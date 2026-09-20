<?php

namespace App\Http\Controllers;

use App\Http\Resources\SalidaTourResource;
use App\Models\Tour;
use App\Services\TourService;
use App\Support\ApiDocs;
use Dedoc\Scramble\Attributes\Group;
use Dedoc\Scramble\Attributes\PathParameter;
use Dedoc\Scramble\Attributes\QueryParameter;
use Dedoc\Scramble\Attributes\Response as ApiResponse;
use Illuminate\Http\Request;

#[Group('Tours')]
class TourSalidaController extends Controller
{
    public function __construct(private TourService $service)
    {
    }

    /**
     * Listar las salidas de un tour
     *
     * Recurso anidado: devuelve solo las salidas del tour indicado, ordenadas por fecha y hora.
     */
    #[PathParameter('tour', description: 'Identificador del tour.', type: 'int', example: 1)]
    #[QueryParameter('page', description: 'Número de página.', type: 'int', default: 1, example: 2)]
    #[QueryParameter('per_page', description: 'Registros por página (1 a 50).', type: 'int', default: 15, example: 5)]
    #[ApiResponse(404, 'El tour no existe (`RECURSO_NO_ENCONTRADO`).', type: ApiDocs::ERROR)]
    public function index(Request $request, Tour $tour)
    {
        return SalidaTourResource::collection($this->service->listSalidas($tour, $request->query()));
    }
}