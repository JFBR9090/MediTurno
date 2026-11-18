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
  programada: { label: 'Programada', classes: 'bg-[#eeeee9] text-[#1c3a13] border-[#c4c7c4] dark:bg-[#162812] dark:text-[#d3fa99] dark:border-[#284520]' },
  confirmada: { label: 'Confirmada', classes: 'bg-[#d3fa99] text-[#1c3a13] border-[#d3fa99] dark:bg-[#d3fa99] dark:text-[#1c3a13]' },
  completada: { label: 'Completada', classes: 'bg-[#1c3a13] text-[#fcfcf7] border-[#1c3a13] dark:bg-[#284520] dark:text-[#fcfcf7] dark:border-[#3a5e30]' },
  no_asistio: { label: 'No Asistió', classes: 'bg-[#eeeee9] text-[#666666] border-[#c4c7c4] dark:bg-[#162812] dark:text-[#8ca388] dark:border-[#284520]' },
  cancelada: { label: 'Cancelada', classes: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800' },
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
            className={`rounded-full px-4 py-1.5 text-xs font-mono transition-all ${
              modoFiltro === 'fecha' && fechaFiltro === toLocalISODate(new Date())
                ? 'bg-[#1c3a13] text-[#fcfcf7] dark:bg-[#d3fa99] dark:text-[#1c3a13]'
                : 'bg-[#fcfcf7] dark:bg-[#162812] border border-[#eeeee9] dark:border-[#284520] text-[#1c3a13] dark:text-[#fcfcf7] hover:bg-[#eeeee9] dark:hover:bg-[#20361a]'
            }`}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setModoFiltro('todas')}
            className={`rounded-full px-4 py-1.5 text-xs font-mono transition-all ${
              modoFiltro === 'todas'
                ? 'bg-[#1c3a13] text-[#fcfcf7] dark:bg-[#d3fa99] dark:text-[#1c3a13]'
                : 'bg-[#fcfcf7] dark:bg-[#162812] border border-[#eeeee9] dark:border-[#284520] text-[#1c3a13] dark:text-[#fcfcf7] hover:bg-[#eeeee9] dark:hover:bg-[#20361a]'
            }`}
          >
            Historial Completo
          </button>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#eeeee9] dark:border-[#284520] bg-[#fcfcf7] dark:bg-[#162812] px-3 py-1 text-xs font-mono">
            <CalendarDays className="h-3.5 w-3.5 text-[#1c3a13] dark:text-[#d3fa99]" />
            <input
              type="date"
              value={fechaFiltro}
              onChange={(e) => {
                setFechaFiltro(e.target.value);
                setModoFiltro('fecha');
              }}
              className="bg-transparent text-xs font-mono text-[#1c3a13] dark:text-[#fcfcf7] focus:outline-none"
              aria-label="Filtrar agenda por fecha"
            />
          </div>
        </div>
      }
    >
      {/* Resumen rápido */}
      <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface p-4">
          <p className="text-xs font-mono uppercase text-[#666666] dark:text-[#8ca388]">
            {modoFiltro === 'todas' ? 'Total en Historial' : 'Turnos de la Fecha'}
          </p>
          <p className="mt-1 text-2xl font-mono text-[#1c3a13] dark:text-[#fcfcf7]">{resumen.total}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-xs font-mono uppercase text-[#666666] dark:text-[#8ca388]">Por Atender</p>
          <p className="mt-1 text-2xl font-mono text-[#1c3a13] dark:text-[#d3fa99]">{resumen.pendientes}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-xs font-mono uppercase text-[#666666] dark:text-[#8ca388]">Atendidas</p>
          <p className="mt-1 text-2xl font-mono text-[#757c5d] dark:text-[#d3fa99]">{resumen.atendidas}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-xs font-mono uppercase text-[#666666] dark:text-[#8ca388]">Inasistencias</p>
          <p className="mt-1 text-2xl font-mono text-amber-600 dark:text-amber-400">{resumen.inasistencias}</p>
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
                  esInmutable ? 'opacity-90' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                  {/* Bloque horario */}
                  <div className="rounded-2xl border border-[#eeeee9] dark:border-[#284520] bg-[#fcfcf7] dark:bg-[#12210e] px-4 py-3 text-center shrink-0 min-w-[155px]">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-[#1c3a13] dark:text-[#d3fa99]">
                      <Clock className="h-3.5 w-3.5" />
                      {fechaLabel}
                    </div>
                    <p className="mt-1 text-xs font-mono font-medium text-[#1c3a13] dark:text-[#fcfcf7]">{horaStr}</p>
                  </div>

                  {/* Información del paciente */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                      <span className="rounded-full bg-[#eeeee9] dark:bg-[#12210e] border border-[#c4c7c4]/80 dark:border-[#284520] px-2.5 py-0.5 font-mono text-xs text-[#1c3a13] dark:text-[#d3fa99]">
                        {cita.codigo_reserva}
                      </span>
                      <span className="text-xs font-mono text-[#666666] dark:text-[#8ca388]">
                        {cita.paciente_documento}
                      </span>
                    </div>

                    <h3 className="text-base font-medium text-[#1c3a13] dark:text-[#fcfcf7]">
                      {cita.paciente_nombre}
                    </h3>

                    <p className="text-xs text-[#666666] dark:text-[#8ca388]">
                      <strong>Motivo:</strong> {cita.motivo_consulta || 'Control general'}
                    </p>

                    <p className="inline-flex items-center gap-1.5 text-xs font-mono text-[#666666] dark:text-[#8ca388]">
                      <Phone className="h-3.5 w-3.5 text-[#1c3a13] dark:text-[#d3fa99]" />
                      Contacto: {cita.paciente_telefono}
                    </p>
                  </div>
                </div>

                {/* Acciones de transición de estado */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {esInmutable ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#eeeee9] dark:border-[#284520] bg-[#fcfcf7] dark:bg-[#12210e] px-4 py-2 text-xs font-mono text-[#666666] dark:text-[#8ca388]">
                      <Lock className="h-3.5 w-3.5 text-[#757c5d]" />
                      Registro cerrado (inmutable)
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleTransition(cita.id, 'completada')}
                        className="btn-primary text-xs px-4 py-2"
                      >
                        <UserCheck className="h-4 w-4" />
                        Marcar como Atendida
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleTransition(cita.id, 'no_asistio')}
                        className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 px-4 py-2 text-xs font-mono text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors disabled:opacity-70"
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

      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[#eeeee9] dark:border-[#284520] bg-[#eeeee9] dark:bg-[#162812] px-4 py-3 text-xs text-[#666666] dark:text-[#8ca388]">
        <CheckCircle2 className="h-4 w-4 text-[#1c3a13] dark:text-[#d3fa99] shrink-0" />
        <span>
          Toda cita marcada como <code className="font-mono text-[#1c3a13] dark:text-[#d3fa99]">completada</code> o <code className="font-mono text-[#1c3a13] dark:text-[#d3fa99]">no_asistio</code> bloquea
          nuevas modificaciones y registra auditoría permanente en <code className="font-mono text-[#1c3a13] dark:text-[#d3fa99]">historial_citas</code>.
        </span>
      </div>
    </DashboardLayout>
  );
}
