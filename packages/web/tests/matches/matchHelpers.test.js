import { describe, expect, it } from 'vitest';

import {
  getMatchPath,
  getMatchStatus,
} from '../../src/features/matches/utils/matchHelpers';

const match = (fields) => ({ id: 'm1', ...fields });

describe('getMatchStatus', () => {
  it('describe cada estado de la partida', () => {
    expect(getMatchStatus(match({ status: 'preparation' }))).toBe(
      'Preparación'
    );
    expect(getMatchStatus(match({ status: 'playing', myTurn: true }))).toBe(
      'Tu turno'
    );
    expect(getMatchStatus(match({ status: 'playing', myTurn: false }))).toBe(
      'Esperando'
    );
    expect(
      getMatchStatus(match({ status: 'finished', result: 'victory' }))
    ).toBe('Victoria');
    expect(
      getMatchStatus(match({ status: 'finished', result: 'defeat' }))
    ).toBe('Derrota');
  });
});

describe('getMatchPath', () => {
  it('lleva a la pantalla que corresponde al estado', () => {
    expect(getMatchPath(match({ status: 'preparation' }))).toBe(
      '/jugador/partidas/m1/preparacion'
    );
    expect(getMatchPath(match({ status: 'playing' }))).toBe(
      '/jugador/partidas/m1'
    );
    expect(getMatchPath(match({ status: 'finished' }))).toBe(
      '/jugador/partidas/m1/resultado'
    );
  });
});
