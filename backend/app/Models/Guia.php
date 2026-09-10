<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guia extends Model
{
    protected $table = 'guias';

    protected $fillable = ['nombre', 'email', 'telefono', 'especialidad'];

    public function salidaTours()
    {
        return $this->belongsToMany(SalidaTour::class, 'guia_salida')
            ->withPivot('rol', 'fecha_asignacion', 'estado')
            ->withTimestamps();
    }
}