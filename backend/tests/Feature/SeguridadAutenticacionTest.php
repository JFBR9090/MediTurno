<?php

namespace Tests\Feature;

use App\Models\Cita;
use App\Models\Especialidad;
use App\Models\HorarioAtencion;
use App\Models\Medico;
use App\Models\Paciente;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class SeguridadAutenticacionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        RateLimiter::clear('login:carlos.mendoza@email.com|127.0.0.1');
    }

    public function test_login_exitoso_para_los_cuatro_perfiles_con_validacion_de_perfil(): void
    {
        // 1. Perfil Paciente
        $resPac = $this->postJson('/api/auth/login', [
            'correo' => 'carlos.mendoza@email.com',
            'password' => 'paciente123',
            'perfil' => 'paciente',
        ]);
        $resPac->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.rol', 'paciente');

        // 2. Perfil Profesional
        $resMed = $this->postJson('/api/auth/login', [
            'correo' => 'dr.ramirez@mediturno.com',
            'password' => 'medico123',
            'perfil' => 'profesional',
        ]);
        $resMed->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.rol', 'profesional');

        // 3. Perfil Agendas
        $resAge = $this->postJson('/api/auth/login', [
            'correo' => 'agendas@mediturno.com',
            'password' => 'agenda123',
            'perfil' => 'agenda',
        ]);
        $resAge->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.rol', 'agenda');

        // 4. Perfil Citas
        $resCit = $this->postJson('/api/auth/login', [
            'correo' => 'citas@mediturno.com',
            'password' => 'citas123',
            'perfil' => 'cita',
        ]);
        $resCit->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.rol', 'cita');
    }

    public function test_rechazo_cuando_las_credenciales_no_coinciden_con_el_perfil_seleccionado(): void
    {
        // Usuario Paciente intentando ingresar por el perfil de Profesional
        $res = $this->postJson('/api/auth/login', [
            'correo' => 'carlos.mendoza@email.com',
            'password' => 'paciente123',
            'perfil' => 'profesional',
        ]);

        $res->assertStatus(403)
            ->assertJsonPath('success', false);
        $this->assertStringContainsString('no coincide con el perfil seleccionado', $res->json('error'));

        // Usuario Profesional intentando ingresar por el perfil de Citas
        $res2 = $this->postJson('/api/auth/login', [
            'correo' => 'dr.ramirez@mediturno.com',
            'password' => 'medico123',
            'perfil' => 'cita',
        ]);

        $res2->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    public function test_proteccion_contra_fuerza_bruta_bloqueo_despues_de_cinco_intentos_fallidos(): void
    {
        $correo = 'carlos.mendoza@email.com';
        $ip = '127.0.0.1';
        $throttleKey = "login:{$correo}|{$ip}";
        RateLimiter::clear($throttleKey);

        // Realizar 5 intentos fallidos
        for ($i = 1; $i <= 5; $i++) {
            $res = $this->postJson('/api/auth/login', [
                'correo' => $correo,
                'password' => 'clave_incorrecta_' . $i,
                'perfil' => 'paciente',
            ], ['REMOTE_ADDR' => $ip]);

            $res->assertStatus(401)
                ->assertJsonPath('success', false);
        }

        // El 6to intento debe ser bloqueado con HTTP 429 Too Many Requests
        $resBloqueado = $this->postJson('/api/auth/login', [
            'correo' => $correo,
            'password' => 'paciente123', // incluso con clave correcta, queda bloqueado temporalmente
            'perfil' => 'paciente',
        ], ['REMOTE_ADDR' => $ip]);

        $resBloqueado->assertStatus(429)
            ->assertJsonPath('success', false);
        $this->assertStringContainsString('Demasiados intentos fallidos', $resBloqueado->json('error'));
        $this->assertTrue($resBloqueado->headers->has('Retry-After'));

        // Limpiar para siguientes tests
        RateLimiter::clear($throttleKey);
    }

    public function test_segregacion_estricta_de_permisos_por_perfil(): void
    {
        $pacienteUser = User::where('email', 'carlos.mendoza@email.com')->firstOrFail();
        $profesionalUser = User::where('email', 'dr.ramirez@mediturno.com')->firstOrFail();
        $agendaUser = User::where('email', 'agendas@mediturno.com')->firstOrFail();
        $citaUser = User::where('email', 'citas@mediturno.com')->firstOrFail();

        $medico = Medico::firstOrFail();
        $cita = Cita::firstOrFail();

        // 1. Paciente NO puede ver pacientes ni reportes admin
        $this->actingAs($pacienteUser)->getJson('/api/pacientes')->assertStatus(403);
        $this->actingAs($pacienteUser)->getJson('/api/reportes/citas')->assertStatus(403);

        // 2. Profesional NO puede acceder al directorio global de pacientes ni a reportes
        $this->actingAs($profesionalUser)->getJson('/api/pacientes')->assertStatus(403);
        $this->actingAs($profesionalUser)->getJson('/api/reportes/citas')->assertStatus(403);

        // 3. Agenda NO puede consultar el listado de citas de pacientes (403)
        $this->actingAs($agendaUser)->getJson('/api/citas')->assertStatus(403);

        // 4. Agenda SÍ puede configurar horarios semanales
        $resAgenda = $this->actingAs($agendaUser)->postJson("/api/horarios/{$medico->id}", [
            'dia_semana' => 7, // Domingo
            'hora_inicio' => '10:00',
            'hora_fin' => '12:00',
        ]);
        $resAgenda->assertCreated();

        // 5. Citas NO puede configurar horarios de médicos (403)
        $this->actingAs($citaUser)->postJson("/api/horarios/{$medico->id}", [
            'dia_semana' => 7,
            'hora_inicio' => '14:00',
            'hora_fin' => '16:00',
        ])->assertStatus(403);

        // 6. Citas NO puede actualizar el estado de atención clínica (403)
        $this->actingAs($citaUser)->putJson("/api/citas/{$cita->id}/estado", [
            'estado' => 'completada',
        ])->assertStatus(403);

        // 7. Citas SÍ puede ver reportes y consultar citas globales
        $this->actingAs($citaUser)->getJson('/api/reportes/citas')->assertOk();
        $this->actingAs($citaUser)->getJson('/api/citas')->assertOk();
    }

    public function test_cierre_de_sesion_seguro(): void
    {
        $user = User::where('email', 'carlos.mendoza@email.com')->firstOrFail();

        $this->actingAs($user);
        $this->getJson('/api/auth/me')->assertOk();

        // Logout
        $resLogout = $this->postJson('/api/auth/logout');
        $resLogout->assertOk()->assertJsonPath('success', true);

        // Siguiente petición como guest no debe tener sesión
        $this->getJson('/api/auth/me')->assertStatus(401);
    }
}
