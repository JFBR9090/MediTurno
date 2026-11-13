<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BloqueoHorario;
use App\Models\HorarioAtencion;
use App\Models\Medico;
use App\Services\AgendaDisponibilidadService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgendaController extends Controller
{
    public function calendario(
        Request $request,
        Medico $medico,
        AgendaDisponibilidadService $service
    ): JsonResponse {
        $dias = min(21, max(1, (int) $request->integer('dias', 10)));
        $calendario = $service->generarCalendario($medico, null, $dias);

        return response()->json([
            'success' => true,
            'medico_id' => $medico->id,
            'data' => $calendario,
        ]);
    }

    public function disponibilidad(
        Request $request,
        Medico $medico,
        AgendaDisponibilidadService $service
    ): JsonResponse {
        $data = $request->validate([
            'fecha' => ['required', 'date_format:Y-m-d'],
        ]);

        $slots = $service->obtenerSlotsDisponibles($medico, $data['fecha']);

        return response()->json([
            'success' => true,
            'medico_id' => $medico->id,
            'fecha' => $data['fecha'],
            'data' => $slots,
        ]);
    }

    public function horarios(Medico $medico): JsonResponse
    {
        $horarios = HorarioAtencion::query()
            ->where('medico_id', $medico->id)
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get();

        $bloqueos = BloqueoHorario::query()
            ->where('medico_id', $medico->id)
            ->where('fecha_hora_fin', '>=', Carbon::now('America/Bogota'))
            ->orderBy('fecha_hora_inicio')
            ->get();

        return response()->json([
            'success' => true,
            'duracion_cita_defecto_min' => $medico->duracion_cita_defecto_min,
            'horarios' => $horarios,
            'bloqueos' => $bloqueos,
        ]);
    }

    public function guardarHorario(Request $request, Medico $medico): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! in_array($user->rol, ['administrador', 'agenda', 'medico', 'profesional'], true)) {
            return response()->json(['success' => false, 'error' => 'Permisos insuficientes.'], 403);
        }

        if (in_array($user->rol, ['medico', 'profesional'], true) && $user->medico?->id !== $medico->id) {
            return response()->json(['success' => false, 'error' => 'No puedes editar la agenda de otro médico.'], 403);
        }

        $data = $request->validate([
            'dia_semana' => ['required', 'integer', 'between:1,7'],
            'hora_inicio' => ['required', 'date_format:H:i'],
            'hora_fin' => ['required', 'date_format:H:i', 'after:hora_inicio'],
            'duracion_cita_defecto_min' => ['nullable', 'integer', 'in:15,20,30,45,60'],
        ]);

        $inicio = $data['hora_inicio'] . ':00';
        $fin = $data['hora_fin'] . ':00';

        // HU-05: Evitar horarios superpuestos en el mismo día
        $solapamiento = HorarioAtencion::query()
            ->where('medico_id', $medico->id)
            ->where('dia_semana', (int) $data['dia_semana'])
            ->where('activo', true)
            ->where('hora_inicio', '<', $fin)
            ->where('hora_fin', '>', $inicio)
            ->exists();

        if ($solapamiento) {
            return response()->json([
                'success' => false,
                'error' => 'La franja horaria se superpone con un horario ya configurado para ese día.',
            ], 409);
        }

        if (isset($data['duracion_cita_defecto_min'])) {
            $medico->update([
                'duracion_cita_defecto_min' => (int) $data['duracion_cita_defecto_min'],
            ]);
        }

        $horario = HorarioAtencion::create([
            'medico_id' => $medico->id,
            'dia_semana' => (int) $data['dia_semana'],
            'hora_inicio' => $inicio,
            'hora_fin' => $fin,
            'activo' => true,
        ]);

        return response()->json(['success' => true, 'data' => $horario], 201);
    }

    public function eliminarHorario(Request $request, HorarioAtencion $horario): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! in_array($user->rol, ['administrador', 'agenda', 'medico', 'profesional'], true)) {
            return response()->json(['success' => false, 'error' => 'Permisos insuficientes.'], 403);
        }

        if (in_array($user->rol, ['medico', 'profesional'], true) && $user->medico?->id !== $horario->medico_id) {
            return response()->json(['success' => false, 'error' => 'Permisos insuficientes.'], 403);
        }

        $horario->delete();

        return response()->json(['success' => true]);
    }

    public function crearBloqueo(Request $request, Medico $medico): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! in_array($user->rol, ['administrador', 'agenda', 'medico', 'profesional'], true)) {
            return response()->json(['success' => false, 'error' => 'Permisos insuficientes.'], 403);
        }

        if (in_array($user->rol, ['medico', 'profesional'], true) && $user->medico?->id !== $medico->id) {
            return response()->json(['success' => false, 'error' => 'No puedes bloquear la agenda de otro médico.'], 403);
        }

        $data = $request->validate([
            'fecha_hora_inicio' => ['required', 'date'],
            'fecha_hora_fin' => ['required', 'date', 'after:fecha_hora_inicio'],
            'tipo' => ['required', 'in:descanso,vacaciones,incapacidad,administrativo'],
            'motivo' => ['nullable', 'string', 'max:255'],
        ]);

        $bloqueo = BloqueoHorario::create([
            'medico_id' => $medico->id,
            'fecha_hora_inicio' => Carbon::parse($data['fecha_hora_inicio'], 'America/Bogota'),
            'fecha_hora_fin' => Carbon::parse($data['fecha_hora_fin'], 'America/Bogota'),
            'tipo' => $data['tipo'],
            'motivo' => $data['motivo'] ?? null,
        ]);

        return response()->json(['success' => true, 'data' => $bloqueo], 201);
    }
}
