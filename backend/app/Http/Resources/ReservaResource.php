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
            'fecha_reserva' => $this->fecha_reserva?->toIso8601String(),
            'estado' => $this->estado,
            'total' => (float) $this->total,
            'creado_en' => $this->created_at?->toIso8601String(),
            'actualizado_en' => $this->updated_at?->toIso8601String(),
        ];
    }
}