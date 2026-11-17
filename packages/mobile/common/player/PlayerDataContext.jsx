import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import * as invitationsService from '../api/invitationsService';
import * as matchesService from '../api/matchesService';
import * as tournamentsService from '../api/tournamentsService';
import { useAuth } from '../auth/authContext';

const PlayerDataContext = createContext(null);

async function readPlayerData(token, userId) {
  const [invitations, tournaments, matches] = await Promise.all([
    invitationsService.getInvitations(token),
    tournamentsService.getTournaments(token),
    matchesService.getMatches(token, userId),
  ]);

  return { invitations, tournaments, matches };
}

function replaceMatch(current, match) {
  if (!current) {
    return current;
  }

  return {
    ...current,
    matches: current.matches.map((item) =>
      item.id === match.id ? match : item
    ),
  };
}

export function PlayerDataProvider({ children }) {
  const { token, user, expireSession } = useAuth();
  const userId = user?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  // Evita que una consulta periódica que salió antes de una jugada propia
  // pise la partida con datos viejos: cada jugada incrementa la versión y
  // las respuestas de una versión anterior se descartan.
  const saving = useRef(false);
  const revision = useRef(0);

  function startMove() {
    saving.current = true;
    revision.current += 1;
  }

  function endMove() {
    revision.current += 1;
    saving.current = false;
  }

  // Primera carga (y reintentos).
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const result = await readPlayerData(token, userId);

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          if (err.status === 401) {
            expireSession();
          } else {
            setError(err.message);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [token, userId, reload, expireSession]);

  const retry = useCallback(() => {
    setError('');
    setLoading(true);
    setReload((current) => current + 1);
  }, []);

  // Para deslizar hacia abajo y actualizar.
  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError('');

    try {
      setData(await readPlayerData(token, userId));
    } catch (err) {
      if (err.status === 401) {
        expireSession();
      } else {
        setError(err.message);
      }
    } finally {
      setRefreshing(false);
    }
  }, [token, userId, expireSession]);

  // Si falla, lanza el error para que la pantalla lo muestre.
  const respondToInvitation = useCallback(
    async (invitationId, status) => {
      setPending(true);

      try {
        const response = await invitationsService.respondToInvitation(
          token,
          invitationId,
          status
        );

        setData((current) => {
          const previous = current.invitations.find(
            (item) => item.id === invitationId
          );

          let tournaments = current.tournaments;

          const exists = tournaments.some(
            (item) => item.id === response.tournamentId
          );

          if (
            response.status === 'accepted' &&
            !exists &&
            previous?.tournamentInfo
          ) {
            tournaments = [...tournaments, previous.tournamentInfo];
          }

          return {
            ...current,
            tournaments,
            invitations: current.invitations.map((item) =>
              item.id === invitationId ? { ...item, ...response } : item
            ),
          };
        });
      } catch (err) {
        if (err.status === 401) {
          expireSession();
        }

        throw err;
      } finally {
        setPending(false);
      }
    },
    [token, expireSession]
  );

  // Si falla, lanza el error (por ejemplo, una ubicación inválida).
  const confirmFleet = useCallback(
    async (matchId, fleetSetup) => {
      startMove();

      try {
        const match = await matchesService.submitFleet(
          token,
          matchId,
          fleetSetup,
          userId
        );

        setData((current) => ({
          ...current,
          matches: current.matches.map((item) =>
            item.id === matchId ? match : item
          ),
        }));
      } catch (err) {
        if (err.status === 401) {
          expireSession();
        }

        throw err;
      } finally {
        endMove();
      }
    },
    [token, userId, expireSession]
  );

  // Si falla, lanza el error (turno equivocado, casilla repetida, etc.).
  const shoot = useCallback(
    async (matchId, coordinate) => {
      startMove();

      try {
        const match = await matchesService.submitShot(
          token,
          matchId,
          coordinate,
          userId
        );

        setData((current) => replaceMatch(current, match));

        return match;
      } catch (err) {
        if (err.status === 401) {
          expireSession();
        }

        throw err;
      } finally {
        endMove();
      }
    },
    [token, userId, expireSession]
  );

  // Consulta una partida y la actualiza. Los errores de red se ignoran:
  // se vuelve a intentar en la próxima consulta.
  const refreshMatch = useCallback(
    async (matchId) => {
      const startedAt = revision.current;

      try {
        const match = await matchesService.getMatch(token, matchId, userId);

        if (!saving.current && startedAt === revision.current) {
          setData((current) => replaceMatch(current, match));
        }
      } catch (err) {
        if (err.status === 401) {
          expireSession();
        }
      }
    },
    [token, userId, expireSession]
  );

  // Cada partida lleva el nombre de su torneo.
  const visibleData = useMemo(() => {
    if (!data) {
      return null;
    }

    return {
      ...data,
      matches: data.matches.map((match) => {
        const tournament = data.tournaments.find(
          (item) => item.id === match.tournamentId
        );

        return {
          ...match,
          tournamentName: tournament?.name ?? match.tournamentId,
        };
      }),
    };
  }, [data]);

  const value = useMemo(
    () => ({
      data: visibleData,
      loading,
      refreshing,
      pending,
      error,
      retry,
      refresh,
      respondToInvitation,
      confirmFleet,
      shoot,
      refreshMatch,
    }),
    [
      visibleData,
      loading,
      refreshing,
      pending,
      error,
      retry,
      refresh,
      respondToInvitation,
      confirmFleet,
      shoot,
      refreshMatch,
    ]
  );

  return (
    <PlayerDataContext.Provider value={value}>
      {children}
    </PlayerDataContext.Provider>
  );
}

export function usePlayerData() {
  const context = useContext(PlayerDataContext);

  if (!context) {
    throw new Error(
      'usePlayerData debe usarse dentro de <PlayerDataProvider>.'
    );
  }

  return context;
}
