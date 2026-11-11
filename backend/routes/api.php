<?php

use App\Http\Controllers\Api\AgendaController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatalogoController;
use App\Http\Controllers\Api\CitaController;
use App\Http\Controllers\Api\NotificacionController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

// Healthcheck
Route::get('/health', function () {
    $start = microtime(true);
    DB::select('SELECT 1');

    return response()->json([
        'status' => 'UP',
        'database' => [
            'driver' => config('database.default'),
            'status' => 'CONNECTED',
            'latencyMs' => round((microtime(true) - $start) * 1000, 2),
        ],
    ]);
});

// Autenticación (Cookies HttpOnly de Sesión Laravel)
Route::prefix('auth')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/demo', [AuthController::class, 'demoLogin']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Catálogos públicos
Route::get('/especialidades', [CatalogoController::class, 'especialidades']);
Route::get('/medicos', [CatalogoController::class, 'medicos']);

// Agendas: generación de calendarios y cálculo de disponibilidad
Route::get('/horarios/{medico}/calendario', [AgendaController::class, 'calendario']);
Route::get('/horarios/{medico}/disponibilidad', [AgendaController::class, 'disponibilidad']);
Route::get('/horarios/{medico}', [AgendaController::class, 'horarios']);

// Rutas protegidas por sesión
Route::middleware('auth')->group(function () {
    // Especialidades (Admin)
    Route::post('/especialidades', [CatalogoController::class, 'storeEspecialidad']);
    Route::put('/especialidades/{especialidad}', [CatalogoController::class, 'updateEspecialidad']);
    Route::patch('/especialidades/{especialidad}/toggle', [CatalogoController::class, 'toggleEspecialidad']);

    // Profesionales y Pacientes (Admin)
    Route::post('/medicos', [CatalogoController::class, 'storeMedico']);
    Route::patch('/medicos/{medico}/toggle', [CatalogoController::class, 'toggleMedico']);
    Route::get('/pacientes', [CatalogoController::class, 'pacientes']);
    Route::post('/pacientes', [CatalogoController::class, 'storePaciente']);

    // Agendas y Bloqueos (Médico / Admin)
    Route::post('/horarios/{medico}', [AgendaController::class, 'guardarHorario']);
    Route::delete('/horarios/bloque/{horario}', [AgendaController::class, 'eliminarHorario']);
    Route::post('/horarios/{medico}/bloqueos', [AgendaController::class, 'crearBloqueo']);

    // Citas Médicas y Reportes
    Route::get('/citas', [CitaController::class, 'index']);
    Route::post('/citas', [CitaController::class, 'store']);
    Route::put('/citas/{cita}/cancelar', [CitaController::class, 'cancelar']);
    Route::put('/citas/{cita}/reprogramar', [CitaController::class, 'reprogramar']);
    Route::put('/citas/{cita}/estado', [CitaController::class, 'actualizarEstado']);
    Route::get('/reportes/citas', [CitaController::class, 'reportes']);

    // Notificaciones In-App
    Route::get('/notificaciones', [NotificacionController::class, 'index']);
    Route::post('/notificaciones/leer', [NotificacionController::class, 'marcarLeidas']);
});
