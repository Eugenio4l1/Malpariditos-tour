// Mismo mapa que User::CAPACIDADES_POR_ROL de Laravel.
export const CAPACIDADES_POR_ROL: Record<string, string[]> = {
  admin: [
    'tours:crear', 'tours:editar', 'tours:eliminar',
    'reservas:ver', 'reservas:editar', 'reservas:eliminar', 'reservas:estado',
    'clientes:ver',
  ],
  guia: ['reservas:ver', 'reservas:estado', 'clientes:ver'],
  cliente: [
    'reservas:ver', 'reservas:crear', 'reservas:editar', 'reservas:eliminar',
    'clientes:ver',
  ],
};
