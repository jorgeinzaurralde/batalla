import { useEffect, useState } from 'react';

import { Link, Navigate, useParams } from 'react-router-dom';

import PageTitle from '../../../components/common/PageTitle';
import MissingItem from '../../../components/common/MissingItem';

import Board from '../components/Board';
import BoardLegend from '../components/BoardLegend';

import { getMatchPath } from '../utils/matchHelpers';

import { coordinateLabel, sameCoordinate } from '../utils/coordinates';

const resultLabels = {
  water: '💧 Agua',
  hit: '🎯 Tocado',
  sunk: '💥 Hundido',
};

function describeMove(move) {
  if (Array.isArray(move)) {
    return `Disparo a ${coordinateLabel(move)}`;
  }

  return Object.entries(move)
    .map(([ship, cells]) => {
      const coordinates = cells.map(coordinateLabel).join(', ');

      return `${ship}: ${coordinates}`;
    })
    .join(' · ');
}

export default function MatchResult({
  board,
  matches,
  services,
  onSessionExpired,
}) {
  const { matchId } = useParams();

  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  const match = matches.find((item) => item.id === matchId);

  const finished = match?.status === 'finished';

  useEffect(() => {
    if (!finished) {
      return;
    }

    let cancelled = false;

    async function loadMoves() {
      try {
        const result = await services.matches.getMoves(matchId);

        if (!cancelled) {
          setMoves(result);
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

    loadMoves();

    return () => {
      cancelled = true;
    };
  }, [services, matchId, finished, reload, onSessionExpired]);

  if (!match) {
    return <MissingItem />;
  }

  if (!finished) {
    return <Navigate to={getMatchPath(match)} replace />;
  }

  let title = 'Partida finalizada';

  if (match.result === 'victory') {
    title = 'Victoria en el mar.';
  } else if (match.result === 'defeat') {
    title = 'Esta vez no pudo ser.';
  }

  function retry() {
    setError('');
    setLoading(true);
    setReload((current) => current + 1);
  }

  function getMoveResult(move) {
    if (!Array.isArray(move.move)) {
      return 'Flota preparada';
    }

    const shots =
      move.player === match.mySide ? match.shots : match.receivedShots;

    const shot = shots.find((item) =>
      sameCoordinate(item.coordinate, move.move)
    );

    return shot ? resultLabels[shot.result] : 'Sin resultado disponible';
  }

  const shotMoves = moves.filter((move) => Array.isArray(move.move));

  return (
    <>
      <Link className="jp-text-link jp-back" to="/jugador/partidas">
        ← Volver a partidas
      </Link>

      <PageTitle title={title} description={match.tournamentName} />

      <section className="jp-card">
        <h2>Resultado de la partida</h2>

        <p>
          Finalización:{' '}
          {match.endedAt
            ? new Date(match.endedAt).toLocaleString()
            : 'Sin fecha disponible'}
        </p>
      </section>

      <div className="jp-two-columns">
        <section className="jp-card">
          <h2>Flota rival</h2>

          <Board
            width={board.width}
            height={board.height}
            label="Flota rival al finalizar la partida"
            fleet={match.opponentFleet}
            shots={match.shots}
          />

          <BoardLegend />
        </section>

        <section className="jp-card">
          <h2>Tu flota</h2>

          <Board
            width={board.width}
            height={board.height}
            label="Tu flota al finalizar la partida"
            fleet={match.fleet}
            shots={match.receivedShots}
          />

          <BoardLegend />
        </section>
      </div>

      <section className="jp-card">
        <h2>Historial completo</h2>

        {loading && <p role="status">Cargando historial…</p>}

        {error && (
          <div role="alert">
            <p className="jp-error">{error}</p>

            <button className="jp-button" type="button" onClick={retry}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="jp-table-wrapper">
            <table className="jp-table">
              <caption className="jp-sr-only">
                Historial completo de movimientos
              </caption>

              <thead>
                <tr>
                  <th scope="col">Movimiento</th>
                  <th scope="col">Jugador</th>
                  <th scope="col">Jugada</th>
                  <th scope="col">Resultado</th>
                </tr>
              </thead>

              <tbody>
                {shotMoves.map((move, position) => (
                  <tr key={move.id}>
                    <td>{position + 1}</td>

                    <td>{move.player === match.mySide ? 'Vos' : 'Rival'}</td>

                    <td>{describeMove(move.move)}</td>

                    <td>{getMoveResult(move)}</td>
                  </tr>
                ))}

                {shotMoves.length === 0 && (
                  <tr>
                    <td colSpan={4}>No hay disparos registrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
