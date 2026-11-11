import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
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
import { useAuth } from '../../context/AuthContext';
import { useMediTurno } from '../../context/MediTurnoContext';

const BADGE_MAP = {
  programada: {
    label: 'Programada',
    classes: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  confirmada: {
    label: 'Confirmada',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  cancelada: {
    label: 'Cancelada',
    classes: 'bg-red-50 text-red-700 border-red-200',
  },
  completada: {
    label: 'Completada',
    classes: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  no_asistio: {
    label: 'No Asistió',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

export function MisCitasPage() {
  const { user } = useAuth();
  const { citas, cancelarCita, showToast } = useMediTurno();

  const [tab, setTab] = useState('programadas');
  const [loading, setLoading] = useState(true);
  const [citaACancelar, setCitaACancelar] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
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

  return (
    <DashboardLayout
      title="Mis Citas Médicas"
      subtitle="Consulta tus turnos activos, verifica códigos de reserva y gestiona cancelaciones."
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
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            tab === 'programadas'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Programadas
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              tab === 'programadas'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {citasProgramadas.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('historial')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            tab === 'historial'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Historial
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              tab === 'historial'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-600'
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

            // Regla de Negocio RN07: mínimo 2 horas de anticipación para cancelar
            const horasRestantes = (fechaIni.getTime() - Date.now()) / 3600000;
            const esCancelable =
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
                    <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 font-mono text-xs font-semibold text-slate-700">
                      {cita.codigo_reserva}
                    </span>
                    <span className="text-xs font-semibold text-sky-700">
                      {cita.especialidad}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {cita.medico_nombre}
                    </h3>
                    {cita.motivo_consulta && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        Motivo: {cita.motivo_consulta}
                      </p>
                    )}
                    {cita.motivo_cancelacion && cita.estado === 'cancelada' && (
                      <p className="mt-0.5 text-xs text-red-600">
                        Motivo de cancelación: {cita.motivo_cancelacion}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5 capitalize">
                      <Calendar className="h-3.5 w-3.5 text-sky-600" />
                      {fechaStr}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Clock className="h-3.5 w-3.5 text-sky-600" />
                      {horaStr}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-sky-600" />
                      {cita.consultorio}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                {['programada', 'confirmada'].includes(cita.estado) && (
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                    <a
                      href={`https://wa.me/573001234567?text=${waText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp text-xs px-3 py-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </a>

                    {esCancelable ? (
                      <button
                        type="button"
                        onClick={() => setCitaACancelar(cita)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancelar Cita
                      </button>
                    ) : bloqueadaPorTiempo ? (
                      <div className="group relative inline-flex items-center">
                        <button
                          type="button"
                          disabled
                          title="Límite superado: mínimo 2 horas de anticipación"
                          aria-label="Cancelar Cita deshabilitado: Límite superado: mínimo 2 horas de anticipación"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed"
                        >
                          <Info className="h-4 w-4" />
                          Cancelar Cita
                        </button>
                        {/* Tooltip accesible */}
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
    </DashboardLayout>
  );
}

