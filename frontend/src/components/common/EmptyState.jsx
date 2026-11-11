import { Link } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';

export function EmptyState({
  title = 'No hay registros disponibles',
  description = 'Cuando exista información disponible aparecerá en este espacio.',
  actionLabel,
  actionTo,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) {
  return (
    <div className="card-surface px-6 py-12 text-center flex flex-col items-center justify-center">
      {/* Ilustración SVG calendario médico vacío */}
      <div className="mb-4 rounded-2xl bg-sky-50 p-4 text-sky-600">
        <svg
          className="h-12 w-12"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect
            x="6"
            y="10"
            width="36"
            height="32"
            rx="6"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path d="M6 19H42" stroke="currentColor" strokeWidth="2.5" />
          <path d="M16 6V12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M32 6V12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M24 25V35M19 30H29"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-slate-500">{description}</p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && actionTo && (
            <Link to={actionTo} className="btn-primary">
              <CalendarPlus className="h-4 w-4" />
              {actionLabel}
            </Link>
          )}
          {actionLabel && !actionTo && onAction && (
            <button type="button" onClick={onAction} className="btn-primary">
              <CalendarPlus className="h-4 w-4" />
              {actionLabel}
            </button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <button type="button" onClick={onSecondaryAction} className="btn-secondary">
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

