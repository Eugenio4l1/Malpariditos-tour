<?php

namespace App\Policies;

use App\Models\Cliente;
use App\Models\User;

class ClientePolicy
{
    /**
     * Los administradores y guías pueden consultar cualquier cliente.
     * Un cliente solo puede consultar sus propios datos.
     */
    public function view(User $user, Cliente $cliente): bool
    {
        if (in_array($user->role, ['admin', 'guia'], true)) {
            return true;
        }

        return $user->role === 'cliente'
            && $user->cliente?->id === $cliente->id;
    }
}