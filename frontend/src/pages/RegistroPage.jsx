import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Info, Loader2, UserPlus } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { useMediTurno } from '../context/MediTurnoContext';

export function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const fecha = new Date(fechaNacimiento + 'T00:00:00');
  if (isNaN(fecha.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const m = hoy.getMonth() - fecha.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) {
    edad--;
  }
  return edad;
}

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
      case 'tipo_documento': {
        const edad = calcularEdad(currentForm.fecha_nacimiento);
        if (edad !== null && edad < 18 && value === 'CC') {
          return `Al ser menor de 18 años (${edad} años), debes registrarte con Tarjeta de Identidad (TI).`;
        }
        return '';
      }
      case 'numero_documento':
        return !/^\d{5,15}$/.test(value.trim())
          ? 'Ingresa un número de documento válido (solo dígitos).'
          : '';
      case 'telefono':
        return !/^\d{7,15}$/.test(value.trim())
          ? 'Ingresa un número de celular válido (ej. 3001234567).'
          : '';
      case 'fecha_nacimiento': {
        if (!value) return 'La fecha de nacimiento es obligatoria.';
        if (new Date(value + 'T00:00:00') >= new Date()) {
          return 'La fecha de nacimiento no puede ser futura.';
        }
        const edad = calcularEdad(value);
        if (edad !== null && edad < 18 && currentForm.tipo_documento === 'CC') {
          return `Al tener ${edad} años (menor de 18), debes registrarte con Tarjeta de Identidad (TI).`;
        }
        return '';
      }
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

    if (name === 'fecha_nacimiento') {
      const edad = calcularEdad(nextVal);
      if (edad !== null && edad < 18 && form.tipo_documento === 'CC') {
        // Forzar automáticamente cambio a TI para menores de edad
        setForm((prev) => ({
          ...prev,
          fecha_nacimiento: nextVal,
          tipo_documento: 'TI',
        }));
        setErrors((prev) => ({
          ...prev,
          fecha_nacimiento: '',
          tipo_documento: '',
          general: '',
        }));
        return;
      }
    }

    if (name === 'tipo_documento') {
      const edad = calcularEdad(form.fecha_nacimiento);
      if (edad !== null && edad < 18 && nextVal === 'CC') {
        // Impedir selección de CC si es menor de 18 años
        setForm((prev) => ({ ...prev, tipo_documento: 'TI' }));
        setErrors((prev) => ({
          ...prev,
          tipo_documento: `Los menores de 18 años (${edad} años) no pueden usar Cédula de Ciudadanía. Debes usar Tarjeta de Identidad (TI).`,
        }));
        return;
      }
    }

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
      'tipo_documento',
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

  const edadCalculada = calcularEdad(form.fecha_nacimiento);
  const esMenorDeEdad = edadCalculada !== null && edadCalculada < 18;

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcf7] dark:bg-[#0d170a] text-[#1c3a13] dark:text-[#fcfcf7] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-2xl bg-[#fcfcf7] dark:bg-[#12210e] border border-[#eeeee9] dark:border-[#284520] rounded-[32px] p-6 sm:p-10 space-y-6">
          <div>
            <span className="badge-lime font-mono text-[10px] uppercase">
              Registro Institucional de Pacientes
            </span>
            <h1 className="mt-2 text-3xl font-light tracking-[-0.4px] text-[#1c3a13] dark:text-[#fcfcf7]">
              Crea tu cuenta en MediTurno
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#666666] dark:text-[#8ca388]">
              Agenda tus citas médicas en menos de 3 minutos y gestiona tus turnos bajo la arquitectura Seed.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#1c3a13] mb-1.5">
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
                  className={errors.tipo_documento ? 'input-field-error' : 'input-field'}
                >
                  <option value="CC" disabled={esMenorDeEdad}>
                    Cédula de Ciudadanía (CC) {esMenorDeEdad ? '— (Exclusivo para mayores de 18 años)' : ''}
                  </option>
                  <option value="TI">Tarjeta de Identidad (TI)</option>
                  <option value="CE">Cédula de Extranjería (CE)</option>
                  <option value="PA">Pasaporte (PA)</option>
                </select>
                {errors.tipo_documento && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.tipo_documento}</p>
                )}
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

            {esMenorDeEdad && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50/90 dark:border-amber-700/60 dark:bg-amber-950/40 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3 animate-fade-in shadow-sm">
                <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-950 dark:text-amber-100 text-[13px]">
                    Requisito de Identificación para Menores de Edad ({edadCalculada} {edadCalculada === 1 ? 'año' : 'años'})
                  </p>
                  <p className="text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                    Al tener menos de 18 años, la legislación colombiana (Decreto 1260 de 1970 y normatividad de la Registraduría Nacional del Estado Civil) establece que el documento oficial de identidad es la <strong>Tarjeta de Identidad (TI)</strong>. La <strong>Cédula de Ciudadanía (CC)</strong> es de uso exclusivo para mayores de edad, por lo que ha sido inhabilitada y el sistema ha seleccionado automáticamente <strong>TI</strong> para tu registro.
                  </p>
                </div>
              </div>
            )}

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

            <div className="rounded-2xl border border-[#eeeee9] dark:border-[#284520] bg-[#eeeee9] dark:bg-[#162812] p-4">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#1c3a13] dark:text-[#fcfcf7]">
                <input
                  name="aceptaPolitica"
                  type="checkbox"
                  checked={form.aceptaPolitica}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-[#c4c7c4] dark:border-[#284520] text-[#1c3a13] dark:text-[#d3fa99] focus:ring-[#1c3a13] dark:focus:ring-[#d3fa99]"
                />
                <span className="leading-relaxed">
                  Autorizo el tratamiento de mis datos personales conforme a la{' '}
                  <strong className="text-[#1c3a13] dark:text-[#d3fa99]">Ley 1581 de 2012 de Colombia</strong>{' '}
                  exclusivamente para la gestión de citas médicas en MediTurno.
                </span>
              </label>
              {errors.aceptaPolitica && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.aceptaPolitica}</p>
              )}
            </div>

            {errors.general && (
              <div className="rounded-2xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-xs text-red-800 dark:text-red-300">
                {errors.general}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#d3fa99] dark:text-[#1c3a13]" />
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

          <p className="text-center text-xs text-[#666666] dark:text-[#8ca388]">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-medium text-[#1c3a13] dark:text-[#d3fa99] underline hover:text-[#284f1c]">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

