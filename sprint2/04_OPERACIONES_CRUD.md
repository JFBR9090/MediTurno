# Entregable 4: Implementar Operaciones CRUD — MediTurno
**Sprint 2 — Backend Funcional y Base de Datos**  
**Proyecto:** MediTurno — Sistema Web de Gestión y Programación de Citas Médicas  
**Alcance:** Matriz de Operaciones Create, Read, Update y Delete sobre las entidades del sistema.

---

## 1. Resumen de Operaciones CRUD por Entidad

El sistema implementa operaciones completas de creación, consulta, modificación y baja/eliminación sobre todas las entidades centrales del modelo de negocio:

| Entidad | Create (Crear) | Read (Consultar) | Update (Actualizar) | Delete (Eliminar / Baja Lógica) |
| :--- | :--- | :--- | :--- | :--- |
| **Especialidades** | `POST /api/especialidades` | `GET /api/especialidades` | `PUT /api/especialidades/{id}` | `PATCH /api/especialidades/{id}/toggle` (Baja lógica) |
| **Médicos** | `POST /api/medicos` | `GET /api/medicos` | `PATCH /api/medicos/{id}/toggle` | `PATCH /api/medicos/{id}/toggle` (Desactivación) |
| **Horarios Médicos**| `POST /api/horarios/{medico}` | `GET /api/horarios/{medico}` | `POST` (Ajuste de duración) | `DELETE /api/horarios/bloque/{id}` (Borrado físico) |
| **Pacientes** | `POST /api/auth/register`<br>`POST /api/pacientes` | `GET /api/pacientes` | Modificación de perfil | Control de estado activo en `users` |
| **Citas Médicas** | `POST /api/citas` (Transaccional) | `GET /api/citas` (Aislamiento RBAC) | `PUT /api/citas/{id}/reprogramar`<br>`PUT /api/citas/{id}/estado` | `PUT /api/citas/{id}/cancelar` (Baja lógica auditada) |

---

## 2. Detalle de Operaciones CRUD

### 2.1. Entidad: Especialidades Médicas
Catálogo base de las ramas asistenciales disponibles en la clínica.

- **Create (`POST /api/especialidades`):**
  - Permite al Administrador registrar una nueva especialidad médica.
  - Valida unicidad de nombre (`unique:especialidades,nombre`) y duración estándar (15, 20, 30, 45, 60 min).
  - Retorna código HTTP `201 Created`.
- **Read (`GET /api/especialidades`):**
  - Consulta pública de especialidades con conteo de médicos activos vinculados.
  - Soporta el parámetro `?solo_activas=true`.
- **Update (`PUT /api/especialidades/{id}`):**
  - Permite al Administrador modificar nombre, descripción y tiempos promedio.
  - Valida que el nombre no colisione con otra especialidad existente.
  - Retorna código HTTP `200 OK`.
- **Delete / Baja Lógica (`PATCH /api/especialidades/{id}/toggle`):**
  - Alterna el estado operativo (`activa = 0` o `activa = 1`).
  - Permite inhabilitar una especialidad sin eliminarla físicamente, previniendo la orfandad de registros históricos.

---

### 2.2. Entidad: Horarios de Atención Semanal
Franjas de disponibilidad clínica por profesional de la salud.

- **Create (`POST /api/horarios/{medico}`):**
  - Crea un bloque de horario semanal (ej. Lunes de 08:00 a 12:00).
  - **Control contra colisiones:** Si la nueva franja se superpone con un horario ya configurado para ese mismo día, la API rechaza la petición con código **`HTTP 409 Conflict`**.
- **Read (`GET /api/horarios/{medico}`):**
  - Retorna todos los bloques semanales configurados del médico.
- **Delete Físico (`DELETE /api/horarios/bloque/{id}`):**
  - Elimina físicamente el bloque de horario seleccionado (`$horario->delete()`).
  - Restringido al Administrador o al médico titular de la agenda.

---

### 2.3. Entidad: Citas Médicas (Transaccional con Auditoría)
La entidad de mayor relevancia operativa del sistema.

- **Create (`POST /api/citas`):**
  - Ejecución atómica en `DB::transaction()`.
  - Genera automáticamente un código único de reserva (ej. `MED-48201`).
  - Verifica que la franja horaria esté libre tanto en la agenda semanal como en la tabla de citas. Si otro usuario intenta reservar concurrentemente el mismo slot, rechaza con **`HTTP 409 Conflict`**.
  - Emite notificación automática al paciente.
- **Read (`GET /api/citas`):**
  - Lectura filtrada y segregada por RBAC:
    - Pacientes: Visualizan exclusivamente su propio historial.
    - Médicos: Visualizan su agenda asistencial.
    - Administradores: Visualizan el consolidado con tablero de métricas.
- **Update 1 — Reprogramación (`PUT /api/citas/{id}/reprogramar`):**
  - Permite modificar la fecha y hora de la cita.
  - Valida disponibilidad en la nueva fecha y hora.
  - Exige la regla de negocio de **mínimo 2 horas de anticipación**.
- **Update 2 — Transición de Estado Clínico (`PUT /api/citas/{id}/estado`):**
  - Permite al médico marcar la cita como `completada` o registrar `no_asistio`.
  - Crea un registro inmutable en `historial_citas` con la identidad del médico responsable y la hora exacta.
- **Delete / Cancelación (`PUT /api/citas/{id}/cancelar`):**
  - Realiza la anulación de la cita y libera de inmediato el turno en la agenda.
  - Exige regla de negocio de **mínimo 2 horas de anticipación** (retorna `HTTP 400 Bad Request` si el tiempo es inferior).

---

## 3. Justificación de Arquitectura Médica: ¿Por qué Baja Lógica en Citas?

> [!IMPORTANT]
> En sistemas de información en salud (HIS) y bajo la normatividad sanitaria vigente (Resolución 1995 de 1999 e ISO 27799 sobre seguridad en salud), **los registros de citas e historias médicas no deben eliminarse físicamente (`DELETE FROM citas`)** por las siguientes razones:
> 1. **Trazabilidad Legal:** La anulación debe conservar quién la solicitó, cuándo y bajo qué motivo (`cancelada_en`, `motivo_cancelacion`, `cancelada_por_user_id`).
> 2. **Integridad de Auditoría:** Toda modificación debe generar un registro inmutable en la tabla `historial_citas`.
> 3. **Liberación Inmediata de Agenda:** Al cambiar el estado a `cancelada`, el motor de disponibilidad descuenta la cita y permite que otro paciente reserve ese espacio libremente.

---

## 4. Evidencia de Pruebas Automatizadas del CRUD

Las operaciones CRUD están respaldadas por pruebas automatizadas en [`PlanPruebasMvpTest.php`](../../backend/tests/Feature/PlanPruebasMvpTest.php):

- `test_cp01_registrar_paciente_valido` (CRUD Create Paciente)
- `test_cp05_y_cp06_consultar_profesionales_y_horarios` (CRUD Read Médicos y Horarios)
- `test_cp07_cp08_y_cp09_reservar_disponible_rechazar_ocupado_y_rechazar_pasado` (CRUD Create Cita y 409)
- `test_cp10_y_cp14_cancelar_y_reprogramar_cita` (CRUD Update/Delete Citas con regla de 2 horas)
- `test_admin_gestiona_especialidades_pacientes_y_horarios_sin_solapamiento` (CRUD Completo Admin)
- `test_admin_edita_especialidad` (CRUD Update Especialidad con HTTP 200)

Comando para ejecutar la verificación del CRUD:
```bash
cd backend
php artisan test --filter=PlanPruebasMvpTest
```
