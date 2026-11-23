# Entregable 3: Desarrollar Autenticación y Autorización — MediTurno
**Sprint 2 — Backend Funcional y Base de Datos**  
**Proyecto:** MediTurno — Sistema Web de Gestión y Programación de Citas Médicas  
**Mecanismo:** Laravel Session / HttpOnly Cookies / Gatekeeper RBAC  
**Hashing de Claves:** Bcrypt (12 rondas de costo)

---

## 1. Arquitectura de Seguridad y Autenticación

MediTurno rechaza expresamente el almacenamiento de tokens JWT o claves de sesión en `localStorage` o `sessionStorage`, debido a su vulnerabilidad inherente frente a ataques de Cross-Site Scripting (XSS).

En su lugar, el sistema implementa una arquitectura basada en **Cookies de Sesión HttpOnly**:

1. **Atributo `HttpOnly`:** La cookie no es accesible mediante scripts de JavaScript en el navegador, mitigando el robo de identidad por XSS.
2. **Atributo `SameSite=Lax`:** Protege contra ataques de Cross-Site Request Forgery (CSRF).
3. **Regeneración de Sesión (`Session Fixation Mitigation`):** Tras cada inicio de sesión exitoso (`Auth::login`), el sistema ejecuta `$request->session()->regenerate()` para invalidar identificadores previos.
4. **Cifrado de Contraseñas:** Las credenciales se almacenan mediante `Hash::make()` utilizando el algoritmo **Bcrypt con factor de costo 12**.

---

## 2. Protección Contra Ataques de Fuerza Bruta (Rate Limiting)

Para proteger la integridad de las cuentas médicas y administrativas, el endpoint `POST /api/auth/login` incorpora una barrera de limitación de tasa basada en la clave compuesta:

$$\text{throttleKey} = \text{hash}(\text{correo} + \text{IP})$$

- **Límite:** 5 intentos fallidos permitidos en una ventana móvil de 60 segundos.
- **Acción:** Si se supera el límite, el sistema bloquea de inmediato las peticiones adicionales y retorna un código **`HTTP 429 Too Many Requests`**.
- **Respuesta estándar:**
  ```json
  {
    "success": false,
    "error": "Demasiados intentos fallidos. Por seguridad, el acceso ha sido bloqueado temporalmente. Intenta nuevamente en 58 segundos.",
    "retry_after": 58
  }
  ```
- **Cabecera HTTP:** `Retry-After: 58`

---

## 3. Matriz de Control de Acceso Basado en Roles (RBAC)

El sistema define 3 roles de usuario con segregación estricta de privilegios:

| Módulo / Acción | Paciente (`paciente`) | Profesional Médico (`profesional`/`medico`) | Administrador (`administrador`/`admin`) |
| :--- | :---: | :---: | :---: |
| **Consultar especialidades y médicos** | ✅ Permitido | ✅ Permitido | ✅ Permitido |
| **Agendar citas médicas** | ✅ Permitido | ❌ Denegado | ✅ Permitido |
| **Cancelar / Reprogramar citas propias (> 2h)** | ✅ Permitido | ❌ Denegado | ✅ Permitido |
| **Cancelar citas ajenas o forzadas** | ❌ Denegado | ❌ Denegado | ✅ Permitido |
| **Gestionar horarios y descansos propios** | ❌ Denegado | ✅ Permitido | ✅ Permitido |
| **Modificar horarios de otros médicos** | ❌ Denegado | ❌ Denegado | ✅ Permitido |
| **Actualizar estado clínico (`completada`, etc.)** | ❌ Denegado | ✅ Solo sus pacientes | ✅ Permitido |
| **Crear / Editar / Desactivar especialidades** | ❌ Denegado | ❌ Denegado | ✅ Permitido |
| **Crear médicos y asignar consultorio** | ❌ Denegado | ❌ Denegado | ✅ Permitido |
| **Consultar reportes y métricas consolidadas** | ❌ Denegado | ❌ Denegado | ✅ Permitido |

---

## 4. Middleware de Autorización (`EnsureUserHasRole.php`)

El middleware interceptor inspecciona la solicitud entrante y ejecuta las siguientes comprobaciones en secuencia:

```php
public function handle(Request $request, Closure $next, string ...$roles): Response
{
    $user = $request->user();

    // 1. Verificación de autenticación previa
    if (! $user) {
        return response()->json([
            'success' => false,
            'error' => 'Autenticación requerida. Inicia sesión para acceder.',
        ], 401);
    }

    if (empty($roles)) {
        return $next($request);
    }

    // 2. Administradores tienen acceso irrestricto
    if ($user->isAdmin()) {
        return $next($request);
    }

    // 3. Verificación de rol con normalización de alias
    if ($user->hasRole($roles)) {
        return $next($request);
    }

    // 4. Denegación de acceso si el rol no coincide
    return response()->json([
        'success' => false,
        'error' => 'Acceso denegado. No tienes permisos para acceder a esta función.',
    ], 403);
}
```

### Normalización de Identificadores de Rol
El modelo [`User.php`](../../backend/app/Models/User.php) normaliza de forma bidireccional los identificadores comunes para garantizar robustez:
- `'admin'` $\leftrightarrow$ `'administrador'`
- `'medico'` $\leftrightarrow$ `'profesional'`

---

## 5. Pruebas Automatizadas de Seguridad (`SeguridadAutenticacionTest.php`)

Para auditar y demostrar al instructor el funcionamiento del esquema de seguridad, se construyó una suite de pruebas automatizadas:

| Caso de Prueba | Método en Test | Resultado |
| :--- | :--- | :---: |
| **Login exitoso para los 3 perfiles** | `test_login_exitoso_para_los_tres_perfiles_con_validacion_de_perfil` | `PASSED` |
| **Rechazo cuando el rol no coincide** | `test_rechazo_cuando_las_credenciales_no_coinciden_con_el_perfil_seleccionado` | `PASSED` |
| **Bloqueo por Fuerza Bruta (HTTP 429)** | `test_proteccion_contra_fuerza_bruta_bloqueo_despues_de_cinco_intentos_fallidos` | `PASSED` |
| **Segregación estricta de permisos RBAC** | `test_segregacion_estricta_de_permisos_por_perfil` | `PASSED` |
| **Cierre de sesión seguro** | `test_cierre_de_sesion_seguro` | `PASSED` |

Comando para ejecutar las pruebas de seguridad:
```bash
cd backend
php artisan test --filter=SeguridadAutenticacionTest
```
