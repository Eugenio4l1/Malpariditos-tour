<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CategoriaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nombre' => fake()->randomElement(['Aventura', 'Cultural', 'Playa', 'Naturaleza', 'Gastronómico']),
            'descripcion' => fake()->randomElement([
                'Experiencias pensadas para quienes buscan adrenalina y contacto con la naturaleza.',
                'Recorridos que combinan historia, tradición y patrimonio local.',
                'Ideal para desconectarse frente al mar y disfrutar del paisaje costero.',
                'Rutas al aire libre entre bosques, ríos y volcanes.',
                'Una experiencia culinaria que resalta los sabores típicos de la región.',
            ]),
        ];
    }
}