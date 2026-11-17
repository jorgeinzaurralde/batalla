import { describe, expect, it } from 'vitest';

import { BOARD } from '../fixtures';
import {
  buildCells,
  isFleetComplete,
  validatePlacement,
} from '../../src/features/matches/utils/fleet';

// Reglas de una ubicación válida (sección 5 de la letra): cada barco ocupa
// tantas casillas como su largo, en línea recta, dentro del tablero y sin
// superponerse con otro (aunque sí pueden quedar pegados).

describe('buildCells', () => {
  it('arma las casillas en horizontal', () => {
    expect(buildCells([1, 2], 3, 'horizontal')).toEqual([
      [1, 2],
      [2, 2],
      [3, 2],
    ]);
  });

  it('arma las casillas en vertical', () => {
    expect(buildCells([1, 2], 3, 'vertical')).toEqual([
      [1, 2],
      [1, 3],
      [1, 4],
    ]);
  });
});

describe('validatePlacement', () => {
  it('acepta un barco dentro del tablero', () => {
    const cells = buildCells([0, 0], 2, 'horizontal');

    expect(validatePlacement(BOARD, {}, 'lancha', cells)).toBe('');
  });

  it('rechaza un barco que se sale del tablero', () => {
    const cells = buildCells([4, 0], 2, 'horizontal');

    expect(validatePlacement(BOARD, {}, 'lancha', cells)).toBe(
      'El barco debe quedar dentro del tablero.'
    );
  });

  it('rechaza barcos superpuestos', () => {
    const fleet = {
      lancha: [
        [1, 1],
        [2, 1],
      ],
    };
    const cells = buildCells([2, 0], 3, 'vertical');

    expect(validatePlacement(BOARD, fleet, 'fragata', cells)).toBe(
      'Los barcos no pueden superponerse.'
    );
  });

  it('permite barcos en casillas adyacentes', () => {
    const fleet = {
      lancha: [
        [0, 0],
        [1, 0],
      ],
    };
    const cells = buildCells([0, 1], 3, 'horizontal');

    expect(validatePlacement(BOARD, fleet, 'fragata', cells)).toBe('');
  });

  it('permite mover un barco sobre su propia posición anterior', () => {
    const fleet = {
      lancha: [
        [0, 0],
        [1, 0],
      ],
    };
    const cells = buildCells([1, 0], 2, 'horizontal');

    expect(validatePlacement(BOARD, fleet, 'lancha', cells)).toBe('');
  });
});

describe('isFleetComplete', () => {
  it('la flota está completa cuando están todos los barcos', () => {
    const fleet = {
      lancha: buildCells([0, 0], 2, 'horizontal'),
      fragata: buildCells([0, 2], 3, 'horizontal'),
    };

    expect(isFleetComplete(BOARD, fleet)).toBe(true);
  });

  it('falta confirmar si queda algún barco sin ubicar', () => {
    const fleet = { lancha: buildCells([0, 0], 2, 'horizontal') };

    expect(isFleetComplete(BOARD, fleet)).toBe(false);
  });
});
