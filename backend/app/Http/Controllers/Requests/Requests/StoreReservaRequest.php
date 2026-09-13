<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReservaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Obligatorio + existencia de clave foránea
            'cliente_id' => ['required', 'integer', 'exists:clientes,id'],

            // Obligatorio + existencia de clave foránea + unicidad compuesta
            'salida_tour_id' => [
                'required',
                'integer',
                'exists:salida_tours,id',
                Rule::unique('reservas', 'salida_tour_id')->where(function ($query) {
                    return $query->where('cliente_id', $this->cliente_id)
                                  ->where('estado', '!=', 'cancelada');
                }),
            ],

            // Rango numérico
            'cantidad_personas' => ['required', 'integer', 'min:1', 'max:20'],

            // Formato de fecha
            'fecha_reserva' => ['required', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'cliente_id.required' => 'El cliente es obligatorio.',
            'cliente_id.integer' => 'El identificador del cliente debe ser numérico.',
            'cliente_id.exists' => 'El cliente indicado no existe.',

            'salida_tour_id.required' => 'La salida del tour es obligatoria.',
            'salida_tour_id.integer' => 'El identificador de la salida del tour debe ser numérico.',
            'salida_tour_id.exists' => 'La salida del tour indicada no existe.',
            'salida_tour_id.unique' => 'Ya tienes una reserva activa para esta salida de tour.',

            'cantidad_personas.required' => 'La cantidad de personas es obligatoria.',
            'cantidad_personas.integer' => 'La cantidad de personas debe ser un número entero.',
            'cantidad_personas.min' => 'Debes reservar al menos :min persona.',
            'cantidad_personas.max' => 'No puedes reservar más de :max personas por reserva.',

            'fecha_reserva.required' => 'La fecha de reserva es obligatoria.',
            'fecha_reserva.date' => 'La fecha de reserva no tiene un formato válido.',
        ];
    }
}