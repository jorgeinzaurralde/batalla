import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import MissingItem from '../../../components/common/MissingItem';
import Board from '../components/Board';
import { getMatchPath } from '../utils/matchHelpers';
import { buildCells, isFleetComplete, validatePlacement } from '../utils/fleet';
import PageTitle from '../../../components/common/PageTitle';
import Placeholder from '../../../components/common/Placeholder';

export default function Preparation({
  board,
  matches,
  onPlaceShip,
  onResetFleet,
  onConfirm,
}) {
  const { matchId } = useParams();

  const [selectedShip, setSelectedShip] = useState(board.ships[0].id);

  const [orientation, setOrientation] = useState('horizontal');
  const [error, setError] = useState('');

  const match = matches.find((item) => item.id === matchId);

  if (!match) {
    return <MissingItem />;
  }

  if (match.status !== 'preparation') {
    return <Navigate to={getMatchPath(match)} replace />;
  }

  const allPlaced = isFleetComplete(board, match.fleet);

  function handlePlace(coordinate) {
    const ship = board.ships.find((item) => item.id === selectedShip);

    const cells = buildCells(coordinate, ship.size, orientation);
    const placementError = validatePlacement(
      board,
      match.fleet,
      selectedShip,
      cells
    );

    if (placementError) {
      setError(placementError);
      return;
    }

    onPlaceShip(match.id, selectedShip, cells);
    setError('');
  }

  return (
    <>
      <Link className="jp-text-link jp-back" to="/jugador/partidas">
        ← Volver a partidas
      </Link>

      <PageTitle
        title="Prepará tu flota"
        description={match.tournamentName}
        status="Preparación"
      />

      <div className="jp-game-layout">
        <section className="jp-card">
          <h2>Tu tablero</h2>

          <p>Elegí un barco y después su casilla inicial.</p>

          <Board
            width={board.width}
            height={board.height}
            label="Tablero para ubicar tus barcos"
            fleet={match.fleet}
            onCellClick={handlePlace}
          />

          <p className="jp-error" role="alert">
            {error}
          </p>

          <button
            className="jp-button jp-full-width"
            type="button"
            disabled={!allPlaced}
            onClick={() => onConfirm(match.id)}
          >
            Confirmar distribución
          </button>
        </section>

        <div className="jp-stack">
          <section className="jp-card">
            <h2>Barcos disponibles</h2>

            <p className="jp-placeholder">
              Estos barcos corresponden a la configuración del servidor. La
              distribución se envía al confirmar.
            </p>

            <div className="jp-ship-list">
              {board.ships.map((ship) => (
                <button
                  className={
                    selectedShip === ship.id
                      ? 'jp-ship jp-ship-selected'
                      : 'jp-ship'
                  }
                  type="button"
                  key={ship.id}
                  aria-pressed={selectedShip === ship.id}
                  onClick={() => {
                    setSelectedShip(ship.id);
                    setError('');
                  }}
                >
                  <strong>{ship.name}</strong>
                  <span>
                    {ship.size} casillas ·{' '}
                    {match.fleet[ship.id] ? 'Ubicado' : 'Sin ubicar'}
                  </span>
                </button>
              ))}
            </div>

            <h3>Orientación</h3>

            <div className="jp-actions">
              {[
                ['horizontal', 'Horizontal'],
                ['vertical', 'Vertical'],
              ].map(([value, label]) => (
                <button
                  className={
                    orientation === value
                      ? 'jp-button'
                      : 'jp-button jp-button-secondary'
                  }
                  key={value}
                  type="button"
                  aria-pressed={orientation === value}
                  onClick={() => {
                    setOrientation(value);
                    setError('');
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              className="jp-button jp-button-secondary jp-full-width jp-reset"
              type="button"
              onClick={() => {
                onResetFleet(match.id);
                setError('');
              }}
            >
              Limpiar distribución
            </button>
          </section>

          <section className="jp-card">
            <h2>Preparación</h2>
            <p>
              Podés preparar tu flota sin esperar al rival. Para mover un barco,
              volvé a seleccionarlo y elegí otra casilla inicial.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
