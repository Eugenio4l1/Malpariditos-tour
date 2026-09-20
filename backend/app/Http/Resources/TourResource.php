<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            /**
             * Identificador del tour.
             * @example 12
             */
            'id' => $this->id,
            /**
             * Identificador de la categoría a la que pertenece.
             * @example 1
             */
            'categoria_id' => $this->categoria_id,
            /**
             * Nombre único del tour.
             * @example "Caminata al volcán Rincón de la Vieja"
             */
            'nombre' => $this->nombre,
            /**
             * Descripción opcional.
             * @example "Recorrido guiado de medio día por el parque nacional."
             */
            'descripcion' => $this->descripcion,
            /**
             * Precio por persona.
             * @example 45000
             */
            'precio' => (float) $this->precio,
            /**
             * Duración en horas (1 a 24).
             * @example 4
             */
            'duracion_horas' => $this->duracion_horas,
            /**
             * Estado comercial del tour.
             * @var 'activo'|'inactivo'
             * @example "activo"
             */
            'estado' => $this->estado,
            /** Categoría del tour. Solo se incluye cuando está cargada (listado y detalle). */
            'categoria' => new CategoriaResource($this->whenLoaded('categoria')),
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