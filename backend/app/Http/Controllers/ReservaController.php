<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReservaRequest;
use App\Http\Requests\UpdateReservaRequest;
use App\Http\Resources\ReservaResource;
use App\Models\Reserva;
use App\Services\ReservaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReservaController extends Controller
{
    public function __construct(private ReservaService $service)
    {
    }

    public function index(Request $request)
    {
        return ReservaResource::collection($this->service->list($request->query()));
    }

    public function store(StoreReservaRequest $request): JsonResponse
    {
        $reserva = $this->service->create($request->validated());

        return (new ReservaResource($reserva))
            ->response()
            ->setStatusCode(201)
            ->header('Location', route('reservas.show', $reserva));
    }

    public function show(Reserva $reserva): ReservaResource
    {
        return new ReservaResource($reserva);
    }

    public function update(UpdateReservaRequest $request, Reserva $reserva): ReservaResource
    {
        return new ReservaResource($this->service->update($reserva, $request->validated()));
    }

    public function destroy(Reserva $reserva): Response
    {
        $this->service->delete($reserva);

        return response()->noContent();
    }
}