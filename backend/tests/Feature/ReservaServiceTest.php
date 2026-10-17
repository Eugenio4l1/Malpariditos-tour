<?php

namespace Tests\Feature;

use App\Exceptions\BusinessRuleException;
use App\Models\Cliente;
use App\Models\Reserva;
use App\Models\SalidaTour;
use App\Models\Tour;
use App\Models\User;
use App\Services\ReservaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
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

    protected function tearDown(): void
    {
        // Los listeners de modelo registrados en un test no deben filtrarse a otros.
        Reserva::flushEventListeners();

        parent::tearDown();
    }

    private function crearUsuarioCliente(): User
    {
        $user = User::factory()->create([
            'role' => 'cliente',
        ]);

        // Vínculo explícito por user_id (ya no por correo).
        Cliente::factory()->paraUsuario($user)->create();

        return $user;
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

    private function datosReserva(User $user, SalidaTour $salida, int $personas = 2): array
    {
        return [
            'cliente_id' => $user->cliente->id,
            'salida_tour_id' => $salida->id,
            'cantidad_personas' => $personas,
            'fecha_reserva' => now(),
        ];
    }

    /**
     * Verifica que la acción viole una regla de negocio con el código esperado.
     */
    private function assertViolaRegla(string $codigo, callable $accion): void
    {
        try {
            $accion();
        } catch (BusinessRuleException $e) {
            $this->assertSame($codigo, $e->getErrorCode());

            return;
        }

        $this->fail("Se esperaba BusinessRuleException con código {$codigo}.");
    }

    // Regla 1: no reservar una salida ya vencida
    public function test_no_permite_reservar_salida_de_tour_vencida(): void
    {
        $user = $this->crearUsuarioCliente();
        $salida = $this->crearSalida([
            'fecha' => now()->subDay()->toDateString(),
        ]);

        $this->assertViolaRegla(
            'SALIDA_TOUR_VENCIDA',
            fn () => $this->service->create($user, $this->datosReserva($user, $salida))
        );
    }

    // Regla 2: no reservar sin cupo disponible suficiente
    public function test_no_permite_reservar_sin_cupo_disponible_suficiente(): void
    {
        $user = $this->crearUsuarioCliente();
        $salida = $this->crearSalida([
            'cupo_maximo' => 2,
        ]);

        $this->assertViolaRegla(
            'CUPO_INSUFICIENTE',
            fn () => $this->service->create($user, $this->datosReserva($user, $salida, 3))
        );
    }

    // Regla 3: descuento por umbral de personas
    public function test_aplica_descuento_por_umbral_de_personas(): void
    {
        $user = $this->crearUsuarioCliente();
        $salida = $this->crearSalida();

        $reserva = $this->service->create($user, $this->datosReserva($user, $salida, 5));

        $this->assertEquals(450.00, (float) $reserva->total); // 5*100 - 10%
    }

    // Regla 4: no eliminar una reserva confirmada (dependencia activa)
    public function test_no_permite_eliminar_una_reserva_confirmada(): void
    {
        $user = $this->crearUsuarioCliente();
        $salida = $this->crearSalida();
        $reserva = $this->service->create($user, $this->datosReserva($user, $salida));

        $guia = User::factory()->create(['role' => 'guia']);
        $this->service->confirm($guia, $reserva);

        $this->assertViolaRegla(
            'RESERVA_CON_DEPENDENCIAS',
            fn () => $this->service->delete($user, $reserva)
        );

        $this->assertDatabaseHas('reservas', ['id' => $reserva->id]);
    }

    // ---------- RESERVA_NO_MODIFICABLE ----------

    public function test_no_permite_modificar_una_reserva_confirmada(): void
    {
        $user = $this->crearUsuarioCliente();
        $reserva = $this->service->create($user, $this->datosReserva($user, $this->crearSalida()));
        $guia = User::factory()->create(['role' => 'guia']);
        $this->service->confirm($guia, $reserva);

        $this->assertViolaRegla(
            'RESERVA_NO_MODIFICABLE',
            fn () => $this->service->update($user, $reserva, ['cantidad_personas' => 4])
        );

        $this->assertSame(2, (int) $reserva->fresh()->cantidad_personas);
    }

    public function test_no_permite_modificar_una_reserva_cancelada(): void
    {
        $user = $this->crearUsuarioCliente();
        $reserva = $this->service->create($user, $this->datosReserva($user, $this->crearSalida()));
        $guia = User::factory()->create(['role' => 'guia']);
        $this->service->cancel($guia, $reserva);

        $this->assertViolaRegla(
            'RESERVA_NO_MODIFICABLE',
            fn () => $this->service->update($user, $reserva, ['cantidad_personas' => 4])
        );

        $this->assertSame(2, (int) $reserva->fresh()->cantidad_personas);
    }

    // ---------- ESTADO_INVALIDO ----------

    public function test_no_permite_confirmar_una_reserva_ya_confirmada(): void
    {
        $user = $this->crearUsuarioCliente();
        $reserva = $this->service->create($user, $this->datosReserva($user, $this->crearSalida()));
        $guia = User::factory()->create(['role' => 'guia']);
        $this->service->confirm($guia, $reserva);

        $this->assertViolaRegla('ESTADO_INVALIDO', fn () => $this->service->confirm($guia, $reserva));
    }

    public function test_no_permite_confirmar_una_reserva_cancelada(): void
    {
        $user = $this->crearUsuarioCliente();
        $reserva = $this->service->create($user, $this->datosReserva($user, $this->crearSalida()));
        $guia = User::factory()->create(['role' => 'guia']);
        $this->service->cancel($guia, $reserva);

        $this->assertViolaRegla('ESTADO_INVALIDO', fn () => $this->service->confirm($guia, $reserva));
        $this->assertSame('cancelada', $reserva->fresh()->estado);
    }

    public function test_no_permite_cancelar_una_reserva_ya_cancelada(): void
    {
        $user = $this->crearUsuarioCliente();
        $reserva = $this->service->create($user, $this->datosReserva($user, $this->crearSalida()));
        $guia = User::factory()->create(['role' => 'guia']);
        $this->service->cancel($guia, $reserva);

        $this->assertViolaRegla('ESTADO_INVALIDO', fn () => $this->service->cancel($guia, $reserva));
    }

    public function test_cambiar_estado_rechaza_un_estado_desconocido(): void
    {
        $user = $this->crearUsuarioCliente();
        $reserva = $this->service->create($user, $this->datosReserva($user, $this->crearSalida()));
        $admin = User::factory()->create(['role' => 'admin']);

        $this->assertViolaRegla(
            'ESTADO_INVALIDO',
            fn () => $this->service->cambiarEstado($admin, $reserva, 'volando')
        );
    }

    // ---------- Transacciones ----------

    // Una regla de negocio falla ANTES de cualquier insert: no hay nada que revertir.
    // Este test comprueba que el rechazo no deja registros, pero NO prueba una reversión.
    public function test_rechazo_por_cupo_no_crea_registros(): void
    {
        $user = $this->crearUsuarioCliente();
        $salida = $this->crearSalida([
            'cupo_maximo' => 1,
        ]);

        $this->assertViolaRegla(
            'CUPO_INSUFICIENTE',
            fn () => $this->service->create($user, $this->datosReserva($user, $salida, 5))
        );

        $this->assertDatabaseCount('reservas', 0);
    }

    // Reversión real: el INSERT ya ocurrió dentro de la transacción y luego algo falla.
    public function test_falla_despues_del_insert_revierte_la_creacion(): void
    {
        $user = $this->crearUsuarioCliente();
        $salida = $this->crearSalida();

        // Se dispara cuando la fila ya fue insertada, todavía dentro de la transacción.
        Reserva::created(function () {
            throw new RuntimeException('Fallo simulado después del insert');
        });

        try {
            $this->service->create($user, $this->datosReserva($user, $salida));
            $this->fail('Se esperaba RuntimeException.');
        } catch (RuntimeException $e) {
            $this->assertSame('Fallo simulado después del insert', $e->getMessage());
        }

        // Si no hubiera transacción, el INSERT quedaría guardado.
        $this->assertDatabaseCount('reservas', 0);
    }

    // Reversión real en una modificación: el UPDATE se ejecuta y luego se deshace.
    public function test_falla_despues_del_update_revierte_la_modificacion(): void
    {
        $user = $this->crearUsuarioCliente();
        $reserva = $this->service->create($user, $this->datosReserva($user, $this->crearSalida(), 2));

        Reserva::updated(function () {
            throw new RuntimeException('Fallo simulado después del update');
        });

        try {
            $this->service->update($user, $reserva, ['cantidad_personas' => 4]);
            $this->fail('Se esperaba RuntimeException.');
        } catch (RuntimeException $e) {
            $this->assertSame('Fallo simulado después del update', $e->getMessage());
        }

        $guardada = Reserva::findOrFail($reserva->id);

        $this->assertSame(2, (int) $guardada->cantidad_personas);
        $this->assertEqualsWithDelta(200.0, (float) $guardada->total, 0.001);
    }
}