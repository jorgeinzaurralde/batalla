import { describe, expect, it } from 'vitest';

import { markSunkShips } from '../common/player/sunkShips';

const shot = (column, row, result) => ({ coordinate: [column, row], result });
const resultAt = (shots, column, row) =>
  shots.find(
    (item) => item.coordinate[0] === column && item.coordinate[1] === row
  )?.result;

describe('markSunkShips con la flota a la vista', () => {
  const fleet = {
    fragata: [
      [1, 1],
      [2, 1],
      [3, 1],
    ],
    lancha: [
      [5, 5],
      [5, 6],
    ],
  };

  it('marca como hundidas todas las casillas del barco hundido', () => {
    const shots = [shot(1, 1, 'hit'), shot(2, 1, 'hit'), shot(3, 1, 'sunk')];

    const result = markSunkShips(shots, { fleet });

    expect(result.map((item) => item.result)).toEqual(['sunk', 'sunk', 'sunk']);
  });

  it('deja como tocado un barco que todavía no se hundió', () => {
    const shots = [shot(5, 5, 'hit'), shot(0, 0, 'water')];

    const result = markSunkShips(shots, { fleet });

    expect(resultAt(result, 5, 5)).toBe('hit');
    expect(resultAt(result, 0, 0)).toBe('water');
  });
});

describe('markSunkShips con la flota del rival oculta', () => {
  it('deduce el barco hundido a partir de los tocados en línea', () => {
    const shots = [shot(4, 2, 'hit'), shot(4, 3, 'hit'), shot(4, 4, 'sunk')];

    const result = markSunkShips(shots, { shipSizes: [3, 2] });

    expect(result.map((item) => item.result)).toEqual(['sunk', 'sunk', 'sunk']);
  });

  it('no toca otros barcos tocados que no están en la misma línea', () => {
    const shots = [shot(0, 0, 'hit'), shot(2, 2, 'hit'), shot(3, 2, 'sunk')];

    const result = markSunkShips(shots, { shipSizes: [2, 3] });

    expect(resultAt(result, 2, 2)).toBe('sunk');
    expect(resultAt(result, 0, 0)).toBe('hit');
  });

  it('si hay tocados en las dos direcciones, usa el largo de los barcos', () => {
    // Lancha (2) horizontal hundida en (2,2); arriba hay otro barco tocado.
    const shots = [
      shot(2, 0, 'hit'),
      shot(2, 1, 'hit'),
      shot(1, 2, 'hit'),
      shot(2, 2, 'sunk'),
    ];

    const result = markSunkShips(shots, { shipSizes: [2, 4] });

    expect(resultAt(result, 1, 2)).toBe('sunk');
    expect(resultAt(result, 2, 1)).toBe('hit');
    expect(resultAt(result, 2, 0)).toBe('hit');
  });
});
