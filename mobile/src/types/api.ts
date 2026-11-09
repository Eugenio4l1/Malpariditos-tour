export interface Categoria { id: number; nombre: string }

export interface Tour {
  id: number
  categoria_id: number
  nombre: string
  descripcion: string | null
  precio: number
  duracion_horas: number
  estado: 'activo' | 'inactivo'
  categoria?: Categoria
}

export interface Salida {
  id: number
  tour_id: number
  fecha: string          // AAAA-MM-DD
  hora: string
  cupo_maximo: number
  cupo_disponible: number;
  estado: string
}

export interface Reserva {
  id: number
  cliente_id: number
  salida_tour_id: number
  cantidad_personas: number
  fecha_reserva: string
  estado: 'pendiente' | 'confirmada' | 'cancelada'
  total: number
}

export interface Usuario {
  id: number
  name: string
  email: string
  role: 'admin' | 'guia' | 'cliente'
  cliente_id?: number | null
}

export interface Paginado<T> {
  data: T[]
  meta: { current_page: number; last_page: number; total: number }
}
