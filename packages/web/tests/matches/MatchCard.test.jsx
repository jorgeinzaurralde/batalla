import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import MatchCard from '../../src/features/matches/components/MatchCard';

function renderCard(fields) {
  render(
    <MemoryRouter>
      <MatchCard
        match={{ id: 'm1', tournamentName: 'Copa del Atlántico', ...fields }}
      />
    </MemoryRouter>
  );
}

describe('MatchCard', () => {
  it('invita a preparar la flota de una partida nueva', () => {
    renderCard({ status: 'preparation', myTurn: false });

    expect(
      screen.getByRole('link', { name: 'Preparar flota' })
    ).toHaveAttribute('href', '/jugador/partidas/m1/preparacion');
  });

  it('avisa cuando es el turno del jugador', () => {
    renderCard({ status: 'playing', myTurn: true });

    expect(screen.getByText('Tu turno')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Abrir partida' })).toHaveAttribute(
      'href',
      '/jugador/partidas/m1'
    );
  });

  it('lleva al resultado y al historial de una partida terminada', () => {
    renderCard({ status: 'finished', result: 'victory' });

    expect(screen.getByText('Victoria')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ver resultado e historial' })
    ).toHaveAttribute('href', '/jugador/partidas/m1/resultado');
  });
});
