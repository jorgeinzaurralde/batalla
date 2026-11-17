import { afterEach, describe, expect, it, vi } from 'vitest';

import { Backend } from '../../src/services/api/Backend';

// Comportamiento común de la API (sección 6.5 de la letra): x-api-key en
// todas las rutas, token Bearer, cuerpos JSON y errores con estado HTTP.

const backend = new Backend({
  apiKey: 'clave-de-prueba',
  baseUrl: 'https://api.ejemplo.com',
});

function mockFetch(response) {
  const fetch = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

function jsonResponse(status, body) {
  return {
    ok: status < 400,
    status,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Backend', () => {
  it('exige una API key', () => {
    expect(() => new Backend({ baseUrl: 'https://api.ejemplo.com' })).toThrow();
  });

  it('envía la API key, el token y el cuerpo en JSON', async () => {
    const fetch = mockFetch(jsonResponse(201, { id: 'inv-1' }));

    const result = await backend.put(
      '/api/invitations',
      { invitedUser: 'u2', tournament: 't1' },
      { headers: { Authorization: 'Bearer token-de-prueba' } }
    );

    const [url, options] = fetch.mock.calls[0];
    expect(String(url)).toBe('https://api.ejemplo.com/api/invitations');
    expect(options.method).toBe('PUT');
    expect(options.headers['x-api-key']).toBe('clave-de-prueba');
    expect(options.headers.Authorization).toBe('Bearer token-de-prueba');
    expect(JSON.parse(options.body)).toEqual({
      invitedUser: 'u2',
      tournament: 't1',
    });
    expect(result).toEqual({ id: 'inv-1' });
  });

  it('acepta respuestas 204 sin contenido', async () => {
    mockFetch({ ok: true, status: 204 });

    await expect(backend.delete('/api/me/session')).resolves.toBeNull();
  });

  it('usa el mensaje de la API en los errores 400', async () => {
    mockFetch(jsonResponse(400, { error: 'Invitation already accepted' }));

    await expect(
      backend.post('/api/invitations/i1/accept')
    ).rejects.toMatchObject({
      status: 400,
      message: 'Invitation already accepted',
    });
  });

  it('traduce los errores que llegan sin contenido', async () => {
    mockFetch(jsonResponse(401));
    await expect(backend.get('/api/me')).rejects.toMatchObject({
      status: 401,
      message: 'La sesión venció. Volvé a ingresar.',
    });

    mockFetch(jsonResponse(403));
    await expect(backend.get('/api/users')).rejects.toMatchObject({
      status: 403,
      message: 'No tenés permiso para esta acción.',
    });
  });
});

describe('sesión vencida', () => {
  const withToken = { headers: { Authorization: 'Bearer token-vencido' } };

  function backendWithHandler() {
    const onUnauthorized = vi.fn();
    const client = new Backend({
      apiKey: 'clave-de-prueba',
      baseUrl: 'https://api.ejemplo.com',
      onUnauthorized,
    });

    return { client, onUnauthorized };
  }

  it('avisa a la aplicación cuando la API rechaza el token', async () => {
    const { client, onUnauthorized } = backendWithHandler();
    mockFetch(jsonResponse(401, { error: 'Authentication required' }));

    await expect(client.get('/api/users', withToken)).rejects.toMatchObject({
      status: 401,
    });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('no avisa si el pedido no llevaba token, como el ingreso', async () => {
    const { client, onUnauthorized } = backendWithHandler();
    mockFetch(jsonResponse(401));

    await expect(
      client.put('/api/me/session', { email: 'a@b.com', password: 'x' })
    ).rejects.toMatchObject({ status: 401 });
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('no avisa ante otros errores', async () => {
    const { client, onUnauthorized } = backendWithHandler();
    mockFetch(jsonResponse(403));

    await expect(client.get('/api/users', withToken)).rejects.toMatchObject({
      status: 403,
    });
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
