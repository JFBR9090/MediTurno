import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarCheck,
  LogOut,
  Menu,
  Shield,
  ShieldCheck,
  Stethoscope,
  User,
  X,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useMediTurno } from '../../context/MediTurnoContext';
import { useTheme } from '../../context/ThemeContext';

const ROLE_DEFAULT_ROUTES = {
  paciente: '/paciente/citas',
  profesional: '/medico/agenda',
  medico: '/medico/agenda',
  administrador: '/admin/dashboard',
};

const ROLE_LABELS = {
  paciente: 'Paciente',
  profesional: 'Profesional Médico',
  medico: 'Profesional Médico',
  administrador: 'Administrador',
};

const ROLE_BADGE_COLORS = {
  paciente: 'bg-[#eeeee9] text-[#1c3a13] border-[#c4c7c4]/80 dark:bg-[#162812] dark:text-[#d3fa99] dark:border-[#284520]',
  profesional: 'bg-[#d3fa99] text-[#1c3a13] border-[#d3fa99] dark:bg-[#d3fa99] dark:text-[#1c3a13]',
  medico: 'bg-[#d3fa99] text-[#1c3a13] border-[#d3fa99] dark:bg-[#d3fa99] dark:text-[#1c3a13]',
  administrador: 'bg-[#1c3a13] text-[#fcfcf7] border-[#1c3a13] dark:bg-[#284520] dark:text-[#fcfcf7] dark:border-[#3a5e30]',
};

export function Navbar() {
  const { user, isAuthenticated, loginDemo, logout } = useAuth();
  const { notificaciones, unreadCount, marcarNotificacionesLeidas, showToast } = useMediTurno();
  const { isDark } = useTheme();
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
        title: `Sesión: ${ROLE_LABELS[demoUser.rol] || demoUser.rol}`,
        message: `Ingresaste como ${demoUser.nombre} ${demoUser.apellido}.`,
      });
      navigate(ROLE_DEFAULT_ROUTES[demoUser.rol] || '/');
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
    navigate('/login');
  };

  const handleToggleNotif = () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next && unreadCount > 0) {
      marcarNotificacionesLeidas();
    }
  };

  const userRol = user?.rol || 'paciente';
  const roleLabel = ROLE_LABELS[userRol] || userRol;
  const badgeColor = ROLE_BADGE_COLORS[userRol] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <header className="sticky top-0 z-40 border-b border-[#eeeee9] dark:border-[#284520] bg-[#fcfcf7]/95 dark:bg-[#0d170a]/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Marca */}
        <Link
          to={isAuthenticated ? (ROLE_DEFAULT_ROUTES[userRol] || '/') : '/login'}
          className="shrink-0 focus:outline-none"
        >
          <Logo size="md" variant={isDark ? 'dark' : 'light'} />
        </Link>

        {/* Auditoría Rápida entre los 3 Perfiles (Visible solo si autenticado) */}
        {isAuthenticated && (
          <div className="hidden lg:flex items-center gap-1 rounded-full border border-[#eeeee9] dark:border-[#284520] bg-[#eeeee9] dark:bg-[#162812] p-1">
            <span className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-[#666666] dark:text-[#8ca388]">
              Perfiles:
            </span>
            <button
              type="button"
              onClick={() => handleDemoSelect('paciente')}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-mono transition-all ${
                userRol === 'paciente'
                  ? 'bg-[#1c3a13] text-[#fcfcf7] dark:bg-[#d3fa99] dark:text-[#1c3a13]'
                  : 'text-[#1c3a13] hover:bg-[#fcfcf7] dark:text-[#fcfcf7] dark:hover:bg-[#20361a]'
              }`}
            >
              <User className="h-3 w-3" />
              Pacientes
            </button>
            <button
              type="button"
              onClick={() => handleDemoSelect('profesional')}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-mono transition-all ${
                userRol === 'profesional' || userRol === 'medico'
                  ? 'bg-[#1c3a13] text-[#fcfcf7] dark:bg-[#d3fa99] dark:text-[#1c3a13]'
                  : 'text-[#1c3a13] hover:bg-[#fcfcf7] dark:text-[#fcfcf7] dark:hover:bg-[#20361a]'
              }`}
            >
              <Stethoscope className="h-3 w-3" />
              Profesionales
            </button>
            <button
              type="button"
              onClick={() => handleDemoSelect('admin')}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-mono transition-all ${
                userRol === 'administrador'
                  ? 'bg-[#1c3a13] text-[#fcfcf7] dark:bg-[#d3fa99] dark:text-[#1c3a13]'
                  : 'text-[#1c3a13] hover:bg-[#fcfcf7] dark:text-[#fcfcf7] dark:hover:bg-[#20361a]'
              }`}
            >
              <Shield className="h-3 w-3" />
              Admin
            </button>
          </div>
        )}

        {/* Acciones Derecha (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Interruptor de Modo Oscuro (Siempre visible) */}
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              {/* Enlaces según perfil autorizado */}
              {userRol === 'paciente' && (
                <div className="flex items-center gap-2">
                  <Link
                    to="/paciente/citas"
                    className="text-xs font-normal text-[#1c3a13] dark:text-[#fcfcf7] hover:text-[#284f1c] dark:hover:text-[#d3fa99] px-3 py-1.5 rounded-full hover:bg-[#eeeee9] dark:hover:bg-[#162812] transition-colors"
                  >
                    Mis Citas
                  </Link>
                  <Link
                    to="/paciente/reservar"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#1c3a13] dark:bg-[#d3fa99] px-4 py-1.5 text-xs font-normal text-[#fcfcf7] dark:text-[#1c3a13] hover:bg-[#284f1c] dark:hover:bg-[#c3ee83] transition-colors"
                  >
                    <CalendarCheck className="h-3.5 w-3.5 text-[#d3fa99] dark:text-[#1c3a13]" />
                    Reservar Cita
                  </Link>
                </div>
              )}

              {(userRol === 'profesional' || userRol === 'medico') && (
                <Link
                  to="/medico/agenda"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#1c3a13] dark:bg-[#d3fa99] px-4 py-1.5 text-xs font-normal text-[#fcfcf7] dark:text-[#1c3a13] hover:bg-[#284f1c] dark:hover:bg-[#c3ee83] transition-colors"
                >
                  <Stethoscope className="h-3.5 w-3.5 text-[#d3fa99] dark:text-[#1c3a13]" />
                  Mi Agenda Clínica
                </Link>
              )}

              {userRol === 'administrador' && (
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#1c3a13] dark:bg-[#d3fa99] px-4 py-1.5 text-xs font-normal text-[#fcfcf7] dark:text-[#1c3a13] hover:bg-[#284f1c] dark:hover:bg-[#c3ee83] transition-colors"
                >
                  <Shield className="h-3.5 w-3.5 text-[#d3fa99] dark:text-[#1c3a13]" />
                  Dashboard Admin
                </Link>
              )}

              {/* Notificaciones */}
              <div className="relative">
                <button
                  type="button"
                  onClick={handleToggleNotif}
                  className="relative rounded-full border border-[#eeeee9] dark:border-[#284520] p-2 text-[#1c3a13] dark:text-[#fcfcf7] hover:bg-[#eeeee9] dark:hover:bg-[#162812] transition-colors"
                  aria-label="Notificaciones"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#d3fa99] px-1 text-[10px] font-mono font-bold text-[#1c3a13]">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[#eeeee9] dark:border-[#284520] bg-[#fcfcf7] dark:bg-[#162812] p-3 shadow-xl z-50">
                    <div className="flex items-center justify-between border-b border-[#eeeee9] dark:border-[#284520] pb-2 mb-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-[#666666] dark:text-[#8ca388]">
                        Notificaciones
                      </span>
                      <button
                        type="button"
                        onClick={() => setNotifOpen(false)}
                        className="text-xs font-mono text-[#1c3a13] dark:text-[#d3fa99] hover:underline"
                      >
                        Cerrar
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notificaciones.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          className="rounded-xl bg-[#eeeee9] dark:bg-[#12210e] p-2.5 text-left"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-medium text-[#1c3a13] dark:text-[#fcfcf7]">{n.titulo}</p>
                            <span className="text-[10px] font-mono text-[#666666] dark:text-[#8ca388]">{n.fecha}</span>
                          </div>
                          <p className="mt-0.5 text-xs text-[#666666] dark:text-[#8ca388]">{n.mensaje}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Badge de Usuario y Perfil */}
              <div className="flex items-center gap-2 rounded-full border border-[#eeeee9] dark:border-[#284520] bg-[#eeeee9] dark:bg-[#162812] px-3 py-1">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1c3a13] dark:bg-[#d3fa99] text-xs font-medium text-[#fcfcf7] dark:text-[#1c3a13]">
                  {user.nombre?.[0]}
                  {user.apellido?.[0]}
                </div>
                <div className="text-left leading-tight pr-1">
                  <p className="text-xs font-normal text-[#1c3a13] dark:text-[#fcfcf7]">
                    {user.nombre} {user.apellido}
                  </p>
                  <span className={`inline-block rounded-full border px-2 py-0.2 text-[9px] font-mono ${badgeColor}`}>
                    {roleLabel}
                  </span>
                </div>
              </div>

              {/* Botón Salir Seguro */}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-[#eeeee9] dark:border-[#284520] p-2 text-[#666666] dark:text-[#8ca388] hover:bg-[#eeeee9] dark:hover:bg-[#162812] hover:text-[#1c3a13] dark:hover:text-[#fcfcf7] transition-colors"
                title="Cerrar sesión segura"
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-mono text-[#666666] dark:text-[#8ca388]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#1c3a13] dark:text-[#d3fa99]" />
                Acceso Restringido
              </span>
              <Link to="/login" className="btn-primary text-xs py-1.5 px-4">
                Iniciar Sesión
              </Link>
            </div>
          )}
        </div>

        {/* Botón menú móvil y toggle rápido */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-full border border-[#eeeee9] dark:border-[#284520] p-2 text-[#1c3a13] dark:text-[#fcfcf7] hover:bg-[#eeeee9] dark:hover:bg-[#162812]"
            aria-label="Abrir menú"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Drawer móvil */}
      {mobileOpen && (
        <div className="border-t border-[#eeeee9] dark:border-[#284520] bg-[#fcfcf7] dark:bg-[#12210e] px-4 py-4 md:hidden space-y-4">
          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#eeeee9] dark:border-[#284520]">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1c3a13] dark:bg-[#d3fa99] text-xs font-bold text-[#fcfcf7] dark:text-[#1c3a13]">
                    {user.nombre?.[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1c3a13] dark:text-[#fcfcf7]">{user.nombre} {user.apellido}</p>
                    <p className="text-[11px] text-[#757c5d] dark:text-[#d3fa99]">{roleLabel}</p>
                  </div>
                </div>
                <ThemeToggle showLabel />
              </div>

              <div className="space-y-1">
                {userRol === 'paciente' && (
                  <>
                    <Link
                      to="/paciente/citas"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 text-xs font-medium text-[#1c3a13] dark:text-[#fcfcf7] hover:bg-[#eeeee9] dark:hover:bg-[#162812] rounded-lg"
                    >
                      Mis Citas
                    </Link>
                    <Link
                      to="/paciente/reservar"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 text-xs font-medium text-[#1c3a13] dark:text-[#d3fa99] hover:bg-[#eeeee9] dark:hover:bg-[#162812] rounded-lg"
                    >
                      Reservar Cita
                    </Link>
                  </>
                )}
                {(userRol === 'profesional' || userRol === 'medico') && (
                  <Link
                    to="/medico/agenda"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-xs font-medium text-[#1c3a13] dark:text-[#d3fa99] hover:bg-[#eeeee9] dark:hover:bg-[#162812] rounded-lg"
                  >
                    Mi Agenda Clínica
                  </Link>
                )}
                {userRol === 'administrador' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-xs font-medium text-[#1c3a13] dark:text-[#d3fa99] hover:bg-[#eeeee9] dark:hover:bg-[#162812] rounded-lg"
                  >
                    Dashboard Admin
                  </Link>
                )}
              </div>

              <div className="pt-2 border-t border-[#eeeee9] dark:border-[#284520]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/10 dark:bg-red-950/40 py-2 text-xs font-bold text-red-600 dark:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-center">
              <div className="flex justify-center pb-2">
                <ThemeToggle showLabel />
              </div>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full py-2 text-xs"
              >
                Iniciar Sesión
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
