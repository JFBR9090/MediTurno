# Documentación Oficial — MediTurno
**Sistema Web de Gestión y Programación de Citas Médicas**  
**Proyecto Formativo SENA — ADSO / Ciclo de Desarrollo de Software**

Esta carpeta contiene la documentación técnica, funcional, arquitectónica y de base de datos requerida para el cumplimiento de los hitos del proyecto, con énfasis en el **Sprint 2: Backend Funcional, Base de Datos, Autenticación y API REST**.

---

## Índice de Entregables del Sprint 2

| Entregable | Archivo | Descripción | Formato |
| :--- | :--- | :--- | :---: |
| **Especificación de Requisitos** | [SRS_MediTurno.md](./SRS_MediTurno.md) | Documento formal IEEE 830 / SENA con historias de usuario, reglas de negocio y alcance del MVP. | Markdown |
| **Documentación de Endpoints** | [API_ENDPOINTS.md](./API_ENDPOINTS.md) | Manual de referencia técnica de los 18 endpoints REST (Auth, Catálogos, Horarios, Citas y Notificaciones). | Markdown |
| **Diccionario de Datos** | [DICCIONARIO_DE_DATOS.md](./DICCIONARIO_DE_DATOS.md) | Diagrama Entidad-Relación (ERD) en Mermaid y ficha técnica de las 9 tablas del dominio clínico. | Markdown / ERD |
| **Volcado Físico de Base de Datos** | [mediturno_database.sql](./mediturno_database.sql) | Script SQL ejecutable en MySQL / MariaDB / phpMyAdmin con DDL (tablas, FK) y DML (seeders iniciales). | SQL plano UTF-8 |
| **Colección de Pruebas API** | [MediTurno_API.postman_collection.json](./MediTurno_API.postman_collection.json) | Colección exportable Postman v2.1.0 organizada en 6 módulos para evaluación asistida en 1 clic. | JSON (Postman) |

---

## Guía Rápida para el Evaluador / Instructor

1. **Importación de Base de Datos:**
   - Puede ejecutarse directamente en MySQL CLI o phpMyAdmin usando [mediturno_database.sql](./mediturno_database.sql), o recrearse con Laravel mediante:
     ```bash
     cd backend
     php artisan migrate --seed
     ```
2. **Levantar el Servidor Backend:**
   ```bash
   cd backend
   php artisan serve
   ```
3. **Prueba de Endpoints con Postman:**
   - Abra Postman $\rightarrow$ `Import` $\rightarrow$ seleccione [MediTurno_API.postman_collection.json](./MediTurno_API.postman_collection.json).
   - Ejecute primero `2. Autenticación y Gatekeeper / Demo Login (Administrador)` para autenticar la sesión.
   - Las cookies de sesión se transportan automáticamente en las peticiones posteriores.
4. **Ejecución de Pruebas Automatizadas:**
   ```bash
   cd backend
   php artisan test
   ```
   *Resultado esperado:* 21 pruebas aprobadas (118 aserciones) cubriendo validación de perfiles, prevención de fuerza bruta, RBAC, transacciones ACID y control de solapamiento.
