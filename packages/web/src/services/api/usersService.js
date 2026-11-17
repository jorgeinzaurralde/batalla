import { backend, sessionOptions } from './client';
import { withMessages } from './errors';

// Usuarios de la aplicación. Listar lo pueden hacer organizadores y admins;
// crear, modificar y eliminar, solo admins.
export function createUsersService(token) {
  const options = sessionOptions(token);
  const byId = (id) => encodeURIComponent(id);

  function getUsers() {
    return backend.get('/api/users', options);
  }

  function createUser(data) {
    return withMessages(backend.put('/api/users', data, options), {
      400: 'No se pudo crear el usuario: revisá que el correo no esté registrado.',
    });
  }

  // Solo se puede cambiar la contraseña o el rol.
  function updateUser(id, changes) {
    return withMessages(
      backend.patch(`/api/users/${byId(id)}`, changes, options),
      { 400: 'Los datos del usuario no son válidos.' }
    );
  }

  function removeUser(id) {
    return withMessages(backend.delete(`/api/users/${byId(id)}`, options), {
      400: 'No se puede eliminar un usuario que participó en partidas.',
    });
  }

  return {
    getUsers,
    createUser,
    updateUser,
    removeUser,
  };
}
