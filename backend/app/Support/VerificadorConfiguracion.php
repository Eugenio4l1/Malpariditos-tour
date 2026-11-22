<?php

namespace App\Support;

/**
 * Valida que la configuración de producción esté completa y sea segura.
 * Es una función pura (recibe un arreglo) para poder probarla sin arrancar Laravel.
 * Solo devuelve nombres de variables, nunca sus valores.
 */
class VerificadorConfiguracion
{
    /**
     * @param  array<string, mixed>  $c
     * @return list<string>  Problemas encontrados; vacío si todo está bien.
     */
    public static function problemas(array $c): array
    {
        $problemas = [];

        if (self::vacio($c['app_key'] ?? null)) {
            $problemas[] = 'APP_KEY no está definida (genere una con: php artisan key:generate --show).';
        }

        if (($c['app_debug'] ?? false) === true) {
            $problemas[] = 'APP_DEBUG debe ser false en producción.';
        }

        if (! str_starts_with((string) ($c['app_url'] ?? ''), 'https://')) {
            $problemas[] = 'APP_URL debe ser una dirección que empiece con https://.';
        }

        $conexion = $c['db_connection'] ?? null;

        if (self::vacio($conexion) || $conexion === 'sqlite') {
            $problemas[] = 'DB_CONNECTION debe ser un motor de servidor (pgsql o mysql), no sqlite.';
        } elseif (self::vacio($c['db_url'] ?? null)) {
            $requeridas = [
                'db_host' => 'DB_HOST',
                'db_database' => 'DB_DATABASE',
                'db_username' => 'DB_USERNAME',
                'db_password' => 'DB_PASSWORD',
            ];

            foreach ($requeridas as $clave => $nombre) {
                if (self::vacio($c[$clave] ?? null)) {
                    $problemas[] = "$nombre no está definida (o defina DB_URL).";
                }
            }
        }

        $origenes = $c['cors_origins'] ?? [];

        if (! is_array($origenes) || $origenes === [] || in_array('*', $origenes, true)) {
            $problemas[] = 'CORS_ALLOWED_ORIGINS debe listar los orígenes permitidos (ni vacío ni "*").';
        }

        return $problemas;
    }

    private static function vacio(mixed $valor): bool
    {
        return $valor === null || trim((string) $valor) === '';
    }
}