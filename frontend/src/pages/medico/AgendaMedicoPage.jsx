import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Lock,
  Phone,
  UserCheck,
  UserX,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useMediTurno } from '../../context/MediTurnoContext';

const ESTADO_BADGE = {
  programada: { label: 'Programada', classes: 'bg-sky-50 text-sky-700 border-sky-200' },
  confirmada: { label: 'Confirmada', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  completada: { label: 'Completada', classes: 'bg-slate-100 text-slate-600 border-slate-200' },
  no_asistio: { label: 'No Asistió', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelada: { label: 'Cancelada', classes: 'bg-red-50 text-red-700 border-red-200' },
};

function isSameLocalDay(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export function AgendaMedicoPage() {
  const { user } = useAuth();
  const { citas, actualizarEstadoCitaMedico, showToast } = useMediTurno();

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const hoy = useMemo(() => new Date(), []);

  const agendaHoy = useMemo(() => {
    const medicoId = user?.medico_id || 1;
    return citas
      .filter((c) => {
        if (c.medico_id !== medicoId) return false;
        return isSameLocalDay(new Date(c.fecha_hora_inicio), hoy);
      })
      .sort(
        (a, b) =>
          new Date(a.fecha_hora_inicio).getTime() -
          new Date(b.fecha_hora_inicio).getTime()
      );
  }, [citas, user, hoy]);

  const resumenHoy = useMemo(() => {
    return {
      total: agendaHoy.length,
      pendientes: agendaHoy.filter((c) => ['programada', 'confirmada'].includes(c.estado)).length,
      atendidas: agendaHoy.filter((c) => c.estado === 'completada').length,
      inasistencias: agendaHoy.filter((c) => c.estado === 'no_asistio').length,
    };
  }, [agendaHoy]);

  const handleTransition = async (citaId, nuevoEstado) => {
    setProcessingId(citaId);
    try {
      await actualizarEstadoCitaMedico(citaId, nuevoEstado);
      showToast({
        type: nuevoEstado === 'completada' ? 'success' : 'warning',
        title:
          nuevoEstado === 'completada'
            ? 'Consulta marcada como Atendida'
            : 'Inasistencia registrada',
        message: 'La cita pasó a estado final y quedó bloqueada para modificaciones.',
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Acción no permitida',
        message: err.message,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const fechaTitulo = hoy.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <DashboardLayout
      title={`Agenda Médica — ${user?.nombre ? `Dr. ${user.nombre} ${user.apellido}` : 'Profesional'}`}
      subtitle={`Turnos programados para hoy, ${fechaTitulo}.`}
    >
      {/* Resumen rápido del día */}
      <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface p-4">
          <p className="text-xs font-medium text-slate-500">Turnos de Hoy</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{resumenHoy.total}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-xs font-medium text-slate-500">Por Atender</p>
          <p className="mt-1 text-2xl font-bold text-sky-600">{resumenHoy.pendientes}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-xs font-medium text-slate-500">Atendidas</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{resumenHoy.atendidas}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-xs font-medium text-slate-500">Inasistencias</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{resumenHoy.inasistencias}</p>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader variant="table" count={4} />
      ) : agendaHoy.length === 0 ? (
        <EmptyState
          title="No tienes turnos agendados para la jornada de hoy"
          description="Las citas reservadas por los pacientes aparecerán aquí en orden cronológico."
        />
      ) : (
        <div className="space-y-4">
          {agendaHoy.map((cita) => {
            const badge = ESTADO_BADGE[cita.estado] || ESTADO_BADGE.programada;
            const fechaIni = new Date(cita.fecha_hora_inicio);
            const fechaFin = new Date(cita.fecha_hora_fin);
            const horaStr = `${fechaIni.toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })} - ${fechaFin.toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}`;

            const esInmutable = ['completada', 'no_asistio', 'cancelada'].includes(
              cita.estado
            );
            const isBusy = processingId === cita.id;

            return (
              <article
                key={cita.id}
                className={`card-surface p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all ${
                  esInmutable ? 'bg-slate-50/70' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                  {/* Bloque horario */}
                  <div className="rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-center shrink-0 min-w-[140px]">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-sky-700">
                      <Clock className="h-3.5 w-3.5" />
                      Horario
                    </div>
                    <p className="mt-1 text-xs font-bold text-slate-900">{horaStr}</p>
                  </div>

                  {/* Información del paciente */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600">
                        {cita.codigo_reserva}
                      </span>
                      <span className="text-xs text-slate-500">
                        {cita.paciente_documento}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {cita.paciente_nombre}
                    </h3>

                    <p className="text-xs text-slate-600">
                      <strong>Motivo:</strong> {cita.motivo_consulta || 'Control general'}
                    </p>

                    <p className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <Phone className="h-3.5 w-3.5 text-sky-600" />
                      Contacto: {cita.paciente_telefono}
                    </p>
                  </div>
                </div>

                {/* Acciones de transición de estado */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {esInmutable ? (
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-500">
                      <Lock className="h-3.5 w-3.5" />
                      Registro cerrado (inmutable)
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleTransition(cita.id, 'completada')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 transition-colors disabled:opacity-70"
                      >
                        <UserCheck className="h-4 w-4" />
                        Marcar como Atendida
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleTransition(cita.id, 'no_asistio')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors disabled:opacity-70"
                      >
                        <UserX className="h-4 w-4" />
                        Registrar Inasistencia
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>
          De acuerdo con la regla <strong>RN08</strong>, toda cita marcada como{' '}
          <code>completada</code> o <code>no_asistio</code> bloquea nuevas modificaciones y
          registra auditoría permanente.
        </span>
      </div>
    </DashboardLayout>
  );
}

