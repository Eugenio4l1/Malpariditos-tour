<?php

namespace Tests\Unit\Services;

use App\Exceptions\BusinessRuleException;
use App\Models\Tour;
use App\Models\User;
use App\Services\TourService;
use Closure;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Mockery;
use Mockery\MockInterface;
use Tests\TestCase;

class TourServiceDoblesTest extends TestCase
{
    private TourService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new TourService();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    private function admin(): User
    {
        $user = User::factory()->make(['role' => 'admin']);

        $gate = Mockery::mock();
        $gate->shouldReceive('authorize')->andReturn(Response::allow());
        Gate::shouldReceive('forUser')->with($user)->andReturn($gate);

        return $user;
    }

   private function tour(): Tour&MockInterface
{
    /** @var Tour&MockInterface $tour */
    $tour = Mockery::mock(Tour::class)->makePartial();
    $tour->setRawAttributes(['id' => 1]);

    return $tour;
}
    private function relacionConReservasActivas(bool $hay): MockInterface
    {
        $relacion = Mockery::mock();
        $relacion->shouldReceive('whereHas')->once()->andReturnSelf();
        $relacion->shouldReceive('exists')->once()->andReturn($hay);

        return $relacion;
    }

    public function test_actualiza_el_tour_y_lo_devuelve_con_su_categoria(): void
    {
        $user = $this->admin();
        $tour = $this->tour();
        $tour->shouldReceive('update')->once()->with(['precio' => 200])->andReturn(true);
        $tour->shouldReceive('fresh')->once()->with('categoria')->andReturnSelf();

        $this->assertSame($tour, $this->service->update($user, $tour, ['precio' => 200]));
    }

    public function test_no_elimina_un_tour_con_reservas_activas(): void
    {
        $user = $this->admin();
        DB::shouldReceive('transaction')->andReturnUsing(fn (Closure $cb) => $cb());

        $tour = $this->tour();
        $tour->shouldReceive('salidaTours')->once()->andReturn($this->relacionConReservasActivas(true));
        $tour->shouldReceive('delete')->never();

        try {
            $this->service->delete($user, $tour);
            $this->fail('Se esperaba BusinessRuleException.');
        } catch (BusinessRuleException $e) {
            $this->assertSame('TOUR_CON_DEPENDENCIAS', $e->getErrorCode());
        }
    }

    public function test_elimina_un_tour_sin_reservas_activas(): void
{
    $user = $this->admin();
    DB::shouldReceive('transaction')->andReturnUsing(fn (Closure $cb) => $cb());

    $tour = $this->tour();
    $tour->shouldReceive('salidaTours')->once()->andReturn($this->relacionConReservasActivas(false));
    $tour->shouldReceive('delete')->once()->andReturn(true);

    $this->service->delete($user, $tour);

    $this->addToAssertionCount(1); 
}

    public function test_update_y_delete_rechazan_usuario_no_autenticado(): void
    {
        $this->expectException(AuthenticationException::class);

        $this->service->update(null, new Tour(), []);
    }

    public function test_delete_rechaza_usuario_no_autenticado(): void
    {
        $this->expectException(AuthenticationException::class);

        $this->service->delete(null, new Tour());
    }
}