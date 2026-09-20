<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReservaEstadoRequest;
use App\Http\Resources\ReservaResource;
use App\Models\Reserva;
use App\Services\ReservaService;
use App\Support\ApiDocs;
use Dedoc\Scramble\Attributes\Group;
use Dedoc\Scramble\Attributes\PathParameter;
use Dedoc\Scramble\Attributes\Response as ApiResponse;

#[Group('Reservas')]
class ReservaEstadoController extends Controller
{
    public function __construct(private ReservaService $service)
    {
    }

    /**
     * Cambiar el estado de una reserva
     *
     * El cambio de estado se modela como un sub-recurso (sin verbos en la ruta).
     * Enviar `confirmada` confirma una reserva `pendiente`; enviar `cancelada` cancela
     * una reserva que no esté cancelada. Devuelve la reserva actualizada.
     */
    #[PathParameter('reserva', description: 'Identificador de la reserva.', type: 'int', example: 1)]
    #[ApiResponse(400, 'El cuerpo no es un JSON válido (`SOLICITUD_MALFORMADA`).', type: ApiDocs::ERROR)]
    #[ApiResponse(404, 'La reserva no existe (`RECURSO_NO_ENCONTRADO`).', type: ApiDocs::ERROR)]
    #[ApiResponse(409, 'Transición no permitida (`ESTADO_INVALIDO`): por ejemplo, confirmar una reserva que no está pendiente.', type: ApiDocs::ERROR)]
    #[ApiResponse(422, 'Estado inválido (`VALIDACION_FALLIDA`). Solo se acepta `confirmada` o `cancelada`.', type: ApiDocs::ERROR_VALIDACION)]
    public function store(StoreReservaEstadoRequest $request, Reserva $reserva): ReservaResource
    {
        return new ReservaResource(
            $this->service->cambiarEstado($reserva, $request->validated('estado'))
        );
    }
}