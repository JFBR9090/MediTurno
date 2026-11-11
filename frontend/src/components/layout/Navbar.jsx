import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarCheck,
  LogOut,
  Menu,
  Shield,
  Stethoscope,
  User,
  X,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useMediTurno } from '../../context/MediTurnoContext';

const ROLE_DEFAULT_ROUTES = {
  paciente: '/paciente/citas',
  medico: '/medico/agenda',
  administrador: '/admin/dashboard',
};

const ROLE_LABELS = {
  paciente: 'Paciente',
  medico: 'Médico',
  administrador: 'Administrador',
};

export function Navbar() {
  const { user, isAuthenticated, loginDemo, logout } = useAuth();
  const { notificaciones, unreadCount, marcarNotificacionesLeidas, showToast } = useMediTurno();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleDemoSelect = async (roleKey) => {
    try {
      const demoUser = await loginDemo(roleKey);
      if (!demoUser) return;
      setMobileOpen(false);
      showToast({
        type: 'info',
        title: `Sesión Demo: ${ROLE_LABELS[demoUser.rol]}`,
        message: `Ingresaste como ${demoUser.nombre} ${demoUser.apellido}.`,
      });
      navigate(ROLE_DEFAULT_ROUTES[demoUser.rol]);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'No se pudo iniciar la sesión demo',
        message: err.message,
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    setNotifOpen(false);
    showToast({
      type: 'info',
      title: 'Sesión cerrada',
      message: 'Has salido de forma segura de MediTurno.',
    });
    navigate('/');
  };

  const handleToggleNotif = () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next && unreadCount > 0) {
      marcarNotificacionesLeidas();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Marca */}
        <Link to="/" className="shrink-0 focus:outline-none">
          <Logo size="md" />
        </Link>

        {/* Selector de Sesión de Prueba para Auditoría Rápida (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Demo:
          </span>
          <button
            type="button"
            onClick={() => handleDemoSelect('paciente')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              user?.rol === 'paciente'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white hover:text-sky-700'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Paciente Demo
          </button>
          <button
            type="button"
            onClick={() => handleDemoSelect('medico')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              user?.rol === 'medico'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white hover:text-sky-700'
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5" />
            Médico Demo
          </button>
          <button
            type="button"
            onClick={() => handleDemoSelect('admin')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              user?.rol === 'administrador'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white hover:text-sky-700'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Admin Demo
          </button>
        </div>

        {/* Acciones Derecha (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {user.rol === 'paciente' && (
                <Link
                  to="/paciente/reservar"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition-colors"
                >
                  <CalendarCheck className="h-4 w-4" />
                  Agendar Cita
                </Link>
              )}

              {/* Campana de Notificaciones */}
              <div className="relative">
                <button
                  type="button"
                  onClick={handleToggleNotif}
                  className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-sky-700 transition-colors"
                  aria-label="Notificaciones"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Notificaciones
                      </span>
                      <button
                        type="button"
                        onClick={() => setNotifOpen(false)}
                        className="text-xs font-medium text-sky-600 hover:underline"
                      >
                        Cerrar
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notificaciones.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          className="rounded-xl bg-slate-50 p-2.5 text-left"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-800">{n.titulo}</p>
                            <span className="text-[10px] text-slate-400">{n.fecha}</span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-600">{n.mensaje}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Usuario Actual */}
              <Link
                to={ROLE_DEFAULT_ROUTES[user.rol] || '/'}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 hover:border-sky-300 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
                  {user.nombre?.[0]}
                  {user.apellido?.[0]}
                </div>
                <div className="text-left leading-tight">
                  <p className="text-xs font-semibold text-slate-900">
                    {user.nombre} {user.apellido}
                  </p>
                  <p className="text-[11px] font-medium text-sky-700">
                    {ROLE_LABELS[user.rol]}
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-sky-700 px-3 py-2 transition-colors"
              >
                Ingresar
              </Link>
              <Link to="/registro" className="btn-primary">
                Crear Cuenta
              </Link>
            </>
          )}
        </div>

        {/* Botón menú móvil */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
          aria-label="Abrir menú de navegación"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Drawer móvil */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Acceso Rápido de Auditoría (Demo)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSelect('paciente')}
                className={`rounded-xl border px-2 py-2 text-xs font-semibold ${
                  user?.rol === 'paciente'
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                Paciente Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoSelect('medico')}
                className={`rounded-xl border px-2 py-2 text-xs font-semibold ${
                  user?.rol === 'medico'
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                Médico Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoSelect('admin')}
                className={`rounded-xl border px-2 py-2 text-xs font-semibold ${
                  user?.rol === 'administrador'
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                Admin Demo
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={ROLE_DEFAULT_ROUTES[user.rol] || '/'}
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full"
                >
                  Ir a mi Panel ({ROLE_LABELS[user.rol]})
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-secondary w-full text-red-600 border-red-200"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary w-full"
                >
                  Ingresar
                </Link>
                <Link
                  to="/registro"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full"
                >
                  Crear Cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

