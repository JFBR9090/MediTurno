import { useEffect, useState } from 'react';
import { CalendarDays, Clock, Sparkles } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { SkeletonLoader } from '../common/SkeletonLoader';

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
    <div className="space-y-5">
      {/* Calendario de fechas hábiles */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CalendarDays className="h-4 w-4 text-sky-600" />
            3. Selecciona una fecha hábil
          </label>
          <span className="text-xs text-slate-500">
            Calendario generado desde agenda MySQL
          </span>
        </div>

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
                  className={`flex flex-col items-center justify-center rounded-xl border px-2 py-2.5 text-center transition-all ${
                    isSelected
                      ? 'border-sky-600 bg-sky-600 text-white shadow-sm ring-2 ring-sky-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50/40'
                  }`}
                >
                  <span
                    className={`text-[10px] font-semibold uppercase ${
                      isSelected ? 'text-sky-100' : 'text-slate-400'
                    }`}
                  >
                    {d.isToday ? 'Hoy' : d.dayName}
                  </span>
                  <span className="mt-0.5 text-base font-bold leading-none">
                    {d.dayNum}
                  </span>
                  <span
                    className={`mt-0.5 text-[10px] capitalize ${
                      isSelected ? 'text-sky-100' : 'text-slate-400'
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
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Clock className="h-4 w-4 text-sky-600" />
            4. Elige una franja horaria ({medico?.duracion_cita_defecto_min || 30} min)
          </label>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Disponible
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              Ocupada
            </span>
          </div>
        </div>

        {loadingSlots ? (
          <SkeletonLoader variant="slots" />
        ) : freeSlotsCount === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center">
            <p className="text-sm font-semibold text-slate-800">
              No hay horarios disponibles para esta fecha
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Todos los turnos del día ya pasaron, están bloqueados o fueron reservados.
            </p>
            {nextAvailableDate && (
              <button
                type="button"
                onClick={() => {
                  onSelectDate(nextAvailableDate.iso);
                  onSelectSlot(null);
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-white px-3.5 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-50 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
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
                    className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-xs font-medium text-slate-400 cursor-not-allowed"
                  >
                    <span className="line-through">{slot.label}</span>
                    <span className="text-[10px] text-slate-400">{slot.motivo}</span>
                  </button>
                );
              }

              return (
                <button
                  key={slot.inicio}
                  type="button"
                  onClick={() => onSelectSlot(slot)}
                  className={`flex flex-col items-center justify-center rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-500/30'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300'
                  }`}
                >
                  <span>{slot.label}</span>
                  <span
                    className={`text-[10px] font-medium ${
                      isSelected ? 'text-emerald-50' : 'text-emerald-600'
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
