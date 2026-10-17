<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\Reserva;
use App\Models\Tour;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AutorizacionApiTest extends TestCase
{
    use RefreshDatabase;

    private function como(string $rol): User
    {
        $user = User::factory()->create(['role' => $rol]);
        Sanctum::actingAs($user, $user->capacidades());

        return $user;
    }

    private function clienteDe(User $user): Cliente
    {
        return Cliente::factory()->paraUsuario($user)->create();
    }

    // ---------- tours: solo admin ----------

    public function test_cliente_no_puede_crear_tours(): void
    {
        $this->como('cliente');

        $this->postJson('/api/tours', [])
            ->assertForbidden()
            ->assertJsonPath('codigo', 'PROHIBIDO');
    }

    public function test_guia_no_puede_crear_modificar_ni_eliminar_tours(): void
    {
        $this->como('guia');
        $tour = Tour::factory()->create();

        $this->postJson('/api/tours', [])->assertForbidden();
        $this->patchJson("/api/tours/{$tour->id}", ['precio' => 1])->assertForbidden();
        $this->deleteJson("/api/tours/{$tour->id}")->assertForbidden();

        $this->assertDatabaseHas('tours', ['id' => $tour->id]);
    }

    // ---------- reservas ----------

    public function test_cliente_no_puede_cambiar_el_estado_ni_de_su_propia_reserva(): void
    {
        $user = $this->como('cliente');
        $reserva = Reserva::factory()->pendiente()->create(['cliente_id' => $this->clienteDe($user)->id]);

        $this->postJson("/api/reservas/{$reserva->id}/estados", ['estado' => 'confirmada'])
            ->assertForbidden()
            ->assertJsonPath('codigo', 'PROHIBIDO');

        $this->assertDatabaseHas('reservas', ['id' => $reserva->id, 'estado' => 'pendiente']);
    }

    public function test_guia_confirma_reservas_pero_no_las_modifica_ni_elimina(): void
    {
        $this->como('guia');
        $reserva = Reserva::factory()->pendiente()->create();

        $this->patchJson("/api/reservas/{$reserva->id}", ['cantidad_personas' => 2])->assertForbidden();
        $this->deleteJson("/api/reservas/{$reserva->id}")->assertForbidden();

        $this->postJson("/api/reservas/{$reserva->id}/estados", ['estado' => 'confirmada'])
            ->assertOk()
            ->assertJsonPath('data.estado', 'confirmada');
    }

    public function test_admin_no_puede_crear_reservas(): void
    {
        $this->como('admin');

        $this->postJson('/api/reservas', [])->assertForbidden();
    }

    public function test_cliente_no_accede_a_reservas_ajenas(): void
    {
        $user = $this->como('cliente');
        $this->clienteDe($user);
        $ajena = Reserva::factory()->pendiente()->create();

        $this->getJson("/api/reservas/{$ajena->id}")->assertForbidden();
        $this->patchJson("/api/reservas/{$ajena->id}", ['cantidad_personas' => 2])->assertForbidden();
        $this->deleteJson("/api/reservas/{$ajena->id}")->assertForbidden();

        $this->assertDatabaseHas('reservas', ['id' => $ajena->id]);
    }

    public function test_cliente_no_lista_las_reservas_de_otro_cliente(): void
    {
        $user = $this->como('cliente');
        $this->clienteDe($user);
        $otro = Cliente::factory()->create();

        $this->getJson("/api/clientes/{$otro->id}/reservas")
            ->assertForbidden()
            ->assertJsonPath('codigo', 'PROHIBIDO');
    }

    // ---------- el correo ya no vincula cuentas ----------

    public function test_compartir_correo_con_un_cliente_no_da_acceso_a_sus_reservas(): void
    {
        $cliente = Cliente::factory()->create(['email' => 'victima@example.com']);
        $reserva = Reserva::factory()->create(['cliente_id' => $cliente->id]);

        $intruso = User::factory()->create(['email' => 'victima@example.com', 'role' => 'cliente']);
        Sanctum::actingAs($intruso, $intruso->capacidades());

        $this->getJson('/api/reservas')->assertForbidden();
        $this->getJson("/api/clientes/{$cliente->id}/reservas")->assertForbidden();
        $this->getJson("/api/reservas/{$reserva->id}")->assertForbidden();
    }

    // ---------- capacidades del token ----------

    public function test_el_token_de_un_cliente_no_lleva_capacidades_administrativas(): void
    {
        User::factory()->create(['email' => 'c@example.com', 'role' => 'cliente']);

        $token = $this->postJson('/api/login', ['email' => 'c@example.com', 'password' => 'password'])
            ->assertOk()
            ->json('data.token');

        $registro = PersonalAccessToken::findToken($token);

        $this->assertNotContains('*', $registro->abilities);
        $this->assertTrue($registro->can('reservas:crear'));
        $this->assertFalse($registro->can('tours:crear'));
        $this->assertFalse($registro->can('reservas:estado'));
    }

    public function test_un_admin_con_token_de_capacidades_reducidas_recibe_403(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('limitado', ['reservas:ver'])->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/tours', [])
            ->assertForbidden()
            ->assertJsonPath('codigo', 'PROHIBIDO');
    }

    public function test_la_capacidad_del_token_no_reemplaza_al_rol(): void
    {
        $cliente = User::factory()->create(['role' => 'cliente']);
        $token = $cliente->createToken('forzado', ['tours:crear'])->plainTextToken;

        $this->withToken($token)->postJson('/api/tours', [])->assertForbidden();
    }
}