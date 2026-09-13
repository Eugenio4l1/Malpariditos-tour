<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTourRequest;
use App\Http\Requests\UpdateTourRequest;
use App\Http\Resources\TourResource;
use App\Models\Tour;
use App\Services\TourService;
use Illuminate\Http\Request;

class TourController extends Controller
{
    public function __construct(private TourService $service)
    {
    }

    public function index(Request $request)
    {
        return TourResource::collection($this->service->list($request->query()));
    }

    public function store(StoreTourRequest $request)
    {
        $tour = $this->service->create($request->validated());

        return (new TourResource($tour))->response()->setStatusCode(201);
    }

    public function show(Tour $tour)
    {
        return new TourResource($tour);
    }

    public function update(UpdateTourRequest $request, Tour $tour)
    {
        $tour = $this->service->update($tour, $request->validated());

        return new TourResource($tour);
    }

    public function destroy(Tour $tour)
    {
        $this->service->delete($tour);

        return response()->json(null, 204);
    }
}