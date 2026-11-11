<?php

namespace Tests\Feature;

use App\Models\Cita;
use App\Models\Medico;
use App\Models\Paciente;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlanPruebasMvpTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_cp01_registrar_paciente_valido(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'nombre' => 'Valentina',
            'apellido' => 'Rojas',
            'tipo_documento' => 'CC',
            'numero_documento' => '1098765432',
            'telefono' => '3109876543',
            'fecha_nacimiento' => '1997-08-15',
            'correo' => 'valentina.rojas@correo.co',
            'password' => 'ClaveSegura2026',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.rol', 'paciente');

        $this->assertDatabaseHas('users', ['email' => 'valentina.rojas@correo.co']);
        $this->assertDatabaseHas('pacientes', ['numero_documento' => '1098765432']);
    }

    public function test_cp02_rechazar_registro_con_correo_duplicado(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'nombre' => 'Duplicado',
            'apellido' => 'Prueba',
            'tipo_documento' => 'CC',
            'numero_documento' => '9988776655',
            'telefono' => '3005554433',
            'fecha_nacimiento' => '1994-05-10',
            'correo' => 'camila.restrepo@correo.co',
            'password' => 'ClaveSegura2026',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['correo']);
    }

    public function test_cp03_y_cp04_login_valido_e_invalido(): void
    {
        // CP-04: Contraseña incorrecta
        $bad = $this->postJson('/api/auth/login', [
            'correo' => 'camila.restrepo@correo.co',
            'password' => 'Incorrecta123',
        ]);
        $bad->assertStatus(401)->assertJsonPath('success', false);

        // CP-03: Credenciales correctas
        $ok = $this->postJson('/api/auth/login', [
            'correo' => 'camila.restrepo@correo.co',
            'password' => 'Paciente2026*',
        ]);
        $ok->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.rol', 'paciente');
    }

    public function test_cp05_y_cp06_consultar_profesionales_y_horarios(): void
    {
        $medicosRes = $this->getJson('/api/medicos?solo_activos=1');
        $medicosRes->assertOk()->assertJsonPath('success', true);
        $this->assertGreaterThanOrEqual(8, count($medicosRes->json('data')));

        $medico = Medico::firstOrFail();
        $fecha = Carbon::now('America/Bogota')->addDays(4)->startOfDay();
        while ($fecha->isWeekend()) {
            $fecha->addDay();
        }

        $slotsRes = $this->getJson("/api/horarios/{$medico->id}/disponibilidad?fecha={$fecha->format('Y-m-d')}");
        $slotsRes->assertOk()->assertJsonPath('success', true);
        $this->assertNotEmpty($slotsRes->json('data'));
    }

    public function test_cp07_cp08_y_cp09_reservar_disponible_rechazar_ocupado_y_rechazar_pasado(): void
    {
        $pacienteUser = User::where('email', 'camila.restrepo@correo.co')->firstOrFail();
        $medico = Medico::firstOrFail();

        // CP-09: Cita en fecha pasada rechazada
        $pasada = $this->actingAs($pacienteUser)->postJson('/api/citas', [
            'medico_id' => $medico->id,
            'especialidad_id' => $medico->especialidad_id,
            'fecha_hora_inicio' => Carbon::now('America/Bogota')->subDay()->toIso8601String(),
            'fecha_hora_fin' => Carbon::now('America/Bogota')->subDay()->addMinutes(30)->toIso8601String(),
        ]);
        $pasada->assertStatus(400);

        // CP-07: Reservar cita disponible
        $fecha = Carbon::now('America/Bogota')->addDays(6)->startOfDay();
        while ($fecha->isWeekend()) {
            $fecha->addDay();
        }
        $inicio = $fecha->copy()->setTime(14, 0)->toIso8601String();
        $fin = $fecha->copy()->setTime(14, 30)->toIso8601String();

        $creada = $this->actingAs($pacienteUser)->postJson('/api/citas', [
            'medico_id' => $medico->id,
            'especialidad_id' => $medico->especialidad_id,
            'fecha_hora_inicio' => $inicio,
            'fecha_hora_fin' => $fin,
        ]);
        $creada->assertCreated()->assertJsonPath('data.estado', 'programada');

        // CP-08: Reservar horario ocupado rechazado con 409
        $ocupada = $this->actingAs($pacienteUser)->postJson('/api/citas', [
            'medico_id' => $medico->id,
            'especialidad_id' => $medico->especialidad_id,
            'fecha_hora_inicio' => $inicio,
            'fecha_hora_fin' => $fin,
        ]);
        $ocupada->assertStatus(409);
    }

    public function test_cp10_y_cp14_cancelar_y_reprogramar_cita(): void
    {
        $pacienteUser = User::where('email', 'camila.restrepo@correo.co')->firstOrFail();
        $citaFutura = Cita::where('codigo_reserva', 'MT-202611-8B2T')->firstOrFail();

        // CP-14: Reprogramar hacia otro horario libre
        $nuevaFecha = Carbon::now('America/Bogota')->addDays(7)->startOfDay();
        while ($nuevaFecha->isWeekend()) {
            $nuevaFecha->addDay();
        }

        $resReprog = $this->actingAs($pacienteUser)
            ->putJson("/api/citas/{$citaFutura->id}/reprogramar", [
                'fecha_hora_inicio' => $nuevaFecha->copy()->setTime(15, 0)->toIso8601String(),
                'fecha_hora_fin' => $nuevaFecha->copy()->setTime(15, 30)->toIso8601String(),
            ]);
        $resReprog->assertOk()->assertJsonPath('data.estado', 'programada');

        $this->assertDatabaseHas('historial_citas', [
            'cita_id' => $citaFutura->id,
            'estado_nuevo' => 'programada',
        ]);

        // CP-10: Cancelar cita reprogramada
        $resCancel = $this->actingAs($pacienteUser)
            ->putJson("/api/citas/{$citaFutura->id}/cancelar", [
                'motivo_cancelacion' => 'Cambio de viaje',
            ]);
        $resCancel->assertOk()->assertJsonPath('data.estado', 'cancelada');
    }

    public function test_cp11_cp12_y_cp13_agenda_medica_aislamiento_y_reportes_admin(): void
    {
        $medicoUser = User::where('email', 'a.martinez@mediturno.co')->firstOrFail();
        $pacienteUser = User::where('email', 'camila.restrepo@correo.co')->firstOrFail();
        $adminUser = User::where('email', 'admin@mediturno.co')->firstOrFail();

        // CP-11: Médico consulta su propia agenda
        $agendaRes = $this->actingAs($medicoUser)->getJson('/api/citas');
        $agendaRes->assertOk()->assertJsonPath('success', true);
        $this->assertNotEmpty($agendaRes->json('data'));

        // CP-12: Paciente intenta cancelar cita de otro paciente -> 403 Acceso denegado
        $otroPaciente = Paciente::where('user_id', '!=', $pacienteUser->id)->firstOrFail();
        $citaAjena = Cita::where('paciente_id', $otroPaciente->id)->firstOrFail();

        $denegado = $this->actingAs($pacienteUser)
            ->putJson("/api/citas/{$citaAjena->id}/cancelar", []);
        $denegado->assertStatus(403);

        // CP-13: Administrador consulta reportes filtrados
        $reporteRes = $this->actingAs($adminUser)
            ->getJson('/api/reportes/citas?estado=completada');
        $reporteRes->assertOk()
            ->assertJsonPath('success', true);
        $this->assertArrayHasKey('resumen', $reporteRes->json());
        $this->assertGreaterThanOrEqual(1, $reporteRes->json('resumen.completadas'));
    }

    public function test_admin_gestiona_especialidades_pacientes_y_horarios_sin_solapamiento(): void
    {
        $adminUser = User::where('email', 'admin@mediturno.co')->firstOrFail();
        $medico = Medico::firstOrFail();

        // Crear especialidad
        $espRes = $this->actingAs($adminUser)->postJson('/api/especialidades', [
            'nombre' => 'Neurología',
            'descripcion' => 'Atención especializada del sistema nervioso.',
            'tiempo_promedio_min' => 30,
        ]);
        $espRes->assertCreated()->assertJsonPath('data.nombre', 'Neurología');

        // Registrar paciente desde Admin
        $pacRes = $this->actingAs($adminUser)->postJson('/api/pacientes', [
            'nombre' => 'Julián',
            'apellido' => 'Mendoza',
            'tipo_documento' => 'CC',
            'numero_documento' => '1045678912',
            'telefono' => '3187654321',
            'fecha_nacimiento' => '1991-02-20',
            'correo' => 'julian.mendoza@correo.co',
        ]);
        $pacRes->assertCreated()->assertJsonPath('data.numero_documento', '1045678912');

        // Intentar agregar horario superpuesto el lunes (08:00-12:00 ya existe) -> 409
        $horarioSolapado = $this->actingAs($adminUser)->postJson("/api/horarios/{$medico->id}", [
            'dia_semana' => 1,
            'hora_inicio' => '09:00',
            'hora_fin' => '11:00',
        ]);
        $horarioSolapado->assertStatus(409);
    }
}

