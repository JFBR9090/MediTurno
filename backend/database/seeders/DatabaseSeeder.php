<?php

namespace Database\Seeders;

use App\Models\Cita;
use App\Models\Especialidad;
use App\Models\HistorialCita;
use App\Models\HorarioAtencion;
use App\Models\Medico;
use App\Models\Notificacion;
use App\Models\Paciente;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now('America/Bogota');

        // 1. Especialidades
        $especialidadesData = [
            ['nombre' => 'Cardiología', 'descripcion' => 'Diagnóstico y prevención de enfermedades cardiovasculares.', 'icono' => 'HeartPulse', 'tiempo_promedio_min' => 30],
            ['nombre' => 'Medicina General', 'descripcion' => 'Atención primaria integral, control preventivo y valoración clínica.', 'icono' => 'Stethoscope', 'tiempo_promedio_min' => 20],
            ['nombre' => 'Pediatría', 'descripcion' => 'Cuidado médico especializado para recién nacidos, niños y adolescentes.', 'icono' => 'Baby', 'tiempo_promedio_min' => 30],
            ['nombre' => 'Odontología', 'descripcion' => 'Salud oral, profilaxis, endodoncia y odontología estética.', 'icono' => 'Smile', 'tiempo_promedio_min' => 30],
            ['nombre' => 'Dermatología', 'descripcion' => 'Evaluación clínica y tratamiento de afecciones de la piel.', 'icono' => 'Sparkles', 'tiempo_promedio_min' => 30],
            ['nombre' => 'Ginecología', 'descripcion' => 'Salud integral femenina, control prenatal y diagnóstico preventivo.', 'icono' => 'Activity', 'tiempo_promedio_min' => 30],
            ['nombre' => 'Ortopedia', 'descripcion' => 'Valoración osteomuscular, traumatología y rehabilitación articular.', 'icono' => 'Bone', 'tiempo_promedio_min' => 30],
            ['nombre' => 'Oftalmología', 'descripcion' => 'Examen visual completo, agudeza visual y salud ocular.', 'icono' => 'Eye', 'tiempo_promedio_min' => 30],
        ];

        $especialidades = [];
        foreach ($especialidadesData as $esp) {
            $especialidades[$esp['nombre']] = Especialidad::create($esp);
        }

        // 2. Administradores y Perfiles de Coordinación
        User::create([
            'rol' => 'administrador',
            'nombre' => 'Juan Fernando',
            'apellido' => 'Salazar',
            'name' => 'Juan Fernando Salazar',
            'email' => 'admin@mediturno.co',
            'password' => 'Admin2026*',
            'activo' => true,
        ]);

        User::create([
            'rol' => 'administrador',
            'nombre' => 'Administrador',
            'apellido' => 'MediTurno',
            'name' => 'Administrador MediTurno',
            'email' => 'admin@mediturno.com',
            'password' => 'admin123',
            'activo' => true,
        ]);

        // Perfil 3: Gestión de Agendas y Horarios
        User::create([
            'rol' => 'agenda',
            'nombre' => 'Laura',
            'apellido' => 'Gómez',
            'name' => 'Laura Gómez (Coordinadora Agendas)',
            'email' => 'agendas@mediturno.com',
            'password' => 'agenda123',
            'activo' => true,
        ]);

        User::create([
            'rol' => 'agenda',
            'nombre' => 'Coordinación',
            'apellido' => 'de Agendas',
            'name' => 'Coordinación de Agendas',
            'email' => 'coordinador.agendas@mediturno.co',
            'password' => 'Agenda2026*',
            'activo' => true,
        ]);

        // Perfil 4: Gestión Operativa de Citas y Recepción
        User::create([
            'rol' => 'cita',
            'nombre' => 'Andrés',
            'apellido' => 'Cárdenas',
            'name' => 'Andrés Cárdenas (Gestor Citas)',
            'email' => 'citas@mediturno.com',
            'password' => 'citas123',
            'activo' => true,
        ]);

        User::create([
            'rol' => 'cita',
            'nombre' => 'Recepción',
            'apellido' => 'de Citas',
            'name' => 'Recepción de Citas',
            'email' => 'recepcion.citas@mediturno.co',
            'password' => 'Citas2026*',
            'activo' => true,
        ]);

        // 3. Profesionales (Médicos) y sus Agendas Semanales
        $medicosData = [
            [
                'nombre' => 'Dr. Alejandro', 'apellido' => 'Martínez', 'email' => 'a.martinez@mediturno.co',
                'tp' => 'TP-89412-CO', 'esp' => 'Cardiología', 'consultorio' => 'Consultorio 302 - Centro Médico MediTurno',
                'bio' => 'Cardiólogo clínico con 12 años de experiencia en prevención cardiovascular e hipertensión.',
                'calificacion' => 4.9, 'iniciales' => 'AM', 'color' => 'bg-sky-100 text-sky-700', 'dias' => [1, 2, 3, 4, 5],
            ],
            [
                'nombre' => 'Dra. Sofía', 'apellido' => 'Mendoza', 'email' => 's.mendoza@mediturno.co',
                'tp' => 'TP-74520-CO', 'esp' => 'Medicina General', 'consultorio' => 'Consultorio 104 - Piso 1',
                'bio' => 'Médica cirujana enfocada en medicina familiar, tamizaje preventivo y seguimiento crónico.',
                'calificacion' => 4.8, 'iniciales' => 'SM', 'color' => 'bg-emerald-100 text-emerald-700', 'dias' => [1, 2, 3, 4, 5, 6],
            ],
            [
                'nombre' => 'Dr. Mateo', 'apellido' => 'Valencia', 'email' => 'm.valencia@mediturno.co',
                'tp' => 'TP-61209-CO', 'esp' => 'Pediatría', 'consultorio' => 'Consultorio 205 - Ala Pediátrica',
                'bio' => 'Pediatra puericultor especializado en desarrollo infantil y esquema integral de vacunación.',
                'calificacion' => 5.0, 'iniciales' => 'MV', 'color' => 'bg-indigo-100 text-indigo-700', 'dias' => [1, 2, 3, 4, 5],
            ],
            [
                'nombre' => 'Dra. Valeria', 'apellido' => 'Gómez', 'email' => 'v.gomez@mediturno.co',
                'tp' => 'TP-55831-CO', 'esp' => 'Odontología', 'consultorio' => 'Consultorio 210 - Unidad Oral',
                'bio' => 'Odontóloga general y rehabilitadora oral con énfasis en atención mínimamente invasiva.',
                'calificacion' => 4.9, 'iniciales' => 'VG', 'color' => 'bg-teal-100 text-teal-700', 'dias' => [1, 2, 3, 4, 5, 6],
            ],
            [
                'nombre' => 'Dra. Laura', 'apellido' => 'Ríos', 'email' => 'l.rios@mediturno.co',
                'tp' => 'TP-90341-CO', 'esp' => 'Dermatología', 'consultorio' => 'Consultorio 401 - Piso 4',
                'bio' => 'Dermatóloga clínica experta en dermatoscopia digital y manejo de patologías cutáneas.',
                'calificacion' => 4.8, 'iniciales' => 'LR', 'color' => 'bg-amber-100 text-amber-700', 'dias' => [1, 3, 4, 5],
            ],
            [
                'nombre' => 'Dr. Nicolás', 'apellido' => 'Herrera', 'email' => 'n.herrera@mediturno.co',
                'tp' => 'TP-68114-CO', 'esp' => 'Ginecología', 'consultorio' => 'Consultorio 308 - Piso 3',
                'bio' => 'Ginecólogo y obstetra dedicado al cuidado integral de la salud de la mujer.',
                'calificacion' => 4.9, 'iniciales' => 'NH', 'color' => 'bg-rose-100 text-rose-700', 'dias' => [1, 2, 4, 5],
            ],
            [
                'nombre' => 'Dr. Esteban', 'apellido' => 'Cárdenas', 'email' => 'e.cardenas@mediturno.co',
                'tp' => 'TP-49201-CO', 'esp' => 'Ortopedia', 'consultorio' => 'Consultorio 112 - Piso 1',
                'bio' => 'Ortopedista y traumatólogo con enfoque en medicina deportiva y lesiones de rodilla.',
                'calificacion' => 4.7, 'iniciales' => 'EC', 'color' => 'bg-sky-100 text-sky-700', 'dias' => [2, 3, 4, 5],
            ],
            [
                'nombre' => 'Dra. Juliana', 'apellido' => 'Paredes', 'email' => 'j.paredes@mediturno.co',
                'tp' => 'TP-83710-CO', 'esp' => 'Oftalmología', 'consultorio' => 'Consultorio 406 - Piso 4',
                'bio' => 'Oftalmóloga clínica especializada en diagnóstico de segmento anterior y optometría médica.',
                'calificacion' => 4.9, 'iniciales' => 'JP', 'color' => 'bg-cyan-100 text-cyan-700', 'dias' => [1, 2, 3, 5],
            ],
            [
                'nombre' => 'Dr. Roberto', 'apellido' => 'Ramírez', 'email' => 'dr.ramirez@mediturno.com',
                'tp' => 'TP-10023-CO', 'esp' => 'Medicina General', 'consultorio' => 'Consultorio 101 - Piso 1',
                'bio' => 'Especialista en medicina preventiva, valoración primaria y seguimiento ambulatorio.',
                'calificacion' => 4.9, 'iniciales' => 'RR', 'color' => 'bg-emerald-100 text-emerald-700', 'dias' => [1, 2, 3, 4, 5, 6],
                'password' => 'medico123',
            ],
        ];

        $medicos = [];
        foreach ($medicosData as $idx => $m) {
            $userMed = User::create([
                'rol' => 'medico',
                'nombre' => $m['nombre'],
                'apellido' => $m['apellido'],
                'name' => "{$m['nombre']} {$m['apellido']}",
                'email' => $m['email'],
                'password' => $m['password'] ?? 'Medico2026*',
                'activo' => true,
            ]);

            $medico = Medico::create([
                'user_id' => $userMed->id,
                'especialidad_id' => $especialidades[$m['esp']]->id,
                'tarjeta_profesional' => $m['tp'],
                'consultorio' => $m['consultorio'],
                'biografia' => $m['bio'],
                'duracion_cita_defecto_min' => 30,
                'calificacion' => $m['calificacion'],
                'iniciales' => $m['iniciales'],
                'color_avatar' => $m['color'],
                'activo' => true,
            ]);

            foreach ($m['dias'] as $dia) {
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

            $medicos[$idx + 1] = $medico;
        }

        // 4. Pacientes
        $pacientesData = [
            ['nombre' => 'Camila', 'apellido' => 'Restrepo', 'email' => 'camila.restrepo@correo.co', 'doc' => '1018456789', 'tel' => '3001234567', 'fnac' => '1995-04-12'],
            ['nombre' => 'Andrés Felipe', 'apellido' => 'Mejía', 'email' => 'andres.mejia@correo.co', 'doc' => '79842105', 'tel' => '3115678901', 'fnac' => '1988-09-23'],
            ['nombre' => 'Mariana', 'apellido' => 'Ospina Ruiz', 'email' => 'mariana.ospina@correo.co', 'doc' => '52410983', 'tel' => '3158901234', 'fnac' => '1992-01-17'],
            ['nombre' => 'Carlos Alberto', 'apellido' => 'Torres', 'email' => 'carlos.torres@correo.co', 'doc' => '80123491', 'tel' => '3204456677', 'fnac' => '1985-06-05'],
            ['nombre' => 'Luisa Fernanda', 'apellido' => 'Vargas', 'email' => 'luisa.vargas@correo.co', 'doc' => '1032498112', 'tel' => '3019987766', 'fnac' => '1999-11-30'],
            ['nombre' => 'Santiago', 'apellido' => 'Morales', 'email' => 'santiago.morales@correo.co', 'doc' => '1020304050', 'tel' => '3123456789', 'fnac' => '1990-03-14'],
            ['nombre' => 'Carlos', 'apellido' => 'Mendoza', 'email' => 'carlos.mendoza@email.com', 'doc' => '1029384756', 'tel' => '3109876543', 'fnac' => '1992-07-15', 'password' => 'paciente123'],
        ];

        $pacientes = [];
        foreach ($pacientesData as $idx => $p) {
            $userPac = User::create([
                'rol' => 'paciente',
                'nombre' => $p['nombre'],
                'apellido' => $p['apellido'],
                'name' => "{$p['nombre']} {$p['apellido']}",
                'email' => $p['email'],
                'password' => $p['password'] ?? 'Paciente2026*',
                'activo' => true,
            ]);

            $pacientes[$idx + 1] = Paciente::create([
                'user_id' => $userPac->id,
                'tipo_documento' => 'CC',
                'numero_documento' => $p['doc'],
                'telefono' => $p['tel'],
                'fecha_nacimiento' => $p['fnac'],
            ]);
        }

        // 5. Citas iniciales (cubriendo todos los casos del MVP)
        $nextBiz2 = $now->copy()->addDays(2);
        while ($nextBiz2->isSunday()) {
            $nextBiz2->addDay();
        }
        $nextBiz4 = $now->copy()->addDays(4);
        while ($nextBiz4->isSunday()) {
            $nextBiz4->addDay();
        }

        $citasSeed = [
            // Cita próxima (< 2 horas) para probar bloqueo RN07
            [
                'codigo' => 'MT-202611-4K9P',
                'paciente' => $pacientes[1],
                'medico' => $medicos[2],
                'inicio' => $now->copy()->addMinutes(65),
                'fin' => $now->copy()->addMinutes(95),
                'estado' => 'confirmada',
                'motivo' => 'Control de chequeo general y lectura de laboratorio.',
            ],
            // Cita futura (>= 2 horas) cancelable
            [
                'codigo' => 'MT-202611-8B2T',
                'paciente' => $pacientes[1],
                'medico' => $medicos[1],
                'inicio' => $nextBiz2->copy()->setTime(10, 0),
                'fin' => $nextBiz2->copy()->setTime(10, 30),
                'estado' => 'programada',
                'motivo' => 'Evaluación cardiovascular preventiva.',
            ],
            // Cita confirmada futura
            [
                'codigo' => 'MT-202611-7M1X',
                'paciente' => $pacientes[1],
                'medico' => $medicos[4],
                'inicio' => $nextBiz4->copy()->setTime(14, 30),
                'fin' => $nextBiz4->copy()->setTime(15, 0),
                'estado' => 'confirmada',
                'motivo' => 'Limpieza dental semestral y valoración.',
            ],
            // Historial: completada y cancelada
            [
                'codigo' => 'MT-202610-2C5R',
                'paciente' => $pacientes[1],
                'medico' => $medicos[5],
                'inicio' => $now->copy()->subDays(6)->setTime(9, 30),
                'fin' => $now->copy()->subDays(6)->setTime(10, 0),
                'estado' => 'completada',
                'motivo' => 'Revisión de lunares y prescripción de protector solar.',
            ],
            [
                'codigo' => 'MT-202610-5D9L',
                'paciente' => $pacientes[1],
                'medico' => $medicos[8],
                'inicio' => $now->copy()->subDays(12)->setTime(15, 0),
                'fin' => $now->copy()->subDays(12)->setTime(15, 30),
                'estado' => 'cancelada',
                'motivo' => 'Control anual de fórmula óptica.',
                'motivo_cancelacion' => 'Conflicto de horario laboral.',
            ],
            // Agenda de hoy para Dr. Alejandro Martínez (medico_id = 1)
            [
                'codigo' => 'MT-202611-1H4N',
                'paciente' => $pacientes[2],
                'medico' => $medicos[1],
                'inicio' => $now->copy()->setTime(8, 30),
                'fin' => $now->copy()->setTime(9, 0),
                'estado' => 'completada',
                'motivo' => 'Seguimiento de presión arterial y electrocardiograma.',
            ],
            [
                'codigo' => 'MT-202611-3Q8V',
                'paciente' => $pacientes[3],
                'medico' => $medicos[1],
                'inicio' => $now->copy()->setTime(10, 30),
                'fin' => $now->copy()->setTime(11, 0),
                'estado' => 'confirmada',
                'motivo' => 'Palpitaciones esporádicas y valoración física.',
            ],
            [
                'codigo' => 'MT-202611-6Z2W',
                'paciente' => $pacientes[4],
                'medico' => $medicos[1],
                'inicio' => $now->copy()->setTime(14, 0),
                'fin' => $now->copy()->setTime(14, 30),
                'estado' => 'programada',
                'motivo' => 'Primera consulta cardiológica por antecedente familiar.',
            ],
            [
                'codigo' => 'MT-202611-9R5Y',
                'paciente' => $pacientes[5],
                'medico' => $medicos[1],
                'inicio' => $now->copy()->setTime(15, 0),
                'fin' => $now->copy()->setTime(15, 30),
                'estado' => 'programada',
                'motivo' => 'Control semestral post-tratamiento.',
            ],
            // Slot ocupado en fecha futura para demostrar franja ocupada
            [
                'codigo' => 'MT-202611-2P7K',
                'paciente' => $pacientes[6],
                'medico' => $medicos[1],
                'inicio' => $nextBiz2->copy()->setTime(9, 0),
                'fin' => $nextBiz2->copy()->setTime(9, 30),
                'estado' => 'confirmada',
                'motivo' => 'Control cardiológico.',
            ],
        ];

        foreach ($citasSeed as $item) {
            $cita = Cita::create([
                'codigo_reserva' => $item['codigo'],
                'paciente_id' => $item['paciente']->id,
                'medico_id' => $item['medico']->id,
                'especialidad_id' => $item['medico']->especialidad_id,
                'fecha_hora_inicio' => $item['inicio'],
                'fecha_hora_fin' => $item['fin'],
                'estado' => $item['estado'],
                'motivo_consulta' => $item['motivo'],
                'motivo_cancelacion' => $item['motivo_cancelacion'] ?? null,
            ]);

            HistorialCita::create([
                'cita_id' => $cita->id,
                'usuario_responsable_id' => $item['paciente']->user_id,
                'estado_anterior' => null,
                'estado_nuevo' => $item['estado'],
                'observaciones' => 'Registro inicial de cita médica.',
            ]);
        }

        // 6. Notificaciones de bienvenida
        Notificacion::create([
            'user_id' => $pacientes[1]->user_id,
            'titulo' => 'Cita confirmada',
            'mensaje' => 'Tu cita de Medicina General (MT-202611-4K9P) está confirmada para hoy.',
            'leida' => false,
        ]);
        Notificacion::create([
            'user_id' => $pacientes[1]->user_id,
            'titulo' => 'Recordatorio de asistencia',
            'mensaje' => 'Recuerda llegar 15 minutos antes a tu consulta en el Consultorio 302.',
            'leida' => false,
        ]);
    }
}
