<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false, 'error' => 'Autenticación requerida.'], 401);
        }

        $items = Notificacion::query()
            ->where('user_id', $user->id)
            ->orderByDesc('id')
            ->limit(15)
            ->get()
            ->map(fn (Notificacion $n) => [
                'id' => $n->id,
                'titulo' => $n->titulo,
                'mensaje' => $n->mensaje,
                'leida' => $n->leida,
                'fecha' => $n->created_at?->diffForHumans() ?? 'Reciente',
            ]);

        return response()->json(['success' => true, 'data' => $items]);
    }

    public function marcarLeidas(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false, 'error' => 'Autenticación requerida.'], 401);
        }

        Notificacion::query()
            ->where('user_id', $user->id)
            ->where('leida', false)
            ->update(['leida' => true]);

        return response()->json(['success' => true]);
    }
}

