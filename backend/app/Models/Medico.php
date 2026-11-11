<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Medico extends Model
{
    protected $table = 'medicos';

    protected $fillable = [
        'user_id',
        'especialidad_id',
        'tarjeta_profesional',
        'consultorio',
        'biografia',
        'duracion_cita_defecto_min',
        'calificacion',
        'iniciales',
        'color_avatar',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
            'duracion_cita_defecto_min' => 'integer',
            'calificacion' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function especialidad(): BelongsTo
    {
        return $this->belongsTo(Especialidad::class, 'especialidad_id');
    }

    public function horarios(): HasMany
    {
        return $this->hasMany(HorarioAtencion::class, 'medico_id');
    }

    public function bloqueos(): HasMany
    {
        return $this->hasMany(BloqueoHorario::class, 'medico_id');
    }

    public function citas(): HasMany
    {
        return $this->hasMany(Cita::class, 'medico_id');
    }

    public function toFrontendArray(): array
    {
        $this->loadMissing(['user', 'especialidad', 'horarios']);
        $nombreCompleto = trim(($this->user?->nombre ?? '') . ' ' . ($this->user?->apellido ?? ''));
        $diasAtencion = $this->horarios
            ->where('activo', true)
            ->pluck('dia_semana')
            ->unique()
            ->sort()
            ->values()
            ->all();

        return [
            'id' => $this->id,
            'usuario_id' => $this->user_id,
            'nombre' => $nombreCompleto,
            'correo' => $this->user?->email,
            'tarjeta_profesional' => $this->tarjeta_profesional,
            'especialidad_id' => $this->especialidad_id,
            'especialidad' => $this->especialidad?->nombre,
            'consultorio' => $this->consultorio,
            'biografia' => $this->biografia,
            'duracion_cita_defecto_min' => $this->duracion_cita_defecto_min,
            'calificacion' => $this->calificacion,
            'activo' => $this->activo,
            'iniciales' => $this->iniciales,
            'colorAvatar' => $this->color_avatar,
            'diasAtencion' => $diasAtencion ?: [1, 2, 3, 4, 5],
        ];
    }
}

