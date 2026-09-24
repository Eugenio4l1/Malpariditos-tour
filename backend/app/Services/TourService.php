<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\Tour;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class TourService
{
    private const MAX_PAGE_SIZE = 50;
    private const SORTABLE_FIELDS = ['nombre', 'precio', 'duracion_horas', 'created_at'];

    // Punto 6: listado con paginación, ordenamiento y filtros combinables
    public function list(array $filters): LengthAwarePaginator
    {
        $perPage = max(1, min((int) ($filters['per_page'] ?? 15), self::MAX_PAGE_SIZE));

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_FIELDS, true)
            ? $filters['sort_by']
            : 'created_at';
        $sortDir = ($filters['sort_dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $query = Tour::query()->with('categoria');

        if (!empty($filters['categoria_id'])) {
            $query->where('categoria_id', $filters['categoria_id']);
        }

        if (!empty($filters['estado'])) {
            $query->where('estado', $filters['estado']);
        }

        if (!empty($filters['precio_min'])) {
            $query->where('precio', '>=', $filters['precio_min']);
        }

        if (!empty($filters['precio_max'])) {
            $query->where('precio', '<=', $filters['precio_max']);
        }

        if (!empty($filters['buscar'])) {
            $query->where('nombre', 'like', '%' . $filters['buscar'] . '%');
        }

        return $query->orderBy($sortBy, $sortDir)->paginate($perPage);
    }

    // Relación anidada: GET /tours/{tour}/salidas
    public function listSalidas(Tour $tour, array $filters): LengthAwarePaginator
    {
        $perPage = max(1, min((int) ($filters['per_page'] ?? 15), self::MAX_PAGE_SIZE));

        return $tour->salidaTours()
            ->orderBy('fecha')
            ->orderBy('hora')
            ->paginate($perPage);
    }

    public function create(?User $user, array $data): Tour
    {
        $user = $this->usuarioAutenticado($user);

        Gate::forUser($user)->authorize('create', Tour::class);

        return Tour::create($data);
    }

    public function update(?User $user, Tour $tour, array $data): Tour
    {
        $user = $this->usuarioAutenticado($user);

        Gate::forUser($user)->authorize('update', $tour);

        $tour->update($data);

        return $tour->fresh('categoria');
    }

    // Punto 4, regla: no eliminar registro con dependencia activa
    public function delete(?User $user, Tour $tour): void
    {
        $user = $this->usuarioAutenticado($user);

        Gate::forUser($user)->authorize('delete', $tour);

        DB::transaction(function () use ($tour) {
            $tieneReservasActivas = $tour->salidaTours()
                ->whereHas(
                    'reservas',
                    fn ($q) => $q->whereIn('estado', ['pendiente', 'confirmada'])
                )
                ->exists();

            if ($tieneReservasActivas) {
                throw new BusinessRuleException(
                    'No se puede eliminar el tour porque tiene salidas con reservas activas (pendientes o confirmadas).',
                    'TOUR_CON_DEPENDENCIAS'
                );
            }

            $tour->delete();
        });
    }

    private function usuarioAutenticado(?User $user): User
    {
        if (!$user) {
            throw new \Illuminate\Auth\AuthenticationException(
                'Debes autenticarte para realizar esta operación.'
            );
        }

        return $user;
    }
}