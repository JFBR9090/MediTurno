import { Lock, ShieldCheck } from 'lucide-react';
import { Logo } from '../common/Logo';

export function Footer() {
  return (
    <footer className="border-t border-[#eeeee9] bg-[#1c3a13] text-[#fcfcf7] mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="space-y-3.5">
            <Logo size="md" variant="dark" />
            <p className="text-xs text-[#eeeee9]/80 leading-relaxed max-w-xs font-normal">
              Plataforma clínica integral para agendamiento médico sin solapamientos,
              control de horarios en tiempo real y arquitectura de seguridad Gatekeeper.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#d3fa99]">
              Privacidad y Seguridad
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-[#eeeee9]/80 leading-relaxed">
              <ShieldCheck className="h-4 w-4 text-[#d3fa99] shrink-0 mt-0.5" />
              <p>
                Cumplimiento estricto de la{' '}
                <strong className="text-[#fcfcf7]">Ley 1581 de 2012 de Colombia</strong>{' '}
                (Régimen General de Protección de Datos Personales) y Decreto 1377 de 2013.
              </p>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-[#eeeee9]/80 leading-relaxed">
              <Lock className="h-4 w-4 text-[#d3fa99] shrink-0 mt-0.5" />
              <p>
                Sesiones protegidas mediante cookies{' '}
                <code className="rounded-full bg-[#fcfcf7]/15 px-2 py-0.5 text-[10px] font-mono text-[#d3fa99]">
                  HttpOnly
                </code>{' '}
                y control de acceso basado en roles (RBAC).
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#d3fa99]">
              Atención Institucional
            </h4>
            <p className="text-xs text-[#eeeee9]/80">
              Centro Médico MediTurno — Sede Principal
            </p>
            <p className="text-xs text-[#eeeee9]/80 font-mono">
              Lunes a Viernes: 08:00 AM - 04:00 PM | Sábados: 08:00 AM - 12:00 PM
            </p>
            <p className="text-xs text-[#c4c7c4]/60">
              * Los registros en modo demo son datos ficticios de prueba académica.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-[#fcfcf7]/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#c4c7c4]/80">
          <p>© {new Date().getFullYear()} MediTurno. Todos los derechos reservados.</p>
          <p>Tratamiento de datos personales — Estándar Clínico Seed</p>
        </div>
      </div>
    </footer>
  );
}


