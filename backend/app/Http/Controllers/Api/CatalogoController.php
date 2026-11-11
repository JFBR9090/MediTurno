<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Especialidad;
use App\Models\HorarioAtencion;
use App\Models\Medico;
use App\Models\Notificacion;
use App\Models\Paciente;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CatalogoController extends Controller
{
    public function especialidades(): JsonResponse
    {
        $especialidades = Especialidad::query()
            ->where('activa', true)
            ->orderBy('id')
            ->get()
            ->map(fn (Especialidad $e) => [
                'id' => $e->id,
                'nombre' => $e->nombre,
                'descripcion' => $e->descripcion,
                'icono' => $e->icono,
                'tiempoPromedio' => "{$e->tiempo_promedio_min} min",
            ]);

        return response()->json(['success' => true, 'data' => $especialidades]);
    }

    public function medicos(Request $request): JsonResponse
    {
        $query = Medico::with(['user', 'especialidad', 'horarios'])->orderBy('id');

        if ($request->boolean('solo_activos', false)) {
            $query->where('activo', true);
        }

        $medicos = $query->get()->map(fn (Medico $m) => $m->toFrontendArray());

        return response()->json(['success' => true, 'data' => $medicos]);
    }

    public function storeMedico(Request $request): JsonResponse
    {
        $userAuth = $request->user();
        if (! $userAuth || $userAuth->rol !== 'administrador') {
            return response()->json(['success' => false, 'error' => 'Permisos insuficientes.'], 403);
        }

        $data = $request->validate([
            'nombre' => ['required', 'string', 'min:4', 'max:150'],
            'correo' => ['required', 'email', 'max:150', 'unique:users,email'],
            'tarjeta_profesional' => ['required', 'string', 'min:4', 'max:50', 'unique:medicos,tarjeta_profesional'],
            'especialidad_id' => ['required', 'integer', 'exists:especialidades,id'],
            'consultorio' => ['required', 'string', 'min:3', 'max:150'],
            'duracion_cita_defecto_min' => ['nullable', 'integer', 'in:20,30,45'],
            'biografia' => ['nullable', 'string', 'max:1000'],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        $medico = DB::transaction(function () use ($data) {
            $nombreLimpio = trim($data['nombre']);
            $sinTitulo = trim(preg_replace('/^(Dr\.|Dra\.)\s*/i', '', $nombreLimpio));
            $partes = preg_split('/\s+/', $sinTitulo);
            $iniciales = count($partes) >= 2
                ? mb_strtoupper(mb_substr($partes[0], 0, 1) . mb_substr($partes[1], 0, 1))
                : mb_strtoupper(mb_substr($sinTitulo, 0, 2));

            $user = User::create([
                'rol' => 'medico',
                'nombre' => $nombreLimpio,
                'apellido' => '',
                'name' => $nombreLimpio,
                'email' => mb_strtolower(trim($data['correo'])),
                'password' => $data['password'] ?? 'Medico2026*',
                'activo' => true,
            ]);

            $medico = Medico::create([
                'user_id' => $user->id,
                'especialidad_id' => (int) $data['especialidad_id'],
                'tarjeta_profesional' => mb_strtoupper(trim($data['tarjeta_profesional'])),
                'consultorio' => trim($data['consultorio']),
                'biografia' => $data['biografia'] ?? 'Profesional adscrito al Centro Médico MediTurno.',
                'duracion_cita_defecto_min' => (int) ($data['duracion_cita_defecto_min'] ?? 30),
                'calificacion' => 5.0,
                'iniciales' => $iniciales ?: 'MD',
                'color_avatar' => 'bg-sky-100 text-sky-700',
                'activo' => true,
            ]);

            // Plantilla estándar Lunes a Viernes (mañana y tarde)
            foreach ([1, 2, 3, 4, 5] as $dia) {
                HorarioAtencion::create([
                    'medico_id' => $medico->id,
                    'dia_semana' => $dia,
                    'hora_inicio' => '08:00:00',
                    'hora_fin' => '12:00:00',
                    'activo' => true,
                ]);
                HorarioAtencion::create([
                    'medico_id' => $medico->id,
                    'dia_semana' => $dia,
                    'hora_inicio' => '14:00:00',
                    'hora_fin' => '16:00:00',
                    'activo' => true,
                ]);
            }

            Notificacion::create([
                'user_id' => $user->id,
                'titulo' => 'Bienvenido a MediTurno',
                'mensaje' => 'Tu agenda médica quedó habilitada con horario estándar Lunes a Viernes.',
                'leida' => false,
            ]);

            return $medico;
        });

        return response()->json([
            'success' => true,
            'data' => $medico->toFrontendArray(),
        ], 201);
    }

    public function toggleMedico(Request $request, Medico $medico): JsonResponse
    {
        $userAuth = $request->user();
        if (! $userAuth || $userAuth->rol !== 'administrador') {
            return response()->json(['success' => false, 'error' => 'Permisos insuficientes.'], 403);
        }

        $nuevoEstado = ! $medico->activo;
        $medico->update(['activo' => $nuevoEstado]);
        $medico->user?->update(['activo' => $nuevoEstado]);

        return response()->json([
            'success' => true,
            'data' => $medico->fresh()->toFrontendArray(),
        ]);
    }

    public function pacientes(Request $request): JsonResponse
    {
        $userAuth = $request->user();
        if (! $userAuth || $userAuth->rol !== 'administrador') {
            return response()->json(['success' => false, 'error' => 'Permisos insuficientes.'], 403);
        }

        $pacientes = Paciente::with('user')
            ->withCount('citas')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Paciente $p) => [
                'id' => $p->id,
                'nombre' => trim(($p->user?->nombre ?? '') . ' ' . ($p->user?->apellido ?? '')),
                'correo' => $p->user?->email,
                'tipo_documento' => $p->tipo_documento,
                'numero_documento' => $p->numero_documento,
                'telefono' => $p->telefono,
                'fecha_nacimiento' => $p->fecha_nacimiento?->format('Y-m-d'),
                'citas_count' => $p->citas_count,
            ]);

        return response()->json(['success' => true, 'data' => $pacientes]);
    }
}

