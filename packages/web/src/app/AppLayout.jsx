import { Link, NavLink, Outlet } from 'react-router-dom';

import { APP_BASE, NAV_ITEMS } from './navigation';
import { ROLE_LABELS, hasRole } from './roles';

// Estructura común a todos los roles: menú lateral, mensajes y contenido.
export default function AppLayout({ user, onLogout, player }) {
  const { data, loading, pending, error, notice, retry, dismissNotice } =
    player;

  const roleLabel = ROLE_LABELS[user.role];

  return (
    <div className="jp-app">
      <aside className="jp-sidebar">
        <Link className="jp-brand" to={APP_BASE}>
          <span aria-hidden="true">◎</span>
          <span>Batalla Naval</span>
        </Link>

        <p className="jp-nav-label">Tu puerto</p>

        <nav className="jp-nav" aria-label="Navegación principal">
          {NAV_ITEMS.filter((item) => hasRole(user, item.roles)).map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="jp-user">
          <strong>{user.email}</strong>
          <span>{roleLabel}</span>

          <button className="jp-logout" type="button" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="jp-main">
        <header className="jp-topbar">
          <span>Estrategia en el mar</span>
          <strong>{roleLabel}</strong>
        </header>

        <main className="jp-content">
          {notice && (
            <div className="jp-notice">
              <p role="status">{notice}</p>

              <button
                type="button"
                onClick={dismissNotice}
                aria-label="Cerrar mensaje"
              >
                ×
              </button>
            </div>
          )}

          {error && (
            <section className="jp-card" role="alert">
              <p className="jp-error">{error}</p>

              <button
                className="jp-button jp-button-secondary"
                type="button"
                disabled={loading || pending}
                onClick={retry}
              >
                Actualizar datos
              </button>
            </section>
          )}

          {loading && <p role="status">Cargando datos del jugador…</p>}

          {!loading && data && (
            <div aria-busy={pending}>
              {pending && <p role="status">Guardando cambios…</p>}

              <fieldset className="jp-page-content" disabled={pending}>
                <Outlet />
              </fieldset>
            </div>
          )}
        </main>

        <footer className="jp-footer">Batalla Naval</footer>
      </div>
    </div>
  );
}
