import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Award,
  Check,
  Loader2,
  MapPin,
  Stethoscope,
  Zap,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SelectorSlots } from '../../components/citas/SelectorSlots';
import { VoucherConfirmacion } from '../../components/citas/VoucherConfirmacion';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';
import { useMediTurno } from '../../context/MediTurnoContext';
import { getNextBusinessDateISO } from '../../data/mockData';

export function ReservarCitaPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { especialidades, medicos, citas, crearCita, showToast } = useMediTurno();

  const initialEsp = searchParams.get('especialidadId') || String(especialidades[0]?.id || 1);
  const initialMed = searchParams.get('medicoId');

  const [especialidadId, setEspecialidadId] = useState(initialEsp);
  const [selectedMedicoId, setSelectedMedicoId] = useState(
    initialMed ? Number(initialMed) : null
  );
  const [selectedDate, setSelectedDate] = useState(() => getNextBusinessDateISO(1));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [motivoConsulta, setMotivoConsulta] = useState('');
  const [simularConflicto409, setSimularConflicto409] = useState(false);

  const [loadingMedicos, setLoadingMedicos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshSlotsKey, setRefreshSlotsKey] = useState(0);
  const [citaConfirmada, setCitaConfirmada] = useState(null);

  const medicosPorEspecialidad = useMemo(
    () =>
      medicos.filter(
        (m) => m.activo && m.especialidad_id === Number(especialidadId)
      ),
    [medicos, especialidadId]
  );

  // Seleccionar primer médico disponible cuando cambia la especialidad
  useEffect(() => {
    setLoadingMedicos(true);
    const timer = setTimeout(() => {
      setLoadingMedicos(false);
    }, 240);

    const exists = medicosPorEspecialidad.some((m) => m.id === selectedMedicoId);
    if (!exists) {
      setSelectedMedicoId(medicosPorEspecialidad[0]?.id || null);
      setSelectedSlot(null);
    }

    return () => clearTimeout(timer);
  }, [especialidadId, medicosPorEspecialidad]);

  const medicoSeleccionado = useMemo(
    () => medicosPorEspecialidad.find((m) => m.id === selectedMedicoId) || null,
    [medicosPorEspecialidad, selectedMedicoId]
  );

  const handleConfirmarReserva = async () => {
    if (!medicoSeleccionado || !selectedDate || !selectedSlot) {
      showToast({
        type: 'warning',
        title: 'Selección incompleta',
        message: 'Por favor selecciona médico, fecha y franja horaria disponible.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const creada = await crearCita({
        paciente: user,
        medico: medicoSeleccionado,
        fechaISO: selectedDate,
        slot: selectedSlot,
        motivoConsulta,
        simularConflicto: simularConflicto409,
      });

      setCitaConfirmada(creada);
      showToast({
        type: 'success',
        title: 'Cita confirmada',
        message: `Cita confirmada con código ${creada.codigo_reserva}`,
      });
    } catch (err) {
      if (err.status === 409) {
        showToast({
          type: 'warning',
          title: 'Conflicto de horario (409 Conflict)',
          message: 'El turno seleccionado acaba de ser tomado por otro paciente',
          duration: 6000,
        });
        setSelectedSlot(null);
        setSimularConflicto409(false);
        setRefreshSlotsKey((prev) => prev + 1);
      } else {
        showToast({
          type: 'error',
          title: 'Error al reservar',
          message: err.message || 'No fue posible procesar tu reserva.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetFlujo = () => {
    setCitaConfirmada(null);
    setSelectedSlot(null);
    setMotivoConsulta('');
    setRefreshSlotsKey((prev) => prev + 1);
  };

  if (citaConfirmada) {
    return (
      <DashboardLayout
        title="Confirmación de Cita"
        subtitle="Presenta este código al llegar a tu consultorio o envíalo por WhatsApp."
      >
        <VoucherConfirmacion cita={citaConfirmada} onNuevaCita={handleResetFlujo} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Reservar Cita Médica"
      subtitle="Sigue los 4 pasos para agendar tu turno con confirmación inmediata."
      actions={
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 shadow-sm">
          <input
            type="checkbox"
            checked={simularConflicto409}
            onChange={(e) => setSimularConflicto409(e.target.checked)}
            className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
          />
          <Zap className="h-3.5 w-3.5 text-amber-600" />
          Simular Concurrencia (Error 409)
        </label>
      }
    >
      {simularConflicto409 && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            <strong>Modo Simulador 409 activo:</strong> Al pulsar &quot;Confirmar
            Reserva&quot;, el sistema simulará una reserva simultánea (violación GiST) y
            refrescará los slots sin recargar la página.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Pasos 1 al 4 */}
        <div className="lg:col-span-8 space-y-6">
          {/* Paso 1: Filtro por Especialidad */}
          <section className="card-surface p-5 sm:p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label
                htmlFor="select-especialidad"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900"
              >
                <Stethoscope className="h-4 w-4 text-sky-600" />
                1. Especialidad Médica
              </label>
              <span className="text-xs text-slate-500">
                {especialidades.length} áreas disponibles
              </span>
            </div>

            <select
              id="select-especialidad"
              value={especialidadId}
              onChange={(e) => setEspecialidadId(e.target.value)}
              className="input-field font-medium"
            >
              {especialidades.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nombre} — Consulta estándar ({esp.tiempoPromedio})
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {especialidades.map((esp) => {
                const active = Number(especialidadId) === esp.id;
                return (
                  <button
                    key={esp.id}
                    type="button"
                    onClick={() => setEspecialidadId(String(esp.id))}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {esp.nombre}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Paso 2: Selección de Médico */}
          <section className="card-surface p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                2. Selecciona el Profesional
              </h2>
              <span className="text-xs text-slate-500">
                {medicosPorEspecialidad.length} médico(s) activo(s)
              </span>
            </div>

            {loadingMedicos ? (
              <SkeletonLoader variant="cards" count={2} />
            ) : medicosPorEspecialidad.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No hay médicos activos en esta especialidad actualmente.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {medicosPorEspecialidad.map((med) => {
                  const isSelected = med.id === selectedMedicoId;
                  return (
                    <button
                      key={med.id}
                      type="button"
                      onClick={() => {
                        setSelectedMedicoId(med.id);
                        setSelectedSlot(null);
                      }}
                      className={`relative flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/40 ring-2 ring-sky-500/20'
                          : 'border-slate-200 bg-white hover:border-sky-300'
                      }`}
                    >
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold shrink-0 ${med.colorAvatar}`}
                      >
                        {med.iniciales}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {med.nombre}
                        </p>
                        <p className="text-xs font-medium text-sky-700">
                          {med.especialidad}
                        </p>
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500">
                          <Award className="h-3 w-3 text-slate-400 shrink-0" />
                          {med.tarjeta_profesional}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 truncate">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          {med.consultorio}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-white shrink-0">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Pasos 3 y 4: Calendario y Cuadrícula de Slots */}
          {medicoSeleccionado && (
            <section className="card-surface p-5 sm:p-6">
              <SelectorSlots
                medico={medicoSeleccionado}
                citas={citas}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
                refreshKey={refreshSlotsKey}
              />
            </section>
          )}
        </div>

        {/* Columna Derecha: Resumen y Confirmación */}
        <aside className="lg:col-span-4 card-surface p-5 sm:p-6 lg:sticky lg:top-24 space-y-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">
              Paso Final
            </span>
            <h2 className="mt-0.5 text-lg font-bold text-slate-900">
              Resumen de tu Cita
            </h2>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
            <div>
              <p className="text-xs text-slate-500">Paciente</p>
              <p className="font-semibold text-slate-900">
                {user?.nombre} {user?.apellido}
              </p>
            </div>

            <div className="border-t border-slate-200/70 pt-2.5">
              <p className="text-xs text-slate-500">Especialidad y Profesional</p>
              <p className="font-semibold text-slate-900">
                {medicoSeleccionado?.nombre || 'Por seleccionar'}
              </p>
              <p className="text-xs font-medium text-sky-700">
                {medicoSeleccionado?.especialidad}
              </p>
            </div>

            <div className="border-t border-slate-200/70 pt-2.5">
              <p className="text-xs text-slate-500">Fecha y Horario</p>
              {selectedSlot ? (
                <p className="font-semibold text-emerald-700">
                  {selectedDate} · {selectedSlot.label}
                </p>
              ) : (
                <p className="text-xs italic text-slate-400">
                  Selecciona una franja verde disponible
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="motivo-consulta"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Motivo de consulta (opcional)
            </label>
            <textarea
              id="motivo-consulta"
              rows={3}
              maxLength={500}
              value={motivoConsulta}
              onChange={(e) => setMotivoConsulta(e.target.value)}
              placeholder="Describe brevemente tus síntomas o el motivo de tu cita..."
              className="input-field resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleConfirmarReserva}
            disabled={submitting || !medicoSeleccionado || !selectedSlot}
            className="btn-primary w-full py-3 text-base"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Procesando...
              </>
            ) : (
              'Confirmar Reserva'
            )}
          </button>

          <p className="text-[11px] text-center text-slate-400 leading-relaxed">
            Puedes cancelar sin costo hasta 2 horas antes del inicio de tu consulta.
          </p>
        </aside>
      </div>
    </DashboardLayout>
  );
}

