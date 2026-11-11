import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useMediTurno } from '../../context/MediTurnoContext';

const TOAST_STYLES = {
  success: {
    container: 'border-emerald-200 bg-white text-slate-900',
    accent: 'bg-emerald-500',
    iconBg: 'bg-emerald-50 text-emerald-600',
    Icon: CheckCircle2,
  },
  warning: {
    container: 'border-amber-200 bg-white text-slate-900',
    accent: 'bg-amber-500',
    iconBg: 'bg-amber-50 text-amber-600',
    Icon: AlertTriangle,
  },
  error: {
    container: 'border-red-200 bg-white text-slate-900',
    accent: 'bg-red-500',
    iconBg: 'bg-red-50 text-red-600',
    Icon: XCircle,
  },
  info: {
    container: 'border-sky-200 bg-white text-slate-900',
    accent: 'bg-sky-600',
    iconBg: 'bg-sky-50 text-sky-600',
    Icon: Info,
  },
};

export function ToastContainer() {
  const { toasts, dismissToast } = useMediTurno();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-5 right-5 z-50 flex w-full max-w-sm flex-col gap-3 pointer-events-none px-4 sm:px-0"
      aria-live="polite"
      role="region"
      aria-label="Notificaciones del sistema"
    >
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
        const Icon = style.Icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-lg animate-fade-in-up ${style.container}`}
          >
            <div className={`absolute inset-y-0 left-0 w-1.5 ${style.accent}`} />
            <div className="flex items-start gap-3 pl-1">
              <div className={`mt-0.5 rounded-xl p-1.5 shrink-0 ${style.iconBg}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
                )}
                {toast.message && (
                  <p className="mt-0.5 text-sm text-slate-600 leading-snug">{toast.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Cerrar notificación"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

