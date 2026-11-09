import { Tour } from './tour.entity';

// Igual que toIso8601String() de Laravel con zona UTC: 2026-09-20T10:15:00+00:00
const iso = (d: Date) =>
  d instanceof Date && !isNaN(d.getTime()) ? d.toISOString().slice(0, 19) + '+00:00' : null;

// `categoria` solo se incluye si está cargada (como whenLoaded en Laravel).
export function toTourDto(t: Tour, conCategoria: boolean) {
  return {
    id: t.id,
    categoria_id: t.categoriaId,
    nombre: t.nombre,
    descripcion: t.descripcion ?? null,
    precio: t.precio,
    duracion_horas: t.duracionHoras,
    estado: t.estado,
    ...(conCategoria && t.categoria
      ? {
          categoria: {
            id: t.categoria.id,
            nombre: t.categoria.nombre,
            descripcion: t.categoria.descripcion ?? null,
          },
        }
      : {}),
    creado_en: iso(t.createdAt),
    actualizado_en: iso(t.updatedAt),
  };
}
