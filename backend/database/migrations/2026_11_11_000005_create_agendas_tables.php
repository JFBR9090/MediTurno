<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horarios_atencion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medico_id')->constrained('medicos')->cascadeOnDelete();
            $table->unsignedTinyInteger('dia_semana'); // 1: Lunes .. 7: Domingo
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->index(['medico_id', 'dia_semana', 'activo']);
        });

        Schema::create('bloqueos_horario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medico_id')->constrained('medicos')->cascadeOnDelete();
            $table->dateTime('fecha_hora_inicio');
            $table->dateTime('fecha_hora_fin');
            $table->enum('tipo', ['descanso', 'vacaciones', 'incapacidad', 'administrativo'])->default('descanso');
            $table->string('motivo', 255)->nullable();
            $table->timestamps();

            $table->index(['medico_id', 'fecha_hora_inicio', 'fecha_hora_fin'], 'idx_bloqueo_medico_rango');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bloqueos_horario');
        Schema::dropIfExists('horarios_atencion');
    }
};

