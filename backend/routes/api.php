<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\TourController;

// Rutas de Reserva
Route::apiResource('reservas', ReservaController::class);
Route::post('reservas/{reserva}/confirmar', [ReservaController::class, 'confirmar']);
Route::post('reservas/{reserva}/cancelar', [ReservaController::class, 'cancelar']);

// Rutas de Tour
Route::apiResource('tours', TourController::class);
