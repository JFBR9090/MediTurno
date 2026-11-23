# Documentación Oficial — MediTurno
**Sistema Web de Gestión y Programación de Citas Médicas**  
**Proyecto Formativo SENA — ADSO / Ciclo de Desarrollo de Software**

Este repositorio contiene la entrega integral del **Sprint 2: Backend Funcional, Base de Datos, Autenticación, Operaciones CRUD y Documentación de Endpoints**.

Cada entregable solicitado por el instructor ha sido organizado de manera modular en una carpeta separada con su respectivo documento formal, artefactos técnicos y guías de evaluación.

---

## Estructura de Entregables del Sprint 2

| # | Entregable del Instructor | Carpeta en Repositorio | Documento Principal | Artefactos Técnicos Anexos | Estado |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **1** | **Crear base de datos** | [`docs/01_crear_base_de_datos/`](./01_crear_base_de_datos/) | [`01_CREAR_BASE_DE_DATOS.md`](./01_crear_base_de_datos/01_CREAR_BASE_DE_DATOS.md) | • [`mediturno_database.sql`](./01_crear_base_de_datos/mediturno_database.sql)<br>• [`DICCIONARIO_DE_DATOS.md`](./01_crear_base_de_datos/DICCIONARIO_DE_DATOS.md) | 🟢 **100% Completo** |
| **2** | **Implementar API REST** | [`docs/02_implementar_api_rest/`](./02_implementar_api_rest/) | [`02_IMPLEMENTAR_API_REST.md`](./02_implementar_api_rest/02_IMPLEMENTAR_API_REST.md) | • Catálogo de 18 rutas RESTful<br>• Envelope JSON estándar<br>• Códigos HTTP (200, 201, 400, 401, 403, 404, 409, 422, 429) | 🟢 **100% Completo** |
| **3** | **Desarrollar autenticación y autorización** | [`docs/03_autenticacion_y_autorizacion/`](./03_autenticacion_y_autorizacion/) | [`03_AUTENTICACION_Y_AUTORIZACION.md`](./03_autenticacion_y_autorizacion/03_AUTENTICACION_Y_AUTORIZACION.md) | • Cifrado Bcrypt (12 rondas)<br>• Rate Limiting (anti fuerza bruta)<br>• Cookies `HttpOnly`<br>• RBAC (Admin, Médico, Paciente)<br>• Middleware `EnsureUserHasRole` | 🟢 **100% Completo** |
| **4** | **Implementar operaciones CRUD** | [`docs/04_operaciones_crud/`](./04_operaciones_crud/) | [`04_OPERACIONES_CRUD.md`](./04_operaciones_crud/04_OPERACIONES_CRUD.md) | • CRUD Especialidades<br>• CRUD Horarios y Médicos<br>• CRUD Pacientes<br>• CRUD Transaccional Citas Médicas<br>• Justificación técnica de baja lógica clínica | 🟢 **100% Completo** |
| **5** | **Documentar endpoints** | [`docs/05_documentar_endpoints/`](./05_documentar_endpoints/) | [`05_DOCUMENTAR_ENDPOINTS.md`](./05_documentar_endpoints/05_DOCUMENTAR_ENDPOINTS.md) | • [`API_ENDPOINTS.md`](./05_documentar_endpoints/API_ENDPOINTS.md)<br>• [`MediTurno_API.postman_collection.json`](./05_documentar_endpoints/MediTurno_API.postman_collection.json) | 🟢 **100% Completo** |

---

## Documentos Generales de Referencia

- **Especificación de Requisitos de Software:** [`docs/SRS_MediTurno.md`](./SRS_MediTurno.md) (IEEE 830 / Formato SENA v1.0.1).

---

## Verificación y Pruebas Automatizadas

El backend cuenta con una suite completa de pruebas unitarias y de integración que validan automáticamente cada uno de los 5 entregables:

```bash
cd backend
php artisan test
```

**Resultado de la verificación:**
- **21 pruebas aprobadas** (100% de éxito).
- **118 aserciones aprobadas**.
- Validación de autenticación por roles, prevención de solapamientos (HTTP 409), regla de cancelación de 2 horas (HTTP 400), rate limiting (HTTP 429) y operaciones CRUD.
