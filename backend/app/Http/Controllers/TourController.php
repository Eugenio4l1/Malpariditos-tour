<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTourRequest;
use App\Http\Requests\UpdateTourRequest;
use App\Http\Resources\TourResource;
use App\Models\Tour;
use App\Services\TourService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TourController extends Controller
{
    public function __construct(private TourService $service)
    {
    }

    public function index(Request $request)
    {
        return TourResource::collection($this->service->list($request->query()));
    }

    public function store(StoreTourRequest $request): JsonResponse
    {
        $tour = $this->service->create($request->validated());

        return (new TourResource($tour))
            ->response()
            ->setStatusCode(201)
            ->header('Location', route('tours.show', $tour));
    }

    public function show(Tour $tour): TourResource
    {
        return new TourResource($tour->load('categoria'));
    }

    public function update(UpdateTourRequest $request, Tour $tour): TourResource
    {
        return new TourResource($this->service->update($tour, $request->validated()));
    }

    public function destroy(Tour $tour): Response
    {
        $this->service->delete($tour);

        return response()->noContent();
    }
}