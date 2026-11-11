import { useEffect, useMemo, useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Loader2,
  Plus,
  Stethoscope,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { useMediTurno } from '../../context/MediTurnoContext';

export function DashboardAdminPage() {
  const {
    medicos,
    pacientes,
    especialidades,
    citas,
    metricasAdmin,
    agregarMedico,
    toggleEstadoMedico,
    showToast,
  } = useMediTurno();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('medicos');
  const [modalOpen, setModalOpen] = useState(false);
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

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 250);
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
      {
        label: 'Total Pacientes',
        value: totalPacientes,
        icon: Users,
        accent: 'bg-sky-50 text-sky-600',
      },
      {
        label: 'Médicos Activos',
        value: medicosActivos,
        icon: Stethoscope,
        accent: 'bg-sky-50 text-sky-600',
      },
      {
        label: 'Citas Agendadas',
        value: citasAgendadas,
        icon: CalendarCheck,
        accent: 'bg-sky-50 text-sky-600',
      },
      {
        label: 'Citas Atendidas',
        value: citasAtendidas,
        icon: CheckCircle2,
        accent: 'bg-emerald-50 text-emerald-600',
      },
      {
        label: 'Citas Canceladas',
        value: citasCanceladas,
        icon: XCircle,
        accent: 'bg-red-50 text-red-600',
      },
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
      setModalOpen(false);
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

  return (
    <DashboardLayout
      title="Dashboard Administrativo"
      subtitle="Control operativo del centro médico sobre Laravel + MySQL: indicadores, profesionales y pacientes."
      actions={
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Agregar Nuevo Profesional
        </button>
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
                    <span className="text-xs font-semibold text-slate-500">
                      {m.label}
                    </span>
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

      {/* Selector de Módulo: Profesionales | Pacientes */}
      <div className="mb-4 flex items-center gap-2">
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
      </div>

      {/* Tabla Administrativa */}
      {activeTab === 'medicos' ? (
        <section className="card-surface overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 px-6 py-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Directorio de Profesionales Adscritos
              </h2>
              <p className="text-xs text-slate-500">
                Administra la habilitación inmediata de agenda para cada médico.
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
                    <th className="px-6 py-3.5 text-right">Acción</th>
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
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {med.consultorio}
                      </td>
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        <section className="card-surface overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 px-6 py-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pacientes Registrados
              </h2>
              <p className="text-xs text-slate-500">
                Listado de pacientes almacenados en MySQL con historial de citas.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500">
              Total pacientes: {pacientes.length}
            </span>
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
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {pac.fecha_nacimiento}
                    </td>
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

      {/* Modal Agregar Nuevo Profesional */}
      {modalOpen && (
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
                onClick={() => setModalOpen(false)}
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
                  onClick={() => setModalOpen(false)}
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
    </DashboardLayout>
  );
}
