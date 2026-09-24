<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Cliente;
use App\Models\Reserva;
use App\Models\SalidaTour;
use App\Models\Tour;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ApiRestTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Crea un usuario de prueba con el rol indicado.
     */
    private function usuarioConRol(string $rol): User
    {
        return User::factory()->create([
            'role' => $rol,
        ]);
    }

    /**
     * Autentica las siguientes peticiones como un usuario del rol indicado.
     */
    private function autenticarComo(string $rol): void
    {
        $this->actingAs($this->usuarioConRol($rol), 'sanctum');
    }

    // ---------- 201 + Location ----------

    public function test_crear_tour_devuelve_201_con_location(): void
    {
        $this->autenticarComo('admin');

        $categoria = Categoria::factory()->create();

        $respuesta = $this->postJson('/api/tours', [
            'categoria_id' => $categoria->id,
            'nombre' => 'Tour Volcan Rincon',
            'precio' => 45000,
            'duracion_horas' => 4,
            'estado' => 'activo',
        ]);

        $respuesta->assertCreated()->assertJsonPath('data.nombre', 'Tour Volcan Rincon');
        $id = $respuesta->json('data.id');
        $this->assertStringEndsWith("/api/tours/{$id}", $respuesta->headers->get('Location'));
    }

    public function test_crear_reserva_devuelve_201_con_location(): void
    {
        $this->autenticarComo('cliente');

        $cliente = Cliente::factory()->create();
        $salida = SalidaTour::factory()->create(['cupo_maximo' => 10]);

        $respuesta = $this->postJson('/api/reservas', [
            'cliente_id' => $cliente->id,
            'salida_tour_id' => $salida->id,
            'cantidad_personas' => 2,
            'fecha_reserva' => now()->toDateString(),
        ]);

        $respuesta->assertCreated()->assertJsonPath('data.estado', 'pendiente');
        $id = $respuesta->json('data.id');
        $this->assertStringEndsWith("/api/reservas/{$id}", $respuesta->headers->get('Location'));
    }

    // ---------- 204 / 409 ----------

    public function test_eliminar_tour_sin_dependencias_devuelve_204(): void
    {
        $this->autenticarComo('admin');

        $tour = Tour::factory()->create();

        $this->deleteJson("/api/tours/{$tour->id}")->assertNoContent();
        $this->assertDatabaseMissing('tours', ['id' => $tour->id]);
    }

    public function test_eliminar_reserva_confirmada_devuelve_409(): void
    {
        $this->autenticarComo('admin');

        $reserva = Reserva::factory()->confirmada()->create();

        $this->deleteJson("/api/reservas/{$reserva->id}")
            ->assertStatus(409)
            ->assertJsonPath('codigo', 'RESERVA_CON_DEPENDENCIAS')
            ->assertJsonStructure(['mensaje', 'codigo']);
    }

    // ---------- Sub-recurso de estados ----------

    public function test_confirmar_reserva_por_el_subrecurso_estados(): void
    {
        $this->autenticarComo('admin');

        $reserva = Reserva::factory()->pendiente()->create();

        $this->postJson("/api/reservas/{$reserva->id}/estados", ['estado' => 'confirmada'])
            ->assertOk()
            ->assertJsonPath('data.estado', 'confirmada');

        // Confirmar de nuevo viola la regla de negocio
        $this->postJson("/api/reservas/{$reserva->id}/estados", ['estado' => 'confirmada'])
            ->assertStatus(409)
            ->assertJsonPath('codigo', 'ESTADO_INVALIDO');
    }

    public function test_estado_invalido_devuelve_422(): void
    {
        $this->autenticarComo('admin');

        $reserva = Reserva::factory()->pendiente()->create();

        $this->postJson("/api/reservas/{$reserva->id}/estados", ['estado' => 'volando'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('estado', 'errores');
    }

    // ---------- 404 / 422 / 400 / 405 / 500 sin trazas ----------

    public function test_recurso_inexistente_devuelve_404_sin_detalles_internos(): void
    {
        $this->autenticarComo('admin');

        config(['app.debug' => true]);

        $respuesta = $this->getJson('/api/reservas/999999');

        $respuesta->assertNotFound()
            ->assertJsonPath('codigo', 'RECURSO_NO_ENCONTRADO')
            ->assertJsonMissingPath('trace')
            ->assertJsonMissingPath('exception')
            ->assertJsonMissingPath('file');
        $this->assertStringNotContainsString('App\\Models', $respuesta->getContent());
    }

    public function test_validacion_devuelve_422_con_detalle_por_campo(): void
    {
        $this->autenticarComo('admin');

        $this->postJson('/api/tours', [])
            ->assertStatus(422)
            ->assertJsonPath('codigo', 'VALIDACION_FALLIDA')
            ->assertJsonStructure([
                'mensaje',
                'codigo',
                'errores' => ['categoria_id', 'nombre', 'precio'],
            ]);
    }

    public function test_json_malformado_devuelve_400(): void
    {
        $respuesta = $this->call(
            'POST',
            '/api/tours',
            [],
            [],
            [],
            ['CONTENT_TYPE' => 'application/json', 'HTTP_ACCEPT' => 'application/json'],
            '{"nombre": ',
        );

        $respuesta->assertStatus(400)->assertJsonPath('codigo', 'SOLICITUD_MALFORMADA');
    }

    public function test_metodo_no_permitido_devuelve_405(): void
    {
        $this->putJson('/api/reservas', [])
            ->assertStatus(405)
            ->assertJsonPath('codigo', 'METODO_NO_PERMITIDO')
            ->assertHeader('Allow');
    }

    public function test_error_inesperado_devuelve_500_generico_aunque_haya_debug(): void
    {
        config(['app.debug' => true]);
        Route::get('/api/_boom', fn () => throw new \RuntimeException('secreto interno'));

        $respuesta = $this->getJson('/api/_boom');

        $respuesta->assertStatus(500)
            ->assertJsonPath('codigo', 'ERROR_INTERNO')
            ->assertJsonMissingPath('trace');
        $this->assertStringNotContainsString('secreto interno', $respuesta->getContent());
        $this->assertStringNotContainsString('RuntimeException', $respuesta->getContent());
    }

    // ---------- Recursos anidados + metadatos de paginación ----------

    public function test_listado_incluye_metadatos_de_paginacion(): void
    {
        Tour::factory(3)->create();

        $this->getJson('/api/tours?per_page=2')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure([
                'data',
                'links' => ['first', 'last', 'prev', 'next'],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ])
            ->assertJsonPath('meta.total', 3)
            ->assertJsonPath('meta.last_page', 2);
    }

    public function test_reservas_de_un_cliente_solo_incluye_las_suyas(): void
    {
        $this->autenticarComo('admin');

        $cliente = Cliente::factory()->create();
        Reserva::factory(2)->create(['cliente_id' => $cliente->id]);
        Reserva::factory()->create(); // de otro cliente

        $this->getJson("/api/clientes/{$cliente->id}/reservas")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure([
                'data',
                'links',
                'meta' => ['current_page', 'last_page', 'total'],
            ]);
    }

    public function test_salidas_de_un_tour(): void
    {
        $tour = Tour::factory()->create();
        SalidaTour::factory(3)->create(['tour_id' => $tour->id]);
        SalidaTour::factory()->create(); // de otro tour

        $this->getJson("/api/tours/{$tour->id}/salidas")
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'tour_id',
                    'fecha',
                    'hora',
                    'cupo_maximo',
                    'estado',
                ]],
                'links',
                'meta',
            ]);
    }

    public function test_relacion_anidada_con_padre_inexistente_devuelve_404(): void
    {
        $this->autenticarComo('admin');

        $this->getJson('/api/clientes/999999/reservas')->assertNotFound();
        $this->getJson('/api/tours/999999/salidas')->assertNotFound();
    }

    // ---------- Recursos de API: representación estable ----------

    public function test_el_recurso_de_tour_no_expone_columnas_internas(): void
    {
        $tour = Tour::factory()->create();

        $datos = $this->getJson("/api/tours/{$tour->id}")->assertOk()->json('data');

        $this->assertEqualsCanonicalizing(
            [
                'id',
                'categoria_id',
                'nombre',
                'descripcion',
                'precio',
                'duracion_horas',
                'estado',
                'categoria',
                'creado_en',
                'actualizado_en',
            ],
            array_keys($datos),
        );
        $this->assertIsFloat($datos['precio']);
    }
}