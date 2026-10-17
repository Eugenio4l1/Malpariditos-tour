<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ValidacionEspanolTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Todos los mensajes de error de la respuesta, en una sola lista.
     *
     * @return array<int, string>
     */
    private function mensajes(TestResponse $respuesta): array
    {
        return collect($respuesta->json('errores'))->flatten()->all();
    }

    /**
     * Ningún mensaje debe contener palabras típicas de los textos en inglés.
     *
     * @param array<int, string> $mensajes
     */
    private function assertTodoEnEspanol(array $mensajes): void
    {
        $this->assertNotEmpty($mensajes);

        foreach ($mensajes as $mensaje) {
            $this->assertDoesNotMatchRegularExpression(
                '/\b(must|field|the|characters|should)\b/i',
                $mensaje,
                "Mensaje en inglés: {$mensaje}"
            );
        }
    }

    public function test_la_validacion_de_tours_responde_en_espanol(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin, $admin->capacidades());

        $respuesta = $this->postJson('/api/tours', [
            'categoria_id' => 'abc',
            'nombre' => 123,
            'descripcion' => ['no es texto'],
            'precio' => 'gratis',
            'duracion_horas' => 'muchas',
            'estado' => 5,
        ])->assertStatus(422);

        $mensajes = $this->mensajes($respuesta);

        $this->assertTodoEnEspanol($mensajes);
        $this->assertContains('El nombre debe ser texto.', $mensajes);
        $this->assertContains('La descripción debe ser texto.', $mensajes);
        $this->assertContains('El estado debe ser texto.', $mensajes);
    }

    public function test_la_validacion_de_registro_y_contrasena_responde_en_espanol(): void
    {
        $respuesta = $this->postJson('/api/register', [
            'name' => 'x',
            'email' => 'no-es-un-correo',
            'password' => 'abc',
            'password_confirmation' => 'otra',
        ])->assertStatus(422);

        $this->assertTodoEnEspanol($this->mensajes($respuesta));
    }

    public function test_la_validacion_de_login_responde_en_espanol(): void
    {
        $respuesta = $this->postJson('/api/login', [
            'email' => 'no-es-un-correo',
            'password' => 12345,
        ])->assertStatus(422);

        $mensajes = $this->mensajes($respuesta);

        $this->assertTodoEnEspanol($mensajes);
        $this->assertContains('La contraseña debe ser texto.', $mensajes);
    }

    public function test_la_validacion_del_estado_de_una_reserva_responde_en_espanol(): void
    {
        $guia = User::factory()->guia()->create();
        Sanctum::actingAs($guia, $guia->capacidades());

        $reserva = \App\Models\Reserva::factory()->pendiente()->create();

        $respuesta = $this->postJson("/api/reservas/{$reserva->id}/estados", ['estado' => 7])
            ->assertStatus(422);

        $this->assertTodoEnEspanol($this->mensajes($respuesta));
    }
}