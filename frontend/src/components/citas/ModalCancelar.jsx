import { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

export function ModalCancelar({ cita, isOpen, onClose, onConfirm }) {
  const [motivo, setMotivo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !cita) return null;

  const fechaObj = new Date(cita.fecha_hora_inicio);
  const fechaStr = fechaObj.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const horaStr = fechaObj.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handleConfirm = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      await onConfirm(cita.id, motivo.trim() || 'Cancelada por el paciente');
      setMotivo('');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo cancelar la cita.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-cancelar-titulo"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-fade-in-up">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="modal-cancelar-titulo"
                className="text-base font-bold text-slate-900"
              >
                Cancelar Cita Médica
              </h3>
              <p className="text-xs text-slate-500">
                Código {cita.codigo_reserva}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-3.5 text-sm space-y-1">
          <p className="font-semibold text-slate-900">{cita.medico_nombre}</p>
          <p className="text-xs text-sky-700 font-medium">{cita.especialidad}</p>
          <p className="text-xs text-slate-600 capitalize">
            {fechaStr} — {horaStr}
          </p>
        </div>

        <p className="mt-3 text-xs text-slate-500 leading-relaxed">
          Al confirmar la cancelación, el horario quedará liberado de inmediato para
          otros pacientes. Esta acción quedará registrada en el historial de auditoría.
        </p>

        <form onSubmit={handleConfirm} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="motivo-cancelacion"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Motivo de cancelación (opcional)
            </label>
            <textarea
              id="motivo-cancelacion"
              rows={2}
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Ej: Cambio de disponibilidad laboral..."
              className="input-field resize-none"
            />
          </div>

          {errorMsg && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-secondary"
            >
              Mantener Cita
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Confirmar Cancelación'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

