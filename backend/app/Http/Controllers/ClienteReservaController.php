<?php

namespace App\Http\Controllers;

use App\Http\Resources\ReservaResource;
use App\Models\Cliente;
use App\Services\ReservaService;
use App\Support\ApiDocs;
use Dedoc\Scramble\Attributes\Group;
use Dedoc\Scramble\Attributes\PathParameter;
use Dedoc\Scramble\Attributes\QueryParameter;
use Dedoc\Scramble\Attributes\Response as ApiResponse;
use Illuminate\Http\Request;

#[Group('Reservas')]
class ClienteReservaController extends Controller
{
    public function __construct(private ReservaService $service)
    {
    }

    /**
     * Listar las reservas de un cliente
     *
     * Recurso anidado: devuelve solo las reservas del cliente indicado.
     * Admite los mismos filtros, orden y paginación que `GET /reservas`.
     */
    #[PathParameter('cliente', description: 'Identificador del cliente.', type: 'int', example: 1)]
    #[QueryParameter('page', description: 'Número de página.', type: 'int', default: 1, example: 2)]
    #[QueryParameter('per_page', description: 'Registros por página (1 a 50).', type: 'int', default: 15, example: 5)]
    #[QueryParameter('estado', description: 'Filtra por estado: `pendiente`, `confirmada` o `cancelada`.', type: 'string', example: 'pendiente')]
    #[QueryParameter('sort_by', description: 'Campo de orden: `fecha_reserva`, `total`, `cantidad_personas` o `created_at`.', type: 'string', default: 'fecha_reserva', example: 'total')]
    #[QueryParameter('sort_dir', description: 'Dirección del orden: `asc` o `desc`.', type: 'string', default: 'desc', example: 'asc')]
    #[ApiResponse(404, 'El cliente no existe (`RECURSO_NO_ENCONTRADO`).', type: ApiDocs::ERROR)]
    public function index(Request $request, Cliente $cliente)
    {
        $filtros = array_merge($request->query(), ['cliente_id' => $cliente->id]);

        return ReservaResource::collection($this->service->list($filtros));
    }
}