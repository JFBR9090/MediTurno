import { Navigate, Route, Routes, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LandingPage } from '../pages/LandingPage';
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
  medico: '/medico/agenda',
  administrador: '/admin/dashboard',
};

function FullScreenLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      <p className="text-sm font-medium text-slate-500">Verificando sesión segura...</p>
    </div>
  );
}

function ForbiddenView({ userRole }) {
  const destino = ROLE_HOME[userRole] || '/';
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full card-surface p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <span className="inline-block rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
            Error 403 · Acceso Denegado
          </span>
          <h1 className="font-display text-xl font-bold text-slate-900">
            No tienes permisos para acceder a esta sección
          </h1>
          <p className="text-sm text-slate-500">
            Tu rol actual no está autorizado para visualizar este módulo. Regresa a tu
            panel asignado para continuar.
          </p>
          <div className="pt-2">
            <Link to={destino} className="btn-primary w-full">
              Volver a mi Panel
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

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <ForbiddenView userRole={user.rol} />;
  }

  return children;
}

function PublicAuthRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <FullScreenLoading />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROLE_HOME[user.rol] || '/'} replace />;
  }

  return children;
}

export function AppRouter() {
  return (
    <Routes>
      {/* Ruta pública principal */}
      <Route path="/" element={<LandingPage />} />

      {/* Autenticación */}
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

      {/* Panel del Paciente */}
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

      {/* Panel del Médico */}
      <Route
        path="/medico/agenda"
        element={
          <ProtectedRoute allowedRoles={['medico']}>
            <AgendaMedicoPage />
          </ProtectedRoute>
        }
      />

      {/* Panel del Administrador */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['administrador']}>
            <DashboardAdminPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

