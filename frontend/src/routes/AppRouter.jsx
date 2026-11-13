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
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 gap-3 text-white">
      <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
      <p className="text-sm font-medium text-slate-300">Verificando sesión segura...</p>
    </div>
  );
}

function ForbiddenView({ userRole }) {
  const destino = ROLE_HOME[userRole] || '/login';
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full card-surface p-8 text-center space-y-4 shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <span className="inline-block rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
            Error 403 · Acceso Denegado por Perfil
          </span>
          <h1 className="font-display text-xl font-bold text-slate-900">
            No tienes permisos para acceder a este módulo
          </h1>
          <p className="text-sm text-slate-500">
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
