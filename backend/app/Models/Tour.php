<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tour extends Model
{
    use HasFactory;
    protected $table = 'tours';

    protected $fillable = ['categoria_id', 'nombre', 'descripcion', 'precio', 'duracion_horas', 'estado'];

    protected $casts = [
        'precio' => 'decimal:2',
    ];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    public function salidaTours()
    {
        return $this->hasMany(SalidaTour::class);
    }

    public function valoraciones()
    {
        return $this->hasMany(Valoracion::class);
    }

    // Scope de ejemplo, útil para el punto 5 del lab (consultas con scopes)
    public function scopeActivos($query)
    {
        return $query->where('estado', 'activo');
    }
}