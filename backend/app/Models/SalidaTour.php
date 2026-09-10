<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalidaTour extends Model
{
    protected $table = 'salida_tours';

    protected $fillable = ['tour_id', 'fecha', 'hora', 'cupo_maximo', 'estado'];

    protected $casts = [
        'fecha' => 'date',
    ];

    public function tour()
    {
        return $this->belongsTo(Tour::class);
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }

    public function llegadaTour()
    {
        return $this->hasOne(LlegadaTour::class);
    }

    public function guias()
    {
        return $this->belongsToMany(Guia::class, 'guia_salida')
            ->withPivot('rol', 'fecha_asignacion', 'estado')
            ->withTimestamps();
    }
}