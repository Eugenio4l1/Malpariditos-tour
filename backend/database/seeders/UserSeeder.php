<?php

namespace Database\Seeders;

use App\Models\Cliente;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /** Credenciales de demostración: solo para entornos no productivos. */
    private const PASSWORD = 'Password123!';

    public function run(): void
    {
        if (app()->isProduction()) {
            return;
        }

        User::updateOrCreate(
            ['email' => 'admin@malpariditos.test'],
            ['name' => 'Administración', 'password' => self::PASSWORD, 'role' => User::ROL_ADMIN]
        );

        User::updateOrCreate(
            ['email' => 'guia@malpariditos.test'],
            ['name' => 'Guía de turno', 'password' => self::PASSWORD, 'role' => User::ROL_GUIA]
        );

        // Una cuenta por cada cliente sembrado, vinculada por user_id.
        Cliente::whereNull('user_id')->each(function (Cliente $cliente) {
            $user = User::updateOrCreate(
                ['email' => $cliente->email],
                ['name' => $cliente->nombre, 'password' => self::PASSWORD, 'role' => User::ROL_CLIENTE]
            );

            $cliente->update(['user_id' => $user->id]);
        });
    }
}