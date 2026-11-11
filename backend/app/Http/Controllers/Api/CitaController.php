<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BloqueoHorario;
use App\Models\Cita;
use App\Models\HistorialCita;
use App\Models\Medico;
use App\Models\Notificacion;
use App\Models\Paciente;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CitaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false, 'error' => 'Autenticación requerida.'], 401);
        }

        $query = Cita::with(['paciente.user', 'medico.user', 'especialidad'])
            ->orderBy('fecha_hora_inicio');

        if ($user->rol === 'paciente') {
            $pacienteId = $user->paciente?->id;
            if (! $pacienteId) {
                return response()->json(['success' => true, 'data' => []]);
            }
            $query->where('paciente_id', $pacienteId);
        } elseif ($user->rol === 'medico') {
            $medicoId = $user->medico?->id;
            if (! $medicoId) {
                return response()->json(['success' => true, 'data' => []]);
            }
            $query->where('medico_id', $medicoId);
        }

        $citas = $query->get()->map(fn (Cita $c) => $c->toFrontendArray());

        $response = ['success' => true, 'data' => $citas];

        if ($user->rol === 'administrador') {
            $hoyInicio = Carbon::now('America/Bogota')->startOfDay();
            $hoyFin = Carbon::now('America/Bogota')->endOfDay();

            $response['metricas'] = [
                'total_pacientes' => Paciente::count(),
                'medicos_activos' => Medico::where('activo', true)->count(),
                'citas_agendadas' => Cita::whereIn('estado', ['programada', 'confirmada'])->count(),
                'citas_atendidas' => Cita::where('estado', 'completada')->count(),
                'citas_canceladas' => Cita::where('estado', 'cancelada')->count(),
                'citas_hoy' => Cita::whereBetween('fecha_hora_inicio', [$hoyInicio, $hoyFin])->count(),
            ];
        }

        return response()->json($response);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || $user->rol !== 'paciente' || ! $user->paciente) {
            return response()->json([
                'success' => false,
                'error' => 'Solo los pacientes autenticados pueden agendar citas.',
            ], 403);
        }

        if ($request->boolean('simular_conflicto')) {
            return response()->json([
                'success' => false,
                'error' => 'El turno seleccionado acaba de ser tomado por otro paciente',
            ], 409);
        }

        $data = $request->validate([
            'medico_id' => ['required', 'integer', 'exists:medicos,id'],
            'especialidad_id' => ['required', 'integer', 'exists:especialidades,id'],
            'fecha_hora_inicio' => ['required', 'date'],
            'fecha_hora_fin' => ['required', 'date', 'after:fecha_hora_inicio'],
            'motivo_consulta' => ['nullable', 'string', 'max:500'],
        ]);

        $inicio = Carbon::parse($data['fecha_hora_inicio'])->setTimezone('America/Bogota');
        $fin = Carbon::parse($data['fecha_hora_fin'])->setTimezone('America/Bogota');

        // RN02 / RN04: No retroactividad
        if ($inicio->lte(Carbon::now('America/Bogota'))) {
            return response()->json([
                'success' => false,
                'error' => 'No se pueden agendar citas en fechas u horarios pasados.',
            ], 400);
        }

        $medico = Medico::with('user')->findOrFail($data['medico_id']);
        if (! $medico->activo) {
            return response()->json([
                'success' => false,
                'error' => 'El profesional seleccionado no se encuentra activo.',
            ], 409);
        }

        // RN05 del documento: la especialidad debe corresponder al profesional
        if ((int) $data['especialidad_id'] !== (int) $medico->especialidad_id) {
            return response()->json([
                'success' => false,
                'error' => 'La especialidad seleccionada no corresponde al profesional.',
            ], 400);
        }

        $resultado = DB::transaction(function () use ($user, $medico, $data, $inicio, $fin) {
            $colisionCita = Cita::query()
                ->where('medico_id', $medico->id)
                ->whereIn('estado', ['programada', 'confirmada'])
                ->where('fecha_hora_inicio', '<', $fin)
                ->where('fecha_hora_fin', '>', $inicio)
                ->lockForUpdate()
                ->exists();

            if ($colisionCita) {
                return ['conflict' => 'El turno seleccionado acaba de ser tomado por otro paciente'];
            }

            $colisionBloqueo = BloqueoHorario::query()
                ->where('medico_id', $medico->id)
                ->where('fecha_hora_inicio', '<', $fin)
                ->where('fecha_hora_fin', '>', $inicio)
                ->exists();

            if ($colisionBloqueo) {
                return ['conflict' => 'El médico no cuenta con disponibilidad en la franja seleccionada'];
            }

            $codigo = sprintf('MT-%s-%s', $inicio->format('Ym'), mb_strtoupper(Str::random(4)));
            while (Cita::where('codigo_reserva', $codigo)->exists()) {
                $codigo = sprintf('MT-%s-%s', $inicio->format('Ym'), mb_strtoupper(Str::random(4)));
            }

            $cita = Cita::create([
                'codigo_reserva' => $codigo,
                'paciente_id' => $user->paciente->id,
                'medico_id' => $medico->id,
                'especialidad_id' => (int) $data['especialidad_id'],
                'fecha_hora_inicio' => $inicio,
                'fecha_hora_fin' => $fin,
                'estado' => 'programada',
                'motivo_consulta' => ($data['motivo_consulta'] ?? null) ?: 'Consulta médica general',
            ]);

            HistorialCita::create([
                'cita_id' => $cita->id,
                'usuario_responsable_id' => $user->id,
                'estado_anterior' => null,
                'estado_nuevo' => 'programada',
                'observaciones' => 'Reserva creada por el paciente.',
            ]);

            Notificacion::create([
                'user_id' => $user->id,
                'cita_id' => $cita->id,
                'titulo' => 'Cita reservada',
                'mensaje' => "Cita {$cita->codigo_reserva} con {$medico->user->nombre} {$medico->user->apellido} programada.",
                'leida' => false,
            ]);

            if ($medico->user_id) {
                Notificacion::create([
                    'user_id' => $medico->user_id,
                    'cita_id' => $cita->id,
                    'titulo' => 'Nueva cita asignada',
                    'mensaje' => "El paciente {$user->nombre} {$user->apellido} reservó el turno {$cita->codigo_reserva}.",
                    'leida' => false,
                ]);
            }

            return ['cita' => $cita];
        });

        if (isset($resultado['conflict'])) {
            return response()->json([
                'success' => false,
                'error' => $resultado['conflict'],
            ], 409);
        }

        return response()->json([
            'success' => true,
            'data' => $resultado['cita']->toFrontendArray(),
        ], 201);
    }

    public function cancelar(Request $request, Cita $cita): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false, 'error' => 'Autenticación requerida.'], 401);
        }

        $esDuenio = $user->rol === 'paciente' && $user->paciente?->id === $cita->paciente_id;
        if (! $esDuenio && $user->rol !== 'administrador') {
            return response()->json(['success' => false, 'error' => 'No tienes permisos para cancelar esta cita.'], 403);
        }

        if (! in_array($cita->estado, ['programada', 'confirmada'], true)) {
            return response()->json([
                'success' => false,
                'error' => 'Esta cita ya se encuentra cerrada o cancelada.',
            ], 400);
        }

        $minutosRestantes = Carbon::now('America/Bogota')->diffInMinutes($cita->fecha_hora_inicio, false);
        if ($user->rol === 'paciente' && $minutosRestantes < 120) {
            return response()->json([
                'success' => false,
                'error' => 'Las citas no pueden cancelarse con menos de 2 horas de anticipación.',
            ], 400);
        }

        $data = $request->validate([
            'motivo_cancelacion' => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($cita, $user, $data) {
            $estadoAnterior = $cita->estado;
            $motivo = ($data['motivo_cancelacion'] ?? null) ?: 'Cancelada por el paciente';

            $cita->update([
                'estado' => 'cancelada',
                'motivo_cancelacion' => $motivo,
                'cancelado_por_user_id' => $user->id,
                'cancelado_en' => Carbon::now('America/Bogota'),
            ]);

            HistorialCita::create([
                'cita_id' => $cita->id,
                'usuario_responsable_id' => $user->id,
                'estado_anterior' => $estadoAnterior,
                'estado_nuevo' => 'cancelada',
                'observaciones' => $motivo,
            ]);

            Notificacion::create([
                'user_id' => $user->id,
                'cita_id' => $cita->id,
                'titulo' => 'Cita cancelada',
                'mensaje' => "La cita {$cita->codigo_reserva} ha sido cancelada y su horario fue liberado.",
                'leida' => false,
            ]);
        });

        return response()->json([
            'success' => true,
            'data' => $cita->fresh()->toFrontendArray(),
        ]);
    }

    public function reprogramar(Request $request, Cita $cita): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false, 'error' => 'Autenticación requerida.'], 401);
        }

        $esDuenio = $user->rol === 'paciente' && $user->paciente?->id === $cita->paciente_id;
        if (! $esDuenio && $user->rol !== 'administrador') {
            return response()->json(['success' => false, 'error' => 'No tienes permisos para reprogramar esta cita.'], 403);
        }

        if (! in_array($cita->estado, ['programada', 'confirmada'], true)) {
            return response()->json([
                'success' => false,
                'error' => 'Solo se pueden reprogramar citas programadas o confirmadas.',
            ], 400);
        }

        $minutosRestantes = Carbon::now('America/Bogota')->diffInMinutes($cita->fecha_hora_inicio, false);
        if ($user->rol === 'paciente' && $minutosRestantes < 120) {
            return response()->json([
                'success' => false,
                'error' => 'Las citas no pueden reprogramarse con menos de 2 horas de anticipación.',
            ], 400);
        }

        $data = $request->validate([
            'fecha_hora_inicio' => ['required', 'date'],
            'fecha_hora_fin' => ['required', 'date', 'after:fecha_hora_inicio'],
        ]);

        $nuevoInicio = Carbon::parse($data['fecha_hora_inicio'])->setTimezone('America/Bogota');
        $nuevoFin = Carbon::parse($data['fecha_hora_fin'])->setTimezone('America/Bogota');

        if ($nuevoInicio->lte(Carbon::now('America/Bogota'))) {
            return response()->json([
                'success' => false,
                'error' => 'No se puede reprogramar una cita hacia una fecha u hora pasada.',
            ], 400);
        }

        $resultado = DB::transaction(function () use ($cita, $user, $nuevoInicio, $nuevoFin) {
            $colision = Cita::query()
                ->where('medico_id', $cita->medico_id)
                ->where('id', '!=', $cita->id)
                ->whereIn('estado', ['programada', 'confirmada'])
                ->where('fecha_hora_inicio', '<', $nuevoFin)
                ->where('fecha_hora_fin', '>', $nuevoInicio)
                ->lockForUpdate()
                ->exists();

            if ($colision) {
                return ['conflict' => 'El nuevo horario seleccionado ya está ocupado'];
            }

            $colisionBloqueo = BloqueoHorario::query()
                ->where('medico_id', $cita->medico_id)
                ->where('fecha_hora_inicio', '<', $nuevoFin)
                ->where('fecha_hora_fin', '>', $nuevoInicio)
                ->exists();

            if ($colisionBloqueo) {
                return ['conflict' => 'El profesional presenta un bloqueo en el nuevo horario seleccionado'];
            }

            $anteriorStr = $cita->fecha_hora_inicio->format('Y-m-d H:i');
            $estadoAnterior = $cita->estado;

            $cita->update([
                'fecha_hora_inicio' => $nuevoInicio,
                'fecha_hora_fin' => $nuevoFin,
                'estado' => 'programada',
            ]);

            HistorialCita::create([
                'cita_id' => $cita->id,
                'usuario_responsable_id' => $user->id,
                'estado_anterior' => $estadoAnterior,
                'estado_nuevo' => 'programada',
                'observaciones' => "Reprogramada de {$anteriorStr} a {$nuevoInicio->format('Y-m-d H:i')}.",
            ]);

            Notificacion::create([
                'user_id' => $user->id,
                'cita_id' => $cita->id,
                'titulo' => 'Cita reprogramada',
                'mensaje' => "Tu cita {$cita->codigo_reserva} fue reprogramada para el {$nuevoInicio->format('d/m/Y h:i A')}.",
                'leida' => false,
            ]);

            return ['cita' => $cita->fresh()];
        });

        if (isset($resultado['conflict'])) {
            return response()->json([
                'success' => false,
                'error' => $resultado['conflict'],
            ], 409);
        }

        return response()->json([
            'success' => true,
            'data' => $resultado['cita']->toFrontendArray(),
        ]);
    }

    public function actualizarEstado(Request $request, Cita $cita): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! in_array($user->rol, ['medico', 'administrador'], true)) {
            return response()->json(['success' => false, 'error' => 'Permisos insuficientes.'], 403);
        }

        if ($user->rol === 'medico' && $user->medico?->id !== $cita->medico_id) {
            return response()->json(['success' => false, 'error' => 'Solo puedes actualizar citas de tu agenda.'], 403);
        }

        if (in_array($cita->estado, ['completada', 'no_asistio', 'cancelada'], true)) {
            return response()->json([
                'success' => false,
                'error' => 'Esta cita ya se encuentra en un estado final inmutable.',
            ], 400);
        }

        $data = $request->validate([
            'estado' => ['required', 'in:completada,no_asistio,confirmada'],
        ]);

        DB::transaction(function () use ($cita, $user, $data) {
            $estadoAnterior = $cita->estado;
            $cita->update(['estado' => $data['estado']]);

            HistorialCita::create([
                'cita_id' => $cita->id,
                'usuario_responsable_id' => $user->id,
                'estado_anterior' => $estadoAnterior,
                'estado_nuevo' => $data['estado'],
                'observaciones' => "Actualización médica a {$data['estado']}.",
            ]);

            if ($cita->paciente?->user_id) {
                $etiqueta = $data['estado'] === 'completada' ? 'Atendida' : 'Inasistencia';
                Notificacion::create([
                    'user_id' => $cita->paciente->user_id,
                    'cita_id' => $cita->id,
                    'titulo' => "Cita {$etiqueta}",
                    'mensaje' => "Tu turno {$cita->codigo_reserva} fue actualizado a estado {$data['estado']}.",
                    'leida' => false,
                ]);
            }
        });

        return response()->json([
            'success' => true,
            'data' => $cita->fresh()->toFrontendArray(),
        ]);
    }

    public function reportes(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || $user->rol !== 'administrador') {
            return response()->json(['success' => false, 'error' => 'Permisos insuficientes.'], 403);
        }

        $query = Cita::with(['paciente.user', 'medico.user', 'especialidad'])
            ->orderByDesc('fecha_hora_inicio');

        if ($request->filled('fecha_desde')) {
            $desde = Carbon::parse($request->input('fecha_desde'), 'America/Bogota')->startOfDay();
            $query->where('fecha_hora_inicio', '>=', $desde);
        }

        if ($request->filled('fecha_hasta')) {
            $hasta = Carbon::parse($request->input('fecha_hasta'), 'America/Bogota')->endOfDay();
            $query->where('fecha_hora_inicio', '<=', $hasta);
        }

        if ($request->filled('medico_id') && $request->input('medico_id') !== 'all') {
            $query->where('medico_id', (int) $request->input('medico_id'));
        }

        if ($request->filled('estado') && $request->input('estado') !== 'all') {
            $query->where('estado', $request->input('estado'));
        }

        $citas = $query->get();

        $resumen = [
            'total' => $citas->count(),
            'programadas' => $citas->where('estado', 'programada')->count(),
            'confirmadas' => $citas->where('estado', 'confirmada')->count(),
            'completadas' => $citas->where('estado', 'completada')->count(),
            'canceladas' => $citas->where('estado', 'cancelada')->count(),
            'no_asistio' => $citas->where('estado', 'no_asistio')->count(),
        ];

        return response()->json([
            'success' => true,
            'resumen' => $resumen,
            'data' => $citas->map(fn (Cita $c) => $c->toFrontendArray())->values(),
        ]);
    }
}
