# Entregable 1: Crear Base de Datos — MediTurno
**Sprint 2 — Backend Funcional y Base de Datos**  
**Proyecto:** MediTurno — Sistema Web de Gestión y Programación de Citas Médicas  
**Motor:** MySQL 8.0 / MariaDB 10.4 | **Collation:** `utf8mb4_unicode_ci` | **Base de Datos:** `mediturno`

---

## 1. Resumen Ejecutivo del Entregable
Este entregable comprende el diseño físico, normalización (3FN), integridad referencial y poblado de la base de datos relacional del sistema **MediTurno**. 

La base de datos está completamente construida y operativa tanto a través de **migraciones y seeders de Laravel 11 (Code-First)** como mediante un **script SQL físico independiente (`mediturno_database.sql`)** ejecutable en cualquier gestor (phpMyAdmin, MySQL Workbench, DBeaver o línea de comandos).

---

## 2. Diagrama Entidad-Relación (ERD)

```mermaid
erDiagram
    USERS ||--o| PACIENTES : "1:1 tiene perfil"
    USERS ||--o| MEDICOS : "1:1 tiene perfil"
    USERS ||--o{ NOTIFICACIONES : "1:N recibe"
    ESPECIALIDADES ||--o{ MEDICOS : "1:N categoriza"
    ESPECIALIDADES ||--o{ CITAS : "1:N clasifica"
    MEDICOS ||--o{ HORARIOS_ATENCION : "1:N define jornada"
    MEDICOS ||--o{ BLOQUEOS_HORARIO : "1:N registra ausencia"
    MEDICOS ||--o{ CITAS : "1:N atiende"
    PACIENTES ||--o{ CITAS : "1:N solicita"
    CITAS ||--o{ HISTORIAL_CITAS : "1:N audita"
    CITAS ||--o{ NOTIFICACIONES : "1:N genera alerta"
    USERS ||--o{ HISTORIAL_CITAS : "1:N autoriza cambio"

    USERS {
        bigint id PK
        enum rol "administrador, profesional, medico, paciente"
        varchar nombre
        varchar apellido
        varchar email UK
        varchar password "Hash Bcrypt"
        tinyint activo "1=Activo, 0=Inactivo"
        timestamp created_at
        timestamp updated_at
    }

    ESPECIALIDADES {
        bigint id PK
        varchar nombre UK
        text descripcion
        varchar icono
        int tiempo_promedio_min "15, 20, 30, 45, 60"
        tinyint activa
        timestamp created_at
        timestamp updated_at
    }

    PACIENTES {
        bigint id PK
        bigint user_id FK,UK
        enum tipo_documento "CC, TI, CE, PA"
        varchar numero_documento UK
        varchar telefono
        date fecha_nacimiento
        timestamp created_at
        timestamp updated_at
    }

    MEDICOS {
        bigint id PK
        bigint user_id FK,UK
        bigint especialidad_id FK
        varchar tarjeta_profesional UK
        varchar consultorio
        int duracion_cita_defecto_min
        text biografia
        tinyint activo
        timestamp created_at
        timestamp updated_at
    }

    HORARIOS_ATENCION {
        bigint id PK
        bigint medico_id FK
        tinyint dia_semana "1=Lun a 7=Dom"
        time hora_inicio
        time hora_fin
        tinyint activo
        timestamp created_at
        timestamp updated_at
    }

    BLOQUEOS_HORARIO {
        bigint id PK
        bigint medico_id FK
        datetime fecha_hora_inicio
        datetime fecha_hora_fin
        varchar motivo
        timestamp created_at
        timestamp updated_at
    }

    CITAS {
        bigint id PK
        varchar codigo_reserva UK
        bigint paciente_id FK
        bigint medico_id FK
        bigint especialidad_id FK
        datetime fecha_hora_inicio INDEX
        datetime fecha_hora_fin
        enum estado "programada, confirmada, completada, cancelada, no_asistio"
        text motivo_consulta
        text notas_medicas
        datetime cancelada_en
        text motivo_cancelacion
        bigint cancelada_por_user_id FK
        timestamp created_at
        timestamp updated_at
    }

    HISTORIAL_CITAS {
        bigint id PK
        bigint cita_id FK
        bigint usuario_responsable_id FK
        varchar estado_anterior
        varchar estado_nuevo
        text observaciones
        timestamp created_at
        timestamp updated_at
    }

    NOTIFICACIONES {
        bigint id PK
        bigint user_id FK
        bigint cita_id FK
        varchar titulo
        text mensaje
        tinyint leida
        timestamp leida_en
        timestamp created_at
        timestamp updated_at
    }
```

---

## 3. Tablas del Dominio Clínico

| Tabla | Propósito Funcional | Restricciones Clave |
| :--- | :--- | :--- |
| **`users`** | Control centralizado de credenciales, roles y activación de usuarios. | `email` único, contraseña Bcrypt de 12 rondas. |
| **`especialidades`** | Catálogo asistencial (Cardiología, Pediatría, etc.) con tiempos estándar. | `nombre` único. |
| **`pacientes`** | Perfil médico y legal de pacientes según normatividad colombiana. | `user_id` único (1:1), `numero_documento` único. |
| **`medicos`** | Perfil asistencial del personal médico, consultorio y registro profesional. | `user_id` único (1:1), `tarjeta_profesional` única. |
| **`horarios_atencion`** | Definición de bloques semanales de disponibilidad médica. | `medico_id` FK, `dia_semana` (1-7), validación de no solapamiento. |
| **`bloqueos_horario`** | Novedades, vacaciones e incapacidades médicas que inhabilitan turnos. | `medico_id` FK, rango de fecha/hora. |
| **`citas`** | Transacciones de reserva, máquina de estados y ciclo de atención médica. | `codigo_reserva` único, índices en `fecha_hora_inicio` y `estado`. |
| **`historial_citas`** | Auditoría y trazabilidad inmutable de cada cambio de estado médico. | `cita_id` FK, `usuario_responsable_id` FK. |
| **`notificaciones`** | Alertas y notificaciones in-app para confirmación y recordatorios. | `user_id` FK, `cita_id` FK opcional. |

---

## 4. Tablas de Soporte e Infraestructura del Framework

1. **`sessions`:** Sesiones de usuario almacenadas en MySQL (`SESSION_DRIVER=database`), transportadas por cookies seguras `HttpOnly` y `SameSite=Lax`.
2. **`cache` y `cache_locks`:** Persistencia de contadores de Rate Limiting (mitigación contra fuerza bruta en inicios de sesión).
3. **`jobs` y `failed_jobs`:** Cola de tareas asíncronas para procesamiento en segundo plano.
4. **`migrations`:** Historial de versiones ejecutadas en la base de datos.

---

## 5. Instrucciones de Importación y Puesta en Marcha

### Opción A: Importación mediante Script SQL Plano (Recomendada para Evaluación)
1. Abrir **phpMyAdmin** (`http://localhost/phpmyadmin`) o la consola de MySQL.
2. Crear la base de datos o importar directamente el archivo:
   - Archivo: [`mediturno_database.sql`](./mediturno_database.sql)
3. Comando por consola:
   ```bash
   mysql -u root -p < docs/01_crear_base_de_datos/mediturno_database.sql
   ```
4. El script creará la base de datos `mediturno`, generará todas las tablas con sus llaves foráneas y sembrará los registros de prueba de médicos, especialidades, usuarios y citas.

### Opción B: Ejecución mediante Migraciones y Seeders de Laravel
```bash
cd backend
php artisan migrate:fresh --seed
```

---

## 6. Archivos Anexos en esta Carpeta

- [`mediturno_database.sql`](./mediturno_database.sql): Volcado completo ejecutable (DDL + DML) en formato UTF-8.
- [`DICCIONARIO_DE_DATOS.md`](./DICCIONARIO_DE_DATOS.md): Ficha técnica detallada campo por campo con tipos, nulos, llaves y descripciones.
