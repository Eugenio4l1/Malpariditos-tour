<?php

namespace Tests\Feature;

use App\Exceptions\BusinessRuleException;
use App\Models\Categoria;
use App\Models\Cliente;
use App\Models\Reserva;
use App\Models\SalidaTour;
use App\Models\Tour;
use App\Services\TourService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TourServiceTest extends TestCase
{
    use RefreshDatabase;

    private TourService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(TourService::class);
    }

    // CRUD: crear
    public function test_crea_un_tour(): void
    {
        $categoria = Categoria::factory()->create();

        $tour = $this->service->create([
            'categoria_id' => $categoria->id,
            'nombre' => 'Tour de prueba',
            'descripcion' => 'Descripción de prueba',
            'precio' => 150.00,
            'duracion_horas' => 3,
            'estado' => 'activo',
        ]);

        $this->assertDatabaseHas('tours', ['nombre' => 'Tour de prueba']);
        $this->assertEquals('activo', $tour->estado);
    }

    // CRUD: actualizar
    public function test_actualiza_un_tour(): void
    {
        $tour = Tour::factory()->create(['precio' => 100]);

        $actualizado = $this->service->update($tour, ['precio' => 200]);

        $this->assertEquals(200, (float) $actualizado->precio);
        $this->assertDatabaseHas('tours', ['id' => $tour->id, 'precio' => 200]);
    }

    // CRUD: eliminar sin dependencias (camino feliz)
    public function test_elimina_un_tour_sin_dependencias(): void
    {
        $tour = Tour::factory()->create();

        $this->service->delete($tour);

        $this->assertDatabaseMissing('tours', ['id' => $tour->id]);
    }

    // Regla de negocio: no eliminar un tour con salidas que tienen reservas activas
    public function test_no_permite_eliminar_un_tour_con_dependencias_activas(): void
    {
        $tour = Tour::factory()->create();
        $salida = SalidaTour::factory()->create(['tour_id' => $tour->id]);
        $cliente = Cliente::factory()->create();

        Reserva::factory()->create([
            'salida_tour_id' => $salida->id,
            'cliente_id' => $cliente->id,
            'estado' => 'pendiente',
        ]);

        $this->expectException(BusinessRuleException::class);

        $this->service->delete($tour);

        // El tour no debe haberse borrado
        $this->assertDatabaseHas('tours', ['id' => $tour->id]);
    }

    // Regla de negocio: una reserva cancelada NO cuenta como dependencia activa
    public function test_permite_eliminar_un_tour_cuyas_reservas_estan_canceladas(): void
    {
        $tour = Tour::factory()->create();
        $salida = SalidaTour::factory()->create(['tour_id' => $tour->id]);
        $cliente = Cliente::factory()->create();

        Reserva::factory()->create([
            'salida_tour_id' => $salida->id,
            'cliente_id' => $cliente->id,
            'estado' => 'cancelada',
        ]);

        $this->service->delete($tour);

        $this->assertDatabaseMissing('tours', ['id' => $tour->id]);
    }

    // Listado: filtro por estado
    public function test_lista_tours_filtrando_por_estado(): void
    {
        Tour::factory()->count(3)->create(['estado' => 'activo']);
        Tour::factory()->count(2)->create(['estado' => 'inactivo']);

        $resultado = $this->service->list(['estado' => 'activo']);

        $this->assertEquals(3, $resultado->total());
    }

    // Listado: filtro combinado (categoría + rango de precio)
    public function test_lista_tours_con_filtros_combinados(): void
    {
        $categoria = Categoria::factory()->create();

        Tour::factory()->create(['categoria_id' => $categoria->id, 'precio' => 50]);
        Tour::factory()->create(['categoria_id' => $categoria->id, 'precio' => 150]);
        Tour::factory()->create(['categoria_id' => $categoria->id, 'precio' => 500]);
        Tour::factory()->create(['precio' => 150]); // otra categoría, no debe salir

        $resultado = $this->service->list([
            'categoria_id' => $categoria->id,
            'precio_min' => 100,
            'precio_max' => 200,
        ]);

        $this->assertEquals(1, $resultado->total());
    }

    // Listado: ordenamiento por precio ascendente
    public function test_lista_tours_ordenados_por_precio_ascendente(): void
    {
        Tour::factory()->create(['nombre' => 'Caro', 'precio' => 300]);
        Tour::factory()->create(['nombre' => 'Barato', 'precio' => 50]);
        Tour::factory()->create(['nombre' => 'Medio', 'precio' => 150]);

        $resultado = $this->service->list(['sort_by' => 'precio', 'sort_dir' => 'asc']);

        $this->assertEquals('Barato', $resultado->items()[0]->nombre);
        $this->assertEquals('Caro', $resultado->items()[2]->nombre);
    }

    // Listado: tope máximo de tamaño de página
    public function test_el_listado_respeta_el_tope_maximo_de_pagina(): void
    {
        Tour::factory()->count(60)->create();

        $resultado = $this->service->list(['per_page' => 1000]);

        $this->assertEquals(50, $resultado->perPage());
    }
}