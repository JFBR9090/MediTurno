import { useState } from 'react';
import { Loader2, X } from 'lucide-react';

export function ModalPacienteAdmin({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    tipo_documento: 'CC',
    numero_documento: '',
    telefono: '',
    fecha_nacimiento: '',
    correo: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name] || errors.general) {
      setErrors((p) => ({ ...p, [name]: '', general: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErr = {};
    if (form.nombre.trim().length < 2) nextErr.nombre = 'Nombre obligatorio.';
    if (form.apellido.trim().length < 2) nextErr.apellido = 'Apellido obligatorio.';
    if (!/^\d{5,15}$/.test(form.numero_documento.trim())) {
      nextErr.numero_documento = 'Documento inválido (solo dígitos).';
    }
    if (!/^\d{7,15}$/.test(form.telefono.trim())) {
      nextErr.telefono = 'Teléfono inválido.';
    }
    if (!form.fecha_nacimiento) nextErr.fecha_nacimiento = 'Fecha requerida.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) {
      nextErr.correo = 'Correo inválido.';
    }

    if (Object.keys(nextErr).length > 0) {
      setErrors(nextErr);
      return;
    }

    setSubmitting(true);
    try {
      await onSave(form);
      setForm({
        nombre: '',
        apellido: '',
        tipo_documento: 'CC',
        numero_documento: '',
        telefono: '',
        fecha_nacimiento: '',
        correo: '',
      });
      onClose();
    } catch (err) {
      setErrors({ general: err.message || 'No se pudo registrar el paciente.' });
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
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-fade-in-up">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Registrar Paciente</h3>
            <p className="text-xs text-slate-500">
              Crea una cuenta de paciente directamente en MySQL.
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre
              </label>
              <input
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={handleChange}
                className={errors.nombre ? 'input-field-error' : 'input-field'}
              />
              {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Apellido
              </label>
              <input
                name="apellido"
                type="text"
                value={form.apellido}
                onChange={handleChange}
                className={errors.apellido ? 'input-field-error' : 'input-field'}
              />
              {errors.apellido && <p className="mt-1 text-xs text-red-600">{errors.apellido}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo Doc.
              </label>
              <select
                name="tipo_documento"
                value={form.tipo_documento}
                onChange={handleChange}
                className="input-field"
              >
                <option value="CC">CC</option>
                <option value="TI">TI</option>
                <option value="CE">CE</option>
                <option value="PA">PA</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Documento
              </label>
              <input
                name="numero_documento"
                type="text"
                value={form.numero_documento}
                onChange={handleChange}
                className={errors.numero_documento ? 'input-field-error' : 'input-field'}
              />
              {errors.numero_documento && (
                <p className="mt-1 text-xs text-red-600">{errors.numero_documento}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono
              </label>
              <input
                name="telefono"
                type="tel"
                value={form.telefono}
                onChange={handleChange}
                className={errors.telefono ? 'input-field-error' : 'input-field'}
              />
              {errors.telefono && <p className="mt-1 text-xs text-red-600">{errors.telefono}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha Nacimiento
              </label>
              <input
                name="fecha_nacimiento"
                type="date"
                value={form.fecha_nacimiento}
                onChange={handleChange}
                className={errors.fecha_nacimiento ? 'input-field-error' : 'input-field'}
              />
              {errors.fecha_nacimiento && (
                <p className="mt-1 text-xs text-red-600">{errors.fecha_nacimiento}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <input
                name="correo"
                type="email"
                value={form.correo}
                onChange={handleChange}
                className={errors.correo ? 'input-field-error' : 'input-field'}
              />
              {errors.correo && <p className="mt-1 text-xs text-red-600">{errors.correo}</p>}
            </div>
          </div>

          {errors.general && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {errors.general}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Registrar Paciente'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

