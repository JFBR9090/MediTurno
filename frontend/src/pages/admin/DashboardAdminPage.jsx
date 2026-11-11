import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  Loader2,
  Plus,
  Stethoscope,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { ModalHorariosMedico } from '../../components/admin/ModalHorariosMedico';
import { ModalEspecialidadAdmin } from '../../components/admin/ModalEspecialidadAdmin';
import { ModalPacienteAdmin } from '../../components/admin/ModalPacienteAdmin';
import { useMediTurno } from '../../context/MediTurnoContext';
import { apiRequest } from '../../services/api';

const ESTADO_LABELS = {
  programada: 'Programada',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
  no_asistio: 'No Asistió',
};

export function DashboardAdminPage() {
  const {
    medicos,
    pacientes,
    especialidades,
    especialidadesAdmin,
    citas,
    metricasAdmin,
    agregarMedico,
    toggleEstadoMedico,
    crearPacienteAdmin,
    crearEspecialidad,
    actualizarEspecialidad,
    toggleEspecialidad,
    showToast,
  } = useMediTurno();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('medicos'); // medicos | especialidades | pacientes | reportes

  // Modales
  const [modalMedicoOpen, setModalMedicoOpen] = useState(false);
  const [medicoHorarios, setMedicoHorarios] = useState(null);
  const [modalPacienteOpen, setModalPacienteOpen] = useState(false);
  const [modalEspState, setModalEspState] = useState({ open: false, item: null });

  const [submitting, setSubmitting] = useState(false);
  const [nuevoMedico, setNuevoMedico] = useState({
    nombre: '',
    correo: '',
    tarjeta_profesional: '',
    especialidad_id: String(especialidades[0]?.id || 1),
    consultorio: '',
    duracion_cita_defecto_min: '30',
  });
  const [errors, setErrors] = useState({});

  // Reportes filtrados
  const [filtrosReporte, setFiltrosReporte] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    medico_id: 'all',
    estado: 'all',
  });
  const [reporteData, setReporteData] = useState({
    loading: false,
    resumen: null,
    citas: [],
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 240);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (especialidades.length > 0 && !nuevoMedico.especialidad_id) {
      setNuevoMedico((prev) => ({
        ...prev,
        especialidad_id: String(especialidades[0].id),
      }));
    }
  }, [especialidades]);

  const cargarReportes = async (filtros = filtrosReporte) => {
    setReporteData((p) => ({ ...p, loading: true }));
    try {
      const params = new URLSearchParams();
      if (filtros.fecha_desde) params.set('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.set('fecha_hasta', filtros.fecha_hasta);
      if (filtros.medico_id !== 'all') params.set('medico_id', filtros.medico_id);
      if (filtros.estado !== 'all') params.set('estado', filtros.estado);

      const res = await apiRequest(`/reportes/citas?${params.toString()}`);
      setReporteData({
        loading: false,
        resumen: res?.resumen || null,
        citas: res?.data || [],
      });
    } catch {
      setReporteData((p) => ({ ...p, loading: false }));
    }
  };

  useEffect(() => {
    if (activeTab === 'reportes') {
      cargarReportes();
    }
  }, [activeTab]);

  const metricas = useMemo(() => {
    const totalPacientes = metricasAdmin?.total_pacientes ?? pacientes.length;
    const medicosActivos =
      metricasAdmin?.medicos_activos ?? medicos.filter((m) => m.activo).length;
    const citasAgendadas =
      metricasAdmin?.citas_agendadas ??
      citas.filter((c) => ['programada', 'confirmada'].includes(c.estado)).length;
    const citasAtendidas =
      metricasAdmin?.citas_atendidas ??
      citas.filter((c) => c.estado === 'completada').length;
    const citasCanceladas =
      metricasAdmin?.citas_canceladas ??
      citas.filter((c) => c.estado === 'cancelada').length;

    return [
      { label: 'Total Pacientes', value: totalPacientes, icon: Users, accent: 'bg-sky-50 text-sky-600' },
      { label: 'Médicos Activos', value: medicosActivos, icon: Stethoscope, accent: 'bg-sky-50 text-sky-600' },
      { label: 'Citas Agendadas', value: citasAgendadas, icon: CalendarCheck, accent: 'bg-sky-50 text-sky-600' },
      { label: 'Citas Atendidas', value: citasAtendidas, icon: CheckCircle2, accent: 'bg-emerald-50 text-emerald-600' },
      { label: 'Citas Canceladas', value: citasCanceladas, icon: XCircle, accent: 'bg-red-50 text-red-600' },
    ];
  }, [metricasAdmin, pacientes, citas, medicos]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setNuevoMedico((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAgregarSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (nuevoMedico.nombre.trim().length < 4) {
      nextErrors.nombre = 'Ingresa el nombre completo del profesional.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoMedico.correo.trim())) {
      nextErrors.correo = 'Ingresa un correo institucional válido.';
    }
    if (nuevoMedico.tarjeta_profesional.trim().length < 4) {
      nextErrors.tarjeta_profesional = 'Ingresa el número de tarjeta profesional.';
    }
    if (nuevoMedico.consultorio.trim().length < 3) {
      nextErrors.consultorio = 'Especifica la sede o consultorio.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const creado = await agregarMedico(nuevoMedico);
      showToast({
        type: 'success',
        title: 'Médico habilitado',
        message: `${creado.nombre} quedó activo en MySQL y disponible para reservas.`,
      });
      setModalMedicoOpen(false);
      setNuevoMedico({
        nombre: '',
        correo: '',
        tarjeta_profesional: '',
        especialidad_id: String(especialidades[0]?.id || 1),
        consultorio: '',
        duracion_cita_defecto_min: '30',
      });
      setErrors({});
    } catch (err) {
      showToast({
        type: 'error',
        title: 'No se pudo crear el médico',
        message: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportarCSV = () => {
    const rows = [
      ['Codigo', 'Paciente', 'Medico', 'Especialidad', 'Inicio', 'Estado'],
      ...reporteData.citas.map((c) => [
        c.codigo_reserva,
        c.paciente_nombre,
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
    link.download = `reporte-citas-mediturno.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const listaEspecialidades =
    especialidadesAdmin.length > 0 ? especialidadesAdmin : especialidades;

  return (
    <DashboardLayout
      title="Dashboard Administrativo"
      subtitle="Administración integral de profesionales, especialidades, pacientes, horarios y reportes."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setModalPacienteOpen(true)}
            className="btn-secondary"
          >
            <Plus className="h-4 w-4 text-sky-600" />
            Registrar Paciente
          </button>
          <button
            type="button"
            onClick={() => setModalMedicoOpen(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            Agregar Profesional
          </button>
        </div>
      }
    >
      {/* Tarjetas de Métricas */}
      <section className="mb-8">
        {loading ? (
          <SkeletonLoader variant="metrics" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {metricas.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="card-surface p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">{m.label}</span>
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${m.accent}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                    {m.value}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Selector de Módulos Administrativos */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('medicos')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'medicos'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Stethoscope className="h-4 w-4" />
          Profesionales ({medicos.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('especialidades')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'especialidades'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Especialidades ({listaEspecialidades.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pacientes')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'pacientes'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="h-4 w-4" />
          Pacientes ({pacientes.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reportes')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === 'reportes'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Reportes y Citas
        </button>
      </div>

      {/* TAB 1: PROFESIONALES Y HORARIOS */}
      {activeTab === 'medicos' && (
        <section className="card-surface overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 px-6 py-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Directorio de Profesionales y Horarios
              </h2>
              <p className="text-xs text-slate-500">
                Configura horarios semanales de atención o habilita profesionales.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500">
              Total registrados: {medicos.length}
            </span>
          </div>

          {loading ? (
            <div className="p-6">
              <SkeletonLoader variant="table" count={4} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Profesional</th>
                    <th className="px-6 py-3.5">Especialidad</th>
                    <th className="px-6 py-3.5">Tarjeta Prof.</th>
                    <th className="px-6 py-3.5">Consultorio</th>
                    <th className="px-6 py-3.5">Estado</th>
                    <th className="px-6 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {medicos.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shrink-0 ${med.colorAvatar}`}
                          >
                            {med.iniciales}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{med.nombre}</p>
                            <p className="text-xs text-slate-500">{med.correo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
                          {med.especialidad}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-700">
                        {med.tarjeta_profesional}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">{med.consultorio}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            med.activo
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              med.activo ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {med.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setMedicoHorarios(med)}
                            className="btn-secondary px-3 py-1.5 text-xs text-sky-700 border-sky-200 hover:bg-sky-50"
                          >
                            <Clock className="h-3.5 w-3.5" />
                            Horarios
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await toggleEstadoMedico(med.id);
                              showToast({
                                type: 'info',
                                title: 'Estado actualizado',
                                message: `${med.nombre} ahora está ${
                                  med.activo ? 'inactivo' : 'activo'
                                }.`,
                              });
                            }}
                            className="btn-secondary px-3 py-1.5 text-xs"
                          >
                            {med.activo ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* TAB 2: ESPECIALIDADES */}
      {activeTab === 'especialidades' && (
        <section className="card-surface overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 px-6 py-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Gestión de Especialidades Médicas
              </h2>
              <p className="text-xs text-slate-500">
                Crea, actualiza o activa/desactiva las especialidades ofrecidas.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalEspState({ open: true, item: null })}
              className="btn-primary text-xs"
            >
              <Plus className="h-4 w-4" />
              Nueva Especialidad
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Especialidad</th>
                  <th className="px-6 py-3.5">Descripción</th>
                  <th className="px-6 py-3.5">Duración</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {listaEspecialidades.map((esp) => {
                  const activa = esp.activa !== false;
                  return (
                    <tr key={esp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {esp.nombre}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 max-w-md">
                        {esp.descripcion}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        {esp.tiempoPromedio}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            activa
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setModalEspState({ open: true, item: esp })}
                            className="btn-secondary px-3 py-1.5 text-xs"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await toggleEspecialidad(esp.id);
                              showToast({
                                type: 'info',
                                title: 'Especialidad actualizada',
                                message: `${esp.nombre} cambió su estado.`,
                              });
                            }}
                            className="btn-secondary px-3 py-1.5 text-xs"
                          >
                            {activa ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: PACIENTES */}
      {activeTab === 'pacientes' && (
        <section className="card-surface overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 px-6 py-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Pacientes Registrados</h2>
              <p className="text-xs text-slate-500">
                Listado administrativo de pacientes almacenados en MySQL.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalPacienteOpen(true)}
              className="btn-primary text-xs"
            >
              <Plus className="h-4 w-4" />
              Registrar Paciente
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Paciente</th>
                  <th className="px-6 py-3.5">Documento</th>
                  <th className="px-6 py-3.5">Teléfono</th>
                  <th className="px-6 py-3.5">Fecha Nac.</th>
                  <th className="px-6 py-3.5 text-right">Citas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {pacientes.map((pac) => (
                  <tr key={pac.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{pac.nombre}</p>
                      <p className="text-xs text-slate-500">{pac.correo}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-700">
                      {pac.tipo_documento} {pac.numero_documento}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">{pac.telefono}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">{pac.fecha_nacimiento}</td>
                    <td className="px-6 py-4 text-right font-semibold text-sky-700">
                      {pac.citas_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 4: REPORTES Y CITAS (RF-19, RF-20, HU-12) */}
      {activeTab === 'reportes' && (
        <section className="space-y-5">
          <div className="card-surface p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={filtrosReporte.fecha_desde}
                    onChange={(e) =>
                      setFiltrosReporte((p) => ({ ...p, fecha_desde: e.target.value }))
                    }
                    className="input-field py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={filtrosReporte.fecha_hasta}
                    onChange={(e) =>
                      setFiltrosReporte((p) => ({ ...p, fecha_hasta: e.target.value }))
                    }
                    className="input-field py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Profesional
                  </label>
                  <select
                    value={filtrosReporte.medico_id}
                    onChange={(e) =>
                      setFiltrosReporte((p) => ({ ...p, medico_id: e.target.value }))
                    }
                    className="input-field py-2 text-xs"
                  >
                    <option value="all">Todos los médicos</option>
                    {medicos.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={filtrosReporte.estado}
                    onChange={(e) =>
                      setFiltrosReporte((p) => ({ ...p, estado: e.target.value }))
                    }
                    className="input-field py-2 text-xs"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="programada">Programada</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="no_asistio">No Asistió</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => cargarReportes(filtrosReporte)}
                  className="btn-primary py-2 text-xs"
                >
                  Generar Reporte
                </button>
                <button
                  type="button"
                  onClick={handleExportarCSV}
                  disabled={reporteData.citas.length === 0}
                  className="btn-secondary py-2 text-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  Exportar CSV
                </button>
              </div>
            </div>

            {reporteData.resumen && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-6 gap-2.5 border-t border-slate-100 pt-4 text-center">
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <p className="text-[11px] text-slate-500">Total</p>
                  <p className="text-lg font-bold text-slate-900">{reporteData.resumen.total}</p>
                </div>
                <div className="rounded-xl bg-sky-50 p-2.5">
                  <p className="text-[11px] text-sky-700">Programadas</p>
                  <p className="text-lg font-bold text-sky-700">{reporteData.resumen.programadas}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-2.5">
                  <p className="text-[11px] text-emerald-700">Confirmadas</p>
                  <p className="text-lg font-bold text-emerald-700">{reporteData.resumen.confirmadas}</p>
                </div>
                <div className="rounded-xl bg-slate-100 p-2.5">
                  <p className="text-[11px] text-slate-600">Completadas</p>
                  <p className="text-lg font-bold text-slate-800">{reporteData.resumen.completadas}</p>
                </div>
                <div className="rounded-xl bg-red-50 p-2.5">
                  <p className="text-[11px] text-red-700">Canceladas</p>
                  <p className="text-lg font-bold text-red-700">{reporteData.resumen.canceladas}</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-2.5">
                  <p className="text-[11px] text-amber-700">No Asistió</p>
                  <p className="text-lg font-bold text-amber-700">{reporteData.resumen.no_asistio}</p>
                </div>
              </div>
            )}
          </div>

          <div className="card-surface overflow-hidden">
            {reporteData.loading ? (
              <div className="p-6">
                <SkeletonLoader variant="table" count={4} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-3.5">Código</th>
                      <th className="px-6 py-3.5">Paciente</th>
                      <th className="px-6 py-3.5">Profesional</th>
                      <th className="px-6 py-3.5">Fecha y Hora</th>
                      <th className="px-6 py-3.5">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {reporteData.citas.map((c) => {
                      const f = new Date(c.fecha_hora_inicio);
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/70">
                          <td className="px-6 py-3.5 font-mono text-xs font-semibold text-slate-700">
                            {c.codigo_reserva}
                          </td>
                          <td className="px-6 py-3.5 text-xs font-semibold text-slate-900">
                            {c.paciente_nombre}
                          </td>
                          <td className="px-6 py-3.5 text-xs text-slate-600">
                            {c.medico_nombre} ·{' '}
                            <span className="text-sky-700 font-medium">{c.especialidad}</span>
                          </td>
                          <td className="px-6 py-3.5 text-xs text-slate-600">
                            {f.toLocaleDateString('es-CO')} {f.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-3.5 text-xs font-semibold text-slate-700">
                            {ESTADO_LABELS[c.estado] || c.estado}
                          </td>
                        </tr>
                      );
                    })}
                    {reporteData.citas.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-xs text-slate-400">
                          No se encontraron citas con los filtros seleccionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Modal Agregar Nuevo Profesional */}
      {modalMedicoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-nuevo-medico-titulo"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3
                  id="modal-nuevo-medico-titulo"
                  className="text-lg font-bold text-slate-900"
                >
                  Agregar Nuevo Profesional
                </h3>
                <p className="text-xs text-slate-500">
                  El médico quedará habilitado en MySQL con agenda Lunes a Viernes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalMedicoOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAgregarSubmit} noValidate className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre completo (con título)
                </label>
                <input
                  name="nombre"
                  type="text"
                  value={nuevoMedico.nombre}
                  onChange={handleFieldChange}
                  placeholder="Ej. Dra. Carolina Vélez"
                  className={errors.nombre ? 'input-field-error' : 'input-field'}
                />
                {errors.nombre && (
                  <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correo institucional
                  </label>
                  <input
                    name="correo"
                    type="email"
                    value={nuevoMedico.correo}
                    onChange={handleFieldChange}
                    placeholder="c.velez@mediturno.co"
                    className={errors.correo ? 'input-field-error' : 'input-field'}
                  />
                  {errors.correo && (
                    <p className="mt-1 text-xs text-red-600">{errors.correo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tarjeta Profesional
                  </label>
                  <input
                    name="tarjeta_profesional"
                    type="text"
                    value={nuevoMedico.tarjeta_profesional}
                    onChange={handleFieldChange}
                    placeholder="TP-92014-CO"
                    className={
                      errors.tarjeta_profesional ? 'input-field-error' : 'input-field'
                    }
                  />
                  {errors.tarjeta_profesional && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.tarjeta_profesional}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Especialidad asignada
                  </label>
                  <select
                    name="especialidad_id"
                    value={nuevoMedico.especialidad_id}
                    onChange={handleFieldChange}
                    className="input-field"
                  >
                    {especialidades.map((esp) => (
                      <option key={esp.id} value={esp.id}>
                        {esp.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duración estándar (min)
                  </label>
                  <select
                    name="duracion_cita_defecto_min"
                    value={nuevoMedico.duracion_cita_defecto_min}
                    onChange={handleFieldChange}
                    className="input-field"
                  >
                    <option value="20">20 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Consultorio / Sede
                </label>
                <input
                  name="consultorio"
                  type="text"
                  value={nuevoMedico.consultorio}
                  onChange={handleFieldChange}
                  placeholder="Consultorio 305 - Piso 3"
                  className={errors.consultorio ? 'input-field-error' : 'input-field'}
                />
                {errors.consultorio && (
                  <p className="mt-1 text-xs text-red-600">{errors.consultorio}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMedicoOpen(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Profesional'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modales adicionales de Administración */}
      <ModalHorariosMedico
        medico={medicoHorarios}
        isOpen={Boolean(medicoHorarios)}
        onClose={() => setMedicoHorarios(null)}
      />

      <ModalEspecialidadAdmin
        especialidad={modalEspState.item}
        isOpen={modalEspState.open}
        onClose={() => setModalEspState({ open: false, item: null })}
        onSave={async (payload, id) => {
          if (id) {
            await actualizarEspecialidad(id, payload);
            showToast({
              type: 'success',
              title: 'Especialidad actualizada',
              message: `${payload.nombre} fue actualizada en MySQL.`,
            });
          } else {
            await crearEspecialidad(payload);
            showToast({
              type: 'success',
              title: 'Especialidad creada',
              message: `${payload.nombre} quedó disponible en el catálogo.`,
            });
          }
        }}
      />

      <ModalPacienteAdmin
        isOpen={modalPacienteOpen}
        onClose={() => setModalPacienteOpen(false)}
        onSave={async (payload) => {
          const creado = await crearPacienteAdmin(payload);
          showToast({
            type: 'success',
            title: 'Paciente registrado',
            message: `${creado.nombre} fue registrado en MySQL.`,
          });
        }}
      />
    </DashboardLayout>
  );
}
