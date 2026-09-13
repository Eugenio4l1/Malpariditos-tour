<?php

namespace Database\Factories;

use App\Models\Tour;
use Illuminate\Database\Eloquent\Factories\Factory;

class SalidaTourFactory extends Factory
{
    public function definition(): array
    {
        return [
            'tour_id' => Tour::factory(),
            'fecha' => fake()->dateTimeBetween('+1 day', '+2 months')->format('Y-m-d'),
            'hora' => fake()->randomElement(['07:00:00', '08:30:00', '09:00:00', '13:00:00', '15:30:00']),
            'cupo_maximo' => fake()->numberBetween(5, 20),
            'estado' => 'programada',
        ];
    }

    public function vencida(): static
    {
        return $this->state(fn (array $attributes) => [
            'fecha' => fake()->dateTimeBetween('-2 months', '-1 day')->format('Y-m-d'),
            'hora' => '09:00:00',
        ]);
    }

    public function cupoLimitado(int $cupo = 1): static
    {
        return $this->state(fn (array $attributes) => ['cupo_maximo' => $cupo]);
    }
}