<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cita extends Model
{
    protected $table = 'citas';

    protected $fillable = [
        'codigo_reserva',
        'paciente_id',
        'medico_id',
        'especialidad_id',
        'fecha_hora_inicio',
        'fecha_hora_fin',
        'estado',
        'motivo_consulta',
        'motivo_cancelacion',
        'cancelado_por_user_id',
        'cancelado_en',
    ];

    protected function casts(): array
    {
        return [
            'fecha_hora_inicio' => 'datetime',
            'fecha_hora_fin' => 'datetime',
            'cancelado_en' => 'datetime',
        ];
    }

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class, 'paciente_id');
    }

    public function medico(): BelongsTo
    {
        return $this->belongsTo(Medico::class, 'medico_id');
    }

    public function especialidad(): BelongsTo
    {
        return $this->belongsTo(Especialidad::class, 'especialidad_id');
    }

    public function historial(): HasMany
    {
        return $this->hasMany(HistorialCita::class, 'cita_id');
    }

    public function toFrontendArray(): array
    {
        $this->loadMissing(['paciente.user', 'medico.user', 'especialidad']);

        $pacienteNombre = trim(
            ($this->paciente?->user?->nombre ?? '') . ' ' . ($this->paciente?->user?->apellido ?? '')
        );
        $medicoNombre = trim(
            ($this->medico?->user?->nombre ?? '') . ' ' . ($this->medico?->user?->apellido ?? '')
        );

        return [
            'id' => $this->id,
            'codigo_reserva' => $this->codigo_reserva,
            'paciente_id' => $this->paciente_id,
            'paciente_nombre' => $pacienteNombre,
            'paciente_documento' => trim(
                ($this->paciente?->tipo_documento ?? 'CC') . ' ' . ($this->paciente?->numero_documento ?? '')
            ),
            'paciente_telefono' => $this->paciente?->telefono,
            'medico_id' => $this->medico_id,
            'medico_nombre' => $medicoNombre,
            'especialidad_id' => $this->especialidad_id,
            'especialidad' => $this->especialidad?->nombre,
            'consultorio' => $this->medico?->consultorio,
            'fecha_hora_inicio' => $this->fecha_hora_inicio?->toIso8601String(),
            'fecha_hora_fin' => $this->fecha_hora_fin?->toIso8601String(),
            'estado' => $this->estado,
            'motivo_consulta' => $this->motivo_consulta,
            'motivo_cancelacion' => $this->motivo_cancelacion,
            'cancelado_en' => $this->cancelado_en?->toIso8601String(),
        ];
    }
}

