import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import MissingItem from '../../../components/common/MissingItem';
import Board from '../components/Board';
import BoardLegend from '../components/BoardLegend';
import ShotList from '../components/ShotList';
import { getMatchPath, getMatchStatus } from '../utils/matchHelpers';
import { coordinateLabel } from '../utils/coordinates';
import PageTitle from '../../../components/common/PageTitle';
import Placeholder from '../../../components/common/Placeholder';

export default function MatchView({ board, matches, onShoot }) {
  const { matchId } = useParams();

  const [selected, setSelected] = useState(null);

  const match = matches.find((item) => item.id === matchId);

  if (!match) {
    return <MissingItem />;
  }

  if (match.status !== 'playing') {
    return <Navigate to={getMatchPath(match)} replace />;
  }

  async function handleShoot() {
    if (selected && match.myTurn) {
      const succeeded = await onShoot(match.id, selected);

      if (succeeded) {
        setSelected(null);
      }
    }
  }

  return (
    <>
      <Link className="jp-text-link jp-back" to="/jugador/partidas">
        ← Volver a partidas
      </Link>

      <PageTitle
        title="Cada disparo cuenta."
        description={match.tournamentName}
        status={getMatchStatus(match)}
      />

      <div className="jp-game-layout">
        <section className="jp-card">
          <h2>Zona de ataque</h2>
          {!match.myTurn &&
            match.shots.length === 0 &&
            match.receivedShots.length === 0 && (
              <p className="jp-placeholder">
                Tu flota está confirmada. Para comenzar a disparar, ambos
                jugadores deben confirmar su distribución.
              </p>
            )}
          <Placeholder>La flota del rival permanece oculta.</Placeholder>

          <Board
            width={board.width}
            height={board.height}
            label="Tablero rival para seleccionar un disparo"
            shots={match.shots}
            shipSizes={board.ships.map((ship) => ship.size)}
            selected={selected}
            locked={!match.myTurn}
            onCellClick={setSelected}
          />

          <BoardLegend />

          {match.myTurn ? (
            <button
              className="jp-button jp-full-width"
              type="button"
              disabled={!selected}
              onClick={handleShoot}
            >
              {selected
                ? `Disparar a ${coordinateLabel(selected)}`
                : 'Seleccioná una casilla'}
            </button>
          ) : (
            <p className="jp-waiting" role="status">
              Esperando al rival…
            </p>
          )}
        </section>

        <div className="jp-stack">
          <section className="jp-card">
            <h2>Tu flota</h2>

            {!match.fleet && (
              <Placeholder>Todavía no hay barcos ubicados.</Placeholder>
            )}

            <Board
              width={board.width}
              height={board.height}
              label="Tu flota y los disparos recibidos"
              fleet={match.fleet}
              shots={match.receivedShots}
            />

            <Placeholder>
              La partida se actualiza cada cinco segundos.
            </Placeholder>
          </section>

          <section className="jp-card">
            <h2>Últimos disparos</h2>

            <h3>Tus disparos</h3>
            <ShotList shots={match.shots} emptyText="Todavía no disparaste." />

            <h3>Disparos del rival</h3>
            <ShotList
              shots={match.receivedShots}
              emptyText="El rival todavía no disparó."
            />
          </section>
        </div>
      </div>
    </>
  );
}
