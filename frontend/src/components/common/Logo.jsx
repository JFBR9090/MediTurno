export function Logo({ size = 'md', showText = true, className = '' }) {
  const sizes = {
    sm: { svg: 'h-8 w-8', text: 'text-lg' },
    md: { svg: 'h-9 w-9', text: 'text-xl' },
    lg: { svg: 'h-12 w-12', text: 'text-2xl' },
  };

  const current = sizes[size] || sizes.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${current.svg} shrink-0`}
        aria-hidden="true"
      >
        {/* Cruz médica moderna en Azul Zafiro Clínico (#0284C7) */}
        <path
          d="M24 10C24 7.79086 25.7909 6 28 6H36C38.2091 6 40 7.79086 40 10V18.5C40 19.6046 39.1046 20.5 38 20.5"
          stroke="#0284C7"
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        <path
          d="M24 10V18.5C24 19.6046 23.1046 20.5 22 20.5H10C7.79086 20.5 6 22.2909 6 24.5V39.5C6 41.7091 7.79086 43.5 10 43.5H22C23.1046 43.5 24 44.3954 24 45.5V54C24 56.2091 25.7909 58 28 58H36C38.2091 58 40 56.2091 40 54V45.5C40 44.3954 40.8954 43.5 42 43.5H50C52.2091 43.5 54 41.7091 54 39.5V31"
          stroke="#0284C7"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Silueta humana estilizada + Checkmark de cita confirmada */}
        <path
          d="M21 33.5L28.5 40.5C34.5 33 43.5 23.5 53.5 17"
          stroke="#0284C7"
          strokeWidth="4.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Brazo/arco de acento en verde esmeralda conectando con el punto focal */}
        <path
          d="M35.5 32.5C39.5 28 45 24 50.5 21.5"
          stroke="#10B981"
          strokeWidth="3.6"
          strokeLinecap="round"
        />

        {/* Punto superior focal (cabeza humana / acento salud) en Verde Esmeralda (#10B981) */}
        <circle cx="44.5" cy="13.5" r="4.8" fill="#10B981" />
      </svg>

      {showText && (
        <span className={`font-display font-bold tracking-tight ${current.text}`}>
          <span className="text-sky-600">Medi</span>
          <span className="text-slate-800">Turno</span>
        </span>
      )}
    </div>
  );
}

