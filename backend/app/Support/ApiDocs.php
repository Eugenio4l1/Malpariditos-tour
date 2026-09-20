<?php

namespace App\Support;

/**
 * Tipos de respuesta reutilizables para la documentación OpenAPI (Scramble).
 * Describen el formato único de error definido en bootstrap/app.php.
 */
final class ApiDocs
{
    public const ERROR = 'array{mensaje: string, codigo: string}';

    public const ERROR_VALIDACION = 'array{mensaje: string, codigo: string, errores: array<string, string[]>}';
}