<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_registro_exitoso_crea_usuario_y_entrega_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Usuario Prueba',
            'email' => 'registro@example.com',
            'password' => 'Prueba123!',
            'password_confirmation' => 'Prueba123!',
        ]);

        $response
            ->assertStatus(201)
            ->assertJsonStructure([
                'mensaje',
                'data' => [
                    'usuario' => [
                        'id',
                        'name',
                        'email',
                    ],
                    'token',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'registro@example.com',
        ]);

        $user = User::where('email', 'registro@example.com')->firstOrFail();

        $this->assertTrue(
            Hash::check('Prueba123!', $user->password)
        );

        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_type' => User::class,
            'tokenable_id' => $user->id,
            'name' => 'api',
        ]);
    }

    public function test_registro_rechaza_contrasena_que_no_cumple_complejidad(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Usuario Prueba',
            'email' => 'debil@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonStructure([
                'mensaje',
                'codigo',
                'errores',
            ]);

        $this->assertDatabaseMissing('users', [
            'email' => 'debil@example.com',
        ]);
    }

    public function test_login_exitoso_entrega_token(): void
    {
        User::factory()->create([
            'email' => 'login@example.com',
            'password' => 'Prueba123!',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'Prueba123!',
        ]);

        $response
            ->assertOk()
            ->assertJsonStructure([
                'mensaje',
                'data' => [
                    'usuario' => [
                        'id',
                        'name',
                        'email',
                    ],
                    'token',
                ],
            ]);

        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_login_con_contrasena_incorrecta_devuelve_error_generico(): void
    {
        User::factory()->create([
            'email' => 'credenciales@example.com',
            'password' => 'Prueba123!',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'credenciales@example.com',
            'password' => 'Incorrecta123!',
        ]);

        $response
            ->assertStatus(401)
            ->assertExactJson([
                'mensaje' => 'Las credenciales proporcionadas no son válidas.',
                'codigo' => 'CREDENCIALES_INVALIDAS',
            ]);
    }

    public function test_login_con_usuario_inexistente_devuelve_el_mismo_error_generico(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'noexiste@example.com',
            'password' => 'Incorrecta123!',
        ]);

        $response
            ->assertStatus(401)
            ->assertExactJson([
                'mensaje' => 'Las credenciales proporcionadas no son válidas.',
                'codigo' => 'CREDENCIALES_INVALIDAS',
            ]);
    }

    public function test_login_bloquea_exceso_de_intentos(): void
    {
        $email = 'limite@example.com';

        User::factory()->create([
            'email' => $email,
            'password' => 'Prueba123!',
        ]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', [
                'email' => $email,
                'password' => 'Incorrecta123!',
            ])->assertStatus(401);
        }

        $response = $this->postJson('/api/login', [
            'email' => $email,
            'password' => 'Incorrecta123!',
        ]);

        $response
            ->assertStatus(429)
            ->assertJsonStructure([
                'mensaje',
                'codigo',
            ]);

        RateLimiter::clear(strtolower($email) . '|' . request()->ip());
    }

    public function test_logout_revoca_el_token_actual(): void
    {
        $email = 'logout@example.com';

        $user = User::factory()->create([
            'email' => $email,
            'password' => 'Prueba123!',
            'role' => 'cliente',
        ]);

        Cliente::factory()->create([
            'email' => $email,
        ]);

        $token = $user->createToken('api')->plainTextToken;

        $logout = $this
            ->withToken($token)
            ->postJson('/api/logout');

        $logout
            ->assertOk()
            ->assertJson([
                'mensaje' => 'Sesión cerrada correctamente.',
            ]);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);

        $this->app['auth']->forgetGuards();

        $this
            ->withToken($token)
            ->getJson('/api/reservas')
            ->assertStatus(401);
    }

    public function test_token_expirado_no_puede_acceder_a_recurso_protegido(): void
    {
        $user = User::factory()->create();

        $token = $user->createToken(
            'api',
            ['*'],
            now()->subMinute()
        )->plainTextToken;

        $this
            ->withToken($token)
            ->getJson('/api/reservas')
            ->assertStatus(401);
    }

    public function test_recurso_protegido_sin_token_devuelve_401(): void
    {
        $this
            ->getJson('/api/reservas')
            ->assertStatus(401)
            ->assertJsonStructure([
                'mensaje',
                'codigo',
            ]);
    }

    public function test_token_valido_puede_acceder_a_recurso_protegido(): void
    {
        $email = 'tokenvalido@example.com';

        $user = User::factory()->create([
            'email' => $email,
            'role' => 'cliente',
        ]);

        Cliente::factory()->create([
            'email' => $email,
        ]);

        $token = $user->createToken('api')->plainTextToken;

        $this
            ->withToken($token)
            ->getJson('/api/reservas')
            ->assertOk()
            ->assertJsonStructure([
                'data',
                'links',
                'meta',
            ]);
    }
}