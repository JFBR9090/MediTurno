export function SkeletonLoader({ variant = 'cards', count = 3 }) {
  if (variant === 'slots') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" aria-busy="true" aria-label="Cargando horarios">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="h-11 rounded-xl animate-pulse bg-slate-200"
          />
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Cargando registros">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="h-10 w-10 rounded-full animate-pulse bg-slate-200 shrink-0" />
              <div className="space-y-2 flex-1 max-w-xs">
                <div className="h-4 w-3/4 rounded-md animate-pulse bg-slate-200" />
                <div className="h-3 w-1/2 rounded-md animate-pulse bg-slate-200" />
              </div>
            </div>
            <div className="h-8 w-24 rounded-xl animate-pulse bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'metrics') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" aria-busy="true">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="card-surface p-5 space-y-3">
            <div className="h-4 w-24 rounded animate-pulse bg-slate-200" />
            <div className="h-8 w-16 rounded animate-pulse bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" aria-busy="true" aria-label="Cargando contenido">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="card-surface p-5 space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-full animate-pulse bg-slate-200 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-3/4 rounded animate-pulse bg-slate-200" />
              <div className="h-3 w-1/2 rounded animate-pulse bg-slate-200" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded animate-pulse bg-slate-200" />
            <div className="h-3 w-5/6 rounded animate-pulse bg-slate-200" />
          </div>
          <div className="h-10 w-full rounded-xl animate-pulse bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

