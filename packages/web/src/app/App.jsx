import { useCallback, useEffect, useState } from 'react';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Login from '../features/auth/Login';
import AuthenticatedApp from './AuthenticatedApp';
import { APP_BASE } from './navigation';

import { authService } from '../services/api/authService';
import { setUnauthorizedHandler } from '../services/api/client';

import '../features/auth/auth.css';

const SESSION_KEY = 'batalla-naval-session-token';

function readStoredToken() {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function saveToken(token) {
  try {
    sessionStorage.setItem(SESSION_KEY, token);
  } catch {
    // La sesión sigue funcionando hasta recargar.
  }
}

function removeToken() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // La sesión de esta pestaña se limpia igualmente.
  }
}

export default function App() {
  const [storedToken] = useState(readStoredToken);

  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const result = await authService.restore(storedToken);

        if (!cancelled) {
          setSession(result);
        }
      } catch (error) {
        if (!cancelled) {
          if (error.status === 401) {
            removeToken();
          }

          setError(error.message);
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [storedToken]);

  const handleSessionExpired = useCallback(() => {
    removeToken();
    setSession(null);
    setError('La sesión venció. Volvé a ingresar.');
  }, []);

  // Si cualquier pantalla recibe un 401, se cierra la sesión y se vuelve
  // al ingreso.
  useEffect(() => {
    setUnauthorizedHandler(handleSessionExpired);

    return () => setUnauthorizedHandler(null);
  }, [handleSessionExpired]);

  async function handleLogin(email, password) {
    setError('');

    const result = await authService.login(email, password);

    saveToken(result.token);
    setSession(result);

    return true;
  }

  async function handleLogout() {
    try {
      await authService.logout(session.token);

      removeToken();
      setSession(null);
      setError('');
    } catch (error) {
      if (error.status === 401) {
        handleSessionExpired();
      } else {
        setError(error.message);
      }
    }
  }

  if (checking) {
    return (
      <main className="bn-page">
        <p role="status">Comprobando sesión…</p>
      </main>
    );
  }

  const user = session ? session.user : null;

  // Todos los roles usan la misma área; el menú cambia según el rol
  const destination = user ? APP_BASE : '/login';

  return (
    <BrowserRouter>
      {session && error && (
        <p className="bn-error" role="alert">
          {error}
        </p>
      )}

      <Routes>
        <Route path="/" element={<Navigate to={destination} replace />} />

        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={destination} replace />
            ) : (
              <Login onLogin={handleLogin} sessionError={error} />
            )
          }
        />

        <Route
          path={`${APP_BASE}/*`}
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : (
              // Organizadores y admins también pueden hacer todo lo del jugador
              <AuthenticatedApp
                key={session.token}
                user={user}
                token={session.token}
                onLogout={handleLogout}
                onSessionExpired={handleSessionExpired}
              />
            )
          }
        />

        <Route path="*" element={<Navigate to={destination} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
