import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ModalHorariosMedico } from '../../components/admin/ModalHorariosMedico';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { useMediTurno } from '../../context/MediTurnoContext';

export function GestionAgendasPage() {
  const { medicos, especialidades } = useMediTurno();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [especialidadFiltro, setEspecialidadFiltro] = useState('all');

  // Modal de horarios y bloqueos del médico
  const [modalHorariosOpen, setModalHorariosOpen] = useState(false);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  const handleOpenHorarios = (medico) => {
    setMedicoSeleccionado(medico);
    setModalHorariosOpen(true);
  };

  const medicosFiltrados = medicos.filter((m) => {
    const matchNombre =
      m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.especialidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.consultorio && m.consultorio.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchEsp =
      especialidadFiltro === 'all' || String(m.especialidad_id) === String(especialidadFiltro);
    return matchNombre && matchEsp;
  });

  const medicosActivos = medicos.filter((m) => m.activo).length;

  return (
    <DashboardLayout
      title="Gestión de Agendas y Horarios"
      subtitle="Configuración de turnos semanales, franjas de disponibilidad médica y registro de bloqueos."
    >
      {/* Resumen de Capacidad Operativa */}
      <section className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Profesionales Activos</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Stethoscope className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {medicosActivos} / {medicos.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Con agenda configurable</p>
        </div>

        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Especialidades Médicas</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {especialidades.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Servicios clínicos activos</p>
        </div>

        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Aislamiento de Seguridad</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-sm font-bold text-slate-900">Perfil: Agendas</p>
          <p className="mt-1 text-xs text-slate-500">Sin acceso a datos clínicos de pacientes</p>
        </div>
      </section>

      {/* Directorio de Agendas Médicas */}
      <section className="card-surface overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Directorio de Disponibilidad por Profesional
            </h2>
            <p className="text-xs text-slate-500">
              Selecciona un médico para definir su jornada semanal o ingresar periodos de bloqueo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por médico o especialidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9 py-1.5 text-xs w-56 sm:w-64"
              />
            </div>

            <select
              value={especialidadFiltro}
              onChange={(e) => setEspecialidadFiltro(e.target.value)}
              aria-label="Filtrar por especialidad"
              className="input-field py-1.5 text-xs w-44"
            >
              <option value="all">Todas las especialidades</option>
              {especialidades.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nombre}
                </option>
              ))}
            </select>
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
                  <th className="px-6 py-3">Profesional Médico</th>
                  <th className="px-6 py-3">Especialidad</th>
                  <th className="px-6 py-3">Consultorio</th>
                  <th className="px-6 py-3">Duración Consulta</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400">
                      No se encontraron profesionales con los criterios seleccionados.
                    </td>
                  </tr>
                ) : (
                  medicosFiltrados.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                              m.color_avatar || 'bg-sky-100 text-sky-700'
                            }`}
                          >
                            {m.iniciales || m.nombre.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{m.nombre}</p>
                            <p className="text-xs text-slate-400">
                              TP: {m.tarjeta_profesional || 'No especificada'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
                          {m.especialidad}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {m.consultorio || 'Consultorio principal'}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {m.duracion_cita_defecto_min || 30} min
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            m.activo
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {m.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenHorarios(m)}
                          className="btn-secondary text-xs py-1.5 px-3"
                        >
                          <Clock className="h-3.5 w-3.5 text-sky-600" />
                          Gestionar Horarios y Bloqueos
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal de Horarios Semanales y Bloqueos */}
      {modalHorariosOpen && medicoSeleccionado && (
        <ModalHorariosMedico
          isOpen={modalHorariosOpen}
          onClose={() => {
            setModalHorariosOpen(false);
            setMedicoSeleccionado(null);
          }}
          medico={medicoSeleccionado}
        />
      )}
    </DashboardLayout>
  );
}
