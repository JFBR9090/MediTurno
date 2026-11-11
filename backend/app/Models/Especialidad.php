<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Especialidad extends Model
{
    protected $table = 'especialidades';

    protected $fillable = [
        'nombre',
        'descripcion',
        'icono',
        'tiempo_promedio_min',
        'activa',
    ];

    protected function casts(): array
    {
        return [
            'activa' => 'boolean',
            'tiempo_promedio_min' => 'integer',
        ];
    }

    public function medicos(): HasMany
    {
        return $this->hasMany(Medico::class, 'especialidad_id');
    }

    public function citas(): HasMany
    {
        return $this->hasMany(Cita::class, 'especialidad_id');
    }
}

