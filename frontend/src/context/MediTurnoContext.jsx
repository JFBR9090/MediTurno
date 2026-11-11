import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from './AuthContext';

const MediTurnoContext = createContext(null);

export function MediTurnoProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [citas, setCitas] = useState([]);
  const [metricasAdmin, setMetricasAdmin] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = 'info', title, message, duration = 4500 }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
      return id;
    },
    [dismissToast]
  );

  // Cargar catálogos públicos desde Laravel + MySQL
  const cargarCatalogos = useCallback(async () => {
    try {
      const [espRes, medRes] = await Promise.all([
        apiRequest('/especialidades'),
        apiRequest('/medicos'),
      ]);
      if (espRes?.data) setEspecialidades(espRes.data);
      if (medRes?.data) setMedicos(medRes.data);
    } catch {
      // Silencioso en caso de fallo transitorio
    }
  }, []);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  // Cargar citas, métricas y notificaciones del usuario autenticado
  const cargarDatosPrivados = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setCitas([]);
      setPacientes([]);
      setMetricasAdmin(null);
      setNotificaciones([]);
      return;
    }

    try {
      const peticiones = [apiRequest('/citas'), apiRequest('/notificaciones')];
      if (user.rol === 'administrador') {
        peticiones.push(apiRequest('/pacientes'));
      }

      const [citasRes, notifRes, pacientesRes] = await Promise.all(peticiones);
      if (citasRes?.data) setCitas(citasRes.data);
      if (citasRes?.metricas) setMetricasAdmin(citasRes.metricas);
      if (notifRes?.data) setNotificaciones(notifRes.data);
      if (pacientesRes?.data) setPacientes(pacientesRes.data);
    } catch {
      // Ignorado si sesión expiró
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    cargarDatosPrivados();
  }, [cargarDatosPrivados]);

  const marcarNotificacionesLeidas = useCallback(async () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    try {
      await apiRequest('/notificaciones/leer', { method: 'POST' });
    } catch {
      // Ignorar
    }
  }, []);

  const crearCita = useCallback(
    async ({
      medico,
      fechaISO,
      slot,
      motivoConsulta,
      simularConflicto = false,
    }) => {
      const [year, month, day] = fechaISO.split('-').map(Number);
      const [hIni, mIni] = slot.inicio.split(':').map(Number);
      const [hFin, mFin] = slot.fin.split(':').map(Number);

      const inicioDate = new Date(year, month - 1, day, hIni, mIni, 0, 0);
      const finDate = new Date(year, month - 1, day, hFin, mFin, 0, 0);

      const res = await apiRequest('/citas', {
        method: 'POST',
        body: {
          medico_id: medico.id,
          especialidad_id: medico.especialidad_id,
          fecha_hora_inicio: slot.fecha_hora_inicio || inicioDate.toISOString(),
          fecha_hora_fin: slot.fecha_hora_fin || finDate.toISOString(),
          motivo_consulta: motivoConsulta?.trim() || 'Consulta médica general',
          simular_conflicto: simularConflicto,
        },
      });

      await cargarDatosPrivados();
      return res.data;
    },
    [cargarDatosPrivados]
  );

  const cancelarCita = useCallback(
    async (citaId, motivoCancelacion) => {
      await apiRequest(`/citas/${citaId}/cancelar`, {
        method: 'PUT',
        body: {
          motivo_cancelacion: motivoCancelacion || 'Cancelada por el paciente',
        },
      });
      await cargarDatosPrivados();
    },
    [cargarDatosPrivados]
  );

  const actualizarEstadoCitaMedico = useCallback(
    async (citaId, nuevoEstado) => {
      await apiRequest(`/citas/${citaId}/estado`, {
        method: 'PUT',
        body: { estado: nuevoEstado },
      });
      await cargarDatosPrivados();
    },
    [cargarDatosPrivados]
  );

  const agregarMedico = useCallback(async (nuevoMedicoData) => {
    const res = await apiRequest('/medicos', {
      method: 'POST',
      body: {
        nombre: nuevoMedicoData.nombre.trim(),
        correo: nuevoMedicoData.correo.trim().toLowerCase(),
        tarjeta_profesional: nuevoMedicoData.tarjeta_profesional.trim().toUpperCase(),
        especialidad_id: Number(nuevoMedicoData.especialidad_id),
        consultorio: nuevoMedicoData.consultorio.trim(),
        duracion_cita_defecto_min: Number(nuevoMedicoData.duracion_cita_defecto_min) || 30,
      },
    });
    if (res?.data) {
      setMedicos((prev) => [...prev, res.data]);
    }
    return res.data;
  }, []);

  const toggleEstadoMedico = useCallback(async (medicoId) => {
    const res = await apiRequest(`/medicos/${medicoId}/toggle`, {
      method: 'PATCH',
    });
    if (res?.data) {
      setMedicos((prev) =>
        prev.map((m) => (m.id === medicoId ? res.data : m))
      );
    }
  }, []);

  const unreadCount = useMemo(
    () => notificaciones.filter((n) => !n.leida).length,
    [notificaciones]
  );

  const value = {
    especialidades,
    medicos,
    pacientes,
    citas,
    metricasAdmin,
    notificaciones,
    unreadCount,
    toasts,
    showToast,
    dismissToast,
    marcarNotificacionesLeidas,
    crearCita,
    cancelarCita,
    actualizarEstadoCitaMedico,
    agregarMedico,
    toggleEstadoMedico,
    recargarTodo: async () => {
      await Promise.all([cargarCatalogos(), cargarDatosPrivados()]);
    },
  };

  return (
    <MediTurnoContext.Provider value={value}>{children}</MediTurnoContext.Provider>
  );
}

export function useMediTurno() {
  const ctx = useContext(MediTurnoContext);
  if (!ctx) {
    throw new Error('useMediTurno debe utilizarse dentro de un MediTurnoProvider');
  }
  return ctx;
}
