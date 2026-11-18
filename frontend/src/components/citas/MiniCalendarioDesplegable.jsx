import { useEffect, useRef, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function padZero(num) {
  return String(num).padStart(2, '0');
}

function toISODate(year, month, day) {
  return `${year}-${padZero(month + 1)}-${padZero(day)}`;
}

export function MiniCalendarioDesplegable({
  selectedDate,
  onSelectDate,
  onSelectSlot,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse selected date or today
  const initialDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const [viewDate, setViewDate] = useState(initialDate);

  // Sync view month when selectedDate changes externally
  useEffect(() => {
    if (selectedDate) {
      setViewDate(new Date(selectedDate + 'T00:00:00'));
    }
  }, [selectedDate]);

  // Click outside and Escape key handler
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = `${today.getFullYear()}-${padZero(today.getMonth() + 1)}-${padZero(today.getDate())}`;

  // Calculate days in month and padding
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  // Month navigation
  const isCurrentMonthOrPast =
    year < today.getFullYear() ||
    (year === today.getFullYear() && month <= today.getMonth());

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (isCurrentMonthOrPast) return;
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleJumpToday = (e) => {
    e.stopPropagation();
    const now = new Date();
    setViewDate(now);
    onSelectDate(todayISO);
    if (onSelectSlot) onSelectSlot(null);
  };

  const handleSelectDay = (dayNum) => {
    const iso = toISODate(year, month, dayNum);
    onSelectDate(iso);
    if (onSelectSlot) onSelectSlot(null);
    setIsOpen(false);
  };

  // Human-readable formatted date string for the trigger button
  const formattedSelected = (() => {
    if (!selectedDate) return 'Seleccionar fecha médica';
    try {
      const d = new Date(selectedDate + 'T00:00:00');
      const wDay = d.toLocaleDateString('es-CO', { weekday: 'long' });
      const mName = d.toLocaleDateString('es-CO', { month: 'long' });
      return `${wDay.charAt(0).toUpperCase() + wDay.slice(1)}, ${d.getDate()} de ${mName} de ${d.getFullYear()}`;
    } catch {
      return selectedDate;
    }
  })();

  return (
    <div ref={containerRef} className={`relative inline-block w-full sm:w-auto ${className}`}>
      {/* Campo interactivo disparador del desplegable */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`w-full sm:w-auto inline-flex items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 text-xs font-mono transition-all duration-200 select-none ${
          isOpen
            ? 'border-[#1c3a13] bg-[#fcfcf7] dark:border-[#d3fa99] dark:bg-[#162812] ring-2 ring-[#d3fa99]/50'
            : 'border-[#eeeee9] bg-[#fcfcf7] dark:border-[#284520] dark:bg-[#12210e] hover:border-[#c4c7c4] dark:hover:border-[#3a5e30]'
        } text-[#1c3a13] dark:text-[#fcfcf7] shadow-none`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eeeee9] dark:bg-[#162812] text-[#1c3a13] dark:text-[#d3fa99]">
            <CalendarIcon className="h-4 w-4" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] uppercase font-mono text-[#757c5d] dark:text-[#8ca388] leading-none">
              Fecha de la consulta
            </span>
            <span className="mt-0.5 block text-xs font-medium text-[#1c3a13] dark:text-[#fcfcf7] capitalize">
              {formattedSelected}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pl-2 border-l border-[#eeeee9] dark:border-[#284520]">
          <span className="hidden sm:inline-block text-[10px] text-[#757c5d] dark:text-[#8ca388]">
            Calendario
          </span>
          <ChevronDown
            className={`h-4 w-4 text-[#757c5d] dark:text-[#8ca388] transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#1c3a13] dark:text-[#d3fa99]' : ''
            }`}
          />
        </div>
      </button>

      {/* Popover Desplegable con el Mini Calendario */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Selector de fecha de cita médica"
          className="absolute left-0 sm:left-auto sm:right-0 mt-2 z-50 w-full sm:w-80 rounded-2xl border border-[#eeeee9] dark:border-[#284520] bg-[#fcfcf7] dark:bg-[#12210e] p-4 shadow-2xl animate-fade-in-up"
        >
          {/* Cabecera del mes con controles de navegación */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#eeeee9] dark:border-[#284520]">
            <div>
              <h4 className="text-sm font-medium text-[#1c3a13] dark:text-[#fcfcf7]">
                {MONTH_NAMES[month]} {year}
              </h4>
              <p className="text-[10px] font-mono text-[#757c5d] dark:text-[#8ca388]">
                Selecciona un día hábil
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={isCurrentMonthOrPast}
                className="p-1.5 rounded-full text-[#1c3a13] dark:text-[#fcfcf7] hover:bg-[#eeeee9] dark:hover:bg-[#162812] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Mes anterior"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleJumpToday}
                className="px-2 py-1 rounded-full text-[10px] font-mono bg-[#eeeee9] dark:bg-[#162812] text-[#1c3a13] dark:text-[#d3fa99] hover:bg-[#d3fa99] hover:text-[#1c3a13] transition-colors"
                title="Ir al mes actual y hoy"
              >
                Hoy
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-full text-[#1c3a13] dark:text-[#fcfcf7] hover:bg-[#eeeee9] dark:hover:bg-[#162812] transition-colors"
                title="Mes siguiente"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {WEEKDAYS.map((w) => (
              <span
                key={w}
                className="text-[11px] font-mono font-medium text-[#757c5d] dark:text-[#8ca388] py-1"
              >
                {w}
              </span>
            ))}
          </div>

          {/* Cuadrícula de Días */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Espacios vacíos antes del día 1 */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <span key={`empty-${i}`} className="h-8 w-8" />
            ))}

            {/* Días del mes */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const cellDate = new Date(year, month, dayNum);
              cellDate.setHours(0, 0, 0, 0);

              const isPast = cellDate < today;
              const cellISO = toISODate(year, month, dayNum);
              const isSelected = cellISO === selectedDate;
              const isToday = cellISO === todayISO;
              const isSunday = cellDate.getDay() === 0;

              if (isPast) {
                return (
                  <button
                    key={cellISO}
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="flex h-8 w-8 mx-auto items-center justify-center rounded-xl text-xs font-mono text-[#c4c7c4]/60 dark:text-[#757c5d]/40 cursor-not-allowed select-none line-through"
                    title="Fecha pasada no disponible"
                  >
                    {dayNum}
                  </button>
                );
              }

              return (
                <button
                  key={cellISO}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`flex h-8 w-8 mx-auto items-center justify-center rounded-xl text-xs font-mono transition-all select-none ${
                    isSelected
                      ? 'bg-[#1c3a13] text-[#fcfcf7] dark:bg-[#d3fa99] dark:text-[#1c3a13] font-bold shadow-md scale-105 ring-2 ring-[#d3fa99]'
                      : isToday
                      ? 'border border-[#1c3a13] dark:border-[#d3fa99] text-[#1c3a13] dark:text-[#d3fa99] font-medium hover:bg-[#d3fa99]/30 dark:hover:bg-[#162812]'
                      : isSunday
                      ? 'text-[#757c5d] dark:text-[#8ca388] hover:bg-[#eeeee9] dark:hover:bg-[#162812]'
                      : 'text-[#1c3a13] dark:text-[#fcfcf7] hover:bg-[#d3fa99]/30 dark:hover:bg-[#162812] hover:text-[#1c3a13] dark:hover:text-[#d3fa99]'
                  }`}
                  title={`${dayNum} de ${MONTH_NAMES[month]} ${isToday ? '(Hoy)' : ''}`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Pie informativo del desplegable */}
          <div className="mt-3 pt-2.5 border-t border-[#eeeee9] dark:border-[#284520] flex items-center justify-between text-[11px] font-mono text-[#757c5d] dark:text-[#8ca388]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#1c3a13] dark:bg-[#d3fa99]" />
              Seleccionado
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="hover:underline text-[#1c3a13] dark:text-[#d3fa99]"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
