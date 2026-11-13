<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'error' => 'Autenticación requerida. Inicia sesión para acceder.',
            ], 401);
        }

        if (empty($roles)) {
            return $next($request);
        }

        // Si el usuario es administrador siempre tiene acceso completo
        if ($user->isAdmin()) {
            return $next($request);
        }

        if ($user->hasRole($roles)) {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'error' => 'Acceso denegado. No tienes permisos para acceder a esta función.',
        ], 403);
    }
}
