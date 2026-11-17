// La API no deja a un jugador ver los correos de otros usuarios,
// así que si ganó otro se muestra "rival" en vez de su id.
export function getWinnerLabel(tournament, user) {
  if (!tournament.winner) {
    return 'El ganador todavía no está definido.';
  }

  if (tournament.winner === user.id) {
    return `Ganador: ${user.email.split('@')[0]}`;
  }

  return 'Ganador: rival';
}
