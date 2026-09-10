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
       Schema::create('salida_tours', function (Blueprint $table) {
    $table->id();
    $table->foreignId('tour_id')->constrained('tours')->onDelete('cascade');
    $table->date('fecha');
    $table->time('hora');
    $table->integer('cupo_maximo');
    $table->string('estado', 30);
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salida_tours');
    }
};
