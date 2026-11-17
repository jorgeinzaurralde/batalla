import { describe, expect, it } from 'vitest';

import { withMessages } from '../../src/services/api/errors';

function apiError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

describe('withMessages', () => {
  it('devuelve el resultado si el pedido sale bien', async () => {
    await expect(
      withMessages(Promise.resolve({ id: 't1' }), { 400: 'No.' })
    ).resolves.toEqual({ id: 't1' });
  });

  it('traduce el error 400 de la operación al español', async () => {
    const request = Promise.reject(
      apiError(400, 'User has participated in matches')
    );

    await expect(
      withMessages(request, {
        400: 'No se puede eliminar un usuario que participó en partidas.',
      })
    ).rejects.toMatchObject({
      status: 400,
      message: 'No se puede eliminar un usuario que participó en partidas.',
    });
  });

  it('puede elegir el mensaje según el error original', async () => {
    const request = Promise.reject(
      apiError(400, 'Both fleets must be placed before shooting')
    );
    const message = (error) =>
      error.message.startsWith('Both fleets') ? 'Faltan flotas.' : 'Otro.';

    await expect(withMessages(request, { 400: message })).rejects.toMatchObject(
      { message: 'Faltan flotas.' }
    );
  });

  it('deja pasar los errores que no tienen traducción', async () => {
    const request = Promise.reject(apiError(403, 'No tenés permiso.'));

    await expect(withMessages(request, { 400: 'No.' })).rejects.toMatchObject({
      status: 403,
      message: 'No tenés permiso.',
    });
  });
});
