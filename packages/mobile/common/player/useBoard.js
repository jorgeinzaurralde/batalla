import { useCallback, useEffect, useState } from 'react';

import { getBoard } from '../api/matchesService';
import { useAuth } from '../auth/authContext';

// Carga el tablero (tamaño y barcos) desde GET /api/board.
export default function useBoard() {
  const { token, expireSession } = useAuth();

  const [board, setBoard] = useState(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadBoard() {
      try {
        const result = await getBoard(token);

        if (!cancelled) {
          setBoard(result);
        }
      } catch (err) {
        if (!cancelled) {
          if (err.status === 401) {
            expireSession();
          } else {
            setError(err.message);
          }
        }
      }
    }

    loadBoard();

    return () => {
      cancelled = true;
    };
  }, [token, reload, expireSession]);

  const retry = useCallback(() => {
    setError('');
    setReload((current) => current + 1);
  }, []);

  return { board, error, loading: board === null && error === '', retry };
}
