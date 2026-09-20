<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReservaEstadoRequest;
use App\Http\Resources\ReservaResource;
use App\Models\Reserva;
use App\Services\ReservaService;

class ReservaEstadoController extends Controller
{
    public function __construct(private ReservaService $service)
    {
    }

    // POST /api/reservas/{reserva}/estados -> 200 con la reserva actualizada
    public function store(StoreReservaEstadoRequest $request, Reserva $reserva): ReservaResource
    {
        return new ReservaResource(
            $this->service->cambiarEstado($reserva, $request->validated('estado'))
        );
    }
}