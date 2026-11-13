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
    activeClass: 'border-[#1c3a13] bg-[#1c3a13] text-[#fcfcf7]',
    iconActive: 'bg-[#d3fa99] text-[#1c3a13]',
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
    activeClass: 'border-[#1c3a13] bg-[#1c3a13] text-[#fcfcf7]',
    iconActive: 'bg-[#d3fa99] text-[#1c3a13]',
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
    activeClass: 'border-[#1c3a13] bg-[#1c3a13] text-[#fcfcf7]',
    iconActive: 'bg-[#d3fa99] text-[#1c3a13]',
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
    <div className="min-h-screen flex flex-col bg-[#fcfcf7] text-[#1c3a13] font-sans antialiased">
      {/* Barra superior de navegación y auditoría Gatekeeper */}
      <header className="border-b border-[#eeeee9] bg-[#fcfcf7]/95 px-4 py-3.5 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" variant="light" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="badge-lime font-mono text-[11px]">
              <ShieldCheck className="h-3.5 w-3.5" />
              GATEKEEPER ACTIVO · ACCESO SEGURO
            </span>
          </div>
        </div>
      </header>

      {/* Contenedor Principal del Gatekeeper con estética Seed */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-xl bg-[#fcfcf7] rounded-[32px] border border-[#eeeee9] overflow-hidden">
          {/* Encabezado del Formulario (Dark Section con Forest Depths #1c3a13) */}
          <div className="bg-[#1c3a13] px-6 sm:px-8 py-7 text-[#fcfcf7]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="badge-lime font-mono text-[10px] uppercase">
                  Seed Clinical Gatekeeper
                </span>
                <h1 className="mt-3 text-2xl sm:text-3xl font-light tracking-[-0.4px] text-[#fcfcf7]">
                  Iniciar Sesión en MediTurno
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-[#eeeee9]/80 font-normal">
                  Selecciona tu perfil de usuario para ingresar a tu panel autorizado.
                </p>
              </div>
              <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#fcfcf7]/20 bg-[#fcfcf7]/10">
                <Shield className="h-6 w-6 text-[#d3fa99]" />
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* SELECTOR DE LOS 3 PERFILES DE USUARIO */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#666666] mb-3">
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
                          ? 'border-[#1c3a13] bg-[#1c3a13] text-[#fcfcf7]'
                          : 'border-[#eeeee9] bg-[#eeeee9] text-[#1c3a13] hover:border-[#c4c7c4]'
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full mb-2 transition-transform ${
                          isSelected
                            ? 'bg-[#d3fa99] text-[#1c3a13]'
                            : 'bg-[#fcfcf7] text-[#1c3a13]'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{p.name}</span>
                      <span
                        className={`text-[11px] mt-0.5 leading-tight font-mono ${
                          isSelected ? 'text-[#d3fa99]' : 'text-[#666666]'
                        }`}
                      >
                        {p.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Descripción del perfil activo */}
              <div className="mt-3 rounded-2xl bg-[#eeeee9] border border-[#eeeee9] px-4 py-2.5 text-xs text-[#1c3a13] flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#1c3a13] shrink-0" />
                <span>
                  <strong>Perfil {activeProfileData.name}:</strong> {activeProfileData.description}
                </span>
              </div>
            </div>

            {/* ALERTA DE BLOQUEO TEMPORAL (RATE LIMITING) */}
            {lockoutSeconds > 0 && (
              <div className="rounded-2xl border border-red-500/50 bg-red-50 p-4 text-[#1c3a13] space-y-2">
                <div className="flex items-center gap-2 font-medium text-sm text-red-800">
                  <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
                  <span>Protección contra fuerza bruta activada</span>
                </div>
                <p className="text-xs text-red-700 leading-relaxed">
                  Demasiados intentos fallidos consecutivos. Por política de seguridad institucional,
                  el acceso ha sido bloqueado temporalmente.
                </p>
                <div className="pt-1 flex items-center gap-2 text-xs font-mono text-red-900">
                  <span>Reintentando en:</span>
                  <span className="font-mono text-sm px-3 py-0.5 rounded-full bg-[#1c3a13] text-[#d3fa99]">
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
                  className="block text-xs font-mono uppercase tracking-wider text-[#1c3a13] mb-1.5"
                >
                  Correo electrónico institucional o de paciente
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-[#666666]" />
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
                  className="block text-xs font-mono uppercase tracking-wider text-[#1c3a13] mb-1.5"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-[#666666]" />
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
                <div className="rounded-2xl border border-red-300 bg-red-50 p-3.5 text-xs text-red-800 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errors.general}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || lockoutSeconds > 0}
                className="btn-primary w-full py-3.5 text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#d3fa99]" />
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
            <div className="border-t border-[#eeeee9] pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#666666]">
                  Acceso de auditoría de un clic:
                </span>
                <span className="text-[10px] font-mono text-[#666666]">
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
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#c4c7c4]/60 bg-[#eeeee9] px-3 py-2 text-xs font-mono text-[#1c3a13] hover:bg-[#d3fa99] hover:border-[#d3fa99] transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5 text-[#1c3a13] shrink-0" />
                      <span className="truncate">{p.name} Demo</span>
                    </button>
                  );
                })}
              </div>

              <div className="text-center pt-3 border-t border-dashed border-[#eeeee9] text-xs text-[#666666]">
                ¿Eres paciente nuevo?{' '}
                <Link to="/registro" className="font-medium text-[#1c3a13] underline hover:text-[#284f1c]">
                  Crea tu cuenta aquí
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Pie institucional Seed */}
      <footer className="border-t border-[#eeeee9] py-4 text-center text-xs font-mono text-[#666666]">
        MediTurno · Sistema de Gestión Clínica · Estándar Seed · SENA ADSO Ficha 3413988
      </footer>
    </div>
  );
}
