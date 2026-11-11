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
            'horarios' => $horarios,
            'bloqueos' => $bloqueos,
        ]);
    }

    public function guardarHorario(Request $request, Medico $medico): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! in_array($user->rol, ['administrador', 'medico'], true)) {
            return response()->json(['success' => false, 'error' => 'Permisos insuficientes.'], 403);
        }

        if ($user->rol === 'medico' && $user->medico?->id !== $medico->id) {
            return response()->json(['success' => false, 'error' => 'No puedes editar la agenda de otro médico.'], 403);
        }

        $data = $request->validate([
            'dia_semana' => ['required', 'integer', 'between:1,7'],
            'hora_inicio' => ['required', 'date_format:H:i'],
            'hora_fin' => ['required', 'date_format:H:i', 'after:hora_inicio'],
        ]);

        $horario = HorarioAtencion::create([
            'medico_id' => $medico->id,
            'dia_semana' => $data['dia_semana'],
            'hora_inicio' => $data['hora_inicio'] . ':00',
            'hora_fin' => $data['hora_fin'] . ':00',
            'activo' => true,
        ]);

        return response()->json(['success' => true, 'data' => $horario], 201);
    }

    public function crearBloqueo(Request $request, Medico $medico): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! in_array($user->rol, ['administrador', 'medico'], true)) {
            return response()->json(['success' => false, 'error' => 'Permisos insuficientes.'], 403);
        }

        if ($user->rol === 'medico' && $user->medico?->id !== $medico->id) {
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

