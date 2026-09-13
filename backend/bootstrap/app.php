<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // Mapeo genérico para el Lab 4. En el Lab 5 esto se puede refinar
        // para que cada codigoNegocio() tenga su propio status HTTP.
        $exceptions->render(function ($e, Request $request) {
            if (! method_exists($e, 'codigoNegocio') || ! method_exists($e, 'contexto')) {
                return null;
            }

            return response()->json([
                'mensaje' => $e->getMessage(),
                'codigo' => $e->codigoNegocio(),
                'contexto' => $e->contexto(),
            ], 409);
        });
    })->create();