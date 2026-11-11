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

class AuthController extends Controller
{
    private const DEMO_EMAILS = [
        'paciente' => 'camila.restrepo@correo.co',
        'medico' => 'a.martinez@mediturno.co',
        'admin' => 'admin@mediturno.co',
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
        ]);

        $correo = mb_strtolower(trim($data['correo']));
        $user = User::where('email', $correo)->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'error' => 'Credenciales inválidas. Verifica tu correo y contraseña.',
            ], 401);
        }

        if (! $user->activo) {
            return response()->json([
                'success' => false,
                'error' => 'Tu cuenta se encuentra desactivada. Contacta al administrador.',
            ], 403);
        }

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
            'role' => ['required', 'string', 'in:paciente,medico,admin'],
        ]);

        $email = self::DEMO_EMAILS[$data['role']];
        $user = User::where('email', $email)->first();

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

