<?php

namespace App\Http\Controllers;

use App\Http\Resources\ReservaResource;
use App\Models\Cliente;
use App\Services\ReservaService;
use Illuminate\Http\Request;

class ClienteReservaController extends Controller
{
    public function __construct(private ReservaService $service)
    {
    }

    // GET /api/clientes/{cliente}/reservas (mismos filtros, orden y paginación que /api/reservas)
    public function index(Request $request, Cliente $cliente)
    {
        $filtros = array_merge($request->query(), ['cliente_id' => $cliente->id]);

        return ReservaResource::collection($this->service->list($filtros));
    }
}