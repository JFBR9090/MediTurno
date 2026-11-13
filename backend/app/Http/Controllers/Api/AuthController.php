<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Paciente;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    private const DEMO_EMAILS = [
        'paciente' => 'carlos.mendoza@email.com',
        'profesional' => 'dr.ramirez@mediturno.com',
        'medico' => 'dr.ramirez@mediturno.com',
        'admin' => 'admin@mediturno.com',
        'administrador' => 'admin@mediturno.com',
    ];

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false, 'error' => 'Autenticación requerida.'], 401);
        }

        return response()->json([
            'success' => true,
            'user' => $user->toFrontendArray(),
        ]);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'correo' => ['required', 'email'],
            'password' => ['required', 'string', 'min:6'],
            'perfil' => ['nullable', 'string', 'in:paciente,profesional,medico,administrador,admin'],
        ]);

        $correo = mb_strtolower(trim($data['correo']));
        $throttleKey = 'login:' . $correo . '|' . $request->ip();

        // 1. Protección contra Fuerza Bruta (Rate Limiting)
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            return response()->json([
                'success' => false,
                'error' => "Demasiados intentos fallidos. Por seguridad, el acceso ha sido bloqueado temporalmente. Intenta nuevamente en {$seconds} segundos.",
                'retry_after' => $seconds,
            ], 429)->header('Retry-After', (string) $seconds);
        }

        $user = User::where('email', $correo)->first();

        // 2. Validación de credenciales con Hash seguro
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            RateLimiter::hit($throttleKey, 60);
            $restantes = RateLimiter::retriesLeft($throttleKey, 5);

            return response()->json([
                'success' => false,
                'error' => 'Credenciales inválidas. Verifica tu correo y contraseña.',
                'intentos_restantes' => $restantes,
            ], 401);
        }

        // 3. Validación de estado de la cuenta
        if (! $user->activo) {
            return response()->json([
                'success' => false,
                'error' => 'Tu cuenta se encuentra desactivada. Contacta al administrador.',
            ], 403);
        }

        // 4. Verificación de Perfil de Acceso Seleccionado (Pacientes, Profesionales, Administrador)
        if (! empty($data['perfil'])) {
            $perfilSolicitado = match ($data['perfil']) {
                'medico' => 'profesional',
                'admin' => 'administrador',
                default => $data['perfil'],
            };

            $esPerfilValido = match ($perfilSolicitado) {
                'paciente' => $user->isPaciente(),
                'profesional' => $user->isProfesional(),
                'administrador' => $user->isAdmin(),
                default => false,
            };

            if (! $esPerfilValido) {
                RateLimiter::hit($throttleKey, 60);

                $nombresPerfiles = [
                    'paciente' => 'Pacientes',
                    'profesional' => 'Profesionales Médicos',
                    'medico' => 'Profesionales Médicos',
                    'administrador' => 'Administrador',
                ];

                $perfilUsuarioTxt = $nombresPerfiles[$user->rol] ?? $user->rol;
                $perfilSolicitadoTxt = $nombresPerfiles[$perfilSolicitado] ?? $perfilSolicitado;

                return response()->json([
                    'success' => false,
                    'error' => "Acceso denegado: tu cuenta pertenece al perfil '{$perfilUsuarioTxt}', el cual no coincide con el perfil seleccionado ('{$perfilSolicitadoTxt}'). Por favor selecciona el perfil correspondiente.",
                ], 403);
            }
        }

        // 5. Autenticación exitosa: limpiar intentos y regenerar sesión contra session fixation
        RateLimiter::clear($throttleKey);
        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'user' => $user->toFrontendArray(),
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'min:2', 'max:100'],
            'apellido' => ['required', 'string', 'min:2', 'max:100'],
            'tipo_documento' => ['required', 'string', 'in:CC,TI,CE,PA'],
            'numero_documento' => ['required', 'string', 'regex:/^\d{5,15}$/', 'unique:pacientes,numero_documento'],
            'telefono' => ['required', 'string', 'regex:/^\d{7,15}$/'],
            'fecha_nacimiento' => ['required', 'date', 'before:today'],
            'correo' => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = DB::transaction(function () use ($data) {
            $correo = mb_strtolower(trim($data['correo']));
            $user = User::create([
                'rol' => 'paciente',
                'nombre' => trim($data['nombre']),
                'apellido' => trim($data['apellido']),
                'name' => trim($data['nombre']) . ' ' . trim($data['apellido']),
                'email' => $correo,
                'password' => $data['password'],
                'activo' => true,
            ]);

            Paciente::create([
                'user_id' => $user->id,
                'tipo_documento' => $data['tipo_documento'],
                'numero_documento' => trim($data['numero_documento']),
                'telefono' => trim($data['telefono']),
                'fecha_nacimiento' => $data['fecha_nacimiento'],
            ]);

            return $user;
        });

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'user' => $user->toFrontendArray(),
        ], 201);
    }

    public function demoLogin(Request $request): JsonResponse
    {
        $data = $request->validate([
            'role' => ['required', 'string', 'in:paciente,medico,profesional,admin,administrador'],
        ]);

        $roleKey = match ($data['role']) {
            'medico' => 'profesional',
            'administrador' => 'admin',
            default => $data['role'],
        };

        $email = self::DEMO_EMAILS[$roleKey] ?? self::DEMO_EMAILS['paciente'];
        $user = User::where('email', $email)->first();

        // Fallback si no está el demo específico
        if (! $user && $roleKey === 'profesional') {
            $user = User::where('email', 'a.martinez@mediturno.co')->first();
        }
        if (! $user && $roleKey === 'paciente') {
            $user = User::where('email', 'camila.restrepo@correo.co')->first();
        }
        if (! $user && $roleKey === 'admin') {
            $user = User::where('email', 'admin@mediturno.co')->first();
        }

        if (! $user) {
            return response()->json([
                'success' => false,
                'error' => 'Usuario demo no encontrado. Ejecuta los seeders.',
            ], 404);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'user' => $user->toFrontendArray(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['success' => true]);
    }
}
