import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Printer,
  Stethoscope,
} from 'lucide-react';

export function VoucherConfirmacion({ cita, onNuevaCita }) {
  if (!cita) return null;

  const fechaObj = new Date(cita.fecha_hora_inicio);
  const fechaFormateada = fechaObj.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const horaFormateada = fechaObj.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const mensajeWhatsApp = [
    `Hola, tengo confirmada mi cita en MediTurno.`,
    `Código de reserva: ${cita.codigo_reserva}`,
    `Paciente: ${cita.paciente_nombre}`,
    `Médico: ${cita.medico_nombre} (${cita.especialidad})`,
    `Fecha y hora: ${fechaFormateada} a las ${horaFormateada}`,
    `Lugar: ${cita.consultorio}`,
  ].join('\n');

  const whatsappUrl = `https://wa.me/573001234567?text=${encodeURIComponent(
    mensajeWhatsApp
  )}`;

  return (
    <div className="mx-auto max-w-2xl card-surface overflow-hidden animate-fade-in-up">
      {/* Encabezado Verde Esmeralda */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-8 text-center text-white">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm animate-scale-check">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          ¡Cita Reservada con Éxito!
        </h2>
        <p className="mt-1 text-sm text-emerald-50">
          Tu turno quedó protegido y confirmado en la agenda médica.
        </p>
      </div>

      {/* Detalle del Voucher */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50/60 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">
              Código Único de Reserva
            </p>
            <p className="mt-0.5 font-mono text-2xl font-bold tracking-wider text-slate-900">
              {cita.codigo_reserva}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Reserva Activa
          </span>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <dt className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-sky-600" />
              Profesional y Especialidad
            </dt>
            <dd className="mt-1 font-semibold text-slate-900">{cita.medico_nombre}</dd>
            <dd className="text-xs text-sky-700 font-medium">{cita.especialidad}</dd>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <dt className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <CalendarCheck className="h-3.5 w-3.5 text-sky-600" />
              Fecha y Hora del Turno
            </dt>
            <dd className="mt-1 font-semibold text-slate-900 capitalize">
              {fechaFormateada}
            </dd>
            <dd className="text-xs text-slate-600 font-medium">{horaFormateada} (30 min)</dd>
          </div>

          <div className="sm:col-span-2 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <dt className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-sky-600" />
              Sede y Consultorio
            </dt>
            <dd className="mt-1 font-semibold text-slate-900">{cita.consultorio}</dd>
            {cita.motivo_consulta && (
              <dd className="mt-1 text-xs text-slate-500">
                Motivo: {cita.motivo_consulta}
              </dd>
            )}
          </div>
        </dl>

        {/* Acciones de Salida y WhatsApp */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp w-full py-3 text-base"
          >
            <MessageCircle className="h-5 w-5" />
            Enviar Confirmación por WhatsApp Web
          </a>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-secondary w-full"
            >
              <Printer className="h-4 w-4" />
              Imprimir Resumen
            </button>
            <button
              type="button"
              onClick={onNuevaCita}
              className="btn-secondary w-full"
            >
              Agendar Otra Cita
            </button>
            <Link to="/paciente/citas" className="btn-primary w-full">
              Ir a Mis Citas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

