<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    protected $table = 'reservas';

    protected $fillable = ['cliente_id', 'salida_tour_id', 'cantidad_personas', 'fecha_reserva', 'estado', 'total'];

    protected $casts = [
        'fecha_reserva' => 'datetime',
        'total' => 'decimal:2',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function salidaTour()
    {
        return $this->belongsTo(SalidaTour::class);
    }
}