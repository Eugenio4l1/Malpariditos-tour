<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReservaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cantidad_personas' => ['sometimes', 'required', 'integer', 'min:1', 'max:20'],
            'fecha_reserva' => ['sometimes', 'required', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'cantidad_personas.required' => 'La cantidad de personas es obligatoria.',
            'cantidad_personas.integer' => 'La cantidad de personas debe ser un número entero.',
            'cantidad_personas.min' => 'Debes reservar al menos :min persona.',
            'cantidad_personas.max' => 'No puedes reservar más de :max personas por reserva.',

            'fecha_reserva.required' => 'La fecha de reserva es obligatoria.',
            'fecha_reserva.date' => 'La fecha de reserva no tiene un formato válido.',
        ];
    }
}