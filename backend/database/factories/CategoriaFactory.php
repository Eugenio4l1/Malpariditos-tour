<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CategoriaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nombre' => fake()->randomElement(['Aventura', 'Cultural', 'Playa', 'Naturaleza', 'Gastronómico']),
            'descripcion' => fake()->sentence(10),
        ];
    }
}