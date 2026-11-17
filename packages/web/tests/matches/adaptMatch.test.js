import { describe, expect, it } from 'vitest';

import {
  FLEET_NORTH,
  FLEET_SOUTH,
  NORTH,
  SOUTH,
  buildMatch,
  buildPlayingMatch,
} from '../fixtures';
import {
  adaptMatch,
  getSide,
  isMyTurn,
} from '../../src/features/matches/utils/adaptMatch';

const water = (column, row) => [[column, row], 'water'];

describe('getSide', () => {
  it('identifica de qué lado juega cada usuario', () => {
    const match = buildMatch();

    expect(getSide(match, NORTH)).toBe('north');
    expect(getSide(match, SOUTH)).toBe('south');
    expect(getSide(match, 'otro-usuario')).toBeNull();
  });
});

describe('turnos', () => {
  it('north dispara primero', () => {
    const match = buildPlayingMatch();

    expect(isMyTurn(match, 'north')).toBe(true);
    expect(isMyTurn(match, 'south')).toBe(false);
  });

  it('después de cada disparo le toca al otro jugador', () => {
    const afterNorth = buildPlayingMatch({ shotsNorth: [water(0, 0)] });
    expect(isMyTurn(afterNorth, 'north')).toBe(false);
    expect(isMyTurn(afterNorth, 'south')).toBe(true);

    const afterSouth = buildPlayingMatch({
      shotsNorth: [water(0, 0)],
      shotsSouth: [water(4, 4)],
    });
    expect(isMyTurn(afterSouth, 'north')).toBe(true);
    expect(isMyTurn(afterSouth, 'south')).toBe(false);
  });

  it('no es mi turno si todavía no ubiqué mis barcos', () => {
    const match = buildMatch({ fleetSouth: FLEET_SOUTH });

    expect(isMyTurn(match, 'north')).toBe(false);
  });

  it('nadie juega en una partida terminada', () => {
    const match = buildPlayingMatch({
      endedAt: '2026-11-18T13:00:00.000Z',
      winner: 'south',
    });

    expect(isMyTurn(match, 'north')).toBe(false);
    expect(isMyTurn(match, 'south')).toBe(false);
  });
});

describe('adaptMatch', () => {
  it('rechaza partidas en las que el usuario no participa', () => {
    expect(() => adaptMatch(buildMatch(), 'otro-usuario')).toThrow(
      'No participás en esta partida.'
    );
  });

  it('está en preparación hasta que el jugador ubica su flota', () => {
    const view = adaptMatch(buildMatch(), NORTH);

    expect(view.status).toBe('preparation');
    expect(view.fleet).toEqual({});
  });

  it('pasa a juego cuando el jugador ubicó su flota', () => {
    const view = adaptMatch(buildPlayingMatch(), NORTH);

    expect(view.status).toBe('playing');
    expect(view.mySide).toBe('north');
    expect(view.opponentId).toBe(SOUTH);
    expect(view.fleet).toEqual(FLEET_NORTH);
  });

  it('separa mis disparos de los que recibí', () => {
    const match = buildPlayingMatch({
      shotsNorth: [[[3, 3], 'hit']],
      shotsSouth: [water(4, 4)],
    });

    const view = adaptMatch(match, SOUTH);

    expect(view.shots).toEqual([{ coordinate: [4, 4], result: 'water' }]);
    expect(view.receivedShots).toEqual([{ coordinate: [3, 3], result: 'hit' }]);
  });

  it('no muestra la flota del rival mientras la partida sigue', () => {
    const view = adaptMatch(buildPlayingMatch(), NORTH);

    expect(view.opponentFleet).toBeNull();
  });

  it('al terminar muestra el resultado y la flota del rival', () => {
    const match = buildPlayingMatch({
      endedAt: '2026-11-18T13:00:00.000Z',
      winner: 'north',
    });

    const winnerView = adaptMatch(match, NORTH);
    const loserView = adaptMatch(match, SOUTH);

    expect(winnerView.status).toBe('finished');
    expect(winnerView.result).toBe('victory');
    expect(winnerView.opponentFleet).toEqual(FLEET_SOUTH);
    expect(loserView.result).toBe('defeat');
  });
});
