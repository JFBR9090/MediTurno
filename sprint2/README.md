# Entregables Sprint 2 — MediTurno
**Proyecto:** MediTurno — Sistema Web de Gestión y Programación de Citas Médicas  
**Programa de Formación:** ADSO / Ciclo de Desarrollo de Software (SENA)  
**Estado:** Backend Funcional y Base de Datos Completa (21/21 Pruebas Aprobadas)

Esta carpeta contiene los documentos técnicos individuales y separados requeridos para la evaluación del **Sprint 2**, organizados de acuerdo con las instrucciones del instructor:

---

## Índice de Documentos del Sprint 2

| # | Entregable Solicitado | Documento Principal | Descripción del Contenido | Artefactos Técnicos Anexos |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **Crear base de datos** | [`01_CREAR_BASE_DE_DATOS.md`](./01_CREAR_BASE_DE_DATOS.md) | Diagrama Entidad-Relación (ERD) en Mermaid, diseño físico en 3FN, diccionario de datos con las 9 tablas clínicas y guía de importación. | [`mediturno_database.sql`](./mediturno_database.sql) |
| **2** | **Implementar API REST** | [`02_IMPLEMENTAR_API_REST.md`](./02_IMPLEMENTAR_API_REST.md) | Arquitectura RESTful en Laravel 11, mapa de 18 rutas, convención de envoltorio JSON (`success`, `data`, `error`), catálogo de códigos HTTP (`200`, `201`, `400`, `401`, `403`, `404`, `409`, `422`, `429`) y transacciones ACID. | — |
| **3** | **Desarrollar autenticación y autorización** | [`03_AUTENTICACION_Y_AUTORIZACION.md`](./03_AUTENTICACION_Y_AUTORIZACION.md) | Cifrado Bcrypt (12 rondas), Rate Limiting contra fuerza bruta con cabecera `Retry-After`, cookies seguras `HttpOnly`, matriz RBAC para Administrador, Médico y Paciente, y middleware `EnsureUserHasRole`. | Evidencias en `SeguridadAutenticacionTest.php` |
| **4** | **Implementar operaciones CRUD** | [`04_OPERACIONES_CRUD.md`](./04_OPERACIONES_CRUD.md) | Matriz completa de operaciones Create, Read, Update y Delete sobre Especialidades, Médicos, Horarios, Pacientes y Citas Médicas, con justificación legal/técnica de la baja lógica clínica. | Evidencias en `PlanPruebasMvpTest.php` |
| **5** | **Documentar endpoints** | [`05_DOCUMENTAR_ENDPOINTS.md`](./05_DOCUMENTAR_ENDPOINTS.md) | Manual técnico de especificación de los 18 endpoints REST y guía paso a paso para que el instructor pruebe el backend en Postman. | [`MediTurno_API.postman_collection.json`](./MediTurno_API.postman_collection.json)<br>[`API_ENDPOINTS_DETALLE.md`](./API_ENDPOINTS_DETALLE.md) |

---

## Instrucciones Rápidas para el Evaluador / Instructor

1. **Base de Datos:**
   - Puede importarse el script listo en MySQL o phpMyAdmin: [`mediturno_database.sql`](./mediturno_database.sql).
   - O regenerarse con migraciones y seeders de Laravel:
     ```bash
     cd backend
     php artisan migrate:fresh --seed
     ```
2. **Servidor Backend:**
   ```bash
   cd backend
   php artisan serve
   ```
3. **Pruebas en Postman:**
   - Importar la colección [`MediTurno_API.postman_collection.json`](./MediTurno_API.postman_collection.json) en Postman.
   - Ejecutar la carpeta `2. Autenticación / Demo Login (Administrador)` para autenticar la sesión automáticamente mediante cookies `HttpOnly`.
4. **Verificación Automatizada de Pruebas:**
   ```bash
   cd backend
   php artisan test
   ```
   *Resultado:* **21 pruebas aprobadas (118 aserciones)** que validan el 100% de la funcionalidad de este Sprint 2.
