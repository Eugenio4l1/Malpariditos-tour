<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReservaRequest;
use App\Http\Requests\UpdateReservaRequest;
use App\Http\Resources\ReservaResource;
use App\Models\Reserva;
use App\Services\ReservaService;
use Illuminate\Http\Request;

class ReservaController extends Controller
{
    public function __construct(private ReservaService $service)
    {
    }

    public function index(Request $request)
    {
        return ReservaResource::collection($this->service->list($request->query()));
    }

    public function store(StoreReservaRequest $request)
    {
        $reserva = $this->service->create($request->validated());
        return (new ReservaResource($reserva))->response()->setStatusCode(201);
    }

    public function show(Reserva $reserva)
    {
        return new ReservaResource($reserva);
    }

    public function update(UpdateReservaRequest $request, Reserva $reserva)
    {
        $reserva = $this->service->update($reserva, $request->validated());
        return new ReservaResource($reserva);
    }

    public function destroy(Reserva $reserva)
    {
        $this->service->delete($reserva);
        return response()->json(null, 204);
    }

    public function confirmar(Reserva $reserva)
    {
        return new ReservaResource($this->service->confirm($reserva));
    }

    public function cancelar(Reserva $reserva)
    {
        return new ReservaResource($this->service->cancel($reserva));
    }
}