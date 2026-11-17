import { useCallback, useEffect, useState } from 'react';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { Alert, Card, Heading, Spinner } from '../components/UI';

import { ROLES as ROLE_NAMES, ROLE_LABELS } from '../../../app/roles';

import '../admin.css';

const ROLES = Object.values(ROLE_NAMES);

export default function AdminUsers({ usersService, currentUserId }) {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('player');

  const [editing, setEditing] = useState(null);
  const [confirmingRemove, setConfirmingRemove] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('player');

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Obtener usuarios
  const load = useCallback(async () => {
    const data = await usersService.getUsers();
    setUsers(data);
  }, [usersService]);

  // Cargar usuarios al entrar
  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setLoading(true);
      setError('');

      try {
        const data = await usersService.getUsers();

        if (!cancelled) {
          setUsers(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [usersService]);

  // Ejecutar operaciones
  async function run(task, done) {
    if (busy) return;

    setBusy(true);
    setError('');
    setSuccess('');

    try {
      await task();
      await load();
      setSuccess(done);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  // Issue #42: crear usuario
  function create(e) {
    e.preventDefault();

    if (!email.trim() || !password) return;

    run(async () => {
      await usersService.createUser({
        email: email.trim(),
        password,
        role,
      });

      setEmail('');
      setPassword('');
      setRole('player');
    }, 'Usuario creado correctamente.');
  }

  // Issue #43: modificar usuario
  function save(e) {
    e.preventDefault();

    if (!editing) return;

    // El admin no puede cambiarse su propio rol: perdería el acceso.
    const editingSelf = editing.id === currentUserId;
    const changes = {};

    if (!editingSelf) {
      changes.role = newRole;
    }

    if (newPassword) {
      changes.password = newPassword;
    }

    if (Object.keys(changes).length === 0) {
      setError('No hay cambios para guardar.');
      return;
    }

    run(async () => {
      await usersService.updateUser(editing.id, changes);

      setEditing(null);
      setNewPassword('');
    }, 'Usuario actualizado correctamente.');
  }

  // Issue #44: eliminar usuario
  function remove(user) {
    if (!currentUserId || user.id === currentUserId) {
      return;
    }

    setConfirmingRemove(user);
  }

  async function confirmRemove() {
    await run(
      () => usersService.removeUser(confirmingRemove.id),
      'Usuario eliminado correctamente.'
    );
    setConfirmingRemove(null);
  }

  return (
    <div className="admin-users">
      <Heading
        title="Usuarios"
        subtitle="Administración de cuentas y permisos."
      />

      <Alert error={error} success={success} />

      {/* Crear usuario */}
      <Card>
        <h2>Crear usuario</h2>

        <form className="form three-fields" onSubmit={create}>
          <div>
            <label htmlFor="user-email">Correo electrónico</label>

            <input
              id="user-email"
              type="email"
              autoComplete="off"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@correo.com"
              disabled={busy}
            />
          </div>

          <div>
            <label htmlFor="user-pass">Contraseña</label>

            <input
              id="user-pass"
              type="password"
              autoComplete="new-password"
              required
              minLength={1}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
            />
          </div>

          <div>
            <label htmlFor="user-role">Rol</label>

            <select
              id="user-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={busy}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={busy}>
            Crear usuario
          </button>
        </form>
      </Card>

      {/* Listado de usuarios */}
      <Card>
        <h2>Usuarios registrados ({users.length})</h2>

        {loading ? (
          <Spinner />
        ) : users.length === 0 ? (
          <p className="muted">No hay usuarios para mostrar.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.email}</strong>
                      <p className="muted small">{user.id}</p>
                    </td>

                    <td>{ROLE_LABELS[user.role] ?? user.role}</td>

                    <td>
                      <div className="inline">
                        <button
                          type="button"
                          className="btn btn-outline btn-small"
                          disabled={busy}
                          onClick={() => {
                            setEditing(user);
                            setNewRole(user.role);
                            setNewPassword('');
                          }}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="btn btn-ghost btn-small danger"
                          disabled={
                            busy || !currentUserId || user.id === currentUserId
                          }
                          onClick={() => remove(user)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal para modificar usuarios */}
      {editing && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => {
            if (!busy) setEditing(null);
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="edit-title">Editar {editing.email}</h2>

            <form className="form" onSubmit={save}>
              <label htmlFor="edit-role">Rol</label>

              <select
                id="edit-role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                disabled={busy || editing.id === currentUserId}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>

              {editing.id === currentUserId && (
                <p className="small muted">
                  No podés cambiar tu propio rol, para no perder el acceso de
                  administrador.
                </p>
              )}

              <label htmlFor="edit-password">Nueva contraseña (opcional)</label>

              <input
                id="edit-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Dejar vacío para mantener"
                disabled={busy}
              />

              <div className="inline">
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={busy}
                  onClick={() => setEditing(null)}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={busy}
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmingRemove && (
        <ConfirmDialog
          title="Eliminar usuario"
          message={`${confirmingRemove.email} ya no va a poder ingresar a la aplicación.`}
          confirmLabel="Eliminar"
          busy={busy}
          onConfirm={confirmRemove}
          onCancel={() => setConfirmingRemove(null)}
        />
      )}
    </div>
  );
}
