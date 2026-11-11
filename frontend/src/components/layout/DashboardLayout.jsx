import { NavLink } from 'react-router-dom';
import {
  CalendarCheck,
  CalendarPlus,
  ClipboardList,
  LayoutDashboard,
} from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useAuth } from '../../context/AuthContext';

const ROLE_NAV_ITEMS = {
  paciente: [
    { to: '/paciente/citas', label: 'Mis Citas', icon: CalendarCheck },
    { to: '/paciente/reservar', label: 'Reservar Cita', icon: CalendarPlus },
  ],
  medico: [
    { to: '/medico/agenda', label: 'Agenda del Día', icon: ClipboardList },
  ],
  administrador: [
    { to: '/admin/dashboard', label: 'Panel Administrativo', icon: LayoutDashboard },
  ],
};

export function DashboardLayout({ title, subtitle, actions, children }) {
  const { user } = useAuth();
  const navItems = ROLE_NAV_ITEMS[user?.rol] || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Sub-barra de navegación de módulo */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 py-3">
            <nav className="flex items-center gap-2" aria-label="Navegación de panel">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && (
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
        )}

        {children}
      </main>

      <Footer />
    </div>
  );
}

