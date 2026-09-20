<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTourRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $tourId = $this->route('tour');

        return [
            /**
             * Identificador de la categoría (debe existir).
             * @example 2
             */
            'categoria_id' => ['sometimes', 'required', 'integer', 'exists:categorias,id'],
            /**
             * Nombre único del tour (3 a 150 caracteres).
             * @example "Caminata nocturna al volcán"
             */
            'nombre' => [
                'sometimes', 'required', 'string', 'min:3', 'max:150',
                Rule::unique('tours', 'nombre')->ignore($tourId),
            ],
            /**
             * Descripción opcional (máximo 2000 caracteres).
             * @example "Ahora con transporte incluido."
             */
            'descripcion' => ['nullable', 'string', 'max:2000'],
            /**
             * Precio por persona (0 a 999999.99).
             * @example 52000
             */
            'precio' => ['sometimes', 'required', 'numeric', 'min:0', 'max:999999.99'],
            /**
             * Duración en horas (1 a 24).
             * @example 5
             */
            'duracion_horas' => ['sometimes', 'required', 'integer', 'min:1', 'max:24'],
            /**
             * Estado comercial del tour.
             * @example "inactivo"
             */
            'estado' => ['sometimes', 'required', 'string', 'in:activo,inactivo'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'categoria_id.required' => 'La categoría es obligatoria.',
            'categoria_id.integer' => 'La categoría no es válida.',
            'categoria_id.exists' => 'La categoría seleccionada no existe.',
            'nombre.required' => 'El nombre del tour es obligatorio.',
            'nombre.min' => 'El nombre debe tener al menos :min caracteres.',
            'nombre.max' => 'El nombre no puede superar los :max caracteres.',
            'nombre.unique' => 'Ya existe un tour registrado con ese nombre.',
            'descripcion.max' => 'La descripción no puede superar los :max caracteres.',
            'precio.required' => 'El precio es obligatorio.',
            'precio.numeric' => 'El precio debe ser un número.',
            'precio.min' => 'El precio no puede ser negativo.',
            'precio.max' => 'El precio no puede superar :max.',
            'duracion_horas.required' => 'La duración es obligatoria.',
            'duracion_horas.integer' => 'La duración debe ser un número entero de horas.',
            'duracion_horas.min' => 'La duración mínima es de :min hora.',
            'duracion_horas.max' => 'La duración máxima es de :max horas.',
            'estado.required' => 'El estado es obligatorio.',
            'estado.in' => 'El estado debe ser "activo" o "inactivo".',
        ];
    }
}