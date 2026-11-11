# MediTurno — Sistema de Gestión de Citas Médicas

Aplicación web integral para la administración de **pacientes**, **profesionales**, **agendas** y **citas médicas**, construida con **Laravel 11 + MySQL** en el backend y **React 18 + Vite + Tailwind CSS** en el frontend.

## Módulos Implementados
- **Pacientes:** registro con validación, inicio de sesión seguro mediante cookies `HttpOnly`, historial de citas y cancelación con regla mínima de 2 horas de anticipación.
- **Profesionales:** directorio médico por especialidad, tarjeta profesional, habilitación/desactivación y agenda diaria del médico (`completada`, `no_asistio`).
- **Agendas y Disponibilidad (`AgendaDisponibilidadService`):** generación dinámica de calendarios de días hábiles y cálculo en tiempo real de franjas disponibles descontando citas activas y bloqueos de horario.
- **Citas:** reserva atómica transaccional en MySQL (`DB::transaction` + `lockForUpdate`) con prevención de solapamientos (`409 Conflict`), código único `MT-YYYYMM-XXXX`, voucher con confirmación por WhatsApp Web y trazabilidad en `historial_citas`.

## Requisitos
- PHP >= 8.2 y Composer
- MySQL >= 8.0 (o MariaDB)
- Node.js >= 18 y npm (opcional si deseas reconstruir el frontend)

## Instalación y Puesta en Marcha

1. **Crear las bases de datos en MySQL:**
   ```sql
   CREATE DATABASE IF NOT EXISTS mediturno CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE DATABASE IF NOT EXISTS mediturno_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Configurar el Backend (Laravel):**
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   ```

3. **Ejecutar Pruebas Automatizadas (Calendarios, Disponibilidad y Concurrencia):**
   ```bash
   cd backend
   php artisan test
   ```

4. **Iniciar Servidor:**
   ```bash
   cd backend
   php artisan serve
   ```
   Abrir en el navegador: `http://127.0.0.1:8000`
