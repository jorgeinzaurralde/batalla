import { Backend } from './Backend';

// Qué hacer cuando la API rechaza la sesión (lo define App al iniciar).
let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

// Cliente HTTP único de la aplicación: todos los services lo usan.
export const backend = new Backend({
  apiKey: import.meta.env.VITE_API_KEY,
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  onUnauthorized: () => unauthorizedHandler?.(),
});

export function sessionOptions(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}
