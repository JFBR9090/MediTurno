<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('rol', ['administrador', 'medico', 'paciente'])->default('paciente')->after('id');
            $table->string('nombre', 100)->default('')->after('rol');
            $table->string('apellido', 100)->default('')->after('nombre');
            $table->boolean('activo')->default(true)->after('password');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['rol', 'nombre', 'apellido', 'activo']);
        });
    }
};

