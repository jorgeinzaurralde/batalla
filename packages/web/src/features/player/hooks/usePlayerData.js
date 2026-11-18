import { useEffect, useRef, useState } from 'react';

import { createServices } from '../../../services/services';

async function readPlayerData(services) {
  const [board, invitations, tournaments, matches] = await Promise.all([
    services.matches.getBoard(),
    services.invitations.getInvitations(),
    services.tournaments.getTournaments(),
    services.matches.getMatches(),
  ]);

  return { board, invitations, tournaments, matches };
}

function replaceMatch(matches, updatedMatch) {
  const exists = matches.some((match) => match.id === updatedMatch.id);

  if (!exists) {
    return [...matches, updatedMatch];
  }

  return matches.map((match) =>
    match.id === updatedMatch.id ? updatedMatch : match
  );
}

export default function usePlayerData({
  token,
  userId,
  matchId,
  onSessionExpired,
}) {
  const [services] = useState(() => createServices(token, userId));

  const [data, setData] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reload, setReload] = useState(0);

  const mounted = useRef(false);
  const saving = useRef(false);

  // Permite descartar una consulta anterior a una jugada.
  const revision = useRef(0);

  useEffect(() => {
    let cancelled = false;

    mounted.current = true;

    async function loadData() {
      try {
        const result = await readPlayerData(services);

        if (!cancelled) {
          setData(result);
        }
      } catch (error) {
        if (!cancelled) {
          if (error.status === 401) {
            onSessionExpired();
          } else {
            setError(error.message);
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
      mounted.current = false;
    };
  }, [services, reload, onSessionExpired]);

  const currentMatch = data?.matches.find((match) => match.id === matchId);

  const finished = currentMatch?.status === 'finished';

  useEffect(() => {
    if (!matchId || loading || finished) {
      return;
    }

    let cancelled = false;
    let timeout;

    async function refreshMatch() {
      let stop = false;

      if (!saving.current) {
        const currentRevision = revision.current;

        try {
          const match = await services.matches.getMatch(matchId);

          if (
            !cancelled &&
            !saving.current &&
            currentRevision === revision.current
          ) {
            setData((current) => {
              if (!current) {
                return current;
              }

              return {
                ...current,
                matches: replaceMatch(current.matches, match),
              };
            });

            stop = match.status === 'finished';
          }
        } catch (error) {
          if (!cancelled) {
            if (error.status === 401) {
              stop = true;
              onSessionExpired();
            } else {
              setError(error.message);
            }
          }
        }
      }

      if (!cancelled && !stop) {
        //timeout = setTimeout(refreshMatch, 5000);
        timeout = setTimeout(refreshMatch, 1500);
      }
    }

    refreshMatch();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [services, matchId, loading, finished, onSessionExpired]);

  function retry() {
    revision.current += 1;
    setError('');
    setLoading(true);
    setReload((current) => current + 1);
  }

  function dismissNotice() {
    setNotice('');
  }

  async function runAction(action, updateData, message) {
    if (saving.current) {
      return false;
    }

    saving.current = true;
    revision.current += 1;

    setPending(true);
    setError('');
    setNotice('');

    try {
      const result = await action();

      if (mounted.current) {
        setData((current) => updateData(current, result));
        setNotice(message);
      }

      return true;
    } catch (error) {
      if (mounted.current) {
        if (error.status === 401) {
          onSessionExpired();
        } else {
          setError(error.message);
        }
      }

      return false;
    } finally {
      revision.current += 1;
      saving.current = false;

      if (mounted.current) {
        setPending(false);
      }
    }
  }

  function respondToInvitation(invitationId, status) {
    return runAction(
      () => services.invitations.respondToInvitation(invitationId, status),
      (current, response) => {
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
      },
      status === 'accepted' ? 'Invitación aceptada.' : 'Invitación rechazada.'
    );
  }

  // Acomodar un barco todavía no envía nada a la API.
  function placeShip(matchId, shipId, cells) {
    setDrafts((current) => ({
      ...current,
      [matchId]: {
        ...current[matchId],
        [shipId]: cells,
      },
    }));
  }

  function resetFleet(matchId) {
    setDrafts((current) => ({
      ...current,
      [matchId]: {},
    }));
  }

  function updateMatchData(current, match) {
    return {
      ...current,
      matches: replaceMatch(current.matches, match),
    };
  }

  function confirmFleet(matchId) {
    const fleet = drafts[matchId] ?? {};

    return runAction(
      () => services.matches.confirmFleet(matchId, fleet),
      updateMatchData,
      'Flota confirmada.'
    );
  }

  function shoot(matchId, coordinate) {
    return runAction(
      () => services.matches.shoot(matchId, coordinate),
      updateMatchData,
      'Disparo registrado.'
    );
  }

  let visibleData = null;

  if (data) {
    visibleData = {
      ...data,
      matches: data.matches.map((match) => {
        const tournament = data.tournaments.find(
          (item) => item.id === match.tournamentId
        );

        return {
          ...match,
          tournamentName: tournament?.name || match.tournamentId,
          fleet:
            match.status === 'preparation'
              ? (drafts[match.id] ?? {})
              : match.fleet,
        };
      }),
    };
  }

  return {
    data: visibleData,
    services,
    loading,
    pending,
    error,
    notice,
    retry,
    dismissNotice,
    respondToInvitation,
    placeShip,
    resetFleet,
    confirmFleet,
    shoot,
  };
}
