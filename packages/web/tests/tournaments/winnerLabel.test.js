import { describe, expect, it } from 'vitest';

import { getWinnerLabel } from '../../src/features/tournaments/utils/winnerLabel';

const user = { id: 'u1', email: 'player1@example.com' };

describe('getWinnerLabel', () => {
  it('avisa cuando el torneo todavía no tiene ganador', () => {
    expect(getWinnerLabel({ winner: null }, user)).toBe(
      'El ganador todavía no está definido.'
    );
  });

  it('muestra el usuario cuando ganó quien mira', () => {
    expect(getWinnerLabel({ winner: 'u1' }, user)).toBe('Ganador: player1');
  });

  it('no muestra datos de otros usuarios: dice "rival"', () => {
    expect(getWinnerLabel({ winner: 'u2' }, user)).toBe('Ganador: rival');
  });
});
