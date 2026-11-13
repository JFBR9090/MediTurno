import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CalendarClock,
  CalendarPlus,
  Clock,
  Info,
  MapPin,
  MessageCircle,
  XCircle,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { ModalCancelar } from '../../components/citas/ModalCancelar';
import { ModalReprogramar } from '../../components/citas/ModalReprogramar';
import { useAuth } from '../../context/AuthContext';
import { useMediTurno } from '../../context/MediTurnoContext';

const BADGE_MAP = {
  programada: {
    label: 'Programada',
    classes: 'bg-[#eeeee9] text-[#1c3a13] border-[#c4c7c4]',
  },
  confirmada: {
    label: 'Confirmada',
    classes: 'bg-[#d3fa99] text-[#1c3a13] border-[#d3fa99]',
  },
  cancelada: {
    label: 'Cancelada',
    classes: 'bg-red-50 text-red-800 border-red-200',
  },
  completada: {
    label: 'Completada',
    classes: 'bg-[#1c3a13] text-[#fcfcf7] border-[#1c3a13]',
  },
  no_asistio: {
    label: 'No Asistió',
    classes: 'bg-[#eeeee9] text-[#666666] border-[#c4c7c4]',
  },
};

export function MisCitasPage() {
  const { user } = useAuth();
  const { citas, cancelarCita, reprogramarCita, showToast } = useMediTurno();

  const [tab, setTab] = useState('programadas');
  const [loading, setLoading] = useState(true);
  const [citaACancelar, setCitaACancelar] = useState(null);
  const [citaAReprogramar, setCitaAReprogramar] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 260);
    return () => clearTimeout(t);
  }, []);

  const misCitas = useMemo(() => {
    const pid = user?.paciente_id || 1;
    return citas
      .filter((c) => c.paciente_id === pid)
      .sort(
        (a, b) =>
          new Date(a.fecha_hora_inicio).getTime() -
          new Date(b.fecha_hora_inicio).getTime()
      );
  }, [citas, user]);

  const citasProgramadas = useMemo(
    () =>
      misCitas.filter((c) => ['programada', 'confirmada'].includes(c.estado)),
    [misCitas]
  );

  const citasHistorial = useMemo(
    () =>
      misCitas
        .filter((c) =>
          ['cancelada', 'completada', 'no_asistio'].includes(c.estado)
        )
        .reverse(),
    [misCitas]
  );

  const listadoActual = tab === 'programadas' ? citasProgramadas : citasHistorial;

  const handleConfirmarCancelacion = async (citaId, motivo) => {
    await cancelarCita(citaId, motivo);
    showToast({
      type: 'success',
      title: 'Cita cancelada y horario liberado',
      message: 'El turno quedó disponible nuevamente. ¿Deseas programar otra cita?',
    });
  };

  const handleConfirmarReprogramacion = async (citaId, payload) => {
    const actualizada = await reprogramarCita(citaId, payload);
    showToast({
      type: 'success',
      title: 'Cita reprogramada con éxito',
      message: `Nuevo horario guardado para el turno ${actualizada.codigo_reserva}.`,
    });
  };

  return (
    <DashboardLayout
      title="Mis Citas Médicas"
      subtitle="Consulta tus turnos activos, reprograma horarios y gestiona cancelaciones."
      actions={
        <Link to="/paciente/reservar" className="btn-primary">
          <CalendarPlus className="h-4 w-4" />
          Nueva Cita
        </Link>
      }
    >
      {/* Pestañas Programadas / Historial */}
      <div className="mb-6 flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setTab('programadas')}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-mono transition-all ${
            tab === 'programadas'
              ? 'bg-[#1c3a13] text-[#fcfcf7]'
              : 'bg-[#eeeee9] text-[#1c3a13] border border-[#eeeee9] hover:bg-[#c4c7c4]/40'
          }`}
        >
          Programadas
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-mono ${
              tab === 'programadas'
                ? 'bg-[#d3fa99] text-[#1c3a13]'
                : 'bg-[#fcfcf7] text-[#1c3a13]'
            }`}
          >
            {citasProgramadas.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('historial')}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-mono transition-all ${
            tab === 'historial'
              ? 'bg-[#1c3a13] text-[#fcfcf7]'
              : 'bg-[#eeeee9] text-[#1c3a13] border border-[#eeeee9] hover:bg-[#c4c7c4]/40'
          }`}
        >
          Historial
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-mono ${
              tab === 'historial'
                ? 'bg-[#d3fa99] text-[#1c3a13]'
                : 'bg-[#fcfcf7] text-[#1c3a13]'
            }`}
          >
            {citasHistorial.length}
          </span>
        </button>
      </div>

      {loading ? (
        <SkeletonLoader variant="table" count={3} />
      ) : listadoActual.length === 0 ? (
        <EmptyState
          title={
            tab === 'programadas'
              ? 'Actualmente no tienes citas médicas programadas'
              : 'Aún no tienes citas en tu historial'
          }
          description={
            tab === 'programadas'
              ? 'Agenda tu próxima consulta en menos de 3 minutos eligiendo la especialidad y horario de tu preferencia.'
              : 'Aquí aparecerán tus citas completadas o canceladas para tu control personal.'
          }
          actionLabel="Agendar mi primera cita"
          actionTo="/paciente/reservar"
        />
      ) : (
        <div className="space-y-4">
          {listadoActual.map((cita) => {
            const badge = BADGE_MAP[cita.estado] || BADGE_MAP.programada;
            const fechaIni = new Date(cita.fecha_hora_inicio);
            const fechaStr = fechaIni.toLocaleDateString('es-CO', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            const horaStr = fechaIni.toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            });

            // Regla de Negocio RN07: mínimo 2 horas de anticipación para cancelar o reprogramar
            const horasRestantes = (fechaIni.getTime() - Date.now()) / 3600000;
            const esModificable =
              ['programada', 'confirmada'].includes(cita.estado) &&
              horasRestantes >= 2;
            const bloqueadaPorTiempo =
              ['programada', 'confirmada'].includes(cita.estado) &&
              horasRestantes < 2;

            const waText = encodeURIComponent(
              `Hola, tengo una consulta sobre mi cita ${cita.codigo_reserva} con ${cita.medico_nombre} (${fechaStr} ${horaStr}).`
            );

            return (
              <article
                key={cita.id}
                className="card-surface p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.classes}`}
                    >
                      {badge.label}
                    </span>
                    <span className="rounded-full bg-[#eeeee9] border border-[#c4c7c4]/80 px-3 py-0.5 font-mono text-xs text-[#1c3a13]">
                      {cita.codigo_reserva}
                    </span>
                    <span className="text-xs font-mono uppercase text-[#757c5d]">
                      {cita.especialidad}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-[#1c3a13]">
                      {cita.medico_nombre}
                    </h3>
                    {cita.motivo_consulta && (
                      <p className="mt-0.5 text-xs text-[#666666]">
                        Motivo: {cita.motivo_consulta}
                      </p>
                    )}
                    {cita.motivo_cancelacion && cita.estado === 'cancelada' && (
                      <p className="mt-0.5 text-xs text-red-600">
                        Motivo de cancelación: {cita.motivo_cancelacion}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#666666] font-mono">
                    <span className="inline-flex items-center gap-1.5 capitalize">
                      <Calendar className="h-3.5 w-3.5 text-[#1c3a13]" />
                      {fechaStr}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#1c3a13]" />
                      {horaStr}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#1c3a13]" />
                      {cita.consultorio}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                {['programada', 'confirmada'].includes(cita.estado) && (
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <a
                      href={`https://wa.me/573001234567?text=${waText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp text-xs px-4 py-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </a>

                    {esModificable ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setCitaAReprogramar(cita)}
                          className="btn-secondary text-xs px-4 py-2"
                        >
                          <CalendarClock className="h-4 w-4" />
                          Reprogramar
                        </button>
                        <button
                          type="button"
                          onClick={() => setCitaACancelar(cita)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-[#fcfcf7] px-4 py-2 text-xs font-mono text-red-700 hover:bg-red-50 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancelar Cita
                        </button>
                      </>
                    ) : bloqueadaPorTiempo ? (
                      <div className="group relative inline-flex items-center">
                        <button
                          type="button"
                          disabled
                          title="Límite superado: mínimo 2 horas de anticipación"
                          aria-label="Cancelar Cita deshabilitado: Límite superado: mínimo 2 horas de anticipación"
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#c4c7c4] bg-[#eeeee9] px-4 py-2 text-xs font-mono text-[#666666] cursor-not-allowed"
                        >
                          <Info className="h-4 w-4" />
                          Cancelar Cita
                        </button>
                        <span className="pointer-events-none absolute bottom-full right-0 mb-2 hidden w-60 rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-medium text-white shadow-lg group-hover:block z-20">
                          Límite superado: mínimo 2 horas de anticipación
                        </span>
                      </div>
                    ) : null}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <ModalCancelar
        cita={citaACancelar}
        isOpen={Boolean(citaACancelar)}
        onClose={() => setCitaACancelar(null)}
        onConfirm={handleConfirmarCancelacion}
      />

      <ModalReprogramar
        cita={citaAReprogramar}
        isOpen={Boolean(citaAReprogramar)}
        onClose={() => setCitaAReprogramar(null)}
        onConfirm={handleConfirmarReprogramacion}
      />
    </DashboardLayout>
  );
}
