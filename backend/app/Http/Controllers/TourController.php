<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTourRequest;
use App\Http\Requests\UpdateTourRequest;
use App\Http\Resources\TourResource;
use App\Models\Tour;
use App\Services\TourService;
use App\Support\ApiDocs;
use Dedoc\Scramble\Attributes\Endpoint;
use Dedoc\Scramble\Attributes\Group;
use Dedoc\Scramble\Attributes\PathParameter;
use Dedoc\Scramble\Attributes\QueryParameter;
use Dedoc\Scramble\Attributes\Response as ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

#[Group('Tours', description: 'Operaciones sobre los tours turísticos.', weight: 1)]
class TourController extends Controller
{
    public function __construct(private TourService $service)
    {
    }

    /**
     * Listar tours
     *
     * Devuelve los tours paginados, con filtros combinables y ordenamiento.
     * El tamaño de página tiene un tope de 50 registros.
     */
    #[QueryParameter('page', description: 'Número de página.', type: 'int', default: 1, example: 2)]
    #[QueryParameter('per_page', description: 'Registros por página (1 a 50).', type: 'int', default: 15, example: 5)]
    #[QueryParameter('sort_by', description: 'Campo de orden: `nombre`, `precio`, `duracion_horas` o `created_at`.', type: 'string', default: 'created_at', example: 'precio')]
    #[QueryParameter('sort_dir', description: 'Dirección del orden: `asc` o `desc`.', type: 'string', default: 'desc', example: 'asc')]
    #[QueryParameter('categoria_id', description: 'Filtra por categoría.', type: 'int', example: 1)]
    #[QueryParameter('estado', description: 'Filtra por estado.', type: 'string', example: 'activo')]
    #[QueryParameter('precio_min', description: 'Precio mínimo.', type: 'number', example: 10000)]
    #[QueryParameter('precio_max', description: 'Precio máximo.', type: 'number', example: 50000)]
    #[QueryParameter('buscar', description: 'Busca por nombre del tour.', type: 'string', example: 'volcán')]
    public function index(Request $request)
    {
        return TourResource::collection(
            $this->service->list($request->query())
        );
    }

    /**
     * Crear un tour
     *
     * Solo administradores y guías pueden crear tours.
     */
    #[ApiResponse(400, 'El cuerpo no es un JSON válido (`SOLICITUD_MALFORMADA`).', type: ApiDocs::ERROR)]
    #[ApiResponse(403, 'El usuario no tiene permiso para crear tours (`PROHIBIDO`).', type: ApiDocs::ERROR)]
    #[ApiResponse(422, 'Datos inválidos (`VALIDACION_FALLIDA`).', type: ApiDocs::ERROR_VALIDACION)]
    public function store(StoreTourRequest $request): JsonResponse
    {
        Gate::authorize('create', Tour::class);

        $tour = $this->service->create(
            $request->user(),
            $request->validated()
        );

        return (new TourResource($tour))
            ->response()
            ->setStatusCode(201)
            ->header('Location', route('tours.show', $tour));
    }

    /**
     * Ver un tour
     */
    #[PathParameter('tour', description: 'Identificador del tour.', type: 'int', example: 1)]
    #[ApiResponse(404, 'El tour no existe (`RECURSO_NO_ENCONTRADO`).', type: ApiDocs::ERROR)]
public function show(Tour $tour): TourResource
{
    $tour->load('categoria');

    return new TourResource($tour);
}

    /**
     * Actualizar un tour
     *
     * Solo administradores y guías pueden modificar tours.
     */
    #[Endpoint(method: 'PATCH')]
    #[PathParameter('tour', description: 'Identificador del tour.', type: 'int', example: 1)]
    #[ApiResponse(400, 'El cuerpo no es un JSON válido (`SOLICITUD_MALFORMADA`).', type: ApiDocs::ERROR)]
    #[ApiResponse(403, 'El usuario no tiene permiso para modificar el tour (`PROHIBIDO`).', type: ApiDocs::ERROR)]
    #[ApiResponse(404, 'El tour no existe (`RECURSO_NO_ENCONTRADO`).', type: ApiDocs::ERROR)]
    #[ApiResponse(422, 'Datos inválidos (`VALIDACION_FALLIDA`).', type: ApiDocs::ERROR_VALIDACION)]
    public function update(UpdateTourRequest $request, Tour $tour): TourResource
    {
        Gate::authorize('update', $tour);

        return new TourResource(
            $this->service->update(
                $request->user(),
                $tour,
                $request->validated()
            )
        );
    }

    /**
     * Eliminar un tour
     *
     * No se puede eliminar un tour que tenga reservas activas.
     */
    #[PathParameter('tour', description: 'Identificador del tour.', type: 'int', example: 1)]
    #[ApiResponse(204, 'Tour eliminado. La respuesta no tiene cuerpo.')]
    #[ApiResponse(403, 'El usuario no tiene permiso para eliminar el tour (`PROHIBIDO`).', type: ApiDocs::ERROR)]
    #[ApiResponse(404, 'El tour no existe (`RECURSO_NO_ENCONTRADO`).', type: ApiDocs::ERROR)]
    #[ApiResponse(409, 'El tour tiene reservas activas (`TOUR_CON_DEPENDENCIAS`).', type: ApiDocs::ERROR)]
    public function destroy(Tour $tour): Response
    {
        Gate::authorize('delete', $tour);

        $this->service->delete(
            request()->user(),
            $tour
        );

        return response()->noContent();
    }
}