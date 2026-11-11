<?php

namespace Tests\Feature;

use App\Models\BloqueoHorario;
use App\Models\Cita;
use App\Models\Medico;
use App\Models\Paciente;
use Carbon\Carbon;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgendaDisponibilidadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_genera_calendario_de_dias_habiles_para_un_profesional(): void
    {
        $medico = Medico::firstOrFail();

        $response = $this->getJson("/api/horarios/{$medico->id}/calendario?dias=7");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('medico_id', $medico->id)
            ->assertJsonCount(7, 'data');

        $primeraFecha = $response->json('data.0');
        $this->assertArrayHasKey('iso', $primeraFecha);
        $this->assertArrayHasKey('total_slots', $primeraFecha);
        $this->assertArrayHasKey('slots_libres', $primeraFecha);
        $this->assertGreaterThan(0, $primeraFecha['total_slots']);
    }

    public function test_pruebas_de_disponibilidad_descuentan_citas_activas_y_bloqueos(): void
    {
        $medico = Medico::firstOrFail();
        $paciente = Paciente::firstOrFail();

        // Elegir próximo día hábil dentro de la jornada Lunes-Viernes
        $fecha = Carbon::now('America/Bogota')->addDays(3)->startOfDay();
        while ($fecha->isWeekend()) {
            $fecha->addDay();
        }
        $fechaISO = $fecha->format('Y-m-d');

        // Reservar 09:00-09:30 y bloquear 10:00-10:30
        Cita::create([
            'codigo_reserva' => 'MT-TEST-0900',
            'paciente_id' => $paciente->id,
            'medico_id' => $medico->id,
            'especialidad_id' => $medico->especialidad_id,
            'fecha_hora_inicio' => $fecha->copy()->setTime(9, 0),
            'fecha_hora_fin' => $fecha->copy()->setTime(9, 30),
            'estado' => 'programada',
        ]);

        BloqueoHorario::create([
            'medico_id' => $medico->id,
            'fecha_hora_inicio' => $fecha->copy()->setTime(10, 0),
            'fecha_hora_fin' => $fecha->copy()->setTime(10, 30),
            'tipo' => 'descanso',
            'motivo' => 'Pausa administrativa',
        ]);

        $response = $this->getJson("/api/horarios/{$medico->id}/disponibilidad?fecha={$fechaISO}");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('fecha', $fechaISO);

        $slots = collect($response->json('data'));

        $slot0800 = $slots->firstWhere('inicio', '08:00');
        $slot0900 = $slots->firstWhere('inicio', '09:00');
        $slot1000 = $slots->firstWhere('inicio', '10:00');

        $this->assertTrue($slot0800['libre']);
        $this->assertEquals('Disponible', $slot0800['motivo']);

        $this->assertFalse($slot0900['libre']);
        $this->assertEquals('Ocupado', $slot0900['motivo']);

        $this->assertFalse($slot1000['libre']);
        $this->assertEquals('Bloqueado', $slot1000['motivo']);
    }
}

