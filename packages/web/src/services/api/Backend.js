// Mensajes para los errores que la API devuelve sin cuerpo.
const STATUS_MESSAGES = {
  400: 'La operación no es válida.',
  401: 'La sesión venció. Volvé a ingresar.',
  403: 'No tenés permiso para esta acción.',
  404: 'No encontramos el recurso solicitado.',
};

// Cliente HTTP de la API: agrega la API key, serializa el cuerpo en JSON
// y convierte las respuestas de error en excepciones con su estado HTTP.
// onUnauthorized se llama cuando un pedido con sesión recibe un 401, para
// que la aplicación cierre la sesión desde cualquier pantalla.
export class Backend {
  constructor({ apiKey, baseUrl, onUnauthorized } = {}) {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = apiKey;
    this.baseUrl = baseUrl || globalThis.location?.origin;
    this.onUnauthorized = onUnauthorized;
  }

  async fetch(url, { method = 'GET', body = null, headers = {} } = {}) {
    const response = await globalThis.fetch(new URL(url, this.baseUrl), {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        ...headers,
      },
      body: body === null ? null : JSON.stringify(body),
    });

    // Algunas operaciones (por ejemplo, cerrar sesión) responden 204 sin cuerpo.
    if (response.status === 204) {
      return null;
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const error = new Error(
        data?.error ||
          STATUS_MESSAGES[response.status] ||
          `Error de la API: ${response.status}`
      );

      error.status = response.status;

      // Solo cuenta como sesión vencida si el pedido llevaba token
      // (el ingreso no lo lleva).
      if (response.status === 401 && headers.Authorization) {
        this.onUnauthorized?.();
      }

      throw error;
    }

    return data;
  }

  get(url, options = {}) {
    return this.fetch(url, { ...options, method: 'GET' });
  }

  post(url, body = {}, options = {}) {
    return this.fetch(url, { ...options, method: 'POST', body });
  }

  put(url, body = {}, options = {}) {
    return this.fetch(url, { ...options, method: 'PUT', body });
  }

  patch(url, body = {}, options = {}) {
    return this.fetch(url, { ...options, method: 'PATCH', body });
  }

  delete(url, options = {}) {
    return this.fetch(url, { ...options, method: 'DELETE' });
  }
}
