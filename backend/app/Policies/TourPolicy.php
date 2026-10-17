<?php

namespace App\Policies;

use App\Models\Tour;
use App\Models\User;

class TourPolicy
{
    /** La gestión del catálogo es exclusiva de la administración. */
    public function create(User $user): bool
    {
        return $user->role === User::ROL_ADMIN;
    }

    public function update(User $user, Tour $tour): bool
    {
        return $user->role === User::ROL_ADMIN;
    }

    public function delete(User $user, Tour $tour): bool
    {
        return $user->role === User::ROL_ADMIN;
    }
}