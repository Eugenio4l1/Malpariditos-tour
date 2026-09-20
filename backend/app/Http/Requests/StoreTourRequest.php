<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTourRequest extends FormRequest
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
        return [
            /**
             * Identificador de la categoría (debe existir).
             * @example 1
             */
            'categoria_id' => ['required', 'integer', 'exists:categorias,id'],
            /**
             * Nombre único del tour (3 a 150 caracteres).
             * @example "Caminata al volcán Rincón de la Vieja"
             */
            'nombre' => ['required', 'string', 'min:3', 'max:150', 'unique:tours,nombre'],
            /**
             * Descripción opcional (máximo 2000 caracteres).
             * @example "Recorrido guiado de medio día por el parque nacional."
             */
            'descripcion' => ['nullable', 'string', 'max:2000'],
            /**
             * Precio por persona (0 a 999999.99).
             * @example 45000
             */
            'precio' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            /**
             * Duración en horas (1 a 24).
             * @example 4
             */
            'duracion_horas' => ['required', 'integer', 'min:1', 'max:24'],
            /**
             * Estado comercial del tour.
             * @example "activo"
             */
            'estado' => ['required', 'string', 'in:activo,inactivo'],
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