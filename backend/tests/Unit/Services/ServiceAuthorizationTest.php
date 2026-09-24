<?php

namespace Tests\Unit\Services;

use App\Models\Reserva;
use App\Models\Tour;
use App\Models\User;
use App\Services\ReservaService;
use App\Services\TourService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Gate;
use Mockery;
use Mockery\MockInterface;
use Tests\TestCase;

class ServiceAuthorizationTest extends TestCase
{
    private ReservaService $reservaService;

    private TourService $tourService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->reservaService = app(ReservaService::class);
        $this->tourService = app(TourService::class);
    }

    protected function tearDown(): void
    {
        Mockery::close();

        parent::tearDown();
    }

    public function test_reserva_create_rechaza_usuario_no_autenticado(): void
    {
        $this->expectException(AuthenticationException::class);

        $this->reservaService->create(null, []);
    }

    public function test_reserva_update_rechaza_usuario_no_autenticado(): void
    {
        $reserva = new Reserva();

        $this->expectException(AuthenticationException::class);

        $this->reservaService->update(null, $reserva, []);
    }

    public function test_reserva_delete_rechaza_usuario_no_autenticado(): void
    {
        $reserva = new Reserva();

        $this->expectException(AuthenticationException::class);

        $this->reservaService->delete(null, $reserva);
    }

    public function test_reserva_confirm_rechaza_usuario_no_autenticado(): void
    {
        $reserva = new Reserva();

        $this->expectException(AuthenticationException::class);

        $this->reservaService->confirm(null, $reserva);
    }

    public function test_reserva_cancel_rechaza_usuario_no_autenticado(): void
    {
        $reserva = new Reserva();

        $this->expectException(AuthenticationException::class);

        $this->reservaService->cancel(null, $reserva);
    }

    public function test_reserva_cambiar_estado_rechaza_usuario_no_autenticado(): void
    {
        $reserva = new Reserva();

        $this->expectException(AuthenticationException::class);

        $this->reservaService->cambiarEstado(null, $reserva, 'confirmada');
    }

    public function test_reserva_create_rechaza_usuario_sin_permiso(): void
    {
        $user = User::factory()->make([
            'role' => 'cliente',
        ]);

        $this->mockGateAuthorization(
            $user,
            'create',
            Reserva::class
        );

        $this->expectException(AuthorizationException::class);

        $this->reservaService->create($user, []);
    }

    public function test_reserva_update_rechaza_usuario_sin_permiso(): void
    {
        $user = User::factory()->make([
            'role' => 'cliente',
        ]);

        $reserva = new Reserva();

        $this->mockGateAuthorization(
            $user,
            'update',
            $reserva
        );

        $this->expectException(AuthorizationException::class);

        $this->reservaService->update($user, $reserva, []);
    }

    public function test_reserva_delete_rechaza_usuario_sin_permiso(): void
    {
        $user = User::factory()->make([
            'role' => 'cliente',
        ]);

        $reserva = new Reserva();

        $this->mockGateAuthorization(
            $user,
            'delete',
            $reserva
        );

        $this->expectException(AuthorizationException::class);

        $this->reservaService->delete($user, $reserva);
    }

    public function test_reserva_cambiar_estado_rechaza_usuario_sin_permiso(): void
    {
        $user = User::factory()->make([
            'role' => 'cliente',
        ]);

        $reserva = new Reserva();

        $this->mockGateAuthorization(
            $user,
            'changeState',
            $reserva
        );

        $this->expectException(AuthorizationException::class);

        $this->reservaService->cambiarEstado(
            $user,
            $reserva,
            'confirmada'
        );
    }

    public function test_tour_create_rechaza_usuario_sin_permiso(): void
    {
        $user = User::factory()->make([
            'role' => 'cliente',
        ]);

        $this->mockGateAuthorization(
            $user,
            'create',
            Tour::class
        );

        $this->expectException(AuthorizationException::class);

        $this->tourService->create($user, []);
    }

    public function test_tour_update_rechaza_usuario_sin_permiso(): void
    {
        $user = User::factory()->make([
            'role' => 'cliente',
        ]);

        $tour = new Tour();

        $this->mockGateAuthorization(
            $user,
            'update',
            $tour
        );

        $this->expectException(AuthorizationException::class);

        $this->tourService->update($user, $tour, []);
    }

    public function test_tour_delete_rechaza_usuario_sin_permiso(): void
    {
        $user = User::factory()->make([
            'role' => 'cliente',
        ]);

        $tour = new Tour();

        $this->mockGateAuthorization(
            $user,
            'delete',
            $tour
        );

        $this->expectException(AuthorizationException::class);

        $this->tourService->delete($user, $tour);
    }

    private function mockGateAuthorization(
        User $user,
        string $ability,
        mixed $subject
    ): void {
        $gate = Mockery::mock();

        $gate
            ->shouldReceive('authorize')
            ->once()
            ->with($ability, $subject)
            ->andThrow(new AuthorizationException());

        Gate::shouldReceive('forUser')
            ->once()
            ->with($user)
            ->andReturn($gate);
    }
}