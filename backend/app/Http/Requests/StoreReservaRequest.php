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

    /**
     * Si quien reserva es un cliente, su cliente_id sale de su sesión (token),
     * no de lo que envíe el navegador.
     */
    protected function prepareForValidation(): void
    {
        $user = $this->user();

        if ($user && $user->role === 'cliente' && $user->cliente) {
            $this->merge(['cliente_id' => $user->cliente->id]);
        }
    }

    public function rules(): array
    {
        return [
            /**
             * Identificador del cliente (debe existir).
             * @example 1
             */
            'cliente_id' => ['required', 'integer', 'exists:clientes,id'],

            /**
             * Identificador de la salida (debe existir). Un cliente no puede tener dos reservas activas para la misma salida.
             * @example 3
             */
            'salida_tour_id' => [
                'required_without:tour_id',
                'nullable',
                'integer',
                'exists:salida_tours,id',
                Rule::unique('reservas', 'salida_tour_id')->where(function ($query) {
                    return $query->where('cliente_id', $this->cliente_id)
                                  ->where('estado', '!=', 'cancelada');
                }),
            ],

            /**
             * Alternativa a `salida_tour_id`: id del tour a reservar. Junto con `fecha`,
             * el servidor busca la salida de ese día o la programa si todavía no existe.
             * @example 1
             */
            'tour_id' => ['required_without:salida_tour_id', 'nullable', 'integer', 'exists:tours,id'],

            /**
             * Día de la salida (AAAA-MM-DD). Obligatoria cuando se envía `tour_id`.
             * @example "2026-11-27"
             */
            'fecha' => ['required_with:tour_id', 'nullable', 'date_format:Y-m-d', 'after_or_equal:today'],

            /**
             * Cantidad de personas (1 a 20). Desde 5 personas se aplica un 10 % de descuento.
             * @example 2
             */
            'cantidad_personas' => ['required', 'integer', 'min:1', 'max:20'],

            /**
             * Fecha de la reserva.
             * @example "2026-10-15"
             */
            'fecha_reserva' => ['required', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'cliente_id.required' => 'El cliente es obligatorio.',
            'cliente_id.integer' => 'El identificador del cliente debe ser numérico.',
            'cliente_id.exists' => 'El cliente indicado no existe.',

            'salida_tour_id.required_without' => 'Indica la salida del tour o el tour y la fecha.',
            'tour_id.required_without' => 'Indica el tour o la salida del tour.',
            'tour_id.exists' => 'El tour indicado no existe.',
            'fecha.required_with' => 'La fecha de la salida es obligatoria.',
            'fecha.date_format' => 'La fecha de la salida debe tener el formato AAAA-MM-DD.',
            'fecha.after_or_equal' => 'La fecha de la salida debe ser hoy o posterior.',
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