<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
class ClienteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nombre' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'telefono' => fake()->numerify('8###-####'),
            'password' => Hash::make('password123'),
        ];
    }

    public function conPassword(string $password): static
    {
        return $this->state(fn (array $attributes) => [
            'password' => Hash::make($password),
        ]);
    }
    public function paraUsuario(User $user): static
{
    return $this->state(fn (array $attributes) => [
        'user_id' => $user->id,
        'nombre' => $user->name,
        'email' => $user->email,
    ]);
}
}