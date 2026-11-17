import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as authService from '../api/authService';

const SESSION_KEY = 'batalla-naval-session-token';

const AuthContext = createContext(null);

async function readToken() {
  try {
    return await AsyncStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

async function saveToken(token) {
  try {
    await AsyncStorage.setItem(SESSION_KEY, token);
  } catch {
    // La sesión sigue funcionando hasta cerrar la app.
  }
}

async function removeToken() {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch {
    // Nada más que hacer.
  }
}

export function AuthProvider({ children }) {
  // session: { email, role, token, userId } (igual que antes)
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al abrir la app, intenta recuperar la sesión guardada.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = await readToken();

      try {
        if (token) {
          const me = await authService.restore(token);

          if (me.role !== 'player') {
            await removeToken();
          } else if (!cancelled) {
            setSession({
              email: me.email,
              role: me.role,
              token,
              userId: me.id,
            });
          }
        }
      } catch (error) {
        // Solo se descarta el token si la API dijo que ya no sirve.
        if (error.status === 401) {
          await removeToken();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const playerSession = await authService.login(email, password);

    await saveToken(playerSession.token);
    setSession(playerSession);
  }, []);

  const logout = useCallback(async () => {
    const token = session?.token;

    // Se cierra la sesión local aunque la API no responda.
    setSession(null);
    await removeToken();

    if (token) {
      try {
        await authService.logout(token);
      } catch {
        // El token ya no está guardado en este dispositivo.
      }
    }
  }, [session]);

  // Para las pantallas que reciban un 401 de la API.
  const expireSession = useCallback(async () => {
    setSession(null);
    await removeToken();
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session
        ? { id: session.userId, email: session.email, role: session.role }
        : null,
      token: session?.token ?? null,
      loading,
      login,
      logout,
      expireSession,
    }),
    [session, loading, login, logout, expireSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }

  return context;
}
