// Reglas para ubicar barcos. Una coordenada es [columna, fila].

import { sameCoordinate } from './coordinates.js';

export function buildCells([column, row], size, orientation) {
  return Array.from({ length: size }, (_, index) => [
    column + (orientation === 'horizontal' ? index : 0),
    row + (orientation === 'vertical' ? index : 0),
  ]);
}

// Devuelve un mensaje de error, o '' si la ubicación es válida.
export function validatePlacement(board, fleet, shipId, cells) {
  const outside = cells.some(
    ([column, row]) =>
      column < 0 || row < 0 || column >= board.width || row >= board.height
  );

  if (outside) {
    return 'El barco debe quedar dentro del tablero.';
  }

  const otherCells = Object.entries(fleet)
    .filter(([id]) => id !== shipId)
    .flatMap(([, coordinates]) => coordinates);

  const overlaps = cells.some((cell) =>
    otherCells.some((other) => sameCoordinate(cell, other))
  );

  if (overlaps) {
    return 'Los barcos no pueden superponerse.';
  }

  return '';
}

export function isFleetComplete(board, fleet) {
  return board.ships.every((ship) => fleet?.[ship.id]?.length === ship.size);
}

//Arma una flota válida al azar. Si un barco no entra, empieza de nuevo
export function randomFleet(board, maxAttempts = 100) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const fleet = {};
    let ok = true;

    for (const ship of board.ships) {
      let placed = false;

      for (let tries = 0; tries < 200 && !placed; tries++) {
        const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        const start = [
          Math.floor(Math.random() * board.width),
          Math.floor(Math.random() * board.height),
        ];
        const cells = buildCells(start, ship.size, orientation);

        if (!validatePlacement(board, fleet, ship.id, cells)) {
          fleet[ship.id] = cells;
          placed = true;
        }
      }

      if (!placed) {
        ok = false;
        break;
      }
    }

    if (ok) return fleet;
  }

  return null;
}

