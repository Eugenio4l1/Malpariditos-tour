<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClienteReservaController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\ReservaEstadoController;
use App\Http\Controllers\TourController;
use App\Http\Controllers\TourSalidaController;
use Illuminate\Support\Facades\Route;

// Autenticación
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login'])
    ->middleware('throttle:login');
Route::post('logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');

// Tours: sustantivos en plural, sin verbos en la ruta
// El catálogo puede consultarse sin autenticación.
Route::get('tours', [TourController::class, 'index'])
    ->name('tours.index');

Route::get('tours/{tour}', [TourController::class, 'show'])
    ->name('tours.show');

Route::get('tours/{tour}/salidas', [TourSalidaController::class, 'index'])
    ->name('tours.salidas.index');

// Crear, modificar y eliminar tours es exclusivo de la administración.
// Además del rol, el token debe llevar la capacidad correspondiente (abilities).
Route::post('tours', [TourController::class, 'store'])
    ->name('tours.store')
    ->middleware(['auth:sanctum', 'role:admin', 'abilities:tours:crear']);

Route::put('tours/{tour}', [TourController::class, 'update'])
    ->name('tours.update')
    ->middleware(['auth:sanctum', 'role:admin', 'abilities:tours:editar']);

Route::patch('tours/{tour}', [TourController::class, 'update'])
    ->name('tours.update.patch')
    ->middleware(['auth:sanctum', 'role:admin', 'abilities:tours:editar']);

Route::delete('tours/{tour}', [TourController::class, 'destroy'])
    ->name('tours.destroy')
    ->middleware(['auth:sanctum', 'role:admin', 'abilities:tours:eliminar']);

// Reservas
// Capa 1: token con la capacidad adecuada (y rol cuando aplica).
// Capa 2: la política de Reserva decide sobre cada reserva concreta
// (por ejemplo, un cliente solo accede a las suyas).
Route::get('reservas', [ReservaController::class, 'index'])
    ->name('reservas.index')
    ->middleware(['auth:sanctum', 'abilities:reservas:ver']);

Route::post('reservas', [ReservaController::class, 'store'])
    ->name('reservas.store')
    ->middleware(['auth:sanctum', 'role:cliente', 'abilities:reservas:crear']);

Route::get('reservas/{reserva}', [ReservaController::class, 'show'])
    ->name('reservas.show')
    ->middleware(['auth:sanctum', 'abilities:reservas:ver']);

Route::put('reservas/{reserva}', [ReservaController::class, 'update'])
    ->name('reservas.update')
    ->middleware(['auth:sanctum', 'abilities:reservas:editar']);

Route::patch('reservas/{reserva}', [ReservaController::class, 'update'])
    ->name('reservas.update.patch')
    ->middleware(['auth:sanctum', 'abilities:reservas:editar']);

Route::delete('reservas/{reserva}', [ReservaController::class, 'destroy'])
    ->name('reservas.destroy')
    ->middleware(['auth:sanctum', 'abilities:reservas:eliminar']);

// El cambio de estado se modela como un sub-recurso (antes: /confirmar y /cancelar)
// POST /api/reservas/{reserva}/estados   { "estado": "confirmada" | "cancelada" }
Route::post('reservas/{reserva}/estados', [ReservaEstadoController::class, 'store'])
    ->name('reservas.estados.store')
    ->middleware(['auth:sanctum', 'role:admin,guia', 'abilities:reservas:estado']);

// Relación cliente -> reservas
Route::get('clientes/{cliente}/reservas', [ClienteReservaController::class, 'index'])
    ->name('clientes.reservas.index')
    ->middleware(['auth:sanctum', 'abilities:clientes:ver']);