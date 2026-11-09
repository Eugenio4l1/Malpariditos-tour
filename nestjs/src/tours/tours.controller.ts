import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, TourActual, urlBase } from '../common/decoradores';
import type { PeticionBase } from '../common/decoradores';
import { ActualizarTourDto, CrearTourDto } from './tour.dto';
import { Tour } from './tour.entity';
import { TourExisteGuard } from './tour-existe.guard';
import { toTourDto } from './tour.mapper';
import { ToursService } from './tours.service';

@ApiTags('tours')
@Controller('tours')
export class ToursController {
  constructor(private readonly tours: ToursService) {}

  // El catálogo es público (igual que en Laravel).
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number, description: '1 a 50 (15 por defecto).' })
  @ApiQuery({ name: 'sort_by', required: false, enum: ['nombre', 'precio', 'duracion_horas', 'created_at'] })
  @ApiQuery({ name: 'sort_dir', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'categoria_id', required: false, type: Number })
  @ApiQuery({ name: 'estado', required: false, type: String })
  @ApiQuery({ name: 'precio_min', required: false, type: Number })
  @ApiQuery({ name: 'precio_max', required: false, type: Number })
  @ApiQuery({ name: 'buscar', required: false, type: String, description: 'Busca por nombre.' })
  @ApiResponse({ status: 200, description: 'Listado paginado con filtros y orden.' })
  listar(@Query() q: Record<string, string>, @Req() req: PeticionBase) {
    return this.tours.listar(q, urlBase(req));
  }

  @Get(':id')
  @UseGuards(TourExisteGuard)
  @ApiResponse({ status: 200, description: 'Detalle del tour.' })
  @ApiResponse({ status: 404, description: 'El tour no existe (RECURSO_NO_ENCONTRADO).' })
  detalle(@TourActual() tour: Tour) {
    return { data: toTourDto(tour, true) };
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiResponse({ status: 201, description: 'Tour creado (encabezado Location).' })
  @ApiResponse({ status: 401, description: 'Sin token o token inválido (NO_AUTENTICADO).' })
  @ApiResponse({ status: 403, description: 'La persona no es admin (PROHIBIDO).' })
  @ApiResponse({ status: 422, description: 'Datos inválidos (VALIDACION_FALLIDA).' })
  async crear(
    @Body() dto: CrearTourDto,
    @Req() req: PeticionBase,
    @Res({ passthrough: true }) res: { setHeader(n: string, v: string): void },
  ) {
    const { id, data } = await this.tours.crear(dto);
    res.setHeader('Location', `${urlBase(req)}/api/tours/${id}`);
    return { data };
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, TourExisteGuard)
  @Roles('admin')
  @ApiResponse({ status: 200, description: 'Tour actualizado.' })
  @ApiResponse({ status: 401, description: 'Sin token o token inválido (NO_AUTENTICADO).' })
  @ApiResponse({ status: 403, description: 'La persona no es admin (PROHIBIDO).' })
  @ApiResponse({ status: 404, description: 'El tour no existe (RECURSO_NO_ENCONTRADO).' })
  @ApiResponse({ status: 422, description: 'Datos inválidos (VALIDACION_FALLIDA).' })
  async actualizar(@TourActual() tour: Tour, @Body() dto: ActualizarTourDto) {
    return { data: await this.tours.actualizar(tour.id, dto) };
  }

  // PATCH hace lo mismo que PUT (igual que en Laravel: ambos son actualización parcial).
  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, TourExisteGuard)
  @Roles('admin')
  @ApiResponse({ status: 200, description: 'Tour actualizado.' })
  @ApiResponse({ status: 401, description: 'Sin token o token inválido (NO_AUTENTICADO).' })
  @ApiResponse({ status: 403, description: 'La persona no es admin (PROHIBIDO).' })
  @ApiResponse({ status: 404, description: 'El tour no existe (RECURSO_NO_ENCONTRADO).' })
  @ApiResponse({ status: 422, description: 'Datos inválidos (VALIDACION_FALLIDA).' })
  async actualizarParcial(@TourActual() tour: Tour, @Body() dto: ActualizarTourDto) {
    return { data: await this.tours.actualizar(tour.id, dto) };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, TourExisteGuard)
  @Roles('admin')
  @HttpCode(204)
  @ApiResponse({ status: 204, description: 'Tour eliminado.' })
  @ApiResponse({ status: 401, description: 'Sin token o token inválido (NO_AUTENTICADO).' })
  @ApiResponse({ status: 403, description: 'La persona no es admin (PROHIBIDO).' })
  @ApiResponse({ status: 404, description: 'El tour no existe (RECURSO_NO_ENCONTRADO).' })
  @ApiResponse({ status: 409, description: 'Tiene reservas activas (TOUR_CON_DEPENDENCIAS).' })
  async eliminar(@TourActual() tour: Tour) {
    await this.tours.eliminar(tour.id);
  }
}