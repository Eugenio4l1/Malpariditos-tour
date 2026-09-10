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
        Schema::create('llegada_tours', function (Blueprint $table) {
    $table->id();
    $table->foreignId('salida_tour_id')->unique()->constrained('salida_tours')->onDelete('cascade');
    $table->date('fecha_llegada');
    $table->time('hora_llegada');
    $table->string('estado', 30);
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('llegada_tours');
    }
};
