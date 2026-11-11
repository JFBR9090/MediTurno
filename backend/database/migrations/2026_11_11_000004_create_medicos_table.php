<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medicos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->foreignId('especialidad_id')->constrained('especialidades')->restrictOnDelete();
            $table->string('tarjeta_profesional', 50)->unique();
            $table->string('consultorio', 150);
            $table->text('biografia')->nullable();
            $table->unsignedSmallInteger('duracion_cita_defecto_min')->default(30);
            $table->decimal('calificacion', 3, 1)->default(5.0);
            $table->string('iniciales', 5)->default('MD');
            $table->string('color_avatar', 60)->default('bg-sky-100 text-sky-700');
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medicos');
    }
};

