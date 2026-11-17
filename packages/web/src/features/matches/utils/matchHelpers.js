export function getMatchStatus(match) {
  if (match.status === 'preparation') {
    return 'Preparación';
  }

  if (match.status === 'finished') {
    return match.result === 'victory' ? 'Victoria' : 'Derrota';
  }

  return match.myTurn ? 'Tu turno' : 'Esperando';
}
export function getMatchPath(match) {
  const base = `/jugador/partidas/${match.id}`;

  if (match.status === 'preparation') {
    return `${base}/preparacion`;
  }

  if (match.status === 'finished') {
    return `${base}/resultado`;
  }

  return base;
}
