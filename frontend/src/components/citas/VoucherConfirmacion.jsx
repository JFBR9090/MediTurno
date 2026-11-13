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
    <div className="mx-auto max-w-2xl bg-[#fcfcf7] border border-[#eeeee9] rounded-[32px] overflow-hidden">
      {/* Encabezado Dark Section Forest Depths #1c3a13 */}
      <div className="bg-[#1c3a13] px-6 py-8 text-center text-[#fcfcf7]">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#1c3a13] border border-[#d3fa99]/40">
          <CheckCircle2 className="h-10 w-10 text-[#d3fa99]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-light tracking-[-0.4px] text-[#fcfcf7]">
          ¡Cita Reservada con Éxito!
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-[#eeeee9]/80 font-normal">
          Tu turno quedó protegido y confirmado en la agenda médica bajo el sistema Seed.
        </p>
      </div>

      {/* Detalle del Voucher */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#eeeee9] bg-[#eeeee9] px-5 py-4">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#666666]">
              Código Único de Reserva
            </p>
            <p className="mt-0.5 font-mono text-2xl font-normal tracking-wider text-[#1c3a13]">
              {cita.codigo_reserva}
            </p>
          </div>
          <span className="badge-lime font-mono text-xs">
            <span className="h-2 w-2 rounded-full bg-[#1c3a13]" />
            RESERVA CONFIRMADA
          </span>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="rounded-2xl border border-[#eeeee9] bg-[#eeeee9] p-4">
            <dt className="text-xs font-mono uppercase text-[#666666] flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-[#1c3a13]" />
              Profesional y Especialidad
            </dt>
            <dd className="mt-1 font-medium text-[#1c3a13]">{cita.medico_nombre}</dd>
            <dd className="text-xs font-mono text-[#757c5d]">{cita.especialidad}</dd>
          </div>

          <div className="rounded-2xl border border-[#eeeee9] bg-[#eeeee9] p-4">
            <dt className="text-xs font-mono uppercase text-[#666666] flex items-center gap-1.5">
              <CalendarCheck className="h-3.5 w-3.5 text-[#1c3a13]" />
              Fecha y Hora del Turno
            </dt>
            <dd className="mt-1 font-medium text-[#1c3a13] capitalize">
              {fechaFormateada}
            </dd>
            <dd className="text-xs font-mono text-[#666666]">{horaFormateada} (30 min)</dd>
          </div>

          <div className="sm:col-span-2 rounded-2xl border border-[#eeeee9] bg-[#eeeee9] p-4">
            <dt className="text-xs font-mono uppercase text-[#666666] flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#1c3a13]" />
              Sede y Consultorio
            </dt>
            <dd className="mt-1 font-medium text-[#1c3a13]">{cita.consultorio}</dd>
            {cita.motivo_consulta && (
              <dd className="mt-1 text-xs text-[#666666]">
                Motivo: {cita.motivo_consulta}
              </dd>
            )}
          </div>
        </dl>

        {/* Acciones de Salida y WhatsApp */}
        <div className="border-t border-[#eeeee9] pt-5 space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp w-full py-3.5 text-sm"
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
              Imprimir
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

