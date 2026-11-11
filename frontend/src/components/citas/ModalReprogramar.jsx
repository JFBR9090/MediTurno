import { useMemo, useState } from 'react';
import { CalendarClock, Loader2, X } from 'lucide-react';
import { SelectorSlots } from './SelectorSlots';
import { useMediTurno } from '../../context/MediTurnoContext';

export function ModalReprogramar({ cita, isOpen, onClose, onConfirm }) {
  const { medicos } = useMediTurno();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const medico = useMemo(
    () => medicos.find((m) => m.id === cita?.medico_id) || null,
    [medicos, cita?.medico_id]
  );

  if (!isOpen || !cita) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) {
      setErrorMsg('Selecciona una nueva fecha y franja horaria disponible.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);
    try {
      await onConfirm(cita.id, { fechaISO: selectedDate, slot: selectedSlot });
      setSelectedSlot(null);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'No fue posible reprogramar la cita.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-reprogramar-titulo"
    >
      <div className="my-8 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-fade-in-up">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shrink-0">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="modal-reprogramar-titulo"
                className="text-base font-bold text-slate-900"
              >
                Reprogramar Cita Médica
              </h3>
              <p className="text-xs text-slate-500">
                {cita.codigo_reserva} · {cita.medico_nombre} ({cita.especialidad})
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {medico && (
            <SelectorSlots
              medico={medico}
              selectedDate={selectedDate}
              onSelectDate={(d) => {
                setSelectedDate(d);
                if (errorMsg) setErrorMsg('');
              }}
              selectedSlot={selectedSlot}
              onSelectSlot={(s) => {
                setSelectedSlot(s);
                if (errorMsg) setErrorMsg('');
              }}
            />
          )}

          {errorMsg && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedSlot}
              className="btn-primary"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Reprogramando...
                </>
              ) : (
                'Confirmar Nuevo Horario'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

