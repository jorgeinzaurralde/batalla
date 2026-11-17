import { useEffect } from 'react';

import { usePlayerData } from './PlayerDataContext';

const POLL_MS = 4000;

// La API no avisa cuando el rival juega, así que mientras la pantalla
// está abierta se consulta GET /api/matches/:id cada pocos segundos.
export default function useMatchPolling(matchId, enabled) {
  const { refreshMatch } = usePlayerData();

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    refreshMatch(matchId);

    const timer = setInterval(() => refreshMatch(matchId), POLL_MS);

    return () => clearInterval(timer);
  }, [matchId, enabled, refreshMatch]);
}
