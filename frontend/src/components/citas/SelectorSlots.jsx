import { useEffect, useState } from 'react';
import { CalendarDays, Clock, Sparkles } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { MiniCalendarioDesplegable } from './MiniCalendarioDesplegable';

export function SelectorSlots({
  medico,
  selectedDate,
  onSelectDate,
  selectedSlot,
  onSelectSlot,
  refreshKey = 0,
}) {
  const [availableDates, setAvailableDates] = useState([]);
  const [slotsForSelectedDate, setSlotsForSelectedDate] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // 1. Generar calendario de días hábiles desde Laravel (AgendaDisponibilidadService)
  useEffect(() => {
    if (!medico?.id) return undefined;
    let cancelled = false;
    setLoadingCalendar(true);

    apiRequest(`/horarios/${medico.id}/calendario?dias=10`)
      .then((res) => {
        if (cancelled) return;
        const days = res?.data || [];
        setAvailableDates(days);
        if (days.length > 0) {
          const valid = days.some((d) => d.iso === selectedDate);
          if (!valid) {
            onSelectDate(days[0].iso);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setAvailableDates([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCalendar(false);
      });

    return () => {
      cancelled = true;
    };
  }, [medico?.id, refreshKey]);

  // 2. Consultar disponibilidad de slots desde MySQL para la fecha elegida
  useEffect(() => {
    if (!medico?.id || !selectedDate) return undefined;
    let cancelled = false;
    setLoadingSlots(true);

    apiRequest(`/horarios/${medico.id}/disponibilidad?fecha=${selectedDate}`)
      .then((res) => {
        if (!cancelled) {
          setSlotsForSelectedDate(res?.data || []);
        }
      })
      .catch(() => {
        if (!cancelled) setSlotsForSelectedDate([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [medico?.id, selectedDate, refreshKey]);

  const freeSlotsCount = slotsForSelectedDate.filter((s) => s.libre).length;
  const nextAvailableDate =
    freeSlotsCount === 0
      ? availableDates.find((d) => d.iso !== selectedDate && d.slots_libres > 0)
      : null;

  return (
    <div className="space-y-6">
      {/* Calendario de fechas hábiles + Mini Calendario Desplegable */}
      <div>
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <label className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#1c3a13] dark:text-[#fcfcf7]">
              <CalendarDays className="h-4 w-4 text-[#1c3a13] dark:text-[#d3fa99]" />
              3. Selecciona una fecha hábil
            </label>
            <p className="text-[11px] font-mono text-[#757c5d] dark:text-[#8ca388]">
              Agenda médica sincronizada con MySQL
            </p>
          </div>

          {/* Mini Calendario Desplegable interactivo */}
          <MiniCalendarioDesplegable
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            onSelectSlot={onSelectSlot}
          />
        </div>

        {/* Carrusel / Franja de accesos rápidos a fechas hábiles */}
        {loadingCalendar && availableDates.length === 0 ? (
          <SkeletonLoader variant="slots" />
        ) : (
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {availableDates.map((d) => {
              const isSelected = d.iso === selectedDate;
              return (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => {
                    onSelectDate(d.iso);
                    onSelectSlot(null);
                  }}
                  className={`flex flex-col items-center justify-center rounded-2xl border px-3 py-2.5 text-center transition-all ${
                    isSelected
                      ? 'border-[#1c3a13] bg-[#1c3a13] text-[#fcfcf7] dark:border-[#d3fa99] dark:bg-[#d3fa99] dark:text-[#1c3a13] shadow-sm'
                      : 'border-[#eeeee9] bg-[#eeeee9] text-[#1c3a13] hover:border-[#c4c7c4] dark:border-[#284520] dark:bg-[#162812] dark:text-[#fcfcf7] dark:hover:border-[#3a5e30]'
                  }`}
                >
                  <span
                    className={`text-[10px] font-mono uppercase ${
                      isSelected
                        ? 'text-[#d3fa99] dark:text-[#1c3a13] font-semibold'
                        : 'text-[#666666] dark:text-[#8ca388]'
                    }`}
                  >
                    {d.isToday ? 'Hoy' : d.dayName}
                  </span>
                  <span className="mt-0.5 text-base font-mono font-medium leading-none">
                    {d.dayNum}
                  </span>
                  <span
                    className={`mt-0.5 text-[10px] font-mono capitalize ${
                      isSelected
                        ? 'text-[#fcfcf7]/80 dark:text-[#1c3a13]/80'
                        : 'text-[#666666] dark:text-[#8ca388]'
                    }`}
                  >
                    {d.monthShort}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Cuadrícula de Slots Horarios */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <label className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#1c3a13] dark:text-[#fcfcf7]">
            <Clock className="h-4 w-4 text-[#1c3a13] dark:text-[#d3fa99]" />
            4. Elige una franja horaria ({medico?.duracion_cita_defecto_min || 30} min)
          </label>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 text-[#1c3a13] dark:text-[#d3fa99]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#d3fa99] border border-[#1c3a13] dark:border-[#d3fa99]" />
              Disponible
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#666666] dark:text-[#8ca388]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#eeeee9] border border-[#c4c7c4] dark:bg-[#284520] dark:border-[#3a5e30]" />
              Ocupada
            </span>
          </div>
        </div>

        {loadingSlots ? (
          <SkeletonLoader variant="slots" />
        ) : freeSlotsCount === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#c4c7c4] dark:border-[#284520] bg-[#eeeee9]/60 dark:bg-[#162812]/50 p-6 text-center">
            <p className="text-sm font-medium text-[#1c3a13] dark:text-[#fcfcf7]">
              No hay horarios disponibles para esta fecha
            </p>
            <p className="mt-1 text-xs text-[#666666] dark:text-[#8ca388]">
              Todos los turnos del día ya pasaron, están bloqueados o fueron reservados.
            </p>
            {nextAvailableDate && (
              <button
                type="button"
                onClick={() => {
                  onSelectDate(nextAvailableDate.iso);
                  onSelectSlot(null);
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#1c3a13] dark:border-[#d3fa99] bg-[#fcfcf7] dark:bg-[#1c3a13] px-4 py-2 text-xs font-mono text-[#1c3a13] dark:text-[#d3fa99] hover:bg-[#eeeee9] dark:hover:bg-[#284520] transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#d3fa99]" />
                Saltar al próximo turno disponible: {nextAvailableDate.dayName}{' '}
                {nextAvailableDate.dayNum} {nextAvailableDate.monthShort}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {slotsForSelectedDate.map((slot) => {
              const isSelected = selectedSlot?.inicio === slot.inicio;

              if (!slot.libre) {
                return (
                  <button
                    key={slot.inicio}
                    type="button"
                    disabled
                    title={`Franja no disponible (${slot.motivo})`}
                    className="flex flex-col items-center justify-center rounded-full border border-[#eeeee9] bg-[#eeeee9] dark:border-[#284520] dark:bg-[#162812] px-3 py-2 text-xs font-mono text-[#666666]/60 dark:text-[#8ca388]/50 cursor-not-allowed"
                  >
                    <span className="line-through">{slot.label}</span>
                    <span className="text-[9px] text-[#666666] dark:text-[#8ca388]">{slot.motivo}</span>
                  </button>
                );
              }

              return (
                <button
                  key={slot.inicio}
                  type="button"
                  onClick={() => onSelectSlot(slot)}
                  className={`flex flex-col items-center justify-center rounded-full border px-3 py-2 text-xs font-mono transition-all ${
                    isSelected
                      ? 'border-[#1c3a13] bg-[#1c3a13] text-[#fcfcf7] dark:border-[#d3fa99] dark:bg-[#d3fa99] dark:text-[#1c3a13] shadow-sm'
                      : 'border-[#1c3a13]/30 bg-[#fcfcf7] text-[#1c3a13] hover:bg-[#d3fa99]/30 dark:border-[#284520] dark:bg-[#12210e] dark:text-[#fcfcf7] dark:hover:border-[#d3fa99]/60'
                  }`}
                >
                  <span className="font-medium">{slot.label}</span>
                  <span
                    className={`text-[9px] ${
                      isSelected ? 'text-[#d3fa99] dark:text-[#1c3a13]' : 'text-[#757c5d] dark:text-[#8ca388]'
                    }`}
                  >
                    {isSelected ? 'Seleccionado' : 'Libre'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
