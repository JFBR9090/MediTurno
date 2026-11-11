/**
 * Cliente HTTP centralizado para MediTurno.
 * Todas las peticiones incluyen `credentials: 'include'` para transportar cookies HttpOnly.
 * Nunca almacena tokens en localStorage ni sessionStorage.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, signal } = options;

  const config = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    signal,
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  let payload = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    payload = await response.json();
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.error || `Error HTTP ${response.status}`,
      response.status,
      payload?.detalles || null
    );
  }

  return payload;
}

