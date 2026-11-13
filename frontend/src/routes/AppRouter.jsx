import { Navigate, Route, Routes, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from '../pages/LoginPage';
import { RegistroPage } from '../pages/RegistroPage';
import { ReservarCitaPage } from '../pages/paciente/ReservarCitaPage';
import { MisCitasPage } from '../pages/paciente/MisCitasPage';
import { AgendaMedicoPage } from '../pages/medico/AgendaMedicoPage';
import { DashboardAdminPage } from '../pages/admin/DashboardAdminPage';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

const ROLE_HOME = {
  paciente: '/paciente/citas',
  profesional: '/medico/agenda',
  medico: '/medico/agenda',
  administrador: '/admin/dashboard',
};

function FullScreenLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfcf7] gap-3 text-[#1c3a13]">
      <Loader2 className="h-8 w-8 animate-spin text-[#1c3a13]" />
      <p className="text-xs font-mono tracking-wider text-[#666666]">VERIFICANDO SESIÓN SEGURA · SEED...</p>
    </div>
  );
}

function ForbiddenView({ userRole }) {
  const destino = ROLE_HOME[userRole] || '/login';
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcf7] text-[#1c3a13]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-[#eeeee9] border border-[#eeeee9] rounded-2xl p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1c3a13] text-[#d3fa99]">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <span className="badge-lime font-mono text-[10px]">
            ERROR 403 · ACCESO DENEGADO POR PERFIL
          </span>
          <h1 className="text-xl font-light tracking-[-0.4px] text-[#1c3a13]">
            Módulo Fuera de Alcance
          </h1>
          <p className="text-xs text-[#666666] leading-relaxed">
            Tu perfil institucional actual ({userRole}) no está autorizado para visualizar o
            modificar este módulo. Regresa a tu panel correspondiente para continuar.
          </p>
          <div className="pt-2">
            <Link to={destino} className="btn-primary w-full">
              Volver a mi Panel Asignado
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullScreenLoading />;
  }

  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  const hasAccess =
    user?.rol === 'administrador' ||
    (allowedRoles && allowedRoles.includes(user?.rol)) ||
    (allowedRoles && allowedRoles.includes('profesional') && user?.rol === 'medico');

  if (!hasAccess) {
    return <ForbiddenView userRole={user?.rol} />;
  }

  return children;
}

function PublicAuthRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <FullScreenLoading />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={ROLE_HOME[user.rol] || '/login'} replace />;
  }

  return children;
}

// Gatekeeper inicial: ningún contenido visible sin autenticación
function RootGatekeeper() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <FullScreenLoading />;
  }

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  return <Navigate to={ROLE_HOME[user.rol] || '/login'} replace />;
}

export function AppRouter() {
  return (
    <Routes>
      {/* Entrada principal del sitio: Gatekeeper estricto */}
      <Route path="/" element={<RootGatekeeper />} />

      {/* Pantalla de autenticación y selección de los 3 perfiles */}
      <Route
        path="/login"
        element={
          <PublicAuthRoute>
            <LoginPage />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/registro"
        element={
          <PublicAuthRoute>
            <RegistroPage />
          </PublicAuthRoute>
        }
      />

      {/* 1. Panel de Pacientes */}
      <Route
        path="/paciente/reservar"
        element={
          <ProtectedRoute allowedRoles={['paciente']}>
            <ReservarCitaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/paciente/citas"
        element={
          <ProtectedRoute allowedRoles={['paciente']}>
            <MisCitasPage />
          </ProtectedRoute>
        }
      />

      {/* 2. Panel de Profesionales Médicos */}
      <Route
        path="/medico/agenda"
        element={
          <ProtectedRoute allowedRoles={['profesional', 'medico']}>
            <AgendaMedicoPage />
          </ProtectedRoute>
        }
      />

      {/* 3. Panel Superior de Administración */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['administrador']}>
            <DashboardAdminPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback general: redirige a la raíz controlada por Gatekeeper */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
