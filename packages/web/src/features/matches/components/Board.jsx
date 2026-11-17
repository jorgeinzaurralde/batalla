import { coordinateLabel, sameCoordinate } from '../utils/coordinates';
import { markSunkShips } from '../utils/sunkShips';

export default function Board({
  label,
  width,
  height,
  fleet = null,
  shots = [],
  shipSizes = [],
  selected = null,
  onCellClick,
  locked = false,
}) {
  const shipCoordinates = Object.values(fleet ?? {}).flat();

  // Todas las casillas de un barco hundido se muestran como hundidas.
  const boardShots = markSunkShips(shots, { fleet, shipSizes });

  return (
    <div
      className="jp-board"
      role="group"
      aria-label={label}
      style={{ '--jp-board-width': width }}
    >
      <span aria-hidden="true" />

      {Array.from({ length: width }, (_, column) => (
        <span
          className="jp-coordinate"
          key={`column-${column}`}
          aria-hidden="true"
        >
          {String.fromCharCode(65 + column)}
        </span>
      ))}

      {Array.from({ length: height }, (_, row) => (
        <div className="jp-board-row" key={row}>
          <span className="jp-coordinate" aria-hidden="true">
            {row + 1}
          </span>

          {Array.from({ length: width }, (_, column) => {
            const coordinate = [column, row];

            const hasShip = shipCoordinates.some((cell) =>
              sameCoordinate(cell, coordinate)
            );

            const shot = boardShots.find((item) =>
              sameCoordinate(item.coordinate, coordinate)
            );

            const isSelected = selected && sameCoordinate(selected, coordinate);

            const className = [
              'jp-cell',
              hasShip ? 'jp-cell-ship' : '',
              shot ? `jp-cell-${shot.result ?? 'pending'}` : '',
              isSelected ? 'jp-cell-selected' : '',
            ]
              .filter(Boolean)
              .join(' ');

            const symbol = shot
              ? ({
                  water: '•',
                  hit: '×',
                  sunk: '■',
                }[shot.result] ?? '?')
              : '';

            const description = [
              coordinateLabel(coordinate),
              hasShip ? 'Barco propio' : '',
              shot
                ? ({
                    water: 'Agua',
                    hit: 'Tocado',
                    sunk: 'Hundido',
                  }[shot.result] ?? 'Resultado pendiente')
                : '',
            ]
              .filter(Boolean)
              .join('. ');

            return onCellClick ? (
              <button
                className={className}
                type="button"
                key={column}
                aria-label={description}
                aria-pressed={Boolean(isSelected)}
                disabled={locked || Boolean(shot)}
                onClick={() => onCellClick(coordinate)}
              >
                {symbol}
              </button>
            ) : (
              <span className={className} key={column} aria-label={description}>
                {symbol}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
