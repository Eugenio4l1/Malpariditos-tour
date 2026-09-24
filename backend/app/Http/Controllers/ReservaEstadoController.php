<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReservaEstadoRequest;
use App\Http\Resources\ReservaResource;
use App\Models\Reserva;
use App\Services\ReservaService;
use App\Support\ApiDocs;
use Dedoc\Scramble\Attributes\Endpoint;
use Dedoc\Scramble\Attributes\Group;
use Dedoc\Scramble\Attributes\PathParameter;
use Dedoc\Scramble\Attributes\Response as ApiResponse;
use Illuminate\Support\Facades\Gate;

#[Group('Reservas', description: 'Operaciones de estado de las reservas.', weight: 2)]
class ReservaEstadoController extends Controller
{
    public function __construct(private ReservaService $service)
    {
    }

    /**
     * Cambiar estado de una reserva
     *
     * Permite confirmar o cancelar una reserva.
     * La autorización por recurso se valida mediante la política de Reserva.
     */
    #[Endpoint(method: 'POST')]
    #[PathParameter('reserva', description: 'Identificador de la reserva.', type: 'int', example: 1)]
    #[ApiResponse(403, 'El usuario no tiene permiso para cambiar el estado de la reserva (`PROHIBIDO`).', type: ApiDocs::ERROR)]
    #[ApiResponse(404, 'La reserva no existe (`RECURSO_NO_ENCONTRADO`).', type: ApiDocs::ERROR)]
    #[ApiResponse(409, 'El cambio de estado viola una regla de negocio (`ESTADO_INVALIDO`).', type: ApiDocs::ERROR)]
    #[ApiResponse(422, 'Datos inválidos (`VALIDACION_FALLIDA`).', type: ApiDocs::ERROR_VALIDACION)]
    public function store(
        StoreReservaEstadoRequest $request,
        Reserva $reserva
    ): ReservaResource {
        Gate::authorize('changeState', $reserva);

        $reserva = $this->service->cambiarEstado(
            $request->user(),
            $reserva,
            $request->validated()['estado']
        );

        return new ReservaResource($reserva);
    }
}