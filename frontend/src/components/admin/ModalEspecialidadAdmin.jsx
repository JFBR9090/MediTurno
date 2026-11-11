import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';

export function ModalEspecialidadAdmin({
  especialidad,
  isOpen,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    tiempo_promedio_min: '30',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (especialidad) {
      setForm({
        nombre: especialidad.nombre || '',
        descripcion: especialidad.descripcion || '',
        tiempo_promedio_min: String(especialidad.tiempo_promedio_min || 30),
      });
    } else {
      setForm({ nombre: '', descripcion: '', tiempo_promedio_min: '30' });
    }
    setErrors({});
  }, [especialidad, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErr = {};
    if (form.nombre.trim().length < 3) {
      nextErr.nombre = 'El nombre debe tener al menos 3 caracteres.';
    }
    if (Object.keys(nextErr).length > 0) {
      setErrors(nextErr);
      return;
    }

    setSubmitting(true);
    try {
      await onSave(
        {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          tiempo_promedio_min: Number(form.tiempo_promedio_min),
        },
        especialidad?.id
      );
      onClose();
    } catch (err) {
      setErrors({ general: err.message || 'No se pudo guardar la especialidad.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-fade-in-up">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900">
            {especialidad ? 'Editar Especialidad' : 'Nueva Especialidad Médica'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre de la especialidad
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => {
                setForm((p) => ({ ...p, nombre: e.target.value }));
                if (errors.nombre) setErrors({});
              }}
              placeholder="Ej. Neurología"
              className={errors.nombre ? 'input-field-error' : 'input-field'}
            />
            {errors.nombre && (
              <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Duración promedio (minutos)
            </label>
            <select
              value={form.tiempo_promedio_min}
              onChange={(e) =>
                setForm((p) => ({ ...p, tiempo_promedio_min: e.target.value }))
              }
              className="input-field"
            >
              <option value="15">15 minutos</option>
              <option value="20">20 minutos</option>
              <option value="30">30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="60">60 minutos</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción
            </label>
            <textarea
              rows={2}
              value={form.descripcion}
              onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
              placeholder="Descripción breve del servicio médico..."
              className="input-field resize-none"
            />
          </div>

          {errors.general && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {errors.general}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

