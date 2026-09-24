<?php

namespace App\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\Reserva;
use App\Models\SalidaTour;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class ReservaService
{
    private const MAX_PAGE_SIZE = 50;
    private const SORTABLE_FIELDS = ['fecha_reserva', 'total', 'cantidad_personas', 'created_at'];
    private const UMBRAL_DESCUENTO_PERSONAS = 5;
    private const PORCENTAJE_DESCUENTO = 0.10;
    private const ESTADOS_ACTIVOS = ['pendiente', 'confirmada'];

    // Punto 6: listado con paginación, ordenamiento y filtros combinables
    public function list(?User $user, array $filters): LengthAwarePaginator
    {
        $user = $this->usuarioAutenticado($user);

        Gate::forUser($user)->authorize('viewAny', Reserva::class);

        $perPage = max(1, min((int) ($filters['per_page'] ?? 15), self::MAX_PAGE_SIZE));

        $sortBy = in_array($filters['sort_by'] ?? '', self::SORTABLE_FIELDS, true)
            ? $filters['sort_by']
            : 'fecha_reserva';
        $sortDir = ($filters['sort_dir'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $query = Reserva::query();

        if ($user->role === 'cliente') {
            $cliente = $user->cliente;

            if (!$cliente) {
                abort(403, 'El usuario autenticado no tiene un cliente asociado.');
            }

            $query->where('cliente_id', $cliente->id);
        } elseif (!empty($filters['cliente_id'])) {
            $query->where('cliente_id', $filters['cliente_id']);
        }

        if (!empty($filters['estado'])) {
            $query->where('estado', $filters['estado']);
        }

        if (!empty($filters['fecha_desde'])) {
            $query->whereDate('fecha_reserva', '>=', $filters['fecha_desde']);
        }

        if (!empty($filters['fecha_hasta'])) {
            $query->whereDate('fecha_reserva', '<=', $filters['fecha_hasta']);
        }

        return $query->orderBy($sortBy, $sortDir)->paginate($perPage);
    }

    // Punto 5: transacción con lock; Punto 4: reglas 1 y 3
    public function create(?User $user, array $data): Reserva
    {
        $user = $this->usuarioAutenticado($user);

        Gate::forUser($user)->authorize('create', Reserva::class);

        $cliente = $user->cliente;

        if (!$cliente) {
            abort(403, 'El usuario autenticado no tiene un cliente asociado.');
        }

        // El Service también impone la propiedad de la reserva.
        $data['cliente_id'] = $cliente->id;

        return DB::transaction(function () use ($data) {
            /** @var SalidaTour $salida */
            $salida = SalidaTour::with('tour')
                ->lockForUpdate()
                ->findOrFail($data['salida_tour_id']);

            $this->verificarSalidaVigente($salida);
            $this->verificarCupoDisponible($salida, $data['cantidad_personas']);

            $total = $this->calcularTotal(
                $salida->tour->precio,
                $data['cantidad_personas']
            );

            return Reserva::create([
                'cliente_id' => $data['cliente_id'],
                'salida_tour_id' => $data['salida_tour_id'],
                'cantidad_personas' => $data['cantidad_personas'],
                'fecha_reserva' => $data['fecha_reserva'],
                'estado' => 'pendiente',
                'total' => $total,
            ]);
        });
    }

    public function update(?User $user, Reserva $reserva, array $data): Reserva
    {
        $user = $this->usuarioAutenticado($user);

        Gate::forUser($user)->authorize('update', $reserva);

        return DB::transaction(function () use ($reserva, $data) {
            if (in_array($reserva->estado, ['confirmada', 'cancelada'], true)) {
                throw new BusinessRuleException(
                    'No se puede modificar una reserva confirmada o cancelada.',
                    'RESERVA_NO_MODIFICABLE'
                );
            }

            if (isset($data['cantidad_personas'])) {
                $salida = SalidaTour::with('tour')
                    ->lockForUpdate()
                    ->findOrFail($reserva->salida_tour_id);

                $this->verificarCupoDisponible(
                    $salida,
                    $data['cantidad_personas'],
                    excluirReservaId: $reserva->id
                );

                $data['total'] = $this->calcularTotal(
                    $salida->tour->precio,
                    $data['cantidad_personas']
                );
            }

            $reserva->update($data);

            return $reserva->fresh();
        });
    }

    // Punto 4, regla: no se puede confirmar si no está pendiente
    public function confirm(?User $user, Reserva $reserva): Reserva
    {
        $user = $this->usuarioAutenticado($user);

        Gate::forUser($user)->authorize('changeState', $reserva);

        if ($reserva->estado !== 'pendiente') {
            throw new BusinessRuleException(
                'Solo se pueden confirmar reservas en estado pendiente.',
                'ESTADO_INVALIDO'
            );
        }

        $reserva->update(['estado' => 'confirmada']);

        return $reserva;
    }

    public function cancel(?User $user, Reserva $reserva): Reserva
    {
        $user = $this->usuarioAutenticado($user);

        Gate::forUser($user)->authorize('changeState', $reserva);

        if ($reserva->estado === 'cancelada') {
            throw new BusinessRuleException(
                'La reserva ya se encuentra cancelada.',
                'ESTADO_INVALIDO'
            );
        }

        return DB::transaction(function () use ($reserva) {
            $reserva->update(['estado' => 'cancelada']);

            return $reserva->fresh();
        });
    }

    // Cambio de estado expuesto como sub-recurso: POST /reservas/{reserva}/estados
    public function cambiarEstado(?User $user, Reserva $reserva, string $estado): Reserva
    {
        $user = $this->usuarioAutenticado($user);

        Gate::forUser($user)->authorize('changeState', $reserva);

        return match ($estado) {
            'confirmada' => $this->confirm($user, $reserva),
            'cancelada' => $this->cancel($user, $reserva),
            default => throw new BusinessRuleException(
                'El estado proporcionado no es válido.',
                'ESTADO_INVALIDO'
            ),
        };
    }

    // Punto 4, regla: no eliminar registro con dependencia activa
    public function delete(?User $user, Reserva $reserva): void
    {
        $user = $this->usuarioAutenticado($user);

        Gate::forUser($user)->authorize('delete', $reserva);

        if ($reserva->estado === 'confirmada') {
            throw new BusinessRuleException(
                'No se puede eliminar una reserva confirmada.',
                'RESERVA_CON_DEPENDENCIAS'
            );
        }

        $reserva->delete();
    }

    // Punto 4, regla propia del dominio: no reservar una salida ya vencida
    private function verificarSalidaVigente(SalidaTour $salida): void
    {
        $fechaHoraSalida = Carbon::parse(
            $salida->fecha->format('Y-m-d') . ' ' . $salida->hora
        );

        if ($fechaHoraSalida->isPast()) {
            throw new BusinessRuleException(
                'No se puede reservar una salida de tour cuya fecha ya pasó.',
                'SALIDA_TOUR_VENCIDA'
            );
        }
    }

    // Punto 4, regla: no exceder el cupo disponible (calculado dinámicamente)
    private function verificarCupoDisponible(
        SalidaTour $salida,
        int $cantidadSolicitada,
        ?int $excluirReservaId = null
    ): void {
        $query = Reserva::where('salida_tour_id', $salida->id)
            ->whereIn('estado', self::ESTADOS_ACTIVOS);

        if ($excluirReservaId !== null) {
            $query->where('id', '!=', $excluirReservaId);
        }

        $ocupado = (int) $query->sum('cantidad_personas');
        $disponible = $salida->cupo_maximo - $ocupado;

        if ($disponible < $cantidadSolicitada) {
            throw new BusinessRuleException(
                "No hay cupo disponible suficiente. Cupo disponible: {$disponible}.",
                'CUPO_INSUFICIENTE'
            );
        }
    }

    // Punto 4, regla: descuento por umbral
    private function calcularTotal(float $precioPorPersona, int $cantidadPersonas): float
    {
        $total = $precioPorPersona * $cantidadPersonas;

        if ($cantidadPersonas >= self::UMBRAL_DESCUENTO_PERSONAS) {
            $total -= $total * self::PORCENTAJE_DESCUENTO;
        }

        return round($total, 2);
    }

    private function usuarioAutenticado(?User $user): User
    {
        if (!$user) {
            throw new AuthenticationException(
                'Debes autenticarte para realizar esta operación.'
            );
        }

        return $user;
    }
}