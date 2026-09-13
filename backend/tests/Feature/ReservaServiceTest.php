<?php

namespace Tests\Feature;

use App\Exceptions\BusinessRuleException;
use App\Models\Cliente;
use App\Models\SalidaTour;
use App\Models\Tour;
use App\Services\ReservaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservaServiceTest extends TestCase
{
    use RefreshDatabase;

    private ReservaService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ReservaService::class);
    }

    private function crearSalida(array $overrides = []): SalidaTour
    {
        $tour = Tour::factory()->create(['precio' => 100]);

        return SalidaTour::factory()->create(array_merge([
            'tour_id' => $tour->id,
            'fecha' => now()->addDays(5)->toDateString(),
            'hora' => '09:00:00',
            'cupo_maximo' => 10,
            'estado' => 'programada',
        ], $overrides));
    }

    // Regla 1: no reservar una salida ya vencida
    public function test_no_permite_reservar_salida_de_tour_vencida(): void
    {
        $cliente = Cliente::factory()->create();
        $salida = $this->crearSalida(['fecha' => now()->subDay()->toDateString()]);

        $this->expectException(BusinessRuleException::class);

        $this->service->create([
            'cliente_id' => $cliente->id,
            'salida_tour_id' => $salida->id,
            'cantidad_personas' => 2,
            'fecha_reserva' => now(),
        ]);
    }

    // Regla 2: no reservar sin cupo disponible suficiente
    public function test_no_permite_reservar_sin_cupo_disponible_suficiente(): void
    {
        $cliente = Cliente::factory()->create();
        $salida = $this->crearSalida(['cupo_maximo' => 2]);

        $this->expectException(BusinessRuleException::class);

        $this->service->create([
            'cliente_id' => $cliente->id,
            'salida_tour_id' => $salida->id,
            'cantidad_personas' => 3,
            'fecha_reserva' => now(),
        ]);
    }

    // Regla 3: descuento por umbral de personas >w<
    public function test_aplica_descuento_por_umbral_de_personas(): void
    {
        $cliente = Cliente::factory()->create();
        $salida = $this->crearSalida();

        $reserva = $this->service->create([
            'cliente_id' => $cliente->id,
            'salida_tour_id' => $salida->id,
            'cantidad_personas' => 5,
            'fecha_reserva' => now(),
        ]);

        $this->assertEquals(450.00, (float) $reserva->total); // 5*100 - 10%
    }

    // Regla 4: no eliminar una reserva confirmada (dependencia activa)
    public function test_no_permite_eliminar_una_reserva_confirmada(): void
    {
        $cliente = Cliente::factory()->create();
        $salida = $this->crearSalida();

        $reserva = $this->service->create([
            'cliente_id' => $cliente->id,
            'salida_tour_id' => $salida->id,
            'cantidad_personas' => 2,
            'fecha_reserva' => now(),
        ]);

        $this->service->confirm($reserva);

        $this->expectException(BusinessRuleException::class);

        $this->service->delete($reserva);
    }

    // Punto 5: verificación de que un fallo intermedio no deja registros parciales
    public function test_falla_intermedia_no_deja_registros_parciales(): void
    {
        $cliente = Cliente::factory()->create();
        $salida = $this->crearSalida(['cupo_maximo' => 1]);

        try {
            $this->service->create([
                'cliente_id' => $cliente->id,
                'salida_tour_id' => $salida->id,
                'cantidad_personas' => 5,
                'fecha_reserva' => now(),
            ]);
        } catch (BusinessRuleException) {
            // No hacer nada, se espera que falle unu
        }

        $this->assertDatabaseCount('reservas', 0);
    }
}