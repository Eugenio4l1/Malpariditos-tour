<?php

namespace Tests\Unit;

use App\Support\VerificadorConfiguracion;
use PHPUnit\Framework\TestCase;

class VerificadorConfiguracionTest extends TestCase
{
    private function valida(): array
    {
        return [
            'app_key' => 'base64:abc',
            'app_debug' => false,
            'app_url' => 'https://api.ejemplo.com',
            'db_connection' => 'pgsql',
            'db_url' => 'postgresql://u:p@host:5432/bd',
            'cors_origins' => ['https://web.ejemplo.com'],
        ];
    }

    public function test_configuracion_completa_no_tiene_problemas(): void
    {
        $this->assertSame([], VerificadorConfiguracion::problemas($this->valida()));
    }

    public function test_falta_app_key(): void
    {
        $c = $this->valida();
        $c['app_key'] = '';

        $this->assertStringContainsString('APP_KEY', VerificadorConfiguracion::problemas($c)[0]);
    }

    public function test_debug_activo_es_rechazado(): void
    {
        $c = $this->valida();
        $c['app_debug'] = true;

        $this->assertStringContainsString('APP_DEBUG', VerificadorConfiguracion::problemas($c)[0]);
    }

    public function test_sqlite_es_rechazado_en_produccion(): void
    {
        $c = $this->valida();
        $c['db_connection'] = 'sqlite';

        $this->assertStringContainsString('DB_CONNECTION', VerificadorConfiguracion::problemas($c)[0]);
    }

    public function test_sin_db_url_exige_host_base_usuario_y_clave(): void
    {
        $c = $this->valida();
        $c['db_url'] = null;

        $this->assertCount(4, VerificadorConfiguracion::problemas($c));
    }

    public function test_cors_vacio_o_comodin_es_rechazado(): void
    {
        $c = $this->valida();

        $c['cors_origins'] = [];
        $this->assertStringContainsString('CORS_ALLOWED_ORIGINS', VerificadorConfiguracion::problemas($c)[0]);

        $c['cors_origins'] = ['*'];
        $this->assertStringContainsString('CORS_ALLOWED_ORIGINS', VerificadorConfiguracion::problemas($c)[0]);
    }

    public function test_el_mensaje_no_incluye_valores_sensibles(): void
    {
        $c = $this->valida();
        $c['app_key'] = '';
        $c['db_url'] = 'postgresql://usuario:SECRETO@host/bd';
        $c['app_debug'] = true;

        $texto = implode(' ', VerificadorConfiguracion::problemas($c));

        $this->assertStringNotContainsString('SECRETO', $texto);
    }
}