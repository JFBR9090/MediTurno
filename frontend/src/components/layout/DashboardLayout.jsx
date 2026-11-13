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
    <div className="min-h-screen flex flex-col bg-[#fcfcf7] text-[#1c3a13] font-sans antialiased">
      <Navbar />

      {/* Sub-barra de navegación de módulo estilo Seed */}
      <div className="border-b border-[#eeeee9] bg-[#fcfcf7]">
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
                      `inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono transition-all ${
                        isActive
                          ? 'bg-[#1c3a13] text-[#fcfcf7]'
                          : 'text-[#1c3a13] hover:bg-[#eeeee9]'
                      }`
                    }
                  >
                    <Icon className="h-3.5 w-3.5 text-[#d3fa99]" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-3xl sm:text-4xl font-light tracking-[-0.4px] text-[#1c3a13]">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1.5 text-xs sm:text-sm text-[#666666] leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {children}
      </main>

      <Footer />
    </div>
  );
}

