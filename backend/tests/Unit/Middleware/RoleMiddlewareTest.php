<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\RoleMiddleware;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    public function test_admin_puede_pasar_por_el_middleware_de_rol(): void
    {
        $user = User::factory()->make([
            'role' => 'admin',
        ]);

        $request = Request::create('/api/tours', 'POST');
        $request->setUserResolver(fn () => $user);

        $middleware = new RoleMiddleware();

        $response = $middleware->handle(
            $request,
            function (Request $request): Response {
                return response()->json([
                    'ok' => true,
                ]);
            },
            'admin'
        );

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame(
            ['ok' => true],
            $response->getData(true)
        );
    }

    public function test_guia_puede_pasar_por_el_middleware_de_rol(): void
    {
        $user = User::factory()->make([
            'role' => 'guia',
        ]);

        $request = Request::create('/api/tours', 'POST');
        $request->setUserResolver(fn () => $user);

        $middleware = new RoleMiddleware();

        $response = $middleware->handle(
            $request,
            function (Request $request): Response {
                return response()->json([
                    'ok' => true,
                ]);
            },
            'admin',
            'guia'
        );

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame(
            ['ok' => true],
            $response->getData(true)
        );
    }
}