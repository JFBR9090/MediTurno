<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('citas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_reserva', 20)->unique();
            $table->foreignId('paciente_id')->constrained('pacientes')->restrictOnDelete();
            $table->foreignId('medico_id')->constrained('medicos')->restrictOnDelete();
            $table->foreignId('especialidad_id')->constrained('especialidades')->restrictOnDelete();
            $table->dateTime('fecha_hora_inicio');
            $table->dateTime('fecha_hora_fin');
            $table->enum('estado', ['programada', 'confirmada', 'cancelada', 'completada', 'no_asistio'])->default('programada');
            $table->text('motivo_consulta')->nullable();
            $table->text('motivo_cancelacion')->nullable();
            $table->foreignId('cancelado_por_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('cancelado_en')->nullable();
            $table->timestamps();

            $table->index(['medico_id', 'fecha_hora_inicio', 'fecha_hora_fin', 'estado'], 'idx_cita_disponibilidad');
            $table->index(['paciente_id', 'fecha_hora_inicio'], 'idx_cita_paciente');
        });

        Schema::create('historial_citas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cita_id')->constrained('citas')->cascadeOnDelete();
            $table->foreignId('usuario_responsable_id')->constrained('users')->restrictOnDelete();
            $table->string('estado_anterior', 30)->nullable();
            $table->string('estado_nuevo', 30);
            $table->string('observaciones', 255)->nullable();
            $table->timestamp('registrado_en')->useCurrent();
        });

        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('cita_id')->nullable()->constrained('citas')->nullOnDelete();
            $table->string('titulo', 150);
            $table->text('mensaje');
            $table->boolean('leida')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
        Schema::dropIfExists('historial_citas');
        Schema::dropIfExists('citas');
    }
};

