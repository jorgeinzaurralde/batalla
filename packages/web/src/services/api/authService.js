import { backend, sessionOptions } from './client';
import { withMessages } from './errors';

async function login(email, password) {
  const result = await withMessages(
    backend.put('/api/me/session', { email, password }),
    { 400: 'Correo o contraseña incorrectos.' }
  );

  const user = await backend.get('/api/me', sessionOptions(result.token));

  return {
    token: result.token,
    user,
  };
}

async function restore(token) {
  if (!token) {
    return null;
  }

  const user = await backend.get('/api/me', sessionOptions(token));

  return {
    token,
    user,
  };
}

async function logout(token) {
  await backend.delete('/api/me/session', sessionOptions(token));
}

export const authService = {
  login,
  restore,
  logout,
};
