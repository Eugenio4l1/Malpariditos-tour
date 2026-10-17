<?php

namespace Tests\Unit\Policies;

use App\Models\Cliente;
use App\Models\Reserva;
use App\Models\Tour;
use App\Models\User;
use App\Policies\ReservaPolicy;
use App\Policies\TourPolicy;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PoliciasPorRolTest extends TestCase
{
    private function usuario(string $rol, ?int $clienteId = null): User
    {
        $user = User::factory()->make(['role' => $rol]);
        $cliente = $clienteId ? (new Cliente())->forceFill(['id' => $clienteId]) : null;

        return $user->setRelation('cliente', $cliente);
    }

    private function reservaDe(int $clienteId): Reserva
    {
        return (new Reserva())->forceFill(['cliente_id' => $clienteId]);
    }

    #[DataProvider('permisosDeTours')]
    public function test_permisos_sobre_tours(string $rol, bool $esperado): void
    {
        $policy = new TourPolicy();
        $user = $this->usuario($rol);

        $this->assertSame($esperado, $policy->create($user));
        $this->assertSame($esperado, $policy->update($user, new Tour()));
        $this->assertSame($esperado, $policy->delete($user, new Tour()));
    }

    public static function permisosDeTours(): array
    {
        return ['admin' => ['admin', true], 'guia' => ['guia', false], 'cliente' => ['cliente', false]];
    }

    public function test_la_guia_confirma_pero_no_modifica_ni_elimina_reservas(): void
    {
        $policy = new ReservaPolicy();
        $guia = $this->usuario('guia');
        $reserva = $this->reservaDe(1);

        $this->assertTrue($policy->view($guia, $reserva));
        $this->assertTrue($policy->changeState($guia, $reserva));
        $this->assertFalse($policy->update($guia, $reserva));
        $this->assertFalse($policy->delete($guia, $reserva));
        $this->assertFalse($policy->create($guia));
    }

    public function test_el_admin_modifica_y_elimina_cualquier_reserva(): void
    {
        $policy = new ReservaPolicy();
        $admin = $this->usuario('admin');
        $reserva = $this->reservaDe(1);

        $this->assertTrue($policy->update($admin, $reserva));
        $this->assertTrue($policy->delete($admin, $reserva));
        $this->assertTrue($policy->changeState($admin, $reserva));
    }

    public function test_el_cliente_solo_accede_a_sus_reservas_y_no_cambia_estados(): void
    {
        $policy = new ReservaPolicy();
        $cliente = $this->usuario('cliente', 5);

        $this->assertTrue($policy->view($cliente, $this->reservaDe(5)));
        $this->assertFalse($policy->view($cliente, $this->reservaDe(6)));
        $this->assertFalse($policy->update($cliente, $this->reservaDe(6)));
        $this->assertFalse($policy->changeState($cliente, $this->reservaDe(5)));
    }

    public function test_un_cliente_sin_vinculo_no_accede_a_ninguna_reserva(): void
    {
        $policy = new ReservaPolicy();
        $sinVinculo = $this->usuario('cliente');

        $this->assertFalse($policy->view($sinVinculo, $this->reservaDe(5)));
        $this->assertFalse($policy->create($sinVinculo));
    }
}