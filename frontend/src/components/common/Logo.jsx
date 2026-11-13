export function Logo({
  size = 'md',
  showText = true,
  variant = 'auto', // 'light' | 'dark' | 'auto'
  className = '',
}) {
  const sizes = {
    sm: { svg: 'h-7 w-7', text: 'text-base', dot: 'h-1.5 w-1.5' },
    md: { svg: 'h-9 w-9', text: 'text-xl', dot: 'h-2 w-2' },
    lg: { svg: 'h-12 w-12', text: 'text-2xl', dot: 'h-2.5 w-2.5' },
    xl: { svg: 'h-16 w-16', text: 'text-3xl', dot: 'h-3 w-3' },
  };

  const current = sizes[size] || sizes.md;
  const isDark = variant === 'dark';

  // Seed palette tokens:
  // Forest Depths: #1c3a13
  // Lime Pulse: #d3fa99
  // Snow White: #fcfcf7
  // Sage Moss: #757c5d
  const strokeColor = isDark ? '#fcfcf7' : '#1c3a13';
  const accentStroke = isDark ? '#d3fa99' : '#1c3a13';
  const focalCircleFill = isDark ? '#d3fa99' : '#d3fa99';
  const focalCircleStroke = isDark ? '#1c3a13' : '#1c3a13';

  return (
    <div
      className={`inline-flex items-center gap-3 select-none group ${className}`}
      aria-label="MediTurno - Sistema Clínico"
    >
      {/* Símbolo Clínico MediTurno: Cruz médica geométrica + silueta humana + checkmark de confirmación */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${current.svg} shrink-0 transition-transform duration-200 group-hover:scale-105`}
          aria-hidden="true"
        >
          {/* Brazo superior de la cruz médica */}
          <path
            d="M24 10C24 7.79086 25.7909 6 28 6H36C38.2091 6 40 7.79086 40 10V18.5C40 19.6046 39.1046 20.5 38 20.5"
            stroke={strokeColor}
            strokeWidth="4.2"
            strokeLinecap="round"
          />

          {/* Cuerpo perimetral de la cruz clínica */}
          <path
            d="M24 10V18.5C24 19.6046 23.1046 20.5 22 20.5H10C7.79086 20.5 6 22.2909 6 24.5V39.5C6 41.7091 7.79086 43.5 10 43.5H22C23.1046 43.5 24 44.3954 24 45.5V54C24 56.2091 25.7909 58 28 58H36C38.2091 58 40 56.2091 40 54V45.5C40 44.3954 40.8954 43.5 42 43.5H50C52.2091 43.5 54 41.7091 54 39.5V31"
            stroke={strokeColor}
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Trazo dinámico de turno confirmado (Checkmark clínico) */}
          <path
            d="M21 33.5L28.5 40.5C34.5 33 43.5 23.5 53.5 17"
            stroke={strokeColor}
            strokeWidth="4.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Arco conector botánico/clínico */}
          <path
            d="M35.5 32.5C39.5 28 45 24 50.5 21.5"
            stroke={accentStroke}
            strokeWidth="3.6"
            strokeLinecap="round"
          />

          {/* Punto focal superior (cabeza humana / pulso vital) con acento Lime Pulse */}
          <circle
            cx="44.5"
            cy="13.5"
            r="5"
            fill={focalCircleFill}
            stroke={focalCircleStroke}
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex items-baseline tracking-[-0.48px] leading-none">
          <span
            className={`font-medium ${current.text} ${
              isDark ? 'text-[#fcfcf7]' : 'text-[#1c3a13]'
            }`}
          >
            Medi
          </span>
          <span
            className={`font-light ${current.text} ${
              isDark ? 'text-[#fcfcf7]' : 'text-[#1c3a13]'
            }`}
          >
            Turno
          </span>
          {/* Indicador de pulso botánico Seed */}
          <span
            className={`inline-block ${current.dot} rounded-full bg-[#d3fa99] ml-1.5 ring-1 ${
              isDark ? 'ring-[#1c3a13]' : 'ring-[#1c3a13]/20'
            }`}
            title="Seed Clinical Engine"
          />
        </div>
      )}
    </div>
  );
}


