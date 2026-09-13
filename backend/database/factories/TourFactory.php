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
            'nombre' => fake()->randomElement([
                'Caminata al Volcán Arenal',
                'Tour de Snorkel en Isla Tortuga',
                'Recorrido Histórico por el Casco Antiguo',
                'Aventura en Tirolesa por el Bosque Nuboso',
                'Paseo en Kayak por Manglares',
                'Ruta Gastronómica Local',
                'Avistamiento de Aves al Amanecer',
                'Rafting en Río Sarapiquí',
                'Tour Nocturno de Vida Silvestre',
                'Excursión a Cascadas Escondidas',
                'Paseo a Caballo por la Costa',
                'Buceo en Arrecife de Coral',
                'Caminata Guiada por el Cráter',
                'Tour de Café y Cultura Cafetalera',
                'Safari Fotográfico en la Selva',
            ]),
            'descripcion' => fake()->randomElement([
                'Una experiencia guiada por profesionales, ideal para todas las edades.',
                'Incluye transporte, equipo especializado y guía certificado durante todo el recorrido.',
                'Perfecto para quienes buscan contacto directo con la naturaleza y aventura.',
                'Un recorrido pensado para disfrutar del paisaje a un ritmo tranquilo.',
                'Actividad recomendada para grupos familiares y amantes de la fotografía.',
            ]),
            'precio' => fake()->randomFloat(2, 20, 300),
            'duracion_horas' => fake()->numberBetween(1, 12),
            'estado' => fake()->randomElement(['activo', 'inactivo']),
        ];
    }
}