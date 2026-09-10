<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuiaSalida extends Model
{
    protected $table = 'guia_salida';

    protected $fillable = ['guia_id', 'salida_tour_id', 'rol', 'fecha_asignacion', 'estado'];

    protected $casts = [
        'fecha_asignacion' => 'date',
    ];

    public $incrementing = false; // PK compuesta, no autoincremental simple

    public function guia()
    {
        return $this->belongsTo(Guia::class);
    }

    public function salidaTour()
    {
        return $this->belongsTo(SalidaTour::class);
    }
}