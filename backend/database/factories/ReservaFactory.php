<?php

namespace Database\Factories;

use App\Models\Cliente;
use App\Models\SalidaTour;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReservaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'cliente_id' => Cliente::factory(),
            'salida_tour_id' => SalidaTour::factory(),
            'cantidad_personas' => fake()->numberBetween(1, 4),
            'fecha_reserva' => fake()->dateTimeBetween('-10 days', 'now'),
            'estado' => fake()->randomElement(['pendiente', 'confirmada', 'cancelada']),
            'total' => fake()->randomFloat(2, 40, 1500),
        ];
    }

    public function pendiente(): static
    {
        return $this->state(fn () => ['estado' => 'pendiente']);
    }

    public function confirmada(): static
    {
        return $this->state(fn () => ['estado' => 'confirmada']);
    }

    public function cancelada(): static
    {
        return $this->state(fn () => ['estado' => 'cancelada']);
    }
}