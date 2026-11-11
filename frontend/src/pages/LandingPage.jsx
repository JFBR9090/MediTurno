import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Award,
  Baby,
  Bone,
  CalendarCheck,
  Clock,
  Eye,
  HeartPulse,
  MapPin,
  Search,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Stethoscope,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useMediTurno } from '../context/MediTurnoContext';
import { useAuth } from '../context/AuthContext';

const ICON_MAP = {
  HeartPulse,
  Stethoscope,
  Baby,
  Smile,
  Sparkles,
  Activity,
  Bone,
  Eye,
};

export function LandingPage() {
  const { especialidades, medicos } = useMediTurno();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [selectedEspId, setSelectedEspId] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);

  const predicciones = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const espMatches = especialidades
      .filter((e) => e.nombre.toLowerCase().includes(q))
      .map((e) => ({ type: 'especialidad', id: e.id, label: e.nombre, sub: e.descripcion }));

    const medMatches = medicos
      .filter(
        (m) =>
          m.activo &&
          (m.nombre.toLowerCase().includes(q) || m.especialidad.toLowerCase().includes(q))
      )
      .map((m) => ({
        type: 'medico',
        id: m.id,
        especialidadId: m.especialidad_id,
        label: m.nombre,
        sub: `${m.especialidad} · ${m.tarjeta_profesional}`,
      }));

    return [...espMatches, ...medMatches].slice(0, 6);
  }, [query, especialidades, medicos]);

  const medicosFiltrados = useMemo(() => {
    return medicos.filter((m) => {
      if (!m.activo) return false;
      const matchesEsp =
        selectedEspId === 'all' || m.especialidad_id === Number(selectedEspId);
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        m.nombre.toLowerCase().includes(q) ||
        m.especialidad.toLowerCase().includes(q) ||
        m.tarjeta_profesional.toLowerCase().includes(q);
      return matchesEsp && matchesQuery;
    });
  }, [medicos, selectedEspId, query]);

  const handleAgendarClick = (medico) => {
    const targetUrl = `/paciente/reservar?especialidadId=${medico.especialidad_id}&medicoId=${medico.id}`;
    if (!isAuthenticated) {
      navigate(`/login?returnTo=${encodeURIComponent(targetUrl)}`);
      return;
    }
    if (user?.rol !== 'paciente') {
      navigate(
        user?.rol === 'medico' ? '/medico/agenda' : '/admin/dashboard'
      );
      return;
    }
    navigate(targetUrl);
  };

  const handleSelectPrediction = (item) => {
    setShowDropdown(false);
    if (item.type === 'especialidad') {
      setQuery(item.label);
      setSelectedEspId(String(item.id));
      document.getElementById('directorio-medicos')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setQuery(item.label);
      setSelectedEspId(String(item.especialidadId));
      document.getElementById('directorio-medicos')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-600 via-sky-500 to-emerald-500" />
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Disponibilidad médica sincronizada en tiempo real
              </div>

              <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl leading-[1.12]">
                Tu salud en minutos:{' '}
                <span className="text-sky-600">agenda y gestiona citas médicas</span>{' '}
                sin llamadas
              </h1>

              <p className="max-w-2xl text-base sm:text-lg text-slate-500 leading-relaxed">
                Consulta especialistas disponibles al instante, elige el horario que mejor
                se adapte a tu jornada y recibe confirmación inmediata con código único de
                reserva.
              </p>

              {/* Buscador Predictivo de Especialidades */}
              <div className="relative max-w-xl">
                <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20">
                  <Search className="ml-3 h-5 w-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowDropdown(true);
                      if (!e.target.value.trim()) setSelectedEspId('all');
                    }}
                    placeholder="Busca especialidad o médico (ej. Cardiología, Pediatría...)"
                    className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    aria-label="Buscador predictivo de especialidades y médicos"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById('directorio-medicos')
                        ?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="btn-primary shrink-0 px-4 py-2.5"
                  >
                    Buscar
                  </button>
                </div>

                {showDropdown && predicciones.length > 0 && (
                  <ul className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl divide-y divide-slate-100">
                    {predicciones.map((item) => (
                      <li key={`${item.type}-${item.id}`}>
                        <button
                          type="button"
                          onMouseDown={() => handleSelectPrediction(item)}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-sky-50/70 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {item.label}
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-1">
                              {item.sub}
                            </p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 capitalize shrink-0">
                            {item.type}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to={isAuthenticated && user?.rol === 'paciente' ? '/paciente/reservar' : '/registro'}
                  className="btn-primary px-5 py-3 text-sm"
                >
                  <CalendarCheck className="h-4 w-4" />
                  Agendar Cita Ahora
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#especialidades" className="btn-secondary px-5 py-3 text-sm">
                  Explorar Especialidades
                </a>
              </div>
            </div>

            {/* Tarjeta de Estadísticas Clave */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">
                    Indicadores de Servicio
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    Operación 24/7
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
                  <div className="card-surface p-4 flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shrink-0">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">&lt; 3 min</p>
                      <p className="text-xs text-slate-500">
                        Tiempo promedio de reserva autónoma
                      </p>
                    </div>
                  </div>

                  <div className="card-surface p-4 flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">100%</p>
                      <p className="text-xs text-slate-500">
                        Prevención transaccional contra citas duplicadas
                      </p>
                    </div>
                  </div>

                  <div className="card-surface p-4 flex items-center gap-4 sm:col-span-2 lg:col-span-1">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shrink-0">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {especialidades.length} Especialidades · {medicos.filter((m) => m.activo).length} Médicos
                      </p>
                      <p className="text-xs text-slate-500">
                        Directorio verificado con tarjeta profesional
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRID DE ESPECIALIDADES MÉDICAS */}
      <section id="especialidades" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">
              Catálogo Clínico
            </span>
            <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
              Especialidades Médicas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Selecciona un área para filtrar instantáneamente a nuestros especialistas.
            </p>
          </div>
          {selectedEspId !== 'all' && (
            <button
              type="button"
              onClick={() => {
                setSelectedEspId('all');
                setQuery('');
              }}
              className="btn-secondary text-xs"
            >
              Ver todas las especialidades
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {especialidades.map((esp) => {
            const Icon = ICON_MAP[esp.icono] || Stethoscope;
            const isActive = Number(selectedEspId) === esp.id;
            return (
              <button
                key={esp.id}
                type="button"
                onClick={() => {
                  setSelectedEspId(isActive ? 'all' : String(esp.id));
                  setQuery('');
                  document
                    .getElementById('directorio-medicos')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`card-surface p-5 text-left transition-all hover:border-sky-300 hover:shadow-md ${
                  isActive ? 'ring-2 ring-sky-500 border-sky-500 bg-sky-50/30' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      isActive ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                    {esp.tiempoPromedio}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{esp.nombre}</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  {esp.descripcion}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* DIRECTORIO DE MÉDICOS DESTACADOS */}
      <section
        id="directorio-medicos"
        className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"
      >
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">
              Equipo Profesional
            </span>
            <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
              Médicos Destacados
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Profesionales habilitados con agenda abierta para reserva inmediata.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Mostrando {medicosFiltrados.length} profesional(es)
          </span>
        </div>

        {medicosFiltrados.length === 0 ? (
          <div className="card-surface p-10 text-center">
            <p className="text-sm font-semibold text-slate-800">
              No encontramos médicos con ese filtro de búsqueda.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedEspId('all');
                setQuery('');
              }}
              className="mt-3 btn-secondary"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {medicosFiltrados.map((medico) => (
              <article
                key={medico.id}
                className="card-surface p-5 flex flex-col justify-between transition-all hover:border-sky-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ring-2 ring-white shadow-sm shrink-0 ${medico.colorAvatar}`}
                      >
                        {medico.iniciales}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {medico.nombre}
                        </h3>
                        <p className="text-xs font-semibold text-sky-700">
                          {medico.especialidad}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 shrink-0">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {medico.calificacion}
                    </span>
                  </div>

                  <p className="mt-3.5 text-xs text-slate-500 leading-relaxed">
                    {medico.biografia}
                  </p>

                  <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <Award className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                      <span>
                        Tarjeta Profesional:{' '}
                        <strong className="font-mono text-slate-800">
                          {medico.tarjeta_profesional}
                        </strong>
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                      <span>{medico.consultorio}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => handleAgendarClick(medico)}
                    className="btn-primary w-full"
                  >
                    <CalendarCheck className="h-4 w-4" />
                    Agendar Cita
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

