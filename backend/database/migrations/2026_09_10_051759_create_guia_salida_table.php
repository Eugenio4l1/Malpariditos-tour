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
       Schema::create('guia_salida', function (Blueprint $table) {
    $table->foreignId('guia_id')->constrained('guias')->onDelete('cascade');
    $table->foreignId('salida_tour_id')->constrained('salida_tours')->onDelete('cascade');
    $table->string('rol', 50);
    $table->date('fecha_asignacion');
    $table->string('estado', 30);
    $table->primary(['guia_id', 'salida_tour_id']);
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guia_salida');
    }
};
