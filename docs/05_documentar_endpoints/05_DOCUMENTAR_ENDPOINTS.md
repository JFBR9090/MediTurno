# Entregable 5: Documentar Endpoints — MediTurno
**Sprint 2 — Backend Funcional y Base de Datos**  
**Proyecto:** MediTurno — Sistema Web de Gestión y Programación de Citas Médicas  
**Formato de Especificación:** Manual de Endpoints + Colección Postman v2.1.0  
**Herramientas Compatibles:** Postman, Thunder Client, Insomnia, cURL  
**Base URL:** `http://127.0.0.1:8000/api`

---

## 1. Resumen Ejecutivo del Entregable

Este entregable provee la documentación técnica y los artefactos de prueba de los **18 endpoints** que conforman la API RESTful de MediTurno. 

Para facilitar la evaluación por parte del instructor, se entregan dos recursos complementarios:
1. **Manual Técnico de Endpoints ([`API_ENDPOINTS.md`](./API_ENDPOINTS.md)):** Detalle exhaustivo de rutas, métodos, headers, parámetros, cuerpos JSON de petición y respuestas para cada código HTTP.
2. **Colección Postman Exportable ([`MediTurno_API.postman_collection.json`](./MediTurno_API.postman_collection.json)):** Colección oficial lista para importar en Postman y ejecutar pruebas funcionales automatizadas con 1 solo clic.

---

## 2. Estructura de la Colección de Postman

La colección [`MediTurno_API.postman_collection.json`](./MediTurno_API.postman_collection.json) se encuentra organizada en 6 carpetas temáticas:

```
MediTurno API — Sprint 2
├── 1. Healthcheck
│   └── GET /api/health (Estado del servidor y latencia MySQL)
├── 2. Autenticación y Gatekeeper
│   ├── POST /api/auth/demo (Login rápido de Administrador)
│   ├── POST /api/auth/demo (Login rápido de Profesional Médico)
│   ├── POST /api/auth/demo (Login rápido de Paciente)
│   ├── POST /api/auth/login (Login manual con Rate Limiting)
│   ├── POST /api/auth/register (Registro de nuevo paciente)
│   ├── GET /api/auth/me (Consulta de sesión activa)
│   └── POST /api/auth/logout (Cierre de sesión)
├── 3. Catálogos y Especialidades (CRUD)
│   ├── GET /api/especialidades (Catálogo público)
│   ├── POST /api/especialidades (Crear especialidad - Admin)
│   ├── PUT /api/especialidades/1 (Editar especialidad - Admin)
│   ├── PATCH /api/especialidades/1/toggle (Activar/Desactivar)
│   ├── GET /api/medicos (Directorio médico)
│   └── GET /api/pacientes (Directorio de pacientes - Admin)
├── 4. Agendas y Disponibilidad
│   ├── GET /api/horarios/1/calendario (Próximos días hábiles)
│   ├── GET /api/horarios/1/disponibilidad (Cálculo de slots 30 min)
│   └── POST /api/horarios/1 (Crear franja horaria semanal)
├── 5. Citas Médicas y Transacciones (CRUD)
│   ├── GET /api/citas (Listado filtrado por rol)
│   ├── POST /api/citas (Agendamiento transaccional ACID)
│   ├── PUT /api/citas/1/reprogramar (Cambio de fecha con regla > 2h)
│   ├── PUT /api/citas/1/estado (Atención médica: completada/inasistencia)
│   ├── PUT /api/citas/1/cancelar (Baja lógica con regla > 2h)
│   └── GET /api/reportes/citas (Consolidado administrativo)
└── 6. Notificaciones In-App
    ├── GET /api/notificaciones (Alertas del usuario)
    └── POST /api/notificaciones/leer (Marcar como leídas)
```

---

## 3. Guía Paso a Paso para el Evaluador / Instructor

### Paso 1: Levantar el Servidor Backend
Asegúrate de que Apache y MySQL estén iniciados en XAMPP, luego abre una terminal en la carpeta del proyecto y ejecuta:
```bash
cd backend
php artisan serve
```
El servidor responderá en `http://127.0.0.1:8000`.

### Paso 2: Importar la Colección en Postman
1. Abre la aplicación **Postman**.
2. Haz clic en el botón **`Import`** (esquina superior izquierda).
3. Selecciona el archivo:
   [`docs/05_documentar_endpoints/MediTurno_API.postman_collection.json`](./MediTurno_API.postman_collection.json).
4. La colección se importará con el nombre **`MediTurno API — Sprint 2`** y la variable `{{baseUrl}}` preconfigurada en `http://127.0.0.1:8000/api`.

### Paso 3: Flujo de Prueba Recomendado
1. **Verificar conexión:** Ejecutar `1. Healthcheck / Healthcheck & Database Status` $\rightarrow$ debe retornar `HTTP 200` y estado `CONNECTED`.
2. **Autenticar como Administrador:** Ejecutar `2. Autenticación y Gatekeeper / Demo Login (Administrador)` $\rightarrow$ Postman guardará automáticamente la cookie de sesión `mediturno_session`.
3. **Probar el CRUD de Especialidades:**
   - Ejecutar `Crear Especialidad (Admin)` $\rightarrow$ Retorna `HTTP 201 Created`.
   - Ejecutar `Editar Especialidad (Admin)` $\rightarrow$ Retorna `HTTP 200 OK`.
   - Ejecutar `Activar o Desactivar Especialidad` $\rightarrow$ Retorna `HTTP 200 OK` con `activa: false`.
4. **Probar Disponibilidad y Agendamiento:**
   - Ejecutar `4. Agendas / Consultar Disponibilidad de Franjas` $\rightarrow$ Retorna slots libres y ocupados en tiempo real.
   - Ejecutar `5. Citas / Agendar Cita Médica` $\rightarrow$ Retorna `HTTP 201 Created` con código de reserva `MED-XXXXX`.
5. **Probar Regla de Cancelación de 2 Horas:**
   - Ejecutar `5. Citas / Cancelar Cita Médica` $\rightarrow$ Retorna `HTTP 200 OK` si cumple la regla de anticipación.

---

## 4. Archivos Anexos en esta Carpeta

- [`API_ENDPOINTS.md`](./API_ENDPOINTS.md): Documento técnico completo con la descripción pormenorizada de cada uno de los 18 endpoints, formatos de entrada, respuestas y cabeceras.
- [`MediTurno_API.postman_collection.json`](./MediTurno_API.postman_collection.json): Archivo JSON de la colección Postman v2.1.0 listo para importar.
