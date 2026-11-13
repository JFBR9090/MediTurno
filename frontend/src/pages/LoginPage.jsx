import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  User,
} from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import { useMediTurno } from '../context/MediTurnoContext';

const PROFILES = [
  {
    id: 'paciente',
    name: 'Pacientes',
    roleKey: 'paciente',
    icon: User,
    badge: 'Portal Personal',
    description: 'Consulta, reserva y autogestión de citas médicas de pacientes.',
    activeClass: 'border-sky-600 bg-sky-50/70 text-sky-950 ring-2 ring-sky-600/20',
    iconActive: 'bg-sky-600 text-white',
    demoEmail: 'carlos.mendoza@email.com',
    demoPass: 'paciente123',
    demoLabel: 'Carlos Mendoza',
  },
  {
    id: 'profesional',
    name: 'Profesionales',
    roleKey: 'profesional',
    icon: Stethoscope,
    badge: 'Agenda Clínica',
    description: 'Agenda médica diaria, pacientes citados y registro de atención.',
    activeClass: 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-600/20',
    iconActive: 'bg-emerald-600 text-white',
    demoEmail: 'dr.ramirez@mediturno.com',
    demoPass: 'medico123',
    demoLabel: 'Dr. Roberto Ramírez',
  },
  {
    id: 'administrador',
    name: 'Administrador',
    roleKey: 'admin',
    icon: Shield,
    badge: 'Gestión Integral',
    description: 'Supervisión global de profesionales, especialidades, pacientes y reportes.',
    activeClass: 'border-purple-600 bg-purple-50/70 text-purple-950 ring-2 ring-purple-600/20',
    iconActive: 'bg-purple-600 text-white',
    demoEmail: 'admin@mediturno.com',
    demoPass: 'admin123',
    demoLabel: 'Administrador MediTurno',
  },
];

const ROLE_DEFAULT_ROUTES = {
  paciente: '/paciente/citas',
  profesional: '/medico/agenda',
  medico: '/medico/agenda',
  administrador: '/admin/dashboard',
};

export function LoginPage() {
  const { login, loginDemo } = useAuth();
  const { showToast } = useMediTurno();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [selectedProfile, setSelectedProfile] = useState('paciente');
  const [form, setForm] = useState({
    correo: PROFILES[0].demoEmail,
    password: PROFILES[0].demoPass,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  const activeProfileData = PROFILES.find((p) => p.id === selectedProfile) || PROFILES[0];

  // Countdown timer para bloqueo temporal por fuerza bruta
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const handleProfileChange = (profileId) => {
    setSelectedProfile(profileId);
    setErrors({});
    const prof = PROFILES.find((p) => p.id === profileId);
    if (prof) {
      setForm({
        correo: prof.demoEmail,
        password: prof.demoPass,
      });
    }
  };

  const validateField = (name, value) => {
    if (name === 'correo') {
      if (!value.trim()) return 'El correo electrónico es obligatorio.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        return 'Ingresa un correo electrónico válido.';
      }
    }
    if (name === 'password') {
      if (!value) return 'La contraseña es requerida.';
      if (value.length < 6) return 'Debe tener al menos 6 caracteres.';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: '', general: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    const correoErr = validateField('correo', form.correo);
    const passErr = validateField('password', form.password);

    if (correoErr || passErr) {
      setErrors({ correo: correoErr, password: passErr });
      return;
    }

    setSubmitting(true);
    try {
      const result = await login({
        correo: form.correo,
        password: form.password,
        perfil: selectedProfile,
      });
      const loggedUser = result?.user;

      showToast({
        type: 'success',
        title: 'Acceso Seguro Concedido',
        message: `Bienvenido(a), ${loggedUser.nombre} ${loggedUser.apellido}.`,
      });

      const destino = ROLE_DEFAULT_ROUTES[loggedUser.rol] || '/';
      if (returnTo && loggedUser.rol === 'paciente') {
        navigate(returnTo, { replace: true });
      } else {
        navigate(destino, { replace: true });
      }
    } catch (err) {
      // Manejo de Rate Limiting (HTTP 429)
      if (err.message && err.message.includes('bloqueado temporalmente')) {
        const match = err.message.match(/(\d+)\s*segundos/);
        const secs = match ? parseInt(match[1], 10) : 60;
        setLockoutSeconds(secs);
      }
      setErrors({ general: err.message || 'No fue posible iniciar sesión.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async (profileId) => {
    if (lockoutSeconds > 0) return;
    try {
      const prof = PROFILES.find((p) => p.id === profileId);
      const demoUser = await loginDemo(prof?.roleKey || profileId);
      if (!demoUser) return;

      showToast({
        type: 'info',
        title: 'Sesión Segura Activada',
        message: `Ingreso con perfil ${demoUser.rol}: ${demoUser.nombre} ${demoUser.apellido}.`,
      });

      const destino = ROLE_DEFAULT_ROUTES[demoUser.rol] || '/';
      navigate(destino, { replace: true });
    } catch (err) {
      setErrors({ general: err.message || 'Error al iniciar sesión demo.' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      {/* Barra superior de seguridad */}
      <header className="border-b border-slate-800 bg-slate-950/70 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="md" />
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Gatekeeper Activo · Acceso Protegido
            </span>
          </div>
        </div>
      </header>

      {/* Contenedor Principal del Gatekeeper */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Encabezado del Formulario */}
          <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-teal-600 px-6 sm:px-8 py-6 text-white text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                  Autenticación Institucional Segura
                </span>
                <h1 className="mt-2 text-2xl sm:text-3xl font-display font-bold tracking-tight">
                  Iniciar Sesión en MediTurno
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-sky-100">
                  Selecciona tu perfil de usuario para ingresar a tu panel autorizado.
                </p>
              </div>
              <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <Shield className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* SELECTOR DE LOS 3 PERFILES DE USUARIO */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                1. Selecciona tu perfil institucional:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PROFILES.map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedProfile === p.id;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleProfileChange(p.id)}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all text-center ${
                        isSelected
                          ? p.activeClass
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70'
                      }`}
                    >
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl mb-2 transition-transform ${
                          isSelected ? p.iconActive : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-bold">{p.name}</span>
                      <span className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                        {p.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Descripción del perfil activo */}
              <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 text-xs text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
                <span>
                  <strong>Perfil {activeProfileData.name}:</strong> {activeProfileData.description}
                </span>
              </div>
            </div>

            {/* ALERTA DE BLOQUEO TEMPORAL (RATE LIMITING) */}
            {lockoutSeconds > 0 && (
              <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-red-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
                  <span>Protección contra fuerza bruta activada</span>
                </div>
                <p className="text-xs text-red-700">
                  Demasiados intentos fallidos consecutivos. Por política de seguridad institucional,
                  el acceso ha sido bloqueado temporalmente.
                </p>
                <div className="pt-1 flex items-center gap-2 text-xs font-semibold text-red-900">
                  <span>Reintentando en:</span>
                  <span className="font-mono text-base font-bold bg-red-200/60 px-2 py-0.5 rounded-md">
                    {lockoutSeconds}s
                  </span>
                </div>
              </div>
            )}

            {/* FORMULARIO DE ACCESO */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label
                  htmlFor="correo"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Correo electrónico institucional o de paciente
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    id="correo"
                    name="correo"
                    type="email"
                    autoComplete="email"
                    disabled={lockoutSeconds > 0}
                    value={form.correo}
                    onChange={handleChange}
                    placeholder="usuario@mediturno.com"
                    className={`${
                      errors.correo ? 'input-field-error' : 'input-field'
                    } pl-10 text-sm`}
                  />
                </div>
                {errors.correo && (
                  <p className="mt-1 text-xs text-red-600">{errors.correo}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    disabled={lockoutSeconds > 0}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`${
                      errors.password ? 'input-field-error' : 'input-field'
                    } pl-10 text-sm`}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              {errors.general && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errors.general}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || lockoutSeconds > 0}
                className="btn-primary w-full py-3 text-sm shadow-md flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Validando credenciales seguras...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    Ingresar como {activeProfileData.name}
                  </>
                )}
              </button>
            </form>

            {/* SECCIÓN DE PRUEBAS RÁPIDAS DE AUDITORÍA */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Acceso de auditoría de un clic:
                </span>
                <span className="text-[10px] text-slate-400">
                  Prueba rápida de roles
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PROFILES.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={lockoutSeconds > 0}
                      onClick={() => handleQuickDemo(p.id)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-sky-700 transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                      <span className="truncate">{p.name} Demo</span>
                    </button>
                  );
                })}
              </div>

              <div className="text-center pt-2 border-t border-dashed border-slate-200 text-xs text-slate-500">
                ¿Eres paciente nuevo?{' '}
                <Link to="/registro" className="font-semibold text-sky-600 hover:underline">
                  Crea tu cuenta aquí
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Pie institucional */}
      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        MediTurno · Sistema Seguro de Gestión Hospitalaria · SENA ADSO Ficha 3413988
      </footer>
    </div>
  );
}
