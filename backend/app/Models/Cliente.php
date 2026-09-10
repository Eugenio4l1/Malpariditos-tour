<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $table = 'clientes';

    protected $fillable = ['nombre', 'email', 'telefono', 'password'];

    protected $hidden = ['password'];

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }

    public function valoraciones()
    {
        return $this->hasMany(Valoracion::class);
    }
}