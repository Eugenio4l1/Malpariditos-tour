<?php

namespace App\Policies;

use App\Models\Reserva;
use App\Models\User;


class ReservaPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, [User::ROL_ADMIN, User::ROL_GUIA, User::ROL_CLIENTE], true);
    }

    public function view(User $user, Reserva $reserva): bool
    {
        if (in_array($user->role, [User::ROL_ADMIN, User::ROL_GUIA], true)) {
            return true;
        }

        return $this->esDuenio($user, $reserva);
    }

    public function create(User $user): bool
    {
        return $user->role === User::ROL_CLIENTE
            && $user->cliente !== null;
    }

    public function update(User $user, Reserva $reserva): bool
    {
        return $user->role === User::ROL_ADMIN
            || $this->esDuenio($user, $reserva);
    }

    public function delete(User $user, Reserva $reserva): bool
    {
        return $user->role === User::ROL_ADMIN
            || $this->esDuenio($user, $reserva);
    }

    public function changeState(User $user, Reserva $reserva): bool
    {
        return in_array($user->role, [User::ROL_ADMIN, User::ROL_GUIA], true);
    }

    private function esDuenio(User $user, Reserva $reserva): bool
    {
        return $user->role === User::ROL_CLIENTE
            && $user->cliente !== null
            && $user->cliente->id === $reserva->cliente_id;
    }
}