<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalidaTour extends Model
{
    use HasFactory;

    protected $table = 'salida_tours';
    protected $fillable = ['tour_id', 'fecha', 'hora', 'cupo_maximo', 'estado'];
    protected $casts = ['fecha' => 'date'];

    public function tour()
    {
        return $this->belongsTo(Tour::class);
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'salida_tour_id');
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
    
    public function cupoDisponible(): int
{
    $ocupados = $this->reservas()
        ->where('estado', '!=', 'cancelada')
        ->sum('cantidad_personas');

    return max(0, $this->cupo_maximo - $ocupados);
}
   

}
