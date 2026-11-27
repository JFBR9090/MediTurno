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
        $rol = mb_strtolower(trim($this->rol ?? ''));
        return in_array($rol, ['administrador', 'admin'], true);
    }

    public function hasRole(array|string $roles): bool
    {
        $rolActual = mb_strtolower(trim($this->rol ?? ''));

        if ($this->isAdmin()) {
            return true;
        }

        $flattened = [];
        foreach ((array) $roles as $r) {
            foreach (explode(',', (string) $r) as $part) {
                $trimmed = mb_strtolower(trim($part));
                if ($trimmed !== '') {
                    $flattened[] = $trimmed;
                }
            }
        }

        // Permite tratar 'admin' y 'administrador' de manera equivalente
        if (in_array('admin', $flattened, true) && ! in_array('administrador', $flattened, true)) {
            $flattened[] = 'administrador';
        }
        if (in_array('administrador', $flattened, true) && ! in_array('admin', $flattened, true)) {
            $flattened[] = 'admin';
        }

        // Permite tratar 'medico' y 'profesional' de manera equivalente
        if (in_array('profesional', $flattened, true) && ! in_array('medico', $flattened, true)) {
            $flattened[] = 'medico';
        }
        if (in_array('medico', $flattened, true) && ! in_array('profesional', $flattened, true)) {
            $flattened[] = 'profesional';
        }

        return in_array($rolActual, $flattened, true);
    }

    public function toFrontendArray(): array
    {
        $this->loadMissing(['paciente', 'medico']);

        $perfilNormalizado = match ($this->rol) {
            'medico' => 'profesional',
            'admin' => 'administrador',
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
