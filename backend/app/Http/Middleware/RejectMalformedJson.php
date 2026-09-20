<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class RejectMalformedJson
{
    public function handle(Request $request, Closure $next): Response
    {
        $contenido = $request->getContent();

        if ($request->isJson() && $contenido !== '' && ! json_validate($contenido)) {
            throw new BadRequestHttpException('El cuerpo de la solicitud no es un JSON válido.');
        }

        return $next($request);
    }
}