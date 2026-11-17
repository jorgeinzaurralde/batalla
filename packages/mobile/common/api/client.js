const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

const STATUS_MESSAGES = {
  400: 'La operación no es válida.',
  401: 'La sesión venció. Volvé a ingresar.',
  403: 'No tenés permiso para esta acción.',
  404: 'No encontramos el recurso solicitado.',
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Misma URL que usa login() en authService.js.
function buildUrl(path) {
  if (!BASE_URL) {
    throw new Error('Falta configurar EXPO_PUBLIC_API_BASE_URL.');
  }

  return `${BASE_URL.replace(/\/+$/, '')}${path}`;
}

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  if (!API_KEY) {
    throw new Error('Falta configurar EXPO_PUBLIC_API_KEY.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(buildUrl(path), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      'No pudimos conectarnos al servidor. Revisá tu conexión.',
      0
    );
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(
      data?.error ||
        STATUS_MESSAGES[response.status] ||
        `Error de la API: ${response.status}`,
      response.status
    );
  }

  return data;
}
