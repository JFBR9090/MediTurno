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
    public function especialidades(Request $request): JsonResponse
    {
        $query = Especialidad::query()->orderBy('id');

        if (! $request->boolean('todas', false)) {
            $query->where('activa', true);
        }

        $especialidades = $query->get()->map(fn (Especialidad $e) => [
            'id' => $e->id,
            'nombre' => $e->nombre,
            'descripcion' => $e->descripcion,
            'icono' => $e->icono,
            'tiempo_promedio_min' => $e->tiempo_promedio_min,
            'tiempoPromedio' => "{$e->tiempo_promedio_min} min",
            'activa' => $e->activa,
        ]);

        return response()->json(['success' => true, 'data' => $especialidades]);
    }

    public function storeEspecialidad(Request $request): JsonResponse
    {
        $userAuth = $request->user();
        if (! $userAuth || $userAuth->rol !== 'administrador') {
            return response()->json(['success' => false, 'error' => 'Permisos insuficientes.'], 403);
        }

        $data = $request->validate([
            'nombre' => ['required', 'string', 'min:3', 'max:100', 'unique:especialidades,nombre'],
            'descripcion' => ['nullable', 'string', 'max:500'],
            'tiempo_promedio_min' => ['nullable', 'integer', 'in:15,20,30,45,60'],
            'icono' => ['nullable', 'string', 'max:50'],
        ]);

        $esp = Especialidad::create([
            'nombre' => trim($data['nombre']),
            'descripcion' => $data['descripcion'] ?? 'Atención médica especializada.',
            'tiempo_promedio_min' => (int) ($data['tiempo_promedio_min'] ?? 30),
            'icono' => $data['icono'] ?? 'Stethoscope',
            'activa' => true,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $esp->id,
                'nombre' => $esp->nombre,
                'descripcion' => $esp->descripcion,
                'icono' => $esp->icono,
                'tiempo_promedio_min' => $esp->tiempo_promedio_min,
                'tiempoPromedio' => "{$esp->tiempo_promedio_min} min",
                'activa' => $esp->activa,
            ],
        ], 201);
    }

    public function updateEspecialidad(Request $request, Especialidad $especialidad): JsonResponse
    {
        $userAuth = $request->user();
        if (! $userAuth || $userAuth->rol !== 'administrador') {
            return response()->json(['success' => false, 'error' => 'Permisos insuficientes.'], 403);
        }

        $data = $request->validate([
            'nombre' => ['required', 'string', 'min:3', 'max:100', "unique:especialidades,nombre,{$especialidad->id}"],
            'descripcion' => ['nullable', 'string', 'max:500'],
            'tiempo_promedio_min' => ['nullable', 'integer', 'in:15,20,30,45,60'],
        ]);

        $especialidad->update([
            'nombre' => trim($data['nombre']),
            'descripcion' => $data['descripcion'] ?? $especialidad->descripcion,
            'tiempo_promedio_min' => (int) ($data['tiempo_promedio_min'] ?? $especialidad->tiempo_promedio_min),
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $especialidad->id,
                'nombre' => $especialidad->nombre,
                'descripcion' => $especialidad->descripcion,
                'icono' => $especialidad->icono,
                'tiempo_promedio_min' => $especialidad->tiempo_promedio_min,
                'tiempoPromedio' => "{$especialidad->tiempo_promedio_min} min",
                'activa' => $especialidad->activa,
            ],
        ]);
    }

    public function toggleEspecialidad(Request $request, Especialidad $especialidad): JsonResponse
    {
        $userAuth = $request->user();
        if (! $userAuth || $userAuth->rol !== 'administrador') {
            return response()->json(['success' => false, 'error' => 'Permisos insuficientes.'], 403);
        }

        $especialidad->update(['activa' => ! $especialidad->activa]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $especialidad->id,
                'nombre' => $especialidad->nombre,
                'descripcion' => $especialidad->descripcion,
                'icono' => $especialidad->icono,
                'tiempo_promedio_min' => $especialidad->tiempo_promedio_min,
                'tiempoPromedio' => "{$especialidad->tiempo_promedio_min} min",
                'activa' => $especialidad->activa,
            ],
        ]);
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
            'duracion_cita_defecto_min' => ['nullable', 'integer', 'in:15,20,30,45,60'],
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

    public function storePaciente(Request $request): JsonResponse
    {
        $userAuth = $request->user();
        if (! $userAuth || $userAuth->rol !== 'administrador') {
            return response()->json(['success' => false, 'error' => 'Permisos insuficientes.'], 403);
        }

        $data = $request->validate([
            'nombre' => ['required', 'string', 'min:2', 'max:100'],
            'apellido' => ['required', 'string', 'min:2', 'max:100'],
            'tipo_documento' => ['required', 'string', 'in:CC,TI,CE,PA'],
            'numero_documento' => ['required', 'string', 'regex:/^\d{5,15}$/', 'unique:pacientes,numero_documento'],
            'telefono' => ['required', 'string', 'regex:/^\d{7,15}$/'],
            'fecha_nacimiento' => ['required', 'date', 'before:today'],
            'correo' => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        $paciente = DB::transaction(function () use ($data) {
            $user = User::create([
                'rol' => 'paciente',
                'nombre' => trim($data['nombre']),
                'apellido' => trim($data['apellido']),
                'name' => trim($data['nombre']) . ' ' . trim($data['apellido']),
                'email' => mb_strtolower(trim($data['correo'])),
                'password' => $data['password'] ?? 'Paciente2026*',
                'activo' => true,
            ]);

            return Paciente::create([
                'user_id' => $user->id,
                'tipo_documento' => $data['tipo_documento'],
                'numero_documento' => trim($data['numero_documento']),
                'telefono' => trim($data['telefono']),
                'fecha_nacimiento' => $data['fecha_nacimiento'],
            ]);
        });

        $paciente->load('user');

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $paciente->id,
                'nombre' => trim($paciente->user->nombre . ' ' . $paciente->user->apellido),
                'correo' => $paciente->user->email,
                'tipo_documento' => $paciente->tipo_documento,
                'numero_documento' => $paciente->numero_documento,
                'telefono' => $paciente->telefono,
                'fecha_nacimiento' => $paciente->fecha_nacimiento?->format('Y-m-d'),
                'citas_count' => 0,
            ],
        ], 201);
    }
}
