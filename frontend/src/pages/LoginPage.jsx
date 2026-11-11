import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Lock, Mail, Shield, Stethoscope, User } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import { useMediTurno } from '../context/MediTurnoContext';

const ROLE_DEFAULT_ROUTES = {
  paciente: '/paciente/citas',
  medico: '/medico/agenda',
  administrador: '/admin/dashboard',
};

export function LoginPage() {
  const { login, loginDemo } = useAuth();
  const { showToast } = useMediTurno();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [form, setForm] = useState({ correo: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const msg = validateField(name, value);
    if (msg) {
      setErrors((prev) => ({ ...prev, [name]: msg }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const correoErr = validateField('correo', form.correo);
    const passErr = validateField('password', form.password);

    if (correoErr || passErr) {
      setErrors({ correo: correoErr, password: passErr });
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(form);
      const loggedUser = result?.user;
      showToast({
        type: 'success',
        title: 'Bienvenido a MediTurno',
        message: `Sesión iniciada como ${loggedUser.nombre} ${loggedUser.apellido}.`,
      });
      if (returnTo && loggedUser.rol === 'paciente') {
        navigate(returnTo, { replace: true });
      } else {
        navigate(ROLE_DEFAULT_ROUTES[loggedUser.rol] || '/', { replace: true });
      }
    } catch (err) {
      setErrors({ general: err.message || 'No fue posible iniciar sesión.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async (roleKey) => {
    try {
      const demoUser = await loginDemo(roleKey);
      if (!demoUser) return;
      showToast({
        type: 'info',
        title: 'Acceso Demo Activado',
        message: `Ingresaste como ${demoUser.nombre} ${demoUser.apellido}.`,
      });
      if (returnTo && demoUser.rol === 'paciente') {
        navigate(returnTo, { replace: true });
      } else {
        navigate(ROLE_DEFAULT_ROUTES[demoUser.rol] || '/', { replace: true });
      }
    } catch (err) {
      setErrors({ general: err.message || 'No fue posible activar la sesión demo.' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md card-surface p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <Logo size="lg" showText={false} />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-slate-500">
              {returnTo
                ? 'Inicia sesión para continuar con tu reserva médica.'
                : 'Accede a tu portal de pacientes, agenda médica o administración.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="correo"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  autoComplete="email"
                  value={form.correo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="camila.restrepo@correo.co"
                  className={`${
                    errors.correo ? 'input-field-error' : 'input-field'
                  } pl-10`}
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
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={`${
                    errors.password ? 'input-field-error' : 'input-field'
                  } pl-10`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {errors.general && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
                {errors.general}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validando sesión...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          {/* Auditoría rápida */}
          <div className="border-t border-slate-100 pt-5 space-y-2.5">
            <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Ingreso rápido sin contraseña (Auditoría Demo)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('paciente')}
                className="btn-secondary px-2 py-2 text-xs"
              >
                <User className="h-3.5 w-3.5 text-sky-600" />
                Paciente
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('medico')}
                className="btn-secondary px-2 py-2 text-xs"
              >
                <Stethoscope className="h-3.5 w-3.5 text-sky-600" />
                Médico
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="btn-secondary px-2 py-2 text-xs"
              >
                <Shield className="h-3.5 w-3.5 text-sky-600" />
                Admin
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500">
            ¿Eres paciente nuevo?{' '}
            <Link to="/registro" className="font-semibold text-sky-600 hover:underline">
              Crea tu cuenta aquí
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

