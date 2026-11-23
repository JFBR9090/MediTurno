# Entregable 2: Implementar API REST — MediTurno
**Sprint 2 — Backend Funcional y Base de Datos**  
**Proyecto:** MediTurno — Sistema Web de Gestión y Programación de Citas Médicas  
**Framework:** Laravel 11.x (PHP 8.2+)  
**Formato de Comunicación:** JSON (`application/json; charset=UTF-8`)  
**Base URL:** `http://127.0.0.1:8000/api`

---

## 1. Arquitectura y Principios de Diseño RESTful

La API de MediTurno implementa una arquitectura orientada a recursos siguiendo las directrices estándar REST:

1. **Uso Semántico de Métodos HTTP:**
   - `GET`: Obtención y consulta segura e idempotente de información sin efectos colaterales.
   - `POST`: Creación de recursos (citas, médicos, especialidades, registros de usuario).
   - `PUT`: Actualización completa o transición de estado (reprogramaciones, edición de catálogos).
   - `PATCH`: Modificación parcial puntual (cambio de estado booleano / toggle de especialidades y médicos).
   - `DELETE`: Eliminación de franjas horarias o recursos específicos.
2. **Stateless y Sesión Segura:** La API transporta credenciales a través de cookies `HttpOnly` y `SameSite=Lax` con protección CSRF integrada, evitando almacenar JWT o tokens vulnerables en `localStorage`.
3. **Consistencia Transaccional (ACID):** Operaciones críticas como el agendamiento y la cancelación de citas se ejecutan dentro de bloques `DB::transaction()` para prevenir bloqueos mutuos o doble reserva concurrente.

---

## 2. Envoltorio Estándar de Respuesta (Envelope Pattern)

Todas las respuestas de la API siguen una estructura unificada y predecible:

### Respuesta Exitosa
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Cardiología"
  }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "error": "No tienes permisos para acceder a esta función.",
  "detalles": null
}
```

---

## 3. Catálogo de Códigos de Estado HTTP Implementados

| Código HTTP | Definición Estándar | Caso de Uso Específico en MediTurno |
| :---: | :--- | :--- |
| **`200 OK`** | Petición exitosa | Consultas (`GET`) y actualizaciones exitosas (`PUT`, `PATCH`). |
| **`201 Created`** | Recurso creado exitosamente | Alta de citas (`POST /api/citas`), registro de pacientes o especialidades. |
| **`400 Bad Request`** | Regla de negocio infringida | Intento de cancelar una cita con menos de 2 horas de anticipación. |
| **`401 Unauthorized`** | No autenticado | Petición a ruta protegida sin sesión activa en el Gatekeeper. |
| **`403 Forbidden`** | Sin autorización / Permisos insuficientes | Un paciente intentando acceder al módulo administrativo. |
| **`404 Not Found`** | Recurso inexistente | Cita, médico o especialidad con ID no registrado en la base de datos. |
| **`409 Conflict`** | Conflicto de concurrencia | Franja horaria ya ocupada o solapamiento en la agenda del profesional. |
| **`422 Unprocessable Entity`** | Error de validación semántica | Cédula repetida, correo mal formado o campos obligatorios faltantes. |
| **`429 Too Many Requests`** | Límite de tasa excedido | Bloqueo temporal por 5 intentos fallidos consecutivos de login. |

---

## 4. Mapa de Rutas de la API (`routes/api.php`)

### 4.1. Módulo de Autenticación (`/api/auth`)
- `POST /api/auth/login`: Autenticación con verificación de contraseña Bcrypt y Rate Limiting.
- `POST /api/auth/register`: Registro atómico de nuevos pacientes.
- `POST /api/auth/demo`: Autenticación rápida asistida para evaluación del instructor.
- `GET /api/auth/me`: Retorna los datos y rol del usuario en la sesión activa.
- `POST /api/auth/logout`: Cierre de sesión seguro e invalidación de cookies.

### 4.2. Módulo de Catálogos (`/api/...`)
- `GET /api/especialidades`: Catálogo de especialidades médicas (público).
- `POST /api/especialidades`: Crear especialidad médica (`role:administrador`).
- `PUT /api/especialidades/{id}`: Editar especialidad médica (`role:administrador`).
- `PATCH /api/especialidades/{id}/toggle`: Activar o desactivar especialidad (`role:administrador`).
- `GET /api/medicos`: Directorio de profesionales con especialidad y consultorio.
- `POST /api/medicos`: Registro de nuevos profesionales médicos (`role:administrador`).
- `PATCH /api/medicos/{id}/toggle`: Suspensión o reactivación médica (`role:administrador`).
- `GET /api/pacientes`: Directorio de pacientes registrados (`role:administrador`).
- `POST /api/pacientes`: Registro asistido de pacientes desde administración (`role:administrador`).

### 4.3. Módulo de Agendas y Disponibilidad (`/api/horarios/...`)
- `GET /api/horarios/{medico}/calendario`: Generación dinámica de días hábiles futuros según agenda.
- `GET /api/horarios/{medico}/disponibilidad`: Cálculo en tiempo real de slots (franjas de 30 min libres vs ocupadas).
- `GET /api/horarios/{medico}`: Consulta de configuración semanal de horarios.
- `POST /api/horarios/{medico}`: Crear franjas horarias semanales (`role:administrador,medico,profesional`).
- `DELETE /api/horarios/bloque/{id}`: Eliminar franja horaria (`role:administrador,medico,profesional`).
- `POST /api/horarios/{medico}/bloqueos`: Registrar bloqueos por vacaciones o ausencias.

### 4.4. Módulo Transaccional de Citas (`/api/citas/...`)
- `GET /api/citas`: Listado con aislamiento estricto por perfil (pacientes ven solo las suyas, médicos su agenda, administradores consolidado con métricas).
- `POST /api/citas`: Agendamiento transaccional de turnos médicos con control contra solapamiento.
- `PUT /api/citas/{id}/cancelar`: Anulación de cita con regla de negocio de mínimo 2 horas previas.
- `PUT /api/citas/{id}/reprogramar`: Cambio de fecha/hora verificando disponibilidad del profesional.
- `PUT /api/citas/{id}/estado`: Transición clínica (`confirmada`, `completada`, `no_asistio`).
- `GET /api/reportes/citas`: Reporte administrativo parametrizado por fecha, estado y profesional.

### 4.5. Módulo de Notificaciones (`/api/notificaciones`)
- `GET /api/notificaciones`: Notificaciones in-app del usuario autenticado.
- `POST /api/notificaciones/leer`: Marcar alertas como leídas.

---

## 5. Pruebas Automatizadas de la API REST

La API cuenta con una suite completa de pruebas de integración con PHPUnit / Laravel Test Runner:

```bash
cd backend
php artisan test
```

### Resultados de Ejecución
- **21 pruebas aprobadas** (100% de efectividad).
- **118 aserciones ejecutadas**.
- Cobertura de flujos principales: creación, validación de esquemas JSON, rechazo de solapamientos (409), reglas de negocio de tiempo (400) y segregación de perfiles (403).
