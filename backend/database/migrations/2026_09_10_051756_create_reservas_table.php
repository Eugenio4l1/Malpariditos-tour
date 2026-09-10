<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
    $table->id();
    $table->foreignId('cliente_id')->constrained('clientes')->onDelete('restrict');
    $table->foreignId('salida_tour_id')->constrained('salida_tours')->onDelete('cascade');
    $table->integer('cantidad_personas');
    $table->dateTime('fecha_reserva');
    $table->string('estado', 30);
    $table->decimal('total', 10, 2);
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};
