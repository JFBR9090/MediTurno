<?php

namespace Tests\Feature;

use App\Models\Cita;
use App\Models\Especialidad;
use App\Models\Medico;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CitaTransaccionalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_reserva_exitosa_y_prevencion_de_solapamiento_409(): void
    {
        $pacienteUser = User::where('email', 'camila.restrepo@correo.co')->firstOrFail();
        $medico = Medico::firstOrFail();

        $fecha = Carbon::now('America/Bogota')->addDays(5)->startOfDay();
        while ($fecha->isWeekend()) {
            $fecha->addDay();
        }
        $inicio = $fecha->copy()->setTime(11, 0)->toIso8601String();
        $fin = $fecha->copy()->setTime(11, 30)->toIso8601String();

        // Primera reserva: 201 Created
        $res1 = $this->actingAs($pacienteUser)->postJson('/api/citas', [
            'medico_id' => $medico->id,
            'especialidad_id' => $medico->especialidad_id,
            'fecha_hora_inicio' => $inicio,
            'fecha_hora_fin' => $fin,
            'motivo_consulta' => 'Chequeo preventivo',
        ]);

        $res1->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.estado', 'programada');

        $this->assertStringStartsWith('MT-', $res1->json('data.codigo_reserva'));

        // Segunda reserva simultánea en el mismo horario: 409 Conflict
        $res2 = $this->actingAs($pacienteUser)->postJson('/api/citas', [
            'medico_id' => $medico->id,
            'especialidad_id' => $medico->especialidad_id,
            'fecha_hora_inicio' => $inicio,
            'fecha_hora_fin' => $fin,
        ]);

        $res2->assertStatus(409)
            ->assertJsonPath('success', false);
    }

    public function test_regla_de_cancelacion_de_2_horas_y_liberacion_de_horario(): void
    {
        $pacienteUser = User::where('email', 'camila.restrepo@correo.co')->firstOrFail();
        $paciente = $pacienteUser->paciente;

        // Cita próxima (< 2 horas) debe ser bloqueada con 400
        $citaCercana = Cita::where('paciente_id', $paciente->id)
            ->where('codigo_reserva', 'MT-202611-4K9P')
            ->firstOrFail();

        $resBloqueada = $this->actingAs($pacienteUser)
            ->putJson("/api/citas/{$citaCercana->id}/cancelar", [
                'motivo_cancelacion' => 'Imprevisto',
            ]);

        $resBloqueada->assertStatus(400);

        // Cita futura (>= 2 horas) debe cancelarse correctamente
        $citaFutura = Cita::where('paciente_id', $paciente->id)
            ->where('codigo_reserva', 'MT-202611-8B2T')
            ->firstOrFail();

        $resOk = $this->actingAs($pacienteUser)
            ->putJson("/api/citas/{$citaFutura->id}/cancelar", [
                'motivo_cancelacion' => 'Reprogramación personal',
            ]);

        $resOk->assertOk()
            ->assertJsonPath('data.estado', 'cancelada');
    }

    public function test_modulo_profesionales_y_control_de_roles_rbac(): void
    {
        $pacienteUser = User::where('email', 'camila.restrepo@correo.co')->firstOrFail();
        $adminUser = User::where('email', 'admin@mediturno.co')->firstOrFail();
        $especialidad = Especialidad::firstOrFail();

        // Paciente no puede crear profesionales (403 Forbidden)
        $resForbidden = $this->actingAs($pacienteUser)->postJson('/api/medicos', [
            'nombre' => 'Dra. Carolina Vélez',
            'correo' => 'c.velez@mediturno.co',
            'tarjeta_profesional' => 'TP-99999-CO',
            'especialidad_id' => $especialidad->id,
            'consultorio' => 'Consultorio 501',
        ]);
        $resForbidden->assertStatus(403);

        // Administrador sí puede crear profesional + agenda semanal automática
        $resAdmin = $this->actingAs($adminUser)->postJson('/api/medicos', [
            'nombre' => 'Dra. Carolina Vélez',
            'correo' => 'c.velez@mediturno.co',
            'tarjeta_profesional' => 'TP-99999-CO',
            'especialidad_id' => $especialidad->id,
            'consultorio' => 'Consultorio 501',
            'duracion_cita_defecto_min' => 30,
        ]);
        $resAdmin->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.tarjeta_profesional', 'TP-99999-CO');
    }
}

