<?php

namespace Tests\Feature;

use App\Exceptions\BusinessRuleException;
use App\Models\Cliente;
use App\Models\Reserva;
use App\Models\SalidaTour;
use App\Models\Tour;
use App\Models\User;
use App\Services\ReservaService;
use App\Services\TourService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class ServiciosCoberturaTest extends TestCase
{
    use RefreshDatabase;

    private ReservaService $reservas;
    private TourService $tours;

    protected function setUp(): void
    {
        parent::setUp();
        $this->reservas = app(ReservaService::class);
        $this->tours = app(TourService::class);
    }

    private function clienteConUsuario(): User
    {
        $user = User::factory()->cliente()->create();
        Cliente::factory()->paraUsuario($user)->create();

        return $user;
    }

    private function salida(int $cupo = 10): SalidaTour
    {
        return SalidaTour::factory()->create([
            'tour_id' => Tour::factory()->create(['precio' => 100])->id,
            'fecha' => now()->addDays(5)->toDateString(),
            'hora' => '09:00:00',
            'cupo_maximo' => $cupo,
        ]);
    }

    private function datos(User $user, SalidaTour $salida, int $personas): array
    {
        return [
            'cliente_id' => $user->cliente->id,
            'salida_tour_id' => $salida->id,
            'cantidad_personas' => $personas,
            'fecha_reserva' => now(),
        ];
    }

    // ---------- ReservaService::list ----------

    public function test_el_cliente_solo_lista_sus_reservas(): void
    {
        $user = $this->clienteConUsuario();
        Reserva::factory(2)->create(['cliente_id' => $user->cliente->id]);
        Reserva::factory()->create();

        $this->assertSame(2, $this->reservas->list($user, [])->total());
    }

    public function test_el_admin_filtra_por_estado_cliente_y_fechas(): void
    {
        $admin = User::factory()->admin()->create();
        $cliente = Cliente::factory()->create();

        Reserva::factory()->pendiente()->create(['cliente_id' => $cliente->id, 'fecha_reserva' => '2026-10-01']);
        Reserva::factory()->confirmada()->create(['cliente_id' => $cliente->id, 'fecha_reserva' => '2026-11-01']);
        Reserva::factory()->pendiente()->create(['fecha_reserva' => '2026-10-02']); // otro cliente

        $this->assertSame(2, $this->reservas->list($admin, ['cliente_id' => $cliente->id])->total());
        $this->assertSame(1, $this->reservas->list($admin, ['cliente_id' => $cliente->id, 'estado' => 'pendiente'])->total());
        $this->assertSame(1, $this->reservas->list($admin, ['cliente_id' => $cliente->id, 'fecha_desde' => '2026-10-15'])->total());
        $this->assertSame(1, $this->reservas->list($admin, ['cliente_id' => $cliente->id, 'fecha_hasta' => '2026-10-15'])->total());
    }

    public function test_el_tamano_de_pagina_tiene_tope_y_el_orden_invalido_se_ignora(): void
    {
        $admin = User::factory()->admin()->create();

        $this->assertSame(50, $this->reservas->list($admin, ['per_page' => 500])->perPage());
        $this->assertSame(0, $this->reservas->list($admin, ['sort_by' => 'password', 'sort_dir' => 'asc'])->total());
    }

    public function test_un_cliente_sin_vinculo_recibe_403_al_listar(): void
    {
        $user = User::factory()->cliente()->create();

        $this->expectException(HttpException::class);

        $this->reservas->list($user, []);
    }

    // ---------- ReservaService::update y cupo ----------

    public function test_modificar_la_cantidad_recalcula_el_total(): void
    {
        $user = $this->clienteConUsuario();
        $reserva = $this->reservas->create($user, $this->datos($user, $this->salida(), 2));

        $actualizada = $this->reservas->update($user, $reserva, ['cantidad_personas' => 5]);

        $this->assertEqualsWithDelta(450.0, (float) $actualizada->total, 0.001);
    }

    public function test_modificar_la_cantidad_no_puede_exceder_el_cupo(): void
    {
        $user = $this->clienteConUsuario();
        $reserva = $this->reservas->create($user, $this->datos($user, $this->salida(3), 2));

        try {
            $this->reservas->update($user, $reserva, ['cantidad_personas' => 4]);
            $this->fail('Se esperaba BusinessRuleException.');
        } catch (BusinessRuleException $e) {
            $this->assertSame('CUPO_INSUFICIENTE', $e->getErrorCode());
        }
    }

    public function test_cancelar_una_reserva_libera_su_cupo(): void
    {
        $salida = $this->salida(2);
        $a = $this->clienteConUsuario();
        $b = $this->clienteConUsuario();
        $guia = User::factory()->guia()->create();

        $reservaA = $this->reservas->create($a, $this->datos($a, $salida, 2));
        $this->reservas->cancel($guia, $reservaA);

        $reservaB = $this->reservas->create($b, $this->datos($b, $salida, 2));

        $this->assertSame('pendiente', $reservaB->estado);
    }

    // ---------- TourService::list y listSalidas ----------

    public function test_el_listado_de_tours_filtra_busca_y_ordena(): void
    {
        Tour::factory()->create(['nombre' => 'Volcán Arenal', 'precio' => 100, 'estado' => 'activo']);
        Tour::factory()->create(['nombre' => 'Playa Conchal', 'precio' => 500, 'estado' => 'inactivo']);

        $this->assertSame(1, $this->tours->list(['buscar' => 'Volc'])->total());
        $this->assertSame(1, $this->tours->list(['precio_min' => 200])->total());
        $this->assertSame(1, $this->tours->list(['precio_max' => 200])->total());
        $this->assertSame(1, $this->tours->list(['estado' => 'inactivo'])->total());

        $primero = $this->tours->list(['sort_by' => 'precio', 'sort_dir' => 'asc'])->items()[0];
        $this->assertEquals(100, (float) $primero->precio);
    }

    public function test_las_salidas_de_un_tour_salen_ordenadas_por_fecha(): void
    {
        $tour = Tour::factory()->create();
        SalidaTour::factory()->create(['tour_id' => $tour->id, 'fecha' => '2027-02-01']);
        SalidaTour::factory()->create(['tour_id' => $tour->id, 'fecha' => '2027-01-01']);
        SalidaTour::factory()->create(); // de otro tour

        $salidas = $this->tours->listSalidas($tour, []);

        $this->assertSame(2, $salidas->total());
        $this->assertSame('2027-01-01', $salidas->items()[0]->fecha->toDateString());
    }
}