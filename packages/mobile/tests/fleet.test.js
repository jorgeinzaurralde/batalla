import { describe, expect, it } from 'vitest';

import {
  buildCells,
  isFleetComplete,
  randomFleet,
  validatePlacement,
} from '../common/player/fleet';

const board = {
  width: 10,
  height: 10,
  ships: [
    { id: 'lancha', size: 2 },
    { id: 'fragata', size: 3 },
    { id: 'portaaviones', size: 5 },
  ],
};

// Todas las casillas de la flota deben estar dentro del tablero, en línea
// recta y sin repetirse entre barcos (sección 5 de la letra).
function expectValidFleet(fleet) {
  const seen = new Set();

  for (const ship of board.ships) {
    const cells = fleet[ship.id];
    expect(cells).toHaveLength(ship.size);

    const sameRow = cells.every(([, row]) => row === cells[0][1]);
    const sameColumn = cells.every(([column]) => column === cells[0][0]);
    expect(sameRow || sameColumn).toBe(true);

    for (const [column, row] of cells) {
      expect(column).toBeGreaterThanOrEqual(0);
      expect(column).toBeLessThan(board.width);
      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThan(board.height);

      const key = `${column},${row}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  }
}

describe('validatePlacement', () => {
  it('acepta un barco dentro del tablero', () => {
    const cells = buildCells([0, 0], 2, 'vertical');

    expect(validatePlacement(board, {}, 'lancha', cells)).toBe('');
  });

  it('rechaza un barco que se sale del tablero', () => {
    const cells = buildCells([8, 9], 3, 'horizontal');

    expect(validatePlacement(board, {}, 'fragata', cells)).toBe(
      'El barco debe quedar dentro del tablero.'
    );
  });

  it('rechaza barcos superpuestos y permite los adyacentes', () => {
    const fleet = { lancha: buildCells([2, 2], 2, 'horizontal') };

    const overlapping = buildCells([3, 0], 3, 'vertical');
    const adjacent = buildCells([2, 3], 3, 'horizontal');

    expect(validatePlacement(board, fleet, 'fragata', overlapping)).toBe(
      'Los barcos no pueden superponerse.'
    );
    expect(validatePlacement(board, fleet, 'fragata', adjacent)).toBe('');
  });
});

describe('randomFleet', () => {
  it('ubica todos los barcos de forma válida', () => {
    // Se repite porque la ubicación es aleatoria.
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const fleet = randomFleet(board);

      expect(isFleetComplete(board, fleet)).toBe(true);
      expectValidFleet(fleet);
    }
  });
});
