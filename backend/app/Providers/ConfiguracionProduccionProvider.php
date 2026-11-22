<?php

namespace App\Providers;

use App\Support\VerificadorConfiguracion;
use Illuminate\Support\ServiceProvider;
use RuntimeException;

/**
 * En producción la aplicación se niega a arrancar si falta configuración
 * o si es insegura (falla explícita en lugar de valores por omisión).
 */
class ConfiguracionProduccionProvider extends ServiceProvider
{
    public function boot(): void
    {
        if (! $this->app->environment('production') || $this->app->runningUnitTests()) {
            return;
        }

        $conexion = config('database.default');
        $bd = "database.connections.$conexion";

        $problemas = VerificadorConfiguracion::problemas([
            'app_key' => config('app.key'),
            'app_debug' => (bool) config('app.debug'),
            'app_url' => config('app.url'),
            'db_connection' => $conexion,
            'db_url' => config("$bd.url"),
            'db_host' => config("$bd.host"),
            'db_database' => config("$bd.database"),
            'db_username' => config("$bd.username"),
            'db_password' => config("$bd.password"),
            'cors_origins' => config('cors.allowed_origins', []),
        ]);

        if ($problemas !== []) {
            throw new RuntimeException(
                "Configuración de producción inválida:\n- " . implode("\n- ", $problemas)
            );
        }
    }
}