import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { ModalPacienteAdmin } from '../../components/admin/ModalPacienteAdmin';
import { ModalCancelar } from '../../components/citas/ModalCancelar';
import { ModalReprogramar } from '../../components/citas/ModalReprogramar';
import { useMediTurno } from '../../context/MediTurnoContext';
import { apiRequest } from '../../services/api';

const ESTADO_LABELS = {
  programada: { label: 'Programada', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  confirmada: { label: 'Confirmada', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  completada: { label: 'Atendida', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  cancelada: { label: 'Cancelada', color: 'bg-red-50 text-red-700 border-red-200' },
  no_asistio: { label: 'Inasistencia', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export function GestionCitasPage() {
  const { medicos, citas, refrescarCitas, showToast } = useMediTurno();

  const [loading, setLoading] = useState(false);
  const [modalPacienteOpen, setModalPacienteOpen] = useState(false);
  const [citaACancelar, setCitaACancelar] = useState(null);
  const [citaAReprogramar, setCitaAReprogramar] = useState(null);

  // Filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'all',
    medico_id: 'all',
    fecha_desde: '',
    fecha_hasta: '',
  });

  const [reporteCitas, setReporteCitas] = useState([]);
  const [reporteResumen, setReporteResumen] = useState(null);

  const cargarCitasReporte = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.fecha_desde) params.set('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.set('fecha_hasta', filtros.fecha_hasta);
      if (filtros.medico_id !== 'all') params.set('medico_id', filtros.medico_id);
      if (filtros.estado !== 'all') params.set('estado', filtros.estado);

      const res = await apiRequest(`/reportes/citas?${params.toString()}`);
      setReporteCitas(res?.data || []);
      setReporteResumen(res?.resumen || null);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error al consultar citas',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCitasReporte();
  }, [filtros.fecha_desde, filtros.fecha_hasta, filtros.medico_id, filtros.estado]);

  const citasFiltradas = useMemo(() => {
    const list = reporteCitas.length > 0 ? reporteCitas : citas;
    if (!filtros.busqueda.trim()) return list;

    const q = filtros.busqueda.toLowerCase();
    return list.filter((c) => {
      const pac = (c.paciente_nombre || '').toLowerCase();
      const med = (c.medico_nombre || '').toLowerCase();
      const cod = (c.codigo_reserva || '').toLowerCase();
      const esp = (c.especialidad || '').toLowerCase();
      return pac.includes(q) || med.includes(q) || cod.includes(q) || esp.includes(q);
    });
  }, [reporteCitas, citas, filtros.busqueda]);

  const metricas = useMemo(() => {
    const total = reporteResumen?.total ?? citas.length;
    const agendadas =
      (reporteResumen?.programadas ?? 0) + (reporteResumen?.confirmadas ?? 0);
    const atendidas = reporteResumen?.completadas ?? citas.filter((c) => c.estado === 'completada').length;
    const canceladas = reporteResumen?.canceladas ?? citas.filter((c) => c.estado === 'cancelada').length;

    return [
      { label: 'Total Citas Consultadas', value: total, icon: CalendarCheck, accent: 'bg-sky-50 text-sky-600' },
      { label: 'Citas Activas (Prog./Conf.)', value: agendadas, icon: Clock, accent: 'bg-indigo-50 text-indigo-600' },
      { label: 'Atendidas en Consulta', value: atendidas, icon: CheckCircle2, accent: 'bg-emerald-50 text-emerald-600' },
      { label: 'Canceladas', value: canceladas, icon: XCircle, accent: 'bg-red-50 text-red-600' },
    ];
  }, [reporteResumen, citas]);

  const handleExportarCSV = () => {
    const rows = [
      ['Codigo', 'Paciente', 'Documento', 'Medico', 'Especialidad', 'Fecha y Hora', 'Estado'],
      ...citasFiltradas.map((c) => [
        c.codigo_reserva,
        c.paciente_nombre,
        c.paciente_documento || '',
        c.medico_nombre,
        c.especialidad,
        c.fecha_hora_inicio,
        c.estado,
      ]),
    ];
    const csvContent = rows
      .map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-citas-mediturno-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout
      title="Mesa Operativa de Citas y Recepción"
      subtitle="Recepción hospitalaria: asignación de turnos, reprogramación, cancelaciones y atención de pacientes."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportarCSV}
            className="btn-secondary text-xs"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={() => setModalPacienteOpen(true)}
            className="btn-primary text-xs"
          >
            <Plus className="h-4 w-4" />
            Registrar Paciente
          </button>
        </div>
      }
    >
      {/* Tarjetas de Métricas Operativas */}
      <section className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="card-surface p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{m.label}</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${m.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{m.value}</p>
            </div>
          );
        })}
      </section>

      {/* Filtros Operativos */}
      <section className="card-surface p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Búsqueda Rápida
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Código, paciente o médico..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros((p) => ({ ...p, busqueda: e.target.value }))}
                className="input-field pl-9 py-1.5 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros((p) => ({ ...p, estado: e.target.value }))}
              className="input-field py-1.5 text-xs"
            >
              <option value="all">Todos los estados</option>
              <option value="programada">Programadas</option>
              <option value="confirmada">Confirmadas</option>
              <option value="completada">Atendidas</option>
              <option value="cancelada">Canceladas</option>
              <option value="no_asistio">Inasistencias</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Profesional</label>
            <select
              value={filtros.medico_id}
              onChange={(e) => setFiltros((p) => ({ ...p, medico_id: e.target.value }))}
              className="input-field py-1.5 text-xs"
            >
              <option value="all">Todos los médicos</option>
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} ({m.especialidad})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha Desde</label>
            <input
              type="date"
              value={filtros.fecha_desde}
              onChange={(e) => setFiltros((p) => ({ ...p, fecha_desde: e.target.value }))}
              className="input-field py-1.5 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha Hasta</label>
              <input
                type="date"
                value={filtros.fecha_hasta}
                onChange={(e) => setFiltros((p) => ({ ...p, fecha_hasta: e.target.value }))}
                className="input-field py-1.5 text-xs"
              />
            </div>
            <button
              type="button"
              onClick={cargarCitasReporte}
              disabled={loading}
              title="Refrescar lista"
              className="btn-secondary py-2 px-3 mt-4"
            >
              <RefreshCw className={`h-4 w-4 text-sky-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Tabla de Citas */}
      <section className="card-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Listado General de Citas</h2>
            <p className="text-xs text-slate-500">
              Mostrando {citasFiltradas.length} cita(s) según los filtros aplicados.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <SkeletonLoader variant="table" count={5} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Código</th>
                  <th className="px-6 py-3">Paciente</th>
                  <th className="px-6 py-3">Profesional / Especialidad</th>
                  <th className="px-6 py-3">Fecha y Hora</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Acciones de Recepción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {citasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400">
                      No se encontraron citas con los filtros especificados.
                    </td>
                  </tr>
                ) : (
                  citasFiltradas.map((c) => {
                    const est = ESTADO_LABELS[c.estado] || {
                      label: c.estado,
                      color: 'bg-slate-100 text-slate-600',
                    };
                    const puedeGestionar = ['programada', 'confirmada'].includes(c.estado);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {c.codigo_reserva}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">{c.paciente_nombre}</p>
                          <p className="text-xs text-slate-400">
                            Doc: {c.paciente_documento || 'No registrado'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">{c.medico_nombre}</p>
                          <span className="inline-block rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                            {c.especialidad}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-700">
                          <p className="font-semibold">{c.fecha_inicio_formateada || c.fecha_hora_inicio}</p>
                          <p className="text-slate-400">{c.hora_inicio_formateada || ''}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${est.color}`}
                          >
                            {est.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {puedeGestionar ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setCitaAReprogramar(c)}
                                className="btn-secondary text-xs py-1 px-2.5"
                                title="Reprogramar fecha u hora"
                              >
                                Reprogramar
                              </button>
                              <button
                                type="button"
                                onClick={() => setCitaACancelar(c)}
                                className="rounded-lg border border-red-200 bg-red-50/50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                                title="Cancelar cita a petición del paciente"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Cerrada</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal Registrar Paciente en Ventanilla */}
      {modalPacienteOpen && (
        <ModalPacienteAdmin
          isOpen={modalPacienteOpen}
          onClose={() => setModalPacienteOpen(false)}
        />
      )}

      {/* Modales de Cancelación y Reprogramación */}
      {citaACancelar && (
        <ModalCancelar
          isOpen={Boolean(citaACancelar)}
          onClose={() => {
            setCitaACancelar(null);
            cargarCitasReporte();
            refrescarCitas();
          }}
          cita={citaACancelar}
        />
      )}

      {citaAReprogramar && (
        <ModalReprogramar
          isOpen={Boolean(citaAReprogramar)}
          onClose={() => {
            setCitaAReprogramar(null);
            cargarCitasReporte();
            refrescarCitas();
          }}
          cita={citaAReprogramar}
        />
      )}
    </DashboardLayout>
  );
}
