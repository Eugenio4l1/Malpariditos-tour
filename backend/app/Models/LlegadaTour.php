<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LlegadaTour extends Model
{
    protected $table = 'llegada_tours';

    protected $fillable = ['salida_tour_id', 'fecha_llegada', 'hora_llegada', 'estado'];

    protected $casts = [
        'fecha_llegada' => 'date',
    ];

    public function salidaTour()
    {
        return $this->belongsTo(SalidaTour::class);
    }
}