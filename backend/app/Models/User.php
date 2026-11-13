<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'rol',
        'nombre',
        'apellido',
        'name',
        'email',
        'password',
        'activo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'activo' => 'boolean',
        ];
    }

    public function paciente(): HasOne
    {
        return $this->hasOne(Paciente::class);
    }

    public function medico(): HasOne
    {
        return $this->hasOne(Medico::class);
    }

    public function notificaciones(): HasMany
    {
        return $this->hasMany(Notificacion::class);
    }

    public function isPaciente(): bool
    {
        return $this->rol === 'paciente';
    }

    public function isProfesional(): bool
    {
        return in_array($this->rol, ['profesional', 'medico'], true);
    }

    public function isAgenda(): bool
    {
        return in_array($this->rol, ['agenda', 'administrador'], true);
    }

    public function isCita(): bool
    {
        return in_array($this->rol, ['cita', 'administrador'], true);
    }

    public function isAdmin(): bool
    {
        return $this->rol === 'administrador';
    }

    public function hasRole(array|string $roles): bool
    {
        $roles = (array) $roles;
        // Permite tratar 'medico' y 'profesional' de manera equivalente
        if (in_array('profesional', $roles, true) && ! in_array('medico', $roles, true)) {
            $roles[] = 'medico';
        }
        if (in_array('medico', $roles, true) && ! in_array('profesional', $roles, true)) {
            $roles[] = 'profesional';
        }

        return in_array($this->rol, $roles, true);
    }

    public function toFrontendArray(): array
    {
        $this->loadMissing(['paciente', 'medico']);

        $perfilNormalizado = match ($this->rol) {
            'medico' => 'profesional',
            default => $this->rol,
        };

        return [
            'id' => $this->id,
            'rol' => $perfilNormalizado,
            'rol_raw' => $this->rol,
            'perfil' => $perfilNormalizado,
            'nombre' => $this->nombre,
            'apellido' => $this->apellido,
            'correo' => $this->email,
            'paciente_id' => $this->paciente?->id,
            'tipo_documento' => $this->paciente?->tipo_documento,
            'numero_documento' => $this->paciente?->numero_documento,
            'telefono' => $this->paciente?->telefono,
            'medico_id' => $this->medico?->id,
            'tarjeta_profesional' => $this->medico?->tarjeta_profesional,
        ];
    }
}
