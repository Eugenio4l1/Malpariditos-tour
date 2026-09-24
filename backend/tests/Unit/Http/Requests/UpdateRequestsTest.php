<?php

namespace Tests\Unit\Http\Requests;

use App\Http\Requests\UpdateReservaRequest;
use App\Http\Requests\UpdateTourRequest;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class UpdateRequestsTest extends TestCase
{
    public function test_update_reserva_request_autoriza(): void
    {
        $request = new UpdateReservaRequest();

        $this->assertTrue($request->authorize());
    }

    public function test_update_reserva_request_acepta_datos_validos(): void
    {
        $request = new UpdateReservaRequest();

        $validator = Validator::make(
            [
                'cantidad_personas' => 4,
                'fecha_reserva' => '2026-10-20',
            ],
            $request->rules()
        );

        $this->assertFalse($validator->fails());
    }

    public function test_update_reserva_request_rechaza_cantidad_menor_a_uno(): void
    {
        $request = new UpdateReservaRequest();

        $validator = Validator::make(
            [
                'cantidad_personas' => 0,
            ],
            $request->rules()
        );

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey(
            'cantidad_personas',
            $validator->errors()->toArray()
        );
    }

    public function test_update_reserva_request_rechaza_cantidad_mayor_a_veinte(): void
    {
        $request = new UpdateReservaRequest();

        $validator = Validator::make(
            [
                'cantidad_personas' => 21,
            ],
            $request->rules()
        );

        $this->assertTrue($validator->fails());
    }

    public function test_update_reserva_request_rechaza_fecha_invalida(): void
    {
        $request = new UpdateReservaRequest();

        $validator = Validator::make(
            [
                'fecha_reserva' => 'fecha-invalida',
            ],
            $request->rules()
        );

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey(
            'fecha_reserva',
            $validator->errors()->toArray()
        );
    }

    public function test_update_tour_request_autoriza(): void
    {
        $request = new UpdateTourRequest();

        $this->assertTrue($request->authorize());
    }

    public function test_update_tour_request_acepta_estado_valido(): void
    {
        $request = UpdateTourRequest::create('/api/tours/1', 'PUT');

        $validator = Validator::make(
            [
                'estado' => 'activo',
            ],
            $request->rules()
        );

        $this->assertFalse($validator->fails());
    }

    public function test_update_tour_request_rechaza_estado_invalido(): void
    {
        $request = UpdateTourRequest::create('/api/tours/1', 'PUT');

        $validator = Validator::make(
            [
                'estado' => 'pausado',
            ],
            $request->rules()
        );

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey(
            'estado',
            $validator->errors()->toArray()
        );
    }

    public function test_update_tour_request_rechaza_precio_negativo(): void
    {
        $request = UpdateTourRequest::create('/api/tours/1', 'PUT');

        $validator = Validator::make(
            [
                'precio' => -1,
            ],
            $request->rules()
        );

        $this->assertTrue($validator->fails());
    }

    public function test_update_tour_request_rechaza_duracion_fuera_de_rango(): void
    {
        $request = UpdateTourRequest::create('/api/tours/1', 'PUT');

        $validator = Validator::make(
            [
                'duracion_horas' => 25,
            ],
            $request->rules()
        );

        $this->assertTrue($validator->fails());
    }
}