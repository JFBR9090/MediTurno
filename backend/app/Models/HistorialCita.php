<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistorialCita extends Model
{
    public $timestamps = false;

    protected $table = 'historial_citas';

    protected $fillable = [
        'cita_id',
        'usuario_responsable_id',
        'estado_anterior',
        'estado_nuevo',
        'observaciones',
        'registrado_en',
    ];

    protected function casts(): array
    {
        return [
            'registrado_en' => 'datetime',
        ];
    }

    public function cita(): BelongsTo
    {
        return $this->belongsTo(Cita::class, 'cita_id');
    }
}

