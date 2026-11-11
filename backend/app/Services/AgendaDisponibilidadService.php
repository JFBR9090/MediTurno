<?php

namespace App\Services;

use App\Models\BloqueoHorario;
use App\Models\Cita;
use App\Models\HorarioAtencion;
use App\Models\Medico;
use Carbon\Carbon;

class AgendaDisponibilidadService
{
    /**
     * Genera el calendario de fechas hábiles para un profesional,
     * indicando cuántos turnos libres tiene cada día.
     */
    public function generarCalendario(Medico $medico, ?Carbon $desde = null, int $dias = 10): array
    {
        $cursor = ($desde ? $desde->copy() : Carbon::now('America/Bogota'))->startOfDay();
        $hoy = Carbon::now('America/Bogota')->startOfDay();

        $horariosPorDia = HorarioAtencion::query()
            ->where('medico_id', $medico->id)
            ->where('activo', true)
            ->get()
            ->groupBy('dia_semana');

        $calendario = [];
        $revisados = 0;

        while (count($calendario) < $dias && $revisados < 45) {
            $diaSemana = $cursor->isoWeekday(); // 1=Lunes .. 7=Domingo

            if ($horariosPorDia->has($diaSemana)) {
                $fechaISO = $cursor->format('Y-m-d');
                $slots = $this->obtenerSlotsDisponibles($medico, $fechaISO);
                $libres = count(array_filter($slots, fn ($s) => $s['libre'] === true));

                $calendario[] = [
                    'iso' => $fechaISO,
                    'dia_semana' => $diaSemana,
                    'dayName' => mb_substr($cursor->locale('es')->isoFormat('ddd'), 0, 3),
                    'dayNum' => (int) $cursor->format('d'),
                    'monthShort' => mb_substr($cursor->locale('es')->isoFormat('MMM'), 0, 3),
                    'isToday' => $cursor->equalTo($hoy),
                    'total_slots' => count($slots),
                    'slots_libres' => $libres,
                ];
            }

            $cursor->addDay();
            $revisados++;
        }

        return $calendario;
    }

    /**
     * Calcula dinámicamente los slots horarios de un médico en una fecha dada,
     * descontando turnos pasados, bloqueos de agenda y citas activas.
     */
    public function obtenerSlotsDisponibles(Medico $medico, string $fechaISO): array
    {
        $fecha = Carbon::createFromFormat('Y-m-d', $fechaISO, 'America/Bogota')->startOfDay();
        $diaSemana = $fecha->isoWeekday();
        $duracion = max(10, (int) ($medico->duracion_cita_defecto_min ?: 30));
        $ahora = Carbon::now('America/Bogota');

        $jornadas = HorarioAtencion::query()
            ->where('medico_id', $medico->id)
            ->where('dia_semana', $diaSemana)
            ->where('activo', true)
            ->orderBy('hora_inicio')
            ->get();

        if ($jornadas->isEmpty()) {
            return [];
        }

        $inicioDia = $fecha->copy()->startOfDay();
        $finDia = $fecha->copy()->endOfDay();

        $citasActivas = Cita::query()
            ->where('medico_id', $medico->id)
            ->whereIn('estado', ['programada', 'confirmada'])
            ->where('fecha_hora_inicio', '<', $finDia)
            ->where('fecha_hora_fin', '>', $inicioDia)
            ->get(['fecha_hora_inicio', 'fecha_hora_fin']);

        $bloqueos = BloqueoHorario::query()
            ->where('medico_id', $medico->id)
            ->where('fecha_hora_inicio', '<', $finDia)
            ->where('fecha_hora_fin', '>', $inicioDia)
            ->get(['fecha_hora_inicio', 'fecha_hora_fin', 'tipo']);

        $slots = [];

        foreach ($jornadas as $jornada) {
            $cursorInicio = Carbon::parse("{$fechaISO} {$jornada->hora_inicio}", 'America/Bogota');
            $limiteFin = Carbon::parse("{$fechaISO} {$jornada->hora_fin}", 'America/Bogota');

            while ($cursorInicio->copy()->addMinutes($duracion)->lte($limiteFin)) {
                $slotInicio = $cursorInicio->copy();
                $slotFin = $cursorInicio->copy()->addMinutes($duracion);

                $motivo = 'Disponible';
                $libre = true;

                if ($slotInicio->lte($ahora)) {
                    $libre = false;
                    $motivo = 'Pasado';
                }

                if ($libre) {
                    foreach ($bloqueos as $bloqueo) {
                        if ($slotInicio->lt($bloqueo->fecha_hora_fin) && $slotFin->gt($bloqueo->fecha_hora_inicio)) {
                            $libre = false;
                            $motivo = 'Bloqueado';
                            break;
                        }
                    }
                }

                if ($libre) {
                    foreach ($citasActivas as $cita) {
                        if ($slotInicio->lt($cita->fecha_hora_fin) && $slotFin->gt($cita->fecha_hora_inicio)) {
                            $libre = false;
                            $motivo = 'Ocupado';
                            break;
                        }
                    }
                }

                $slots[] = [
                    'inicio' => $slotInicio->format('H:i'),
                    'fin' => $slotFin->format('H:i'),
                    'label' => $slotInicio->format('h:i A'),
                    'fecha_hora_inicio' => $slotInicio->toIso8601String(),
                    'fecha_hora_fin' => $slotFin->toIso8601String(),
                    'libre' => $libre,
                    'motivo' => $motivo,
                ];

                $cursorInicio->addMinutes($duracion);
            }
        }

        return $slots;
    }
}

