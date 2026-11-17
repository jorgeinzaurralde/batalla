import { apiFetch } from './client';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

// Ingreso con correo y contraseña. La app mobile es solo para jugadores.
export async function login(email, password) {
  if (!API_BASE_URL || !API_KEY) {
    throw new Error('Falta configurar la URL del backend o la API key.');
  }

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL.replace(/\/+$/, '')}/api/me/session`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      }
    );
  } catch {
    throw new Error('No se pudo conectar con el servidor.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // La API explica el error en inglés; para el ingreso alcanza con esto.
    if (response.status === 400 || response.status === 401) {
      throw new Error('Correo o contraseña incorrectos.');
    }

    if (typeof data?.error === 'string') {
      throw new Error(data.error);
    }

    if (response.status === 404) {
      throw new Error('Revisá la URL del backend y la API key.');
    }

    throw new Error(`No se pudo iniciar sesión (${response.status}).`);
  }

  if (!data || typeof data.token !== 'string' || !data.token) {
    throw new Error('El servidor devolvió una respuesta de login inválida.');
  }

  if (data.role !== 'player') {
    throw new Error(
      'Esta aplicación permite el acceso únicamente a jugadores.'
    );
  }

  return {
    email: data.email,
    role: data.role,
    token: data.token,
    userId: data.userId,
  };
}

// Recupera la sesión guardada al abrir la aplicación.
export function restore(token) {
  return apiFetch('/api/me', { token });
}

export async function logout(token) {
  await apiFetch('/api/me/session', { method: 'DELETE', token });
}
