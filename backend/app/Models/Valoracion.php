<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Valoracion extends Model
{
    protected $table = 'valoraciones';

    protected $fillable = ['cliente_id', 'tour_id', 'puntuacion', 'comentario', 'fecha'];

    protected $casts = [
        'fecha' => 'date',
        'puntuacion' => 'integer',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function tour()
    {
        return $this->belongsTo(Tour::class);
    }
}