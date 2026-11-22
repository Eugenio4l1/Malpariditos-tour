<?php

use Illuminate\Support\Facades\Route;
use App\Models\Tour;

// Raíz de la API: respuesta ligera. La vista "welcome" usa @vite y fallaría
// en producción porque la imagen no incluye los recursos compilados.
Route::get('/', function () {
    return response()->json([
        'servicio' => 'Malpariditos Tour API',
        'estado' => 'activo',
    ]);
});

Route::get('/tours-activos', function () {
    return Tour::activos()->get();
});

Route::get('/tours-por-categoria', function () {
    return Tour::selectRaw('categoria_id, COUNT(*) as total, AVG(precio) as precio_promedio')
        ->groupBy('categoria_id')
        ->get();
});