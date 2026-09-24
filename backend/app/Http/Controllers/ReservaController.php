<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReservaRequest;
use App\Http\Requests\UpdateReservaRequest;
use App\Http\Resources\ReservaResource;
use App\Models\Reserva;
use App\Services\ReservaService;
use App\Support\ApiDocs;
use Dedoc\Scramble\Attributes\Endpoint;
use Dedoc\Scramble\Attributes\Group;
use Dedoc\Scramble\Attributes\Header;
use Dedoc\Scramble\Attributes\PathParameter;
use Dedoc\Scramble\Attributes\QueryParameter;
use Dedoc\Scramble\Attributes\Response as ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

#[Group('Reservas', description: 'Reservas de los clientes sobre las salidas de los tours.', weight: 2)]
class ReservaController extends Controller
{
    public function __construct(private ReservaService $service)
    {
    }

    /**
     * Listar reservas
     *
     * Devuelve las reservas paginadas, con filtros combinables y ordenamiento.
     * El tamaño de página tiene un tope de 50 registros.
     *
     * Los administradores y guías pueden consultar todas las reservas.
     * Los clientes solamente reciben sus propias reservas.
     */
    #[QueryParameter('page', description: 'Número de página.', type: 'int', default: 1, example: 2)]
    #[QueryParameter('per_page', description: 'Registros por página (1 a 50).', type: 'int', default: 15, example: 5)]
    #[QueryParameter('sort_by', description: 'Campo de orden: `fecha_reserva`, `total`, `cantidad_personas` o `created_at`.', type: 'string', default: 'fecha_reserva', example: 'total')]
    #[QueryParameter('sort_dir', description: 'Dirección del orden: `asc` o `desc`.', type: 'string', default: 'desc', example: 'asc')]
    #[QueryParameter('cliente_id', description: 'Filtra por cliente.', type: 'int', example: 1)]
    #[QueryParameter('estado', description: 'Filtra por estado: `pendiente`, `confirmada` o `cancelada`.', type: 'string', example: 'pendiente')]
    #[QueryParameter('fecha_desde', description: 'Reservas con fecha igual o posterior (AAAA-MM-DD).', type: 'string', format: 'date', example: '2026-10-01')]
    #[QueryParameter('fecha_hasta', description: 'Reservas con fecha igual o anterior (AAAA-MM-DD).', type: 'string', format: 'date', example: '2026-12-31')]
    public function index(Request $request)
    {
        return ReservaResource::collection(
            $this->service->list(
                $request->user(),
                $request->query()
            )
        );
    }

    /**
     * Crear una reserva
     *
     * Registra una reserva en estado `pendiente` y calcula el total (10 % de descuento
     * desde 5 personas). Responde `201 Created` con el encabezado `Location`.
     *
     * El cliente autenticado solamente puede crear reservas a su propio nombre.
     */
    #[Header('Location', 'URL de la reserva creada, por ejemplo http://localhost:8000/api/reservas/21.', type: 'string', status: 201)]
    #[ApiResponse(400, 'El cuerpo no es un JSON válido (`SOLICITUD_MALFORMADA`).', type: ApiDocs::ERROR)]
    #[ApiResponse(409, 'Regla de negocio violada: la salida ya pasó (`SALIDA_TOUR_VENCIDA`) o no hay cupo suficiente (`CUPO_INSUFICIENTE`).', type: ApiDocs::ERROR)]
    #[ApiResponse(422, 'Datos inválidos (`VALIDACION_FALLIDA`). El detalle va por campo en `errores`.', type: ApiDocs::ERROR_VALIDACION)]
    public function store(StoreReservaRequest $request): JsonResponse
    {
        Gate::authorize('create', Reserva::class);

        $data = $request->validated();

        if ($request->user()->role === 'cliente') {
            $cliente = $request->user()->cliente;

            if (!$cliente) {
                throw new AuthorizationException(
                    'El usuario autenticado no tiene un cliente asociado.'
                );
            }

            // El cliente autenticado no puede reservar a nombre de otra persona.
            $data['cliente_id'] = $cliente->id;
        }

        $reserva = $this->service->create(
            $request->user(),
            $data
        );

        /**
         * Reserva creada.
         *
         * @status 201
         * @body ReservaResource
         */
        return (new ReservaResource($reserva))
            ->response()
            ->setStatusCode(201)
            ->header('Location', route('reservas.show', $reserva));
    }

    /**
     * Ver una reserva
     */
    #[PathParameter('reserva', description: 'Identificador de la reserva.', type: 'int', example: 1)]
    #[ApiResponse(404, 'La reserva no existe (`RECURSO_NO_ENCONTRADO`).', type: ApiDocs::ERROR)]
    #[ApiResponse(403, 'El usuario no tiene permiso para consultar la reserva (`PROHIBIDO`).', type: ApiDocs::ERROR)]
    public function show(Reserva $reserva): ReservaResource
    {
        Gate::authorize('view', $reserva);

        return new ReservaResource($reserva);
    }

    /**
     * Actualizar una reserva
     *
     * Actualización parcial de `cantidad_personas` y `fecha_reserva`. Solo es posible
     * mientras la reserva está `pendiente`. Si cambia la cantidad se recalcula el total.
     */
    #[Endpoint(method: 'PATCH')]
    #[PathParameter('reserva', description: 'Identificador de la reserva.', type: 'int', example: 1)]
    #[ApiResponse(400, 'El cuerpo no es un JSON válido (`SOLICITUD_MALFORMADA`).', type: ApiDocs::ERROR)]
    #[ApiResponse(403, 'El usuario no tiene permiso para modificar la reserva (`PROHIBIDO`).', type: ApiDocs::ERROR)]
    #[ApiResponse(404, 'La reserva no existe (`RECURSO_NO_ENCONTRADO`).', type: ApiDocs::ERROR)]
    #[ApiResponse(409, 'La reserva no es modificable (`RESERVA_NO_MODIFICABLE`) o no hay cupo suficiente (`CUPO_INSUFICIENTE`).', type: ApiDocs::ERROR)]
    #[ApiResponse(422, 'Datos inválidos (`VALIDACION_FALLIDA`). El detalle va por campo en `errores`.', type: ApiDocs::ERROR_VALIDACION)]
    public function update(UpdateReservaRequest $request, Reserva $reserva): ReservaResource
    {
        Gate::authorize('update', $reserva);

        return new ReservaResource(
            $this->service->update(
                $request->user(),
                $reserva,
                $request->validated()
            )
        );
    }

    /**
     * Eliminar una reserva
     *
     * No se puede eliminar una reserva confirmada: primero debe cancelarse.
     */
    #[PathParameter('reserva', description: 'Identificador de la reserva.', type: 'int', example: 1)]
    #[ApiResponse(204, 'Reserva eliminada. La respuesta no tiene cuerpo.')]
    #[ApiResponse(403, 'El usuario no tiene permiso para eliminar la reserva (`PROHIBIDO`).', type: ApiDocs::ERROR)]
    #[ApiResponse(404, 'La reserva no existe (`RECURSO_NO_ENCONTRADO`).', type: ApiDocs::ERROR)]
    #[ApiResponse(409, 'La reserva está confirmada (`RESERVA_CON_DEPENDENCIAS`).', type: ApiDocs::ERROR)]
    public function destroy(Reserva $reserva): Response
    {
        Gate::authorize('delete', $reserva);

        $this->service->delete(
            request()->user(),
            $reserva
        );

        return response()->noContent();
    }
}