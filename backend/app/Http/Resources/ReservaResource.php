<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cliente_id' => $this->cliente_id,
            'salida_tour_id' => $this->salida_tour_id,
            'cantidad_personas' => $this->cantidad_personas,
            'fecha_reserva' => $this->fecha_reserva,
            'estado' => $this->estado,
            'total' => $this->total,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}