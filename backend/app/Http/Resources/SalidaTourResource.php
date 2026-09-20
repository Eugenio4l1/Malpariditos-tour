<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalidaTourResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            /**
             * Identificador de la salida.
             * @example 3
             */
            'id' => $this->id,
            /**
             * Identificador del tour al que pertenece.
             * @example 1
             */
            'tour_id' => $this->tour_id,
            /**
             * Fecha de la salida.
             * @format date
             * @example "2026-10-15"
             */
            'fecha' => $this->fecha?->toDateString(),
            /**
             * Hora de la salida.
             * @example "09:00:00"
             */
            'hora' => $this->hora,
            /**
             * Cupo máximo de personas.
             * @example 12
             */
            'cupo_maximo' => $this->cupo_maximo,
            /**
             * Estado de la salida.
             * @example "programada"
             */
            'estado' => $this->estado,
        ];
    }
}