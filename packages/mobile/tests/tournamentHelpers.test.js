import { describe, expect, it } from 'vitest';

import {
  getTournamentRoute,
  getWinnerLabel,
} from '../common/player/tournamentHelpers';

const session = { userId: 'u1', email: 'player1@example.com' };

describe('getWinnerLabel', () => {
  it('avisa cuando el torneo todavía no tiene ganador', () => {
    expect(getWinnerLabel({ winner: null }, session)).toBe(
      'El ganador todavía no está definido.'
    );
  });

  it('muestra el usuario si ganó quien mira, y "rival" si no', () => {
    expect(getWinnerLabel({ winner: 'u1' }, session)).toBe('Ganador: player1');
    expect(getWinnerLabel({ winner: 'u2' }, session)).toBe('Ganador: rival');
  });
});

describe('getTournamentRoute', () => {
  it('lleva al detalle del torneo', () => {
    expect(getTournamentRoute({ id: 't1' })).toBe('/torneo/t1');
  });
});
