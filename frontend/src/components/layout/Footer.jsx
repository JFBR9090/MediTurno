import { Lock, ShieldCheck } from 'lucide-react';
import { Logo } from '../common/Logo';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <Logo size="sm" />
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Plataforma integral para agendamiento médico sin solapamientos,
              control de horarios en tiempo real y gestión clínica eficiente.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Privacidad y Seguridad
            </h4>
            <div className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                Cumplimiento estricto de la{' '}
                <strong className="text-slate-700">Ley 1581 de 2012 de Colombia</strong>{' '}
                (Régimen General de Protección de Datos Personales) y Decreto 1377 de 2013.
              </p>
            </div>
            <div className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
              <Lock className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
              <p>
                Sesiones protegidas mediante cookies{' '}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px]">HttpOnly</code>{' '}
                y control de acceso basado en roles (RBAC).
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Atención al Paciente
            </h4>
            <p className="text-xs text-slate-500">
              Centro Médico MediTurno — Sede Principal
            </p>
            <p className="text-xs text-slate-500">
              Lunes a Viernes: 08:00 AM - 04:00 PM | Sábados: 08:00 AM - 12:00 PM
            </p>
            <p className="text-xs text-slate-400">
              * Los registros visibles en modo demo son datos ficticios de prueba.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} MediTurno. Todos los derechos reservados.</p>
          <p>Tratamiento autorizado de datos personales — Ley 1581 de 2012 (Colombia)</p>
        </div>
      </div>
    </footer>
  );
}

