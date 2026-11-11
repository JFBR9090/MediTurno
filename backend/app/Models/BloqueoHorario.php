<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BloqueoHorario extends Model
{
    protected $table = 'bloqueos_horario';

    protected $fillable = [
        'medico_id',
        'fecha_hora_inicio',
        'fecha_hora_fin',
        'tipo',
        'motivo',
    ];

    protected function casts(): array
    {
        return [
            'fecha_hora_inicio' => 'datetime',
            'fecha_hora_fin' => 'datetime',
        ];
    }

    public function medico(): BelongsTo
    {
        return $this->belongsTo(Medico::class, 'medico_id');
    }
}

