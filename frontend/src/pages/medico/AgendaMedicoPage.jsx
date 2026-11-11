import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
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

function toLocalISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function AgendaMedicoPage() {
  const { user } = useAuth();
  const { citas, actualizarEstadoCitaMedico, showToast } = useMediTurno();

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [modoFiltro, setModoFiltro] = useState('fecha'); // 'fecha' | 'todas'
  const [fechaFiltro, setFechaFiltro] = useState(() => toLocalISODate(new Date()));

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 260);
    return () => clearTimeout(t);
  }, []);

  const citasFiltradas = useMemo(() => {
    const medicoId = user?.medico_id || 1;
    return citas
      .filter((c) => {
        if (c.medico_id !== medicoId) return false;
        if (modoFiltro === 'todas') return true;
        return toLocalISODate(new Date(c.fecha_hora_inicio)) === fechaFiltro;
      })
      .sort(
        (a, b) =>
          new Date(a.fecha_hora_inicio).getTime() -
          new Date(b.fecha_hora_inicio).getTime()
      );
  }, [citas, user, modoFiltro, fechaFiltro]);

  const resumen = useMemo(() => {
    return {
      total: citasFiltradas.length,
      pendientes: citasFiltradas.filter((c) =>
        ['programada', 'confirmada'].includes(c.estado)
      ).length,
      atendidas: citasFiltradas.filter((c) => c.estado === 'completada').length,
      inasistencias: citasFiltradas.filter((c) => c.estado === 'no_asistio').length,
    };
  }, [citasFiltradas]);

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

  const nombreDoctor = user?.nombre
    ? `${user.nombre.startsWith('Dr') ? '' : 'Dr. '}${user.nombre} ${user.apellido}`.trim()
    : 'Profesional';

  return (
    <DashboardLayout
      title={`Agenda Médica — ${nombreDoctor}`}
      subtitle="Consulta tus turnos por fecha o revisa el historial completo de atenciones."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setModoFiltro('fecha');
              setFechaFiltro(toLocalISODate(new Date()));
            }}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              modoFiltro === 'fecha' && fechaFiltro === toLocalISODate(new Date())
                ? 'bg-sky-600 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setModoFiltro('todas')}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              modoFiltro === 'todas'
                ? 'bg-sky-600 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Historial Completo
          </button>
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-sky-600" />
            <input
              type="date"
              value={fechaFiltro}
              onChange={(e) => {
                setFechaFiltro(e.target.value);
                setModoFiltro('fecha');
              }}
              className="text-xs font-medium text-slate-700 focus:outline-none"
              aria-label="Filtrar agenda por fecha"
            />
          </div>
        </div>
      }
    >
      {/* Resumen rápido */}
      <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface p-4">
          <p className="text-xs font-medium text-slate-500">
            {modoFiltro === 'todas' ? 'Total en Historial' : 'Turnos de la Fecha'}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{resumen.total}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-xs font-medium text-slate-500">Por Atender</p>
          <p className="mt-1 text-2xl font-bold text-sky-600">{resumen.pendientes}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-xs font-medium text-slate-500">Atendidas</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{resumen.atendidas}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-xs font-medium text-slate-500">Inasistencias</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{resumen.inasistencias}</p>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader variant="table" count={4} />
      ) : citasFiltradas.length === 0 ? (
        <EmptyState
          title="No tienes turnos agendados para este filtro"
          description="Las citas reservadas por los pacientes aparecerán aquí en orden cronológico."
          secondaryActionLabel={modoFiltro !== 'todas' ? 'Ver Historial Completo' : undefined}
          onSecondaryAction={() => setModoFiltro('todas')}
        />
      ) : (
        <div className="space-y-4">
          {citasFiltradas.map((cita) => {
            const badge = ESTADO_BADGE[cita.estado] || ESTADO_BADGE.programada;
            const fechaIni = new Date(cita.fecha_hora_inicio);
            const fechaFin = new Date(cita.fecha_hora_fin);
            const fechaLabel = fechaIni.toLocaleDateString('es-CO', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
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
                  <div className="rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-center shrink-0 min-w-[155px]">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-sky-700">
                      <Clock className="h-3.5 w-3.5" />
                      {fechaLabel}
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
          Toda cita marcada como <code>completada</code> o <code>no_asistio</code> bloquea
          nuevas modificaciones y registra auditoría permanente en <code>historial_citas</code>.
        </span>
      </div>
    </DashboardLayout>
  );
}
