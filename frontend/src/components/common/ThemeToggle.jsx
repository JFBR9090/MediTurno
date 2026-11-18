import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle({ showLabel = false, className = '' }) {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-2 rounded-full border transition-all duration-200 select-none ${
        isDark
          ? 'border-[#284520] bg-[#162812] text-[#d3fa99] hover:bg-[#20361a] hover:border-[#3a5e30]'
          : 'border-[#eeeee9] bg-[#eeeee9] text-[#1c3a13] hover:bg-[#e4e4dd] hover:border-[#c4c7c4]'
      } p-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#d3fa99] ${className}`}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      <div className="relative flex h-4 w-4 items-center justify-center">
        {isDark ? (
          <Sun className="h-4 w-4 text-[#d3fa99] transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <Moon className="h-4 w-4 text-[#1c3a13] transition-transform duration-300 rotate-0 scale-100" />
        )}
      </div>

      {showLabel && (
        <span className="pr-1 text-xs font-medium">
          {isDark ? 'Modo Claro' : 'Modo Oscuro'}
        </span>
      )}
    </button>
  );
}
