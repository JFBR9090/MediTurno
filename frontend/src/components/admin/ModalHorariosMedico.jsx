import { useEffect, useState } from 'react';
import { Clock, Loader2, Plus, Trash2, X } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useMediTurno } from '../../context/MediTurnoContext';

const DIAS_SEMANA = [
  { id: 1, label: 'Lunes' },
  { id: 2, label: 'Martes' },
  { id: 3, label: 'Miércoles' },
  { id: 4, label: 'Jueves' },
  { id: 5, label: 'Viernes' },
  { id: 6, label: 'Sábado' },
  { id: 7, label: 'Domingo' },
];

export function ModalHorariosMedico({ medico, isOpen, onClose }) {
  const { showToast, recargarTodo } = useMediTurno();
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    dia_semana: '1',
    hora_inicio: '08:00',
    hora_fin: '12:00',
    duracion_cita_defecto_min: String(medico?.duracion_cita_defecto_min || 30),
  });
  const [errorMsg, setErrorMsg] = useState('');

  const cargarHorarios = async () => {
    if (!medico?.id) return;
    setLoading(true);
    try {
      const res = await apiRequest(`/horarios/${medico.id}`);
      setHorarios(res?.horarios || []);
      if (res?.duracion_cita_defecto_min) {
        setForm((prev) => ({
          ...prev,
          duracion_cita_defecto_min: String(res.duracion_cita_defecto_min),
        }));
      }
    } catch {
      setHorarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && medico?.id) {
      setErrorMsg('');
      cargarHorarios();
    }
  }, [isOpen, medico?.id]);

  if (!isOpen || !medico) return null;

  const handleAgregar = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (form.hora_fin <= form.hora_inicio) {
      setErrorMsg('La hora final debe ser posterior a la hora inicial.');
      return;
    }

    setSaving(true);
    try {
      await apiRequest(`/horarios/${medico.id}`, {
        method: 'POST',
        body: {
          dia_semana: Number(form.dia_semana),
          hora_inicio: form.hora_inicio,
          hora_fin: form.hora_fin,
          duracion_cita_defecto_min: Number(form.duracion_cita_defecto_min),
        },
      });
      await Promise.all([cargarHorarios(), recargarTodo()]);
      showToast({
        type: 'success',
        title: 'Horario guardado',
        message: 'La franja de atención fue registrada correctamente.',
      });
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo guardar el horario.');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (horarioId) => {
    try {
      await apiRequest(`/horarios/bloque/${horarioId}`, { method: 'DELETE' });
      await Promise.all([cargarHorarios(), recargarTodo()]);
      showToast({
        type: 'info',
        title: 'Franja eliminada',
        message: 'El horario fue removido de la agenda semanal.',
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="my-8 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-fade-in-up">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Configurar Horarios de Atención
            </h3>
            <p className="text-xs text-slate-500">
              {medico.nombre} · {medico.especialidad}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario agregar bloque horario */}
        <form onSubmit={handleAgregar} className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Día
              </label>
              <select
                value={form.dia_semana}
                onChange={(e) => setForm((p) => ({ ...p, dia_semana: e.target.value }))}
                className="input-field py-2 text-xs"
              >
                {DIAS_SEMANA.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Hora Inicio
              </label>
              <input
                type="time"
                value={form.hora_inicio}
                onChange={(e) => setForm((p) => ({ ...p, hora_inicio: e.target.value }))}
                className="input-field py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Hora Fin
              </label>
              <input
                type="time"
                value={form.hora_fin}
                onChange={(e) => setForm((p) => ({ ...p, hora_fin: e.target.value }))}
                className="input-field py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Duración Cita
              </label>
              <select
                value={form.duracion_cita_defecto_min}
                onChange={(e) =>
                  setForm((p) => ({ ...p, duracion_cita_defecto_min: e.target.value }))
                }
                className="input-field py-2 text-xs"
              >
                <option value="15">15 min</option>
                <option value="20">20 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {errorMsg}
            </p>
          )}

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary py-2 text-xs">
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Agregar Bloque Horario
                </>
              )}
            </button>
          </div>
        </form>

        {/* Listado de bloques actuales */}
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Jornadas Configuradas ({horarios.length})
          </h4>
          {loading ? (
            <p className="py-4 text-center text-xs text-slate-400">Cargando horarios...</p>
          ) : horarios.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">
              Sin horarios configurados.
            </p>
          ) : (
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200">
              {horarios.map((h) => {
                const diaLabel =
                  DIAS_SEMANA.find((d) => d.id === h.dia_semana)?.label || `Día ${h.dia_semana}`;
                return (
                  <div
                    key={h.id}
                    className="flex items-center justify-between px-4 py-2.5 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-3.5 w-3.5 text-sky-600" />
                      <span className="font-semibold text-slate-800 w-24">
                        {diaLabel}
                      </span>
                      <span className="font-mono text-slate-600">
                        {String(h.hora_inicio).slice(0, 5)} — {String(h.hora_fin).slice(0, 5)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEliminar(h.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Eliminar bloque"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

