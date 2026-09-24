<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClienteReservaController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\ReservaEstadoController;
use App\Http\Controllers\TourSalidaController;
use Illuminate\Support\Facades\Route;

// Autenticación
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// Tours: sustantivos en plural, sin verbos en la ruta
Route::apiResource('tours', 'App\\Http\\Controllers\\TourController');
Route::apiResource('tours.salidas', TourSalidaController::class)->only('index');

// Reservas
Route::apiResource('reservas', ReservaController::class);

// El cambio de estado se modela como un sub-recurso (antes: /confirmar y /cancelar)
// POST /api/reservas/{reserva}/estados   { "estado": "confirmada" | "cancelada" }
Route::post('reservas/{reserva}/estados', [ReservaEstadoController::class, 'store'])
    ->name('reservas.estados.store');

// Relación cliente -> reservas
Route::apiResource('clientes.reservas', ClienteReservaController::class)->only('index');