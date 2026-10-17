<?php

namespace App\Models;


use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'role'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
  
    use HasApiTokens, HasFactory, Notifiable;

   
    public const ROL_ADMIN = 'admin';
public const ROL_GUIA = 'guia';
public const ROL_CLIENTE = 'cliente';


public const CAPACIDADES_POR_ROL = [
    self::ROL_ADMIN => [
        'tours:crear', 'tours:editar', 'tours:eliminar',
        'reservas:ver', 'reservas:editar', 'reservas:eliminar', 'reservas:estado',
        'clientes:ver',
    ],
    self::ROL_GUIA => [
        'reservas:ver', 'reservas:estado',
        'clientes:ver',
    ],
    self::ROL_CLIENTE => [
        'reservas:ver', 'reservas:crear', 'reservas:editar', 'reservas:eliminar',
        'clientes:ver',
    ],
];

protected $attributes = [
    'role' => self::ROL_CLIENTE,
];

/** @return array<int, string> */
public function capacidades(): array
{
    return self::CAPACIDADES_POR_ROL[$this->role] ?? [];
}


public function cliente()
{
    return $this->hasOne(Cliente::class, 'user_id');
}
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}