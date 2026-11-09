import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../categorias/categoria.entity';
import { invalido, tourConDependencias } from '../common/errores';
import { ActualizarTourDto, CrearTourDto } from './tour.dto';
import { Tour } from './tour.entity';
import { toTourDto } from './tour.mapper';

const TAMANO_MAX = 50;
const ORDENABLES: Record<string, string> = {
  nombre: 'nombre',
  precio: 'precio',
  duracion_horas: 'duracionHoras',
  created_at: 'createdAt',
};

// Equivale a !empty() de PHP para valores de la URL.
const lleno = (v?: string) => v !== undefined && v !== '' && v !== '0';

@Injectable()
export class ToursService {
  constructor(
    @InjectRepository(Tour) private readonly repo: Repository<Tour>,
    @InjectRepository(Categoria) private readonly categorias: Repository<Categoria>,
  ) {}

  async listar(q: Record<string, string | undefined>, base: string) {
    const crudo = q.per_page === undefined ? 15 : parseInt(q.per_page, 10) || 0;
    const perPage = Math.max(1, Math.min(crudo, TAMANO_MAX));
    const page = /^\d+$/.test(q.page ?? '') && Number(q.page) >= 1 ? Number(q.page) : 1;
    const orden = ORDENABLES[q.sort_by ?? ''] ?? 'createdAt';
    const dir = q.sort_dir === 'asc' ? 'ASC' : 'DESC';

    const qb = this.repo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.categoria', 'c');

    if (lleno(q.categoria_id)) qb.andWhere('t.categoria_id = :cat', { cat: q.categoria_id });
    if (lleno(q.estado)) qb.andWhere('t.estado = :estado', { estado: q.estado });
    if (lleno(q.precio_min)) qb.andWhere('t.precio >= :pmin', { pmin: q.precio_min });
    if (lleno(q.precio_max)) qb.andWhere('t.precio <= :pmax', { pmax: q.precio_max });
    if (lleno(q.buscar)) qb.andWhere('t.nombre LIKE :buscar', { buscar: `%${q.buscar}%` });

    const [tours, total] = await qb
      .orderBy(`t.${orden}`, dir)
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    const ultima = Math.max(1, Math.ceil(total / perPage));
    const url = (p: number) => `${base}/api/tours?page=${p}`;
    const desde = tours.length ? (page - 1) * perPage + 1 : null;

    return {
      data: tours.map((t) => toTourDto(t, true)),
      links: {
        first: url(1),
        last: url(ultima),
        prev: page > 1 ? url(page - 1) : null,
        next: page < ultima ? url(page + 1) : null,
      },
      meta: {
        current_page: page,
        from: desde,
        last_page: ultima,
        path: `${base}/api/tours`,
        per_page: perPage,
        to: desde === null ? null : desde + tours.length - 1,
        total,
      },
    };
  }

  // Como Tour::create(): la respuesta NO incluye la categoría.
  async crear(dto: CrearTourDto) {
    await this.validarReglas(dto);
    const tour = await this.repo.save(
      this.repo.create({
        categoriaId: dto.categoria_id,
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        precio: dto.precio,
        duracionHoras: dto.duracion_horas,
        estado: dto.estado,
      }),
    );
    const creado = await this.repo.findOneByOrFail({ id: tour.id });
    return { id: creado.id, data: toTourDto(creado, false) };
  }

  // Como $tour->fresh('categoria'): la respuesta SÍ incluye la categoría.
  async actualizar(id: number, dto: ActualizarTourDto) {
    await this.validarReglas(dto, id);

    const campos: Partial<Tour> = {};
    if (dto.categoria_id !== undefined) campos.categoriaId = dto.categoria_id;
    if (dto.nombre !== undefined) campos.nombre = dto.nombre;
    if (dto.descripcion !== undefined) campos.descripcion = dto.descripcion;
    if (dto.precio !== undefined) campos.precio = dto.precio;
    if (dto.duracion_horas !== undefined) campos.duracionHoras = dto.duracion_horas;
    if (dto.estado !== undefined) campos.estado = dto.estado;
    if (Object.keys(campos).length > 0) await this.repo.update(id, campos);

    const tour = await this.repo.findOneOrFail({
      where: { id },
      relations: { categoria: true },
    });
    return toTourDto(tour, true);
  }

  // No se elimina un tour con salidas que tengan reservas pendientes o confirmadas.
  async eliminar(id: number) {
    await this.repo.manager.transaction(async (m) => {
      const filas = await m.query(
        `SELECT COUNT(*) AS n
           FROM reservas r
           INNER JOIN salida_tours s ON s.id = r.salida_tour_id
          WHERE s.tour_id = ? AND r.estado IN ('pendiente', 'confirmada')`,
        [id],
      );
      if (Number(filas[0].n) > 0) throw tourConDependencias();
      await m.delete(Tour, id);
    });
  }

  private async validarReglas(
    dto: { categoria_id?: number; nombre?: string },
    idActual?: number,
  ) {
    const errores: Record<string, string[]> = {};

    if (dto.categoria_id !== undefined && !(await this.categorias.existsBy({ id: dto.categoria_id }))) {
      errores.categoria_id = ['La categoría seleccionada no existe.'];
    }
    if (dto.nombre !== undefined) {
      const repetido = await this.repo.findOne({
        where: { nombre: dto.nombre },
        select: { id: true },
      });
      if (repetido && repetido.id !== idActual) {
        errores.nombre = ['Ya existe un tour registrado con ese nombre.'];
      }
    }

    if (Object.keys(errores).length > 0) throw invalido(errores);
  }
}
