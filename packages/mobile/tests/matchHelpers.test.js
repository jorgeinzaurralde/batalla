import { describe, expect, it } from 'vitest';

import {
  getMatchChip,
  getMatchRoute,
  sortMatches,
} from '../common/player/matchHelpers';

describe('getMatchRoute', () => {
  it('lleva a la pantalla que corresponde al estado de la partida', () => {
    expect(getMatchRoute({ id: 'm1', status: 'preparation' })).toBe(
      '/partida/m1/preparation'
    );
    expect(getMatchRoute({ id: 'm1', status: 'playing' })).toBe('/partida/m1');
    expect(getMatchRoute({ id: 'm1', status: 'finished' })).toBe(
      '/partida/m1/resultado'
    );
  });
});

describe('getMatchChip', () => {
  it('resalta cuando es el turno del jugador', () => {
    expect(getMatchChip({ status: 'playing', myTurn: true })).toMatchObject({
      label: 'Tu turno',
      highlight: true,
    });
  });

  it('marca las derrotas como peligro', () => {
    expect(
      getMatchChip({ status: 'finished', result: 'defeat' })
    ).toMatchObject({ label: 'Derrota', danger: true });
  });
});

describe('sortMatches', () => {
  it('muestra primero lo que requiere una acción del jugador', () => {
    const matches = [
      { id: 'terminada', status: 'finished' },
      { id: 'esperando', status: 'playing', myTurn: false },
      { id: 'mi-turno', status: 'playing', myTurn: true },
      { id: 'nueva', status: 'preparation' },
    ];

    expect(sortMatches(matches).map((match) => match.id)).toEqual([
      'mi-turno',
      'nueva',
      'esperando',
      'terminada',
    ]);
  });
});
