# Especificación de Endpoints — API REST MediTurno
**Versión:** 1.0.0 — Sprint 2  
**Protocolo:** HTTP/1.1 y HTTP/2  
**Formato de Intercambio:** `application/json; charset=UTF-8`  
**Base URL Local:** `http://127.0.0.1:8000/api`  
**Manejo de Sesión:** Cookies `HttpOnly` firmadas con `credentials: 'include'` (sin tokens expuestos en `localStorage`).

---

## 1. Convenciones Globales de la API

### 1.1. Estructura Estándar de Respuesta (Envelope)

#### Respuesta Exitosa
```json
{
  "success": true,
  "data": { ... } // Objeto o array con los datos solicitados
}
```

#### Respuesta de Error
```json
{
  "success": false,
  "error": "Mensaje descriptivo del motivo del rechazo.",
  "detalles": { ... } // Opcional: detalle de validación por campo (HTTP 422)
}
```

### 1.2. Códigos de Estado HTTP Utilizados

| Código | Estado | Significado en MediTurno |
| :---: | :--- | :--- |
| **`200`** | `OK` | Consulta o actualización ejecutada exitosamente. |
| **`201`** | `Created` | Recurso creado con éxito (registro, cita agendada, especialidad nueva). |
| **`400`** | `Bad Request` | Petición inválida o regla de negocio violada (ej. cancelar fuera de tiempo). |
| **`401`** | `Unauthorized` | Se requiere autenticación para acceder a la ruta. |
| **`403`** | `Forbidden` | El usuario está autenticado pero su rol no tiene los permisos suficientes. |
| **`404`** | `Not Found` | El recurso solicitado no existe en la base de datos. |
| **`409`** | `Conflict` | Conflicto de concurrencia: franja horaria ocupada o cita ya existente. |
| **`422`** | `Unprocessable Entity` | Falla en las reglas de validación de los datos enviados. |
| **`429`** | `Too Many Requests` | Bloqueo temporal por tasa de peticiones excedida (fuerza bruta en login). |

---

## 2. Módulo 1: Autenticación y Gatekeeper (`/api/auth`)

### 2.1. Iniciar Sesión
- **Ruta:** `POST /api/auth/login`
- **Acceso:** Público
- **Descripción:** Valida credenciales contra hash Bcrypt, aplica rate limiting (máximo 5 intentos/minuto) y regenera la sesión contra ataques de Session Fixation.

#### Request Body
```json
{
  "correo": "admin@mediturno.com",
  "password": "password123",
  "perfil": "administrador" // Opcional: paciente | profesional | administrador
}
```

#### Respuestas
- **`200 OK`:**
```json
{
  "success": true,
  "user": {
    "id": 2,
    "rol": "administrador",
    "nombre": "Administrador",
    "apellido": "MediTurno",
    "correo": "admin@mediturno.com"
  }
}
```
- **`401 Unauthorized`:**
```json
{
  "success": false,
  "error": "Credenciales inválidas. Verifica tu correo y contraseña.",
  "intentos_restantes": 3
}
```
- **`429 Too Many Requests`:**
```json
{
  "success": false,
  "error": "Demasiados intentos fallidos. Por seguridad, el acceso ha sido bloqueado temporalmente. Intenta nuevamente en 58 segundos.",
  "retry_after": 58
}
```

---

### 2.2. Registro de Pacientes
- **Ruta:** `POST /api/auth/register`
- **Acceso:** Público
- **Descripción:** Crea atómicamente en una transacción DB el registro en `users` y en `pacientes`. Autentica automáticamente al nuevo usuario.

#### Request Body
```json
{
  "nombre": "Valentina",
  "apellido": "Rojas",
  "tipo_documento": "CC",
  "numero_documento": "1098765432",
  "telefono": "3109876543",
  "fecha_nacimiento": "1997-08-15",
  "correo": "valentina.rojas@correo.co",
  "password": "ClaveSegura2026"
}
```

#### Respuestas
- **`201 Created`:**
```json
{
  "success": true,
  "user": {
    "id": 22,
    "rol": "paciente",
    "nombre": "Valentina",
    "apellido": "Rojas",
    "correo": "valentina.rojas@correo.co",
    "paciente_id": 15
  }
}
```
- **`422 Unprocessable Entity`:** Duplicado de correo o cédula, formato inválido.

---

### 2.3. Acceso Rápido / Demo
- **Ruta:** `POST /api/auth/demo`
- **Acceso:** Público
- **Descripción:** Permite a evaluadores e instructores alternar instantáneamente entre los 3 perfiles del sistema para auditar el control de accesos RBAC.

#### Request Body
```json
{
  "role": "admin" // admin | profesional | paciente
}
```

#### Respuesta `200 OK`
```json
{
  "success": true,
  "user": {
    "id": 2,
    "rol": "administrador",
    "nombre": "Administrador",
    "apellido": "MediTurno",
    "correo": "admin@mediturno.com"
  }
}
```

---

### 2.4. Consultar Usuario Actual
- **Ruta:** `GET /api/auth/me`
- **Acceso:** Autenticado
- **Descripción:** Retorna los datos del usuario en sesión activa leyendo la cookie HttpOnly.

#### Respuesta `200 OK`
```json
{
  "success": true,
  "user": {
    "id": 2,
    "rol": "administrador",
    "nombre": "Administrador",
    "apellido": "MediTurno",
    "correo": "admin@mediturno.com"
  }
}
```

---

### 2.5. Cerrar Sesión
- **Ruta:** `POST /api/auth/logout`
- **Acceso:** Autenticado
- **Descripción:** Destruye la sesión en servidor, invalida cookies y regenera el token de seguridad.

#### Respuesta `200 OK`
```json
{
  "success": true
}
```

---

## 3. Módulo 2: Catálogos Médicos (`/api/especialidades`, `/api/medicos`, `/api/pacientes`)

### 3.1. Listar Especialidades
- **Ruta:** `GET /api/especialidades`
- **Acceso:** Público
- **Query Params:** `?solo_activas=true` (opcional, filtra catálogo activo).

#### Respuesta `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Cardiología",
      "descripcion": "Diagnóstico y tratamiento de enfermedades cardiovasculares.",
      "icono": "Heart",
      "tiempo_promedio_min": 30,
      "tiempoPromedio": "30 min",
      "activa": true,
      "medicos_count": 3
    }
  ]
}
```

---

### 3.2. Crear Especialidad (CRUD: Create)
- **Ruta:** `POST /api/especialidades`
- **Acceso:** Restringido a `administrador`

#### Request Body
```json
{
  "nombre": "Neurología",
  "descripcion": "Atención especializada del sistema nervioso central y periférico.",
  "tiempo_promedio_min": 45,
  "icono": "Brain"
}
```

#### Respuesta `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 10,
    "nombre": "Neurología",
    "descripcion": "Atención especializada del sistema nervioso central y periférico.",
    "tiempo_promedio_min": 45,
    "activa": true
  }
}
```

---

### 3.3. Actualizar Especialidad (CRUD: Update)
- **Ruta:** `PUT /api/especialidades/{especialidad}`
- **Acceso:** Restringido a `administrador`

#### Request Body
```json
{
  "nombre": "Neurología Avanzada",
  "descripcion": "Atención de alta complejidad neurológica.",
  "tiempo_promedio_min": 45
}
```

#### Respuesta `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 10,
    "nombre": "Neurología Avanzada",
    "descripcion": "Atención de alta complejidad neurológica.",
    "tiempo_promedio_min": 45,
    "activa": true
  }
}
```

---

### 3.4. Alternar Estado / Baja Lógica (CRUD: Delete)
- **Ruta:** `PATCH /api/especialidades/{especialidad}/toggle`
- **Acceso:** Restringido a `administrador`

#### Respuesta `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 10,
    "activa": false
  }
}
```

---

### 3.5. Listar Profesionales Médicos
- **Ruta:** `GET /api/medicos`
- **Acceso:** Público
- **Query Params:** `?solo_activos=true`

#### Respuesta `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Dr. Alejandro Martínez",
      "correo": "a.martinez@mediturno.co",
      "tarjeta_profesional": "TP-10892-COL",
      "especialidad_id": 1,
      "especialidad": "Cardiología",
      "consultorio": "Consultorio 301 - Torre Médica",
      "activo": true
    }
  ]
}
```

---

### 3.6. Crear Médico Asistencial (CRUD: Create)
- **Ruta:** `POST /api/medicos`
- **Acceso:** Restringido a `administrador`

#### Request Body
```json
{
  "nombre": "Dra. Natalia Gómez",
  "correo": "n.gomez@mediturno.co",
  "tarjeta_profesional": "TP-99881-COL",
  "especialidad_id": 1,
  "consultorio": "Consultorio 405",
  "duracion_cita_defecto_min": 30
}
```

#### Respuesta `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 12,
    "nombre": "Dra. Natalia Gómez",
    "correo": "n.gomez@mediturno.co",
    "especialidad": "Cardiología",
    "activo": true
  }
}
```

---

### 3.7. Listar Pacientes Registrados
- **Ruta:** `GET /api/pacientes`
- **Acceso:** Restringido a `administrador`

#### Respuesta `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Camila Restrepo",
      "correo": "camila.restrepo@correo.co",
      "tipo_documento": "CC",
      "numero_documento": "1023456789",
      "telefono": "3001234567",
      "citas_count": 4
    }
  ]
}
```

---

## 4. Módulo 3: Agendas y Disponibilidad Clínica (`/api/horarios`)

### 4.1. Calendario de Días Hábiles
- **Ruta:** `GET /api/horarios/{medico}/calendario`
- **Acceso:** Público
- **Query Params:** `?dias=14` (opcional, calcula los próximos N días hábiles según la agenda semanal configurada del médico).

#### Respuesta `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "iso": "2026-11-23",
      "dayNum": "23",
      "dayName": "Lun",
      "monthShort": "Nov",
      "isToday": false,
      "slots_libres": 8
    }
  ]
}
```

---

### 4.2. Disponibilidad de Franjas Horarias (30 min)
- **Ruta:** `GET /api/horarios/{medico}/disponibilidad`
- **Acceso:** Público
- **Query Params:** `?fecha=2026-11-23`
- **Descripción:** Motor de cálculo en tiempo real que cruza los bloques de atención, descuenta las citas ya agendadas y los bloqueos médicos, entregando las franjas libres y ocupadas.

#### Respuesta `200 OK`
```json
{
  "success": true,
  "fecha": "2026-11-23",
  "data": [
    {
      "inicio": "08:00",
      "fin": "08:30",
      "label": "08:00 AM",
      "libre": true
    },
    {
      "inicio": "08:30",
      "fin": "09:00",
      "label": "08:30 AM",
      "libre": false,
      "motivo": "Turno ya reservado"
    }
  ]
}
```

---

### 4.3. Configurar Franja Horaria (CRUD: Create)
- **Ruta:** `POST /api/horarios/{medico}`
- **Acceso:** `administrador` o el propio `medico`
- **Validación de Integridad:** Impide el solapamiento de horarios el mismo día (HTTP 409).

#### Request Body
```json
{
  "dia_semana": 1, // 1=Lunes a 7=Domingo
  "hora_inicio": "14:00",
  "hora_fin": "18:00"
}
```

#### Respuesta `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 15,
    "medico_id": 1,
    "dia_semana": 1,
    "hora_inicio": "14:00:00",
    "hora_fin": "18:00:00",
    "activo": true
  }
}
```

---

### 4.4. Eliminar Franja Horaria (CRUD: Delete)
- **Ruta:** `DELETE /api/horarios/bloque/{horario}`
- **Acceso:** `administrador` o el propio `medico`

#### Respuesta `200 OK`
```json
{
  "success": true
}
```

---

## 5. Módulo 4: Citas Médicas y Transacciones (`/api/citas`)

### 5.1. Listar Citas Médicas
- **Ruta:** `GET /api/citas`
- **Acceso:** Autenticado
- **Comportamiento por Rol:**
  - `paciente`: Consulta únicamente sus citas personales.
  - `medico`: Consulta su agenda clínica diaria/semanal.
  - `administrador`: Consulta todas las citas y recibe métricas globales consolidadas.

#### Respuesta `200 OK` (Admin con métricas)
```json
{
  "success": true,
  "data": [ ... ],
  "metricas": {
    "total_pacientes": 21,
    "medicos_activos": 9,
    "citas_agendadas": 15,
    "citas_atendidas": 38,
    "citas_canceladas": 4,
    "citas_hoy": 6
  }
}
```

---

### 5.2. Agendar Cita Médica (CRUD: Create)
- **Ruta:** `POST /api/citas`
- **Acceso:** `paciente` o `administrador`
- **Garantías ACID:** Ejecutada en `DB::transaction()` con bloqueo contra colisión para prevenir doble turno concurrente.

#### Request Body
```json
{
  "medico_id": 1,
  "especialidad_id": 1,
  "fecha": "2026-11-23",
  "hora_inicio": "09:00",
  "motivo_consulta": "Revisión rutinaria de presión arterial."
}
```

#### Respuestas
- **`201 Created`:**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "codigo_reserva": "MED-88312",
    "paciente_nombre": "Camila Restrepo",
    "medico_nombre": "Dr. Alejandro Martínez",
    "especialidad": "Cardiología",
    "fecha_hora_inicio": "2026-11-23 09:00:00",
    "estado": "programada"
  }
}
```
- **`409 Conflict`:** Si la franja acaba de ser tomada por otro usuario.

---

### 5.3. Cancelar Cita Médica (CRUD: Delete / Baja Lógica)
- **Ruta:** `PUT /api/citas/{cita}/cancelar`
- **Acceso:** Dueño de la cita (`paciente`) o `administrador`
- **Regla de Negocio:** La cancelación debe realizarse con mínimo **2 horas de anticipación** a la hora pactada.

#### Request Body
```json
{
  "motivo": "Cruce de horario con jornada laboral."
}
```

#### Respuestas
- **`200 OK`:** Cita cancelada y franja liberada inmediatamente en la agenda del médico.
- **`400 Bad Request`:** Si faltan menos de 120 minutos para la cita.

---

### 5.4. Reprogramar Cita Médica (CRUD: Update)
- **Ruta:** `PUT /api/citas/{cita}/reprogramar`
- **Acceso:** Dueño de la cita (`paciente`) o `administrador`
- **Regla de Negocio:** Mínimo 2 horas de anticipación; valida disponibilidad de la nueva fecha.

#### Request Body
```json
{
  "fecha": "2026-11-25",
  "hora_inicio": "10:30",
  "motivo": "Imprevisto personal."
}
```

---

### 5.5. Actualizar Estado Clínico (CRUD: Update)
- **Ruta:** `PUT /api/citas/{cita}/estado`
- **Acceso:** `medico` asignado a la cita o `administrador`
- **Estados posibles:** `confirmada`, `completada`, `no_asistio`.
- **Auditoría:** Genera registro en `historial_citas` y emite notificación al paciente.

#### Request Body
```json
{
  "estado": "completada"
}
```

---

### 5.6. Reportes Clínicos y Administrativos
- **Ruta:** `GET /api/reportes/citas`
- **Acceso:** Restringido a `administrador`
- **Filtros soportados:** `?fecha_desde=2026-11-01&fecha_hasta=2026-11-30&estado=completada&medico_id=1`

---

## 6. Módulo 5: Notificaciones In-App (`/api/notificaciones`)

### 6.1. Consultar Notificaciones
- **Ruta:** `GET /api/notificaciones`
- **Acceso:** Autenticado
- **Descripción:** Retorna las notificaciones del usuario logueado con contador de no leídas (`unreadCount`).

---

### 6.2. Marcar Notificaciones como Leídas
- **Ruta:** `POST /api/notificaciones/leer`
- **Acceso:** Autenticado
- **Request Body (Opcional):**
```json
{
  "notificacion_id": 5 // Si se omite, marca todas como leídas
}
```
- **Respuesta `200 OK`:** `{ "success": true }`
