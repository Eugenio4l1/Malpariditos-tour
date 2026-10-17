<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\Reserva;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReglasNegocioApiTest extends TestCase
{
    use RefreshDatabase;

    private function como(string $rol): User
    {
        $user = User::factory()->create(['role' => $rol]);
        Sanctum::actingAs($user, $user->capacidades());

        return $user;
    }

    /**
     * Reserva en el estado indicado que pertenece al cliente dado.
     */
    private function reservaDe(Cliente $cliente, string $estado): Reserva
    {
        return Reserva::factory()->create([
            'cliente_id' => $cliente->id,
            'estado' => $estado,
        ]);
    }

    // ---------- RESERVA_NO_MODIFICABLE ----------

    public function test_modificar_una_reserva_confirmada_devuelve_409(): void
    {
        $user = $this->como('cliente');
        $reserva = $this->reservaDe(Cliente::factory()->paraUsuario($user)->create(), 'confirmada');

        $this->patchJson("/api/reservas/{$reserva->id}", ['cantidad_personas' => 2])
            ->assertStatus(409)
            ->assertJsonPath('codigo', 'RESERVA_NO_MODIFICABLE')
            ->assertJsonStructure(['mensaje', 'codigo']);
    }

    public function test_modificar_una_reserva_cancelada_devuelve_409(): void
    {
        $user = $this->como('cliente');
        $reserva = $this->reservaDe(Cliente::factory()->paraUsuario($user)->create(), 'cancelada');

        $this->putJson("/api/reservas/{$reserva->id}", ['fecha_reserva' => now()->addDay()->toDateString()])
            ->assertStatus(409)
            ->assertJsonPath('codigo', 'RESERVA_NO_MODIFICABLE');
    }

    public function test_modificar_una_reserva_pendiente_devuelve_200(): void
    {
        $user = $this->como('cliente');
        $reserva = $this->reservaDe(Cliente::factory()->paraUsuario($user)->create(), 'pendiente');

        $this->patchJson("/api/reservas/{$reserva->id}", ['fecha_reserva' => now()->addDay()->toDateString()])
            ->assertOk();
    }

    // ---------- ESTADO_INVALIDO ----------

    public function test_confirmar_una_reserva_cancelada_devuelve_409(): void
    {
        $this->como('guia');
        $reserva = Reserva::factory()->cancelada()->create();

        $this->postJson("/api/reservas/{$reserva->id}/estados", ['estado' => 'confirmada'])
            ->assertStatus(409)
            ->assertJsonPath('codigo', 'ESTADO_INVALIDO')
            ->assertJsonStructure(['mensaje', 'codigo']);

        $this->assertDatabaseHas('reservas', ['id' => $reserva->id, 'estado' => 'cancelada']);
    }

    public function test_confirmar_una_reserva_ya_confirmada_devuelve_409(): void
    {
        $this->como('admin');
        $reserva = Reserva::factory()->confirmada()->create();

        $this->postJson("/api/reservas/{$reserva->id}/estados", ['estado' => 'confirmada'])
            ->assertStatus(409)
            ->assertJsonPath('codigo', 'ESTADO_INVALIDO');
    }

    public function test_cancelar_una_reserva_ya_cancelada_devuelve_409(): void
    {
        $this->como('admin');
        $reserva = Reserva::factory()->cancelada()->create();

        $this->postJson("/api/reservas/{$reserva->id}/estados", ['estado' => 'cancelada'])
            ->assertStatus(409)
            ->assertJsonPath('codigo', 'ESTADO_INVALIDO');
    }

    public function test_cancelar_una_reserva_pendiente_devuelve_200(): void
    {
        $this->como('guia');
        $reserva = Reserva::factory()->pendiente()->create();

        $this->postJson("/api/reservas/{$reserva->id}/estados", ['estado' => 'cancelada'])
            ->assertOk()
            ->assertJsonPath('data.estado', 'cancelada');
    }
}