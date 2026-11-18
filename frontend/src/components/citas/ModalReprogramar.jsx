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
      <div className="my-8 w-full max-w-2xl rounded-2xl border border-[#eeeee9] dark:border-[#284520] bg-[#fcfcf7] dark:bg-[#12210e] text-[#1c3a13] dark:text-[#fcfcf7] p-6 shadow-2xl animate-fade-in-up">
        <div className="flex items-start justify-between gap-3 border-b border-[#eeeee9] dark:border-[#284520] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eeeee9] dark:bg-[#162812] text-[#1c3a13] dark:text-[#d3fa99] shrink-0">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="modal-reprogramar-titulo"
                className="text-base font-medium text-[#1c3a13] dark:text-[#fcfcf7]"
              >
                Reprogramar Cita Médica
              </h3>
              <p className="text-xs font-mono text-[#666666] dark:text-[#8ca388]">
                {cita.codigo_reserva} · {cita.medico_nombre} ({cita.especialidad})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full p-1 text-[#666666] dark:text-[#8ca388] hover:bg-[#eeeee9] dark:hover:bg-[#162812]"
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

