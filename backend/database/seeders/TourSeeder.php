<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Tour;
use Illuminate\Database\Seeder;

class TourSeeder extends Seeder
{
    public function run(): void
    {
        // Primero, un set fijo de categorías
        $categorias = Categoria::factory(5)->create();

        // Luego, 20 tours repartidos entre esas categorías
        Tour::factory(20)->create([
            'categoria_id' => fn () => $categorias->random()->id,
        ]);
    }
}