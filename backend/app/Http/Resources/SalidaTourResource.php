<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalidaTourResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tour_id' => $this->tour_id,
            'fecha' => $this->fecha?->toDateString(),
            'hora' => $this->hora,
            'cupo_maximo' => $this->cupo_maximo,
            'estado' => $this->estado,
        ];
    }
}