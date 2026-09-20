<?php

namespace App\Providers;

use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Scramble::configure()->withDocumentTransformers(function (OpenApi $document) {
            $document->info->title = 'API de Malpariditos Tour';
            $document->info->description = implode("\n", [
                'API REST para gestionar **tours**, sus **salidas** y las **reservas** de los clientes.',
                '',
                '## Convenciones',
                '',
                '- Rutas orientadas a recursos (sustantivos en plural, sin verbos) y relaciones anidadas.',
                '- Todas las respuestas son JSON. Envíe siempre `Accept: application/json`.',
                '- Los listados son paginados y devuelven `data`, `links` y `meta` (`current_page`, `last_page`, `per_page`, `total`).',
                '- Las creaciones responden `201 Created` con el encabezado `Location`.',
                '',
                '## Formato único de error',
                '',
                '    {"mensaje": "Texto legible", "codigo": "CODIGO_ESTABLE", "errores": {"campo": ["detalle por campo"]}}',
                '',
                '`errores` solo aparece en los `422`. Ninguna respuesta incluye trazas de pila.',
                '',
                '| Código | Cuándo ocurre |',
                '|---|---|',
                '| 400 | El cuerpo no es un JSON válido |',
                '| 404 | El recurso no existe |',
                '| 405 | Método no permitido para la ruta |',
                '| 409 | Se viola una regla de negocio (cupo, estado, dependencias...) |',
                '| 422 | Los datos no pasan la validación |',
                '| 500 | Error inesperado (sin detalles internos) |',
            ]);
        });
    }
}