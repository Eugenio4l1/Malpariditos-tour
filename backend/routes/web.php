<?php

use App\Models\Tour;

Route::get('/tours-activos', function () {
    return Tour::activos()->get();
});

Route::get('/tours-por-categoria', function () {
    return Tour::selectRaw('categoria_id, COUNT(*) as total, AVG(precio) as precio_promedio')
        ->groupBy('categoria_id')
        ->get();
});
