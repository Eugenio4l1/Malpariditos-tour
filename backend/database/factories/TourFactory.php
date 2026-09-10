<?php

namespace Database\Factories;

use App\Models\Categoria;
use Illuminate\Database\Eloquent\Factories\Factory;

class TourFactory extends Factory
{
    public function definition(): array
    {
        return [
            'categoria_id' => Categoria::factory(),
            'nombre' => fake()->words(3, true),
            'descripcion' => fake()->paragraph(),
            'precio' => fake()->randomFloat(2, 20, 300),
            'duracion_horas' => fake()->numberBetween(1, 12),
            'estado' => fake()->randomElement(['activo', 'inactivo']),
        ];
    }
}