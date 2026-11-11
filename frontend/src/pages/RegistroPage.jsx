import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, UserPlus } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { useMediTurno } from '../context/MediTurnoContext';

export function RegistroPage() {
  const { register } = useAuth();
  const { showToast } = useMediTurno();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    tipo_documento: 'CC',
    numero_documento: '',
    telefono: '',
    fecha_nacimiento: '',
    correo: '',
    password: '',
    confirmPassword: '',
    aceptaPolitica: false,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateField = (name, value, currentForm = form) => {
    switch (name) {
      case 'nombre':
        return value.trim().length < 2 ? 'Ingresa tu nombre completo.' : '';
      case 'apellido':
        return value.trim().length < 2 ? 'Ingresa tu apellido.' : '';
      case 'numero_documento':
        return !/^\d{5,15}$/.test(value.trim())
          ? 'Ingresa un número de documento válido (solo dígitos).'
          : '';
      case 'telefono':
        return !/^\d{7,15}$/.test(value.trim())
          ? 'Ingresa un número de celular válido (ej. 3001234567).'
          : '';
      case 'fecha_nacimiento':
        if (!value) return 'La fecha de nacimiento es obligatoria.';
        return new Date(value) >= new Date()
          ? 'La fecha de nacimiento no puede ser futura.'
          : '';
      case 'correo':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
          ? 'Ingresa un correo electrónico válido.'
          : '';
      case 'password':
        return value.length < 8
          ? 'La contraseña debe tener mínimo 8 caracteres.'
          : '';
      case 'confirmPassword':
        return value !== currentForm.password
          ? 'Las contraseñas no coinciden.'
          : '';
      case 'aceptaPolitica':
        return !value
          ? 'Debes autorizar el tratamiento de datos según la Ley 1581 de 2012.'
          : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextVal = type === 'checkbox' ? checked : value;
    setForm((prev) => ({ ...prev, [name]: nextVal }));
    if (errors[name] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: '', general: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    const msg = validateField(name, val);
    if (msg) {
      setErrors((prev) => ({ ...prev, [name]: msg }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldsToCheck = [
      'nombre',
      'apellido',
      'numero_documento',
      'telefono',
      'fecha_nacimiento',
      'correo',
      'password',
      'confirmPassword',
      'aceptaPolitica',
    ];

    const nextErrors = {};
    fieldsToCheck.forEach((field) => {
      const msg = validateField(field, form[field], form);
      if (msg) nextErrors[field] = msg;
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      await register(form);
      showToast({
        type: 'success',
        title: 'Cuenta creada con éxito',
        message: 'Ya puedes agendar tu primera cita médica.',
      });
      navigate('/paciente/reservar', { replace: true });
    } catch (err) {
      setErrors({ general: err.message || 'No se pudo completar el registro.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-2xl card-surface p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">
              Registro de Pacientes
            </span>
            <h1 className="mt-1 font-display text-2xl font-bold text-slate-900">
              Crea tu cuenta en MediTurno
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Agenda tus citas médicas en menos de 3 minutos y gestiona tus turnos desde
              cualquier dispositivo.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nombre
                </label>
                <input
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej. Camila"
                  className={errors.nombre ? 'input-field-error' : 'input-field'}
                />
                {errors.nombre && (
                  <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Apellido
                </label>
                <input
                  name="apellido"
                  type="text"
                  value={form.apellido}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ej. Restrepo"
                  className={errors.apellido ? 'input-field-error' : 'input-field'}
                />
                {errors.apellido && (
                  <p className="mt-1 text-xs text-red-600">{errors.apellido}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tipo de Documento
                </label>
                <select
                  name="tipo_documento"
                  value={form.tipo_documento}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="CC">Cédula de Ciudadanía (CC)</option>
                  <option value="TI">Tarjeta de Identidad (TI)</option>
                  <option value="CE">Cédula de Extranjería (CE)</option>
                  <option value="PA">Pasaporte</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Número de Documento
                </label>
                <input
                  name="numero_documento"
                  type="text"
                  value={form.numero_documento}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="1018456789"
                  className={
                    errors.numero_documento ? 'input-field-error' : 'input-field'
                  }
                />
                {errors.numero_documento && (
                  <p className="mt-1 text-xs text-red-600">{errors.numero_documento}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Teléfono / WhatsApp
                </label>
                <input
                  name="telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="3001234567"
                  className={errors.telefono ? 'input-field-error' : 'input-field'}
                />
                {errors.telefono && (
                  <p className="mt-1 text-xs text-red-600">{errors.telefono}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Fecha de Nacimiento
                </label>
                <input
                  name="fecha_nacimiento"
                  type="date"
                  value={form.fecha_nacimiento}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.fecha_nacimiento ? 'input-field-error' : 'input-field'
                  }
                />
                {errors.fecha_nacimiento && (
                  <p className="mt-1 text-xs text-red-600">{errors.fecha_nacimiento}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  name="correo"
                  type="email"
                  value={form.correo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="camila.restrepo@correo.co"
                  className={errors.correo ? 'input-field-error' : 'input-field'}
                />
                {errors.correo && (
                  <p className="mt-1 text-xs text-red-600">{errors.correo}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contraseña
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Mínimo 8 caracteres"
                  className={errors.password ? 'input-field-error' : 'input-field'}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirmar Contraseña
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Repite tu contraseña"
                  className={
                    errors.confirmPassword ? 'input-field-error' : 'input-field'
                  }
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                <input
                  name="aceptaPolitica"
                  type="checkbox"
                  checked={form.aceptaPolitica}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span>
                  Autorizo el tratamiento de mis datos personales conforme a la{' '}
                  <strong className="text-slate-800">Ley 1581 de 2012 de Colombia</strong>{' '}
                  exclusivamente para la gestión de citas médicas en MediTurno.
                </span>
              </label>
              {errors.aceptaPolitica && (
                <p className="mt-1.5 text-xs text-red-600">{errors.aceptaPolitica}</p>
              )}
            </div>

            {errors.general && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
                {errors.general}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registrando paciente...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Completar Registro
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-semibold text-sky-600 hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

