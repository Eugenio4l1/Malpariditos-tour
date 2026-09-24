<?php

namespace App\Policies;

use App\Models\Reserva;
use App\Models\User;

class ReservaPolicy
{
    /**
     * Los administradores y guías pueden consultar cualquier reserva.
     * Un cliente solo puede consultar sus propias reservas.
     */
    public function view(User $user, Reserva $reserva): bool
    {
        if (in_array($user->role, ['admin', 'guia'], true)) {
            return true;
        }

        return $user->role === 'cliente'
            && $user->cliente?->id === $reserva->cliente_id;
    }

    /**
     * Los administradores y guías pueden modificar cualquier reserva.
     * Un cliente solo puede modificar sus propias reservas.
     */
    public function update(User $user, Reserva $reserva): bool
    {
        if (in_array($user->role, ['admin', 'guia'], true)) {
            return true;
        }

        return $user->role === 'cliente'
            && $user->cliente?->id === $reserva->cliente_id;
    }

    /**
     * Los administradores y guías pueden eliminar cualquier reserva.
     * Un cliente solo puede eliminar sus propias reservas.
     */
    public function delete(User $user, Reserva $reserva): bool
    {
        if (in_array($user->role, ['admin', 'guia'], true)) {
            return true;
        }

        return $user->role === 'cliente'
            && $user->cliente?->id === $reserva->cliente_id;
    }

    /**
     * Cambiar el estado de una reserva es una operación administrativa
     * o propia del rol de guía.
     */
    public function changeState(User $user, Reserva $reserva): bool
    {
        return in_array($user->role, ['admin', 'guia'], true);
    }
}