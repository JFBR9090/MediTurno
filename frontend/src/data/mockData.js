/**
 * Catálogo y datos iniciales ficticios para demostración interactiva de MediTurno.
 * Cumple con Ley 1581 de 2012 (datos exclusivamente ficticios para pruebas).
 */

export const DEMO_USERS = {
  paciente: {
    id: 101,
    paciente_id: 1,
    rol: 'paciente',
    nombre: 'Camila',
    apellido: 'Restrepo',
    correo: 'camila.restrepo@correo.co',
    tipo_documento: 'CC',
    numero_documento: '1018456789',
    telefono: '3001234567',
  },
  medico: {
    id: 201,
    medico_id: 1,
    rol: 'medico',
    nombre: 'Alejandro',
    apellido: 'Martínez',
    correo: 'a.martinez@mediturno.co',
    tarjeta_profesional: 'TP-89412-CO',
  },
  admin: {
    id: 301,
    rol: 'administrador',
    nombre: 'Juan Fernando',
    apellido: 'Salazar',
    correo: 'admin@mediturno.co',
  },
};

export const ESPECIALIDADES_INICIALES = [
  {
    id: 1,
    nombre: 'Cardiología',
    descripcion: 'Diagnóstico y prevención de enfermedades cardiovasculares.',
    icono: 'HeartPulse',
    tiempoPromedio: '30 min',
  },
  {
    id: 2,
    nombre: 'Medicina General',
    descripcion: 'Atención primaria integral, control preventivo y valoración clínica.',
    icono: 'Stethoscope',
    tiempoPromedio: '20 min',
  },
  {
    id: 3,
    nombre: 'Pediatría',
    descripcion: 'Cuidado médico especializado para recién nacidos, niños y adolescentes.',
    icono: 'Baby',
    tiempoPromedio: '30 min',
  },
  {
    id: 4,
    nombre: 'Odontología',
    descripcion: 'Salud oral, profilaxis, endodoncia y odontología estética.',
    icono: 'Smile',
    tiempoPromedio: '30 min',
  },
  {
    id: 5,
    nombre: 'Dermatología',
    descripcion: 'Evaluación clínica y tratamiento de afecciones de la piel.',
    icono: 'Sparkles',
    tiempoPromedio: '30 min',
  },
  {
    id: 6,
    nombre: 'Ginecología',
    descripcion: 'Salud integral femenina, control prenatal y diagnóstico preventivo.',
    icono: 'Activity',
    tiempoPromedio: '30 min',
  },
  {
    id: 7,
    nombre: 'Ortopedia',
    descripcion: 'Valoración osteomuscular, traumatología y rehabilitación articular.',
    icono: 'Bone',
    tiempoPromedio: '30 min',
  },
  {
    id: 8,
    nombre: 'Oftalmología',
    descripcion: 'Examen visual completo, agudeza visual y salud ocular.',
    icono: 'Eye',
    tiempoPromedio: '30 min',
  },
];

export const MEDICOS_INICIALES = [
  {
    id: 1,
    usuario_id: 201,
    nombre: 'Dr. Alejandro Martínez',
    correo: 'a.martinez@mediturno.co',
    tarjeta_profesional: 'TP-89412-CO',
    especialidad_id: 1,
    especialidad: 'Cardiología',
    consultorio: 'Consultorio 302 - Centro Médico MediTurno',
    biografia: 'Cardiólogo clínico con 12 años de experiencia en prevención cardiovascular e hipertensión.',
    duracion_cita_defecto_min: 30,
    calificacion: 4.9,
    activo: true,
    iniciales: 'AM',
    colorAvatar: 'bg-sky-100 text-sky-700',
    diasAtencion: [1, 2, 3, 4, 5],
  },
  {
    id: 2,
    usuario_id: 202,
    nombre: 'Dra. Sofía Mendoza',
    correo: 's.mendoza@mediturno.co',
    tarjeta_profesional: 'TP-74520-CO',
    especialidad_id: 2,
    especialidad: 'Medicina General',
    consultorio: 'Consultorio 104 - Piso 1',
    biografia: 'Médica cirujana enfocada en medicina familiar, tamizaje preventivo y seguimiento crónico.',
    duracion_cita_defecto_min: 30,
    calificacion: 4.8,
    activo: true,
    iniciales: 'SM',
    colorAvatar: 'bg-emerald-100 text-emerald-700',
    diasAtencion: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 3,
    usuario_id: 203,
    nombre: 'Dr. Mateo Valencia',
    correo: 'm.valencia@mediturno.co',
    tarjeta_profesional: 'TP-61209-CO',
    especialidad_id: 3,
    especialidad: 'Pediatría',
    consultorio: 'Consultorio 205 - Ala Pediátrica',
    biografia: 'Pediatra puericultor especializado en desarrollo infantil y esquema integral de vacunación.',
    duracion_cita_defecto_min: 30,
    calificacion: 5.0,
    activo: true,
    iniciales: 'MV',
    colorAvatar: 'bg-indigo-100 text-indigo-700',
    diasAtencion: [1, 2, 3, 4, 5],
  },
  {
    id: 4,
    usuario_id: 204,
    nombre: 'Dra. Valeria Gómez',
    correo: 'v.gomez@mediturno.co',
    tarjeta_profesional: 'TP-55831-CO',
    especialidad_id: 4,
    especialidad: 'Odontología',
    consultorio: 'Consultorio 210 - Unidad Oral',
    biografia: 'Odontóloga general y rehabilitadora oral con énfasis en atención mínimamente invasiva.',
    duracion_cita_defecto_min: 30,
    calificacion: 4.9,
    activo: true,
    iniciales: 'VG',
    colorAvatar: 'bg-teal-100 text-teal-700',
    diasAtencion: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 5,
    usuario_id: 205,
    nombre: 'Dra. Laura Ríos',
    correo: 'l.rios@mediturno.co',
    tarjeta_profesional: 'TP-90341-CO',
    especialidad_id: 5,
    especialidad: 'Dermatología',
    consultorio: 'Consultorio 401 - Piso 4',
    biografia: 'Dermatóloga clínica experta en dermatoscopia digital y manejo de patologías cutáneas.',
    duracion_cita_defecto_min: 30,
    calificacion: 4.8,
    activo: true,
    iniciales: 'LR',
    colorAvatar: 'bg-amber-100 text-amber-700',
    diasAtencion: [1, 3, 4, 5],
  },
  {
    id: 6,
    usuario_id: 206,
    nombre: 'Dr. Nicolás Herrera',
    correo: 'n.herrera@mediturno.co',
    tarjeta_profesional: 'TP-68114-CO',
    especialidad_id: 6,
    especialidad: 'Ginecología',
    consultorio: 'Consultorio 308 - Piso 3',
    biografia: 'Ginecólogo y obstetra dedicado al cuidado integral de la salud de la mujer.',
    duracion_cita_defecto_min: 30,
    calificacion: 4.9,
    activo: true,
    iniciales: 'NH',
    colorAvatar: 'bg-rose-100 text-rose-700',
    diasAtencion: [1, 2, 4, 5],
  },
  {
    id: 7,
    usuario_id: 207,
    nombre: 'Dr. Esteban Cárdenas',
    correo: 'e.cardenas@mediturno.co',
    tarjeta_profesional: 'TP-49201-CO',
    especialidad_id: 7,
    especialidad: 'Ortopedia',
    consultorio: 'Consultorio 112 - Piso 1',
    biografia: 'Ortopedista y traumatólogo con enfoque en medicina deportiva y lesiones de rodilla.',
    duracion_cita_defecto_min: 30,
    calificacion: 4.7,
    activo: true,
    iniciales: 'EC',
    colorAvatar: 'bg-sky-100 text-sky-700',
    diasAtencion: [2, 3, 4, 5],
  },
  {
    id: 8,
    usuario_id: 208,
    nombre: 'Dra. Juliana Paredes',
    correo: 'j.paredes@mediturno.co',
    tarjeta_profesional: 'TP-83710-CO',
    especialidad_id: 8,
    especialidad: 'Oftalmología',
    consultorio: 'Consultorio 406 - Piso 4',
    biografia: 'Oftalmóloga clínica especializada en diagnóstico de segmento anterior y optometría médica.',
    duracion_cita_defecto_min: 30,
    calificacion: 4.9,
    activo: true,
    iniciales: 'JP',
    colorAvatar: 'bg-cyan-100 text-cyan-700',
    diasAtencion: [1, 2, 3, 5],
  },
];

export const HORARIOS_SLOTS_BASE = [
  { inicio: '08:00', fin: '08:30', label: '08:00 AM' },
  { inicio: '08:30', fin: '09:00', label: '08:30 AM' },
  { inicio: '09:00', fin: '09:30', label: '09:00 AM' },
  { inicio: '09:30', fin: '10:00', label: '09:30 AM' },
  { inicio: '10:00', fin: '10:30', label: '10:00 AM' },
  { inicio: '10:30', fin: '11:00', label: '10:30 AM' },
  { inicio: '11:00', fin: '11:30', label: '11:00 AM' },
  { inicio: '11:30', fin: '12:00', label: '11:30 AM' },
  { inicio: '14:00', fin: '14:30', label: '02:00 PM' },
  { inicio: '14:30', fin: '15:00', label: '02:30 PM' },
  { inicio: '15:00', fin: '15:30', label: '03:00 PM' },
  { inicio: '15:30', fin: '16:00', label: '03:30 PM' },
];

function formatDateLocalISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addHoursISO(baseDate, hours, minutes = 0) {
  const d = new Date(baseDate.getTime() + hours * 3600000 + minutes * 60000);
  return d.toISOString();
}

function makeDayTimeISO(dayOffset, hour, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function getNextBusinessDateISO(offsetDays = 1) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  while (d.getDay() === 0) {
    d.setDate(d.getDate() + 1);
  }
  return formatDateLocalISO(d);
}

export function createInitialCitas() {
  const now = new Date();

  // Cita próxima (< 2 horas) para probar regla de bloqueo RN07 en MisCitasPage
  const citaMenos2HorasInicio = new Date(now.getTime() + 65 * 60000);
  const citaMenos2HorasFin = new Date(citaMenos2HorasInicio.getTime() + 30 * 60000);

  // Cita futura (>= 2 horas) para probar flujo exitoso de ModalCancelar
  const nextBizDay2 = getNextBusinessDateISO(2);
  const [y2, m2, d2] = nextBizDay2.split('-').map(Number);
  const citaFuturaInicio = new Date(y2, m2 - 1, d2, 10, 0, 0, 0);
  const citaFuturaFin = new Date(y2, m2 - 1, d2, 10, 30, 0, 0);

  // Otra cita futura confirmada
  const nextBizDay3 = getNextBusinessDateISO(4);
  const [y3, m3, d3] = nextBizDay3.split('-').map(Number);
  const citaConfirmadaInicio = new Date(y3, m3 - 1, d3, 14, 30, 0, 0);
  const citaConfirmadaFin = new Date(y3, m3 - 1, d3, 15, 0, 0, 0);

  return [
    {
      id: 1001,
      codigo_reserva: 'MT-202611-4K9P',
      paciente_id: 1,
      paciente_nombre: 'Camila Restrepo',
      paciente_documento: 'CC 1018456789',
      paciente_telefono: '3001234567',
      medico_id: 2,
      medico_nombre: 'Dra. Sofía Mendoza',
      especialidad_id: 2,
      especialidad: 'Medicina General',
      consultorio: 'Consultorio 104 - Piso 1',
      fecha_hora_inicio: citaMenos2HorasInicio.toISOString(),
      fecha_hora_fin: citaMenos2HorasFin.toISOString(),
      estado: 'confirmada',
      motivo_consulta: 'Control de chequeo general y lectura de laboratorio.',
    },
    {
      id: 1002,
      codigo_reserva: 'MT-202611-8B2T',
      paciente_id: 1,
      paciente_nombre: 'Camila Restrepo',
      paciente_documento: 'CC 1018456789',
      paciente_telefono: '3001234567',
      medico_id: 1,
      medico_nombre: 'Dr. Alejandro Martínez',
      especialidad_id: 1,
      especialidad: 'Cardiología',
      consultorio: 'Consultorio 302 - Centro Médico MediTurno',
      fecha_hora_inicio: citaFuturaInicio.toISOString(),
      fecha_hora_fin: citaFuturaFin.toISOString(),
      estado: 'programada',
      motivo_consulta: 'Evaluación cardiovascular preventiva.',
    },
    {
      id: 1003,
      codigo_reserva: 'MT-202611-7M1X',
      paciente_id: 1,
      paciente_nombre: 'Camila Restrepo',
      paciente_documento: 'CC 1018456789',
      paciente_telefono: '3001234567',
      medico_id: 4,
      medico_nombre: 'Dra. Valeria Gómez',
      especialidad_id: 4,
      especialidad: 'Odontología',
      consultorio: 'Consultorio 210 - Unidad Oral',
      fecha_hora_inicio: citaConfirmadaInicio.toISOString(),
      fecha_hora_fin: citaConfirmadaFin.toISOString(),
      estado: 'confirmada',
      motivo_consulta: 'Limpieza dental semestral y valoración.',
    },
    {
      id: 1004,
      codigo_reserva: 'MT-202610-2C5R',
      paciente_id: 1,
      paciente_nombre: 'Camila Restrepo',
      paciente_documento: 'CC 1018456789',
      paciente_telefono: '3001234567',
      medico_id: 5,
      medico_nombre: 'Dra. Laura Ríos',
      especialidad_id: 5,
      especialidad: 'Dermatología',
      consultorio: 'Consultorio 401 - Piso 4',
      fecha_hora_inicio: makeDayTimeISO(-6, 9, 30),
      fecha_hora_fin: makeDayTimeISO(-6, 10, 0),
      estado: 'completada',
      motivo_consulta: 'Revisión de lunares y prescripción de protector solar.',
    },
    {
      id: 1005,
      codigo_reserva: 'MT-202610-5D9L',
      paciente_id: 1,
      paciente_nombre: 'Camila Restrepo',
      paciente_documento: 'CC 1018456789',
      paciente_telefono: '3001234567',
      medico_id: 8,
      medico_nombre: 'Dra. Juliana Paredes',
      especialidad_id: 8,
      especialidad: 'Oftalmología',
      consultorio: 'Consultorio 406 - Piso 4',
      fecha_hora_inicio: makeDayTimeISO(-12, 15, 0),
      fecha_hora_fin: makeDayTimeISO(-12, 15, 30),
      estado: 'cancelada',
      motivo_consulta: 'Control anual de fórmula óptica.',
      motivo_cancelacion: 'Conflicto de horario laboral.',
    },
    // Citas de hoy para Agenda del Médico (Dr. Alejandro Martínez, medico_id: 1)
    {
      id: 2001,
      codigo_reserva: 'MT-202611-1H4N',
      paciente_id: 2,
      paciente_nombre: 'Andrés Felipe Mejía',
      paciente_documento: 'CC 79842105',
      paciente_telefono: '3115678901',
      medico_id: 1,
      medico_nombre: 'Dr. Alejandro Martínez',
      especialidad_id: 1,
      especialidad: 'Cardiología',
      consultorio: 'Consultorio 302 - Centro Médico MediTurno',
      fecha_hora_inicio: makeDayTimeISO(0, 8, 30),
      fecha_hora_fin: makeDayTimeISO(0, 9, 0),
      estado: 'completada',
      motivo_consulta: 'Seguimiento de presión arterial y electrocardiograma.',
    },
    {
      id: 2002,
      codigo_reserva: 'MT-202611-3Q8V',
      paciente_id: 3,
      paciente_nombre: 'Mariana Ospina Ruiz',
      paciente_documento: 'CC 52410983',
      paciente_telefono: '3158901234',
      medico_id: 1,
      medico_nombre: 'Dr. Alejandro Martínez',
      especialidad_id: 1,
      especialidad: 'Cardiología',
      consultorio: 'Consultorio 302 - Centro Médico MediTurno',
      fecha_hora_inicio: makeDayTimeISO(0, 10, 30),
      fecha_hora_fin: makeDayTimeISO(0, 11, 0),
      estado: 'confirmada',
      motivo_consulta: 'Palpitaciones esporádicas y valoración física.',
    },
    {
      id: 2003,
      codigo_reserva: 'MT-202611-6Z2W',
      paciente_id: 4,
      paciente_nombre: 'Carlos Alberto Torres',
      paciente_documento: 'CC 80123491',
      paciente_telefono: '3204456677',
      medico_id: 1,
      medico_nombre: 'Dr. Alejandro Martínez',
      especialidad_id: 1,
      especialidad: 'Cardiología',
      consultorio: 'Consultorio 302 - Centro Médico MediTurno',
      fecha_hora_inicio: makeDayTimeISO(0, 14, 0),
      fecha_hora_fin: makeDayTimeISO(0, 14, 30),
      estado: 'programada',
      motivo_consulta: 'Primera consulta cardiológica por antecedente familiar.',
    },
    {
      id: 2004,
      codigo_reserva: 'MT-202611-9R5Y',
      paciente_id: 5,
      paciente_nombre: 'Luisa Fernanda Vargas',
      paciente_documento: 'CC 1032498112',
      paciente_telefono: '3019987766',
      medico_id: 1,
      medico_nombre: 'Dr. Alejandro Martínez',
      especialidad_id: 1,
      especialidad: 'Cardiología',
      consultorio: 'Consultorio 302 - Centro Médico MediTurno',
      fecha_hora_inicio: makeDayTimeISO(0, 15, 0),
      fecha_hora_fin: makeDayTimeISO(0, 15, 30),
      estado: 'programada',
      motivo_consulta: 'Control semestral post-tratamiento.',
    },
    // Cita ocupada mañana para Dr. Alejandro Martínez (para mostrar slots ocupados en SelectorSlots)
    {
      id: 2005,
      codigo_reserva: 'MT-202611-2P7K',
      paciente_id: 6,
      paciente_nombre: 'Santiago Morales',
      paciente_documento: 'CC 1020304050',
      paciente_telefono: '3123456789',
      medico_id: 1,
      medico_nombre: 'Dr. Alejandro Martínez',
      especialidad_id: 1,
      especialidad: 'Cardiología',
      consultorio: 'Consultorio 302 - Centro Médico MediTurno',
      fecha_hora_inicio: addHoursISO(citaFuturaInicio, -1),
      fecha_hora_fin: addHoursISO(citaFuturaInicio, -0.5),
      estado: 'confirmada',
      motivo_consulta: 'Control cardiológico.',
    },
  ];
}

export const NOTIFICACIONES_INICIALES = [
  {
    id: 1,
    titulo: 'Cita confirmada',
    mensaje: 'Tu cita de Medicina General (MT-202611-4K9P) está confirmada para hoy.',
    leida: false,
    fecha: 'Hace 20 min',
  },
  {
    id: 2,
    titulo: 'Recordatorio de asistencia',
    mensaje: 'Recuerda llegar 15 minutos antes a tu consulta en el Consultorio 302.',
    leida: false,
    fecha: 'Hace 2 horas',
  },
];

