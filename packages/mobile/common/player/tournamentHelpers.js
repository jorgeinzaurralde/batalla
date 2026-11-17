// La API no deja a un jugador ver los correos de otros usuarios,
// así que si ganó otro se muestra "rival" en vez de su id.
export function getWinnerLabel(tournament, session) {
  if (!tournament.winner) {
    return 'El ganador todavía no está definido.';
  }

  if (tournament.winner === session.userId) {
    return `Ganador: ${session.email.split('@')[0]}`;
  }

  return 'Ganador: rival';
}

export function getTournamentRoute(tournament) {
  return `/torneo/${tournament.id}`;
}
