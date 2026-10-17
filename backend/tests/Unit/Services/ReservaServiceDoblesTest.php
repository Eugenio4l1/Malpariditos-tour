<?php

namespace Tests\Unit\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\Reserva;
use App\Models\SalidaTour;
use App\Models\User;
use App\Services\ReservaService;
use Closure;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Mockery;
use Mockery\MockInterface;
use PHPUnit\Framework\Attributes\DataProvider;
use ReflectionMethod;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class ReservaServiceDoblesTest extends TestCase
{
    private ReservaService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ReservaService();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ---------- helpers ----------

    private function usuario(string $rol = 'admin'): User
    {
        return User::factory()->make(['role' => $rol]);
    }

    private function gatePermite(User $user): void
    {
        $gate = Mockery::mock();
        $gate->shouldReceive('authorize')->andReturn(Response::allow());
        Gate::shouldReceive('forUser')->with($user)->andReturn($gate);
    }

    private function transaccionPasante(): void
    {
        DB::shouldReceive('transaction')
            ->andReturnUsing(fn (Closure $callback) => $callback());
    }

    private function reserva(string $estado): Reserva&MockInterface
{
    /** @var Reserva&MockInterface $reserva */
    $reserva = Mockery::mock(Reserva::class)->makePartial();
    $reserva->setRawAttributes(['id' => 1, 'cliente_id' => 1, 'estado' => $estado]);

    return $reserva;
}
    private function invocar(string $metodo, mixed ...$args): mixed
    {
        return (new ReflectionMethod(ReservaService::class, $metodo))
            ->invoke($this->service, ...$args);
    }

    private function assertRegla(string $codigo, callable $accion): void
    {
        try {
            $accion();
        } catch (BusinessRuleException $e) {
            $this->assertSame($codigo, $e->getErrorCode());

            return;
        }

        $this->fail("Se esperaba BusinessRuleException con código {$codigo}.");
    }

    // ---------- confirmar ----------

    public function test_confirmar_una_reserva_pendiente_la_pasa_a_confirmada(): void
    {
        $user = $this->usuario('guia');
        $this->gatePermite($user);

        $reserva = $this->reserva('pendiente');
        $reserva->shouldReceive('update')->once()->with(['estado' => 'confirmada'])->andReturn(true);

        $this->assertSame($reserva, $this->service->confirm($user, $reserva));
    }

    #[DataProvider('estadosNoPendientes')]
    public function test_no_confirma_reservas_que_no_estan_pendientes(string $estado): void
    {
        $user = $this->usuario('guia');
        $this->gatePermite($user);

        $reserva = $this->reserva($estado);
        $reserva->shouldReceive('update')->never();

        $this->assertRegla('ESTADO_INVALIDO', fn () => $this->service->confirm($user, $reserva));
    }

    public static function estadosNoPendientes(): array
    {
        return ['confirmada' => ['confirmada'], 'cancelada' => ['cancelada']];
    }

    // ---------- cancelar ----------

    public function test_cancelar_una_reserva_pendiente_usa_transaccion(): void
    {
        $user = $this->usuario('admin');
        $this->gatePermite($user);
        $this->transaccionPasante();

        $reserva = $this->reserva('pendiente');
        $reserva->shouldReceive('update')->once()->with(['estado' => 'cancelada'])->andReturn(true);
        $reserva->shouldReceive('fresh')->once()->andReturnSelf();

        $this->assertSame($reserva, $this->service->cancel($user, $reserva));
    }

    public function test_no_cancela_una_reserva_ya_cancelada(): void
    {
        $user = $this->usuario('admin');
        $this->gatePermite($user);

        $reserva = $this->reserva('cancelada');
        $reserva->shouldReceive('update')->never();

        $this->assertRegla('ESTADO_INVALIDO', fn () => $this->service->cancel($user, $reserva));
    }

    // ---------- cambiarEstado ----------

    public function test_cambiar_estado_a_confirmada_delega_en_confirmar(): void
    {
        $user = $this->usuario('admin');
        $this->gatePermite($user);

        $reserva = $this->reserva('pendiente');
        $reserva->shouldReceive('update')->once()->with(['estado' => 'confirmada'])->andReturn(true);

        $this->assertSame($reserva, $this->service->cambiarEstado($user, $reserva, 'confirmada'));
    }

    public function test_cambiar_estado_rechaza_un_estado_desconocido(): void
    {
        $user = $this->usuario('admin');
        $this->gatePermite($user);

        $reserva = $this->reserva('pendiente');
        $reserva->shouldReceive('update')->never();

        $this->assertRegla('ESTADO_INVALIDO', fn () => $this->service->cambiarEstado($user, $reserva, 'volando'));
    }

    // ---------- eliminar ----------

    public function test_no_elimina_una_reserva_confirmada(): void
    {
        $user = $this->usuario('admin');
        $this->gatePermite($user);

        $reserva = $this->reserva('confirmada');
        $reserva->shouldReceive('delete')->never();

        $this->assertRegla('RESERVA_CON_DEPENDENCIAS', fn () => $this->service->delete($user, $reserva));
    }

    public function test_elimina_una_reserva_pendiente(): void
{
    $user = $this->usuario('admin');
    $this->gatePermite($user);

    $reserva = $this->reserva('pendiente');
    $reserva->shouldReceive('delete')->once()->andReturn(true);

    $this->service->delete($user, $reserva);

    $this->addToAssertionCount(1); // Mockery verifica delete()->once() al cerrar
}
    // ---------- modificar ----------

    #[DataProvider('estadosNoModificables')]
    public function test_no_modifica_reservas_confirmadas_ni_canceladas(string $estado): void
    {
        $user = $this->usuario('admin');
        $this->gatePermite($user);
        $this->transaccionPasante();

        $reserva = $this->reserva($estado);
        $reserva->shouldReceive('update')->never();

        $this->assertRegla(
            'RESERVA_NO_MODIFICABLE',
            fn () => $this->service->update($user, $reserva, ['fecha_reserva' => '2026-12-01'])
        );
    }

    public static function estadosNoModificables(): array
    {
        return ['confirmada' => ['confirmada'], 'cancelada' => ['cancelada']];
    }

    public function test_modifica_la_fecha_de_una_reserva_pendiente(): void
    {
        $user = $this->usuario('admin');
        $this->gatePermite($user);
        $this->transaccionPasante();

        $reserva = $this->reserva('pendiente');
        $reserva->shouldReceive('update')->once()->with(['fecha_reserva' => '2026-12-01'])->andReturn(true);
        $reserva->shouldReceive('fresh')->once()->andReturnSelf();

        $this->assertSame(
            $reserva,
            $this->service->update($user, $reserva, ['fecha_reserva' => '2026-12-01'])
        );
    }

    // ---------- reglas puras de negocio ----------

    #[DataProvider('totales')]
    public function test_calcula_el_total_con_descuento_por_umbral(float $precio, int $personas, float $esperado): void
    {
        $this->assertEqualsWithDelta($esperado, $this->invocar('calcularTotal', $precio, $personas), 0.001);
    }

    public static function totales(): array
    {
        return [
            'sin descuento (4 personas)' => [100.0, 4, 400.0],
            'umbral exacto (5 personas)' => [100.0, 5, 450.0],
            'sobre el umbral'            => [10.5, 6, 56.7],
        ];
    }

    public function test_rechaza_una_salida_vencida(): void
    {
        $salida = (new SalidaTour())->forceFill([
            'fecha' => now()->subDay()->toDateString(),
            'hora' => '09:00:00',
        ]);

        $this->assertRegla('SALIDA_TOUR_VENCIDA', fn () => $this->invocar('verificarSalidaVigente', $salida));
    }

    public function test_acepta_una_salida_futura(): void
    {
        $salida = (new SalidaTour())->forceFill([
            'fecha' => now()->addDays(2)->toDateString(),
            'hora' => '09:00:00',
        ]);

        $this->assertNull($this->invocar('verificarSalidaVigente', $salida));
    }

    // ---------- cliente sin vínculo ----------

    public function test_crear_exige_un_cliente_vinculado(): void
    {
        $user = $this->usuario('cliente')->setRelation('cliente', null);
        $this->gatePermite($user);

        $this->expectException(HttpException::class);

        $this->service->create($user, []);
    }

    public function test_listar_como_cliente_sin_vinculo_devuelve_403(): void
    {
        $user = $this->usuario('cliente')->setRelation('cliente', null);
        $this->gatePermite($user);

        try {
            $this->service->list($user, []);
            $this->fail('Se esperaba HttpException 403.');
        } catch (HttpException $e) {
            $this->assertSame(403, $e->getStatusCode());
        }
    }
}