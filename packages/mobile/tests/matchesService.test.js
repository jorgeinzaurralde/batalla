import { describe, expect, it } from 'vitest';

import { adaptMatch } from '../common/api/matchesService';

const NORTH = 'user-north';
const SOUTH = 'user-south';

function buildMatch(overrides = {}) {
  return {
    id: 'm1',
    tournament: 't1',
    playerNorth: NORTH,
    playerSouth: SOUTH,
    endedAt: null,
    winner: null,
    fleetNorth: {
      lancha: [
        [0, 0],
        [1, 0],
      ],
    },
    fleetSouth: {
      lancha: [
        [3, 3],
        [3, 4],
      ],
    },
    shotsNorth: [],
    shotsSouth: [],
    ...overrides,
  };
}

describe('adaptMatch (mobile)', () => {
  it('rechaza partidas de otros jugadores', () => {
    expect(() => adaptMatch(buildMatch(), 'otro-usuario')).toThrow();
  });

  it('pide ubicar la flota antes de jugar', () => {
    const view = adaptMatch(buildMatch({ fleetSouth: null }), SOUTH);

    expect(view.status).toBe('preparation');
    expect(view.myTurn).toBe(false);
  });

  it('alterna los turnos empezando por north', () => {
    expect(adaptMatch(buildMatch(), NORTH).myTurn).toBe(true);
    expect(adaptMatch(buildMatch(), SOUTH).myTurn).toBe(false);

    const afterNorth = buildMatch({ shotsNorth: [[[3, 3], 'hit']] });
    expect(adaptMatch(afterNorth, NORTH).myTurn).toBe(false);
    expect(adaptMatch(afterNorth, SOUTH).myTurn).toBe(true);
  });

  it('oculta la flota rival hasta que termina la partida', () => {
    expect(adaptMatch(buildMatch(), NORTH).opponentFleet).toBeNull();

    const finished = buildMatch({
      endedAt: '2026-11-18T13:00:00.000Z',
      winner: 'south',
    });
    const view = adaptMatch(finished, NORTH);

    expect(view.status).toBe('finished');
    expect(view.result).toBe('defeat');
    expect(view.opponentFleet).toEqual({
      lancha: [
        [3, 3],
        [3, 4],
      ],
    });
  });
});
