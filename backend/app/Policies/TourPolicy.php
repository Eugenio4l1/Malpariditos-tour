<?php

namespace App\Policies;

use App\Models\Tour;
use App\Models\User;

class TourPolicy
{
    /**
     * Crear tours requiere permisos de administración o guía.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'guia'], true);
    }

    /**
     * Actualizar tours requiere permisos de administración o guía.
     */
    public function update(User $user, Tour $tour): bool
    {
        return in_array($user->role, ['admin', 'guia'], true);
    }

    /**
     * Eliminar tours requiere permisos de administración o guía.
     */
    public function delete(User $user, Tour $tour): bool
    {
        return in_array($user->role, ['admin', 'guia'], true);
    }
}
