<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            /**
             * Identificador de la reserva.
             * @example 7
             */
            'id' => $this->id,
            /**
             * Identificador del cliente que reserva.
             * @example 1
             */
            'cliente_id' => $this->cliente_id,
            /**
             * Identificador de la salida reservada.
             * @example 3
             */
            'salida_tour_id' => $this->salida_tour_id,
            /**
             * Cantidad de personas (1 a 20).
             * @example 2
             */
            'cantidad_personas' => $this->cantidad_personas,
            /**
             * Fecha en que se registró la reserva.
             * @format date-time
             * @example "2026-10-15T00:00:00-06:00"
             */
            'fecha_reserva' => $this->fecha_reserva?->toIso8601String(),
            /**
             * Estado de la reserva.
             * @var 'pendiente'|'confirmada'|'cancelada'
             * @example "pendiente"
             */
            'estado' => $this->estado,
            /**
             * Total calculado (incluye el descuento del 10 % desde 5 personas).
             * @example 90000
             */
            'total' => (float) $this->total,
            /**
             * Fecha de creación.
             * @format date-time
             * @example "2026-09-20T10:15:00-06:00"
             */
            'creado_en' => $this->created_at?->toIso8601String(),
            /**
             * Fecha de la última actualización.
             * @format date-time
             * @example "2026-09-20T10:15:00-06:00"
             */
            'actualizado_en' => $this->updated_at?->toIso8601String(),
        ];
    }
}