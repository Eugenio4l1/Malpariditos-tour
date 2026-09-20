<?php

use App\Exceptions\BusinessRuleException;
use App\Http\Middleware\RejectMalformedJson;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // JSON malformado -> 400 antes de llegar a la validación (que daría 422)
        $middleware->api(prepend: [RejectMalformedJson::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $esApi = fn (Request $request): bool => $request->is('api/*') || $request->expectsJson();

        // Formato único de error para toda la API: { mensaje, codigo, [errores] }
        // Nunca incluye trazas, rutas del servidor ni mensajes de la base de datos.
        $error = fn (string $mensaje, string $codigo, int $status, array $extra = [], array $headers = []) => response()->json(
            array_merge(['mensaje' => $mensaje, 'codigo' => $codigo], $extra),
            $status,
            $headers,
        );

        $exceptions->shouldRenderJsonWhen(fn (Request $request) => $esApi($request));

        // Las reglas de negocio son esperadas: no ensucian la bitácora
        $exceptions->dontReport([BusinessRuleException::class]);

        // Regla de negocio -> 409
        $exceptions->render(fn (BusinessRuleException $e, Request $request) => $error($e->getMessage(), $e->getErrorCode(), 409));

        // Validación -> 422 con detalle por campo
        $exceptions->render(function (ValidationException $e, Request $request) use ($esApi, $error) {
            if (! $esApi($request)) {
                return null;
            }

            return $error('Los datos enviados no son válidos.', 'VALIDACION_FALLIDA', 422, ['errores' => $e->errors()]);
        });

        // Cuerpo JSON ilegible -> 400
        $exceptions->render(function (BadRequestHttpException $e, Request $request) use ($esApi, $error) {
            return $esApi($request) ? $error($e->getMessage(), 'SOLICITUD_MALFORMADA', 400) : null;
        });

        // Sin identidad -> 401
        $exceptions->render(function (AuthenticationException $e, Request $request) use ($esApi, $error) {
            return $esApi($request) ? $error('No autenticado. Envíe un token válido.', 'NO_AUTENTICADO', 401) : null;
        });

        // Identidad sin permiso -> 403 (AuthorizationException llega convertida en AccessDeniedHttpException)
        $exceptions->render(function (AccessDeniedHttpException $e, Request $request) use ($esApi, $error) {
            return $esApi($request) ? $error('No tiene permiso para realizar esta acción.', 'PROHIBIDO', 403) : null;
        });

        // Recurso inexistente (incluye ModelNotFoundException, que llega convertida) -> 404 limpio
        $exceptions->render(function (NotFoundHttpException $e, Request $request) use ($esApi, $error) {
            return $esApi($request) ? $error('Recurso no encontrado.', 'RECURSO_NO_ENCONTRADO', 404) : null;
        });

        // Método no permitido -> 405 (conserva el encabezado Allow)
        $exceptions->render(function (MethodNotAllowedHttpException $e, Request $request) use ($esApi, $error) {
            return $esApi($request)
                ? $error('Método no permitido para este recurso.', 'METODO_NO_PERMITIDO', 405, [], $e->getHeaders())
                : null;
        });

        // Límite de tasa -> 429 (conserva Retry-After)
        $exceptions->render(function (TooManyRequestsHttpException $e, Request $request) use ($esApi, $error) {
            return $esApi($request)
                ? $error('Demasiadas solicitudes. Intente más tarde.', 'DEMASIADAS_SOLICITUDES', 429, [], $e->getHeaders())
                : null;
        });

        // Cualquier otra cosa: 500 genérico. El detalle queda solo en la bitácora, aunque APP_DEBUG=true.
        $exceptions->render(function (Throwable $e, Request $request) use ($esApi, $error) {
            if (! $esApi($request)) {
                return null;
            }

            if ($e instanceof HttpExceptionInterface) {
                $status = $e->getStatusCode();

                return $error(HttpResponse::$statusTexts[$status] ?? 'Error', 'ERROR_HTTP', $status, [], $e->getHeaders());
            }

            return $error('Error interno del servidor.', 'ERROR_INTERNO', 500);
        });
    })->create();