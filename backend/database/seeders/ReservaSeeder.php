<?php
namespace Database\Seeders;
 
use App\Models\Cliente;
use App\Models\Reserva;
use App\Models\SalidaTour;
use App\Models\Tour;
use Illuminate\Database\Seeder;
 
class ReservaSeeder extends Seeder
{
    public function run(): void
    {
        // Clientes de prueba
        $clientes = Cliente::factory(8)->create();
 
        // Salidas programadas, repartidas entre los tours ya sembrados
        $tours = Tour::all();
        $salidas = SalidaTour::factory(15)->create([
            'tour_id' => fn () => $tours->random()->id,
        ]);
 
        // Una salida ya vencida: útil para probar la regla SALIDA_TOUR_VENCIDA
        $salidaVencida = SalidaTour::factory()->vencida()->create([
            'tour_id' => $tours->random()->id,
        ]);
 
        // Una salida con cupo muy limitado: útil para probar CUPO_INSUFICIENTE
        $salidaCupoLimitado = SalidaTour::factory()->cupoLimitado(2)->create([
            'tour_id' => $tours->random()->id,
        ]);
 
        // Reservas de prueba sobre las salidas programadas normales
        Reserva::factory(25)->create([
            'cliente_id' => fn () => $clientes->random()->id,
            'salida_tour_id' => fn () => $salidas->random()->id,
        ]);
    }
}
 
