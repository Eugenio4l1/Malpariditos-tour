<?php

namespace App\Http\Controllers;

use App\Http\Resources\SalidaTourResource;
use App\Models\Tour;
use App\Services\TourService;
use Illuminate\Http\Request;

class TourSalidaController extends Controller
{
    public function __construct(private TourService $service)
    {
    }

    // GET /api/tours/{tour}/salidas
    public function index(Request $request, Tour $tour)
    {
        return SalidaTourResource::collection($this->service->listSalidas($tour, $request->query()));
    }
}