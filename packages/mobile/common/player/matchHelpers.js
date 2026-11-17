// La API no deja a un jugador consultar correos de otros usuarios,
// así que por ahora se muestra el id. Si eso cambia, se arregla acá.
export function labelUser(userId) {
  return userId;
}

export function getMatchChip(match) {
  if (match.status === 'preparation') {
    return { label: 'Colocar flota', highlight: false, danger: false };
  }

  if (match.status === 'finished') {
    if (match.result === 'victory') {
      return { label: 'Victoria', highlight: false, danger: false };
    }

    if (match.result === 'defeat') {
      return { label: 'Derrota', highlight: false, danger: true };
    }

    return { label: 'Terminada', highlight: false, danger: false };
  }

  if (match.myTurn) {
    return { label: 'Tu turno', highlight: true, danger: false };
  }

  return { label: 'Esperando', highlight: false, danger: false };
}

const STATUS_SUFFIX = {
  preparation: 'Nueva',
  playing: 'En curso',
  finished: 'Terminada',
};

export function getMatchSubtitle(match) {
  const opponent = `vs ${labelUser(match.opponentId)}`;

  if (match.myTurn) {
    return opponent;
  }

  return `${opponent} · ${STATUS_SUFFIX[match.status]}`;
}

// Primero lo que requiere acción del jugador, y al final lo terminado.
const PRIORITY = { preparation: 1, playing: 2, finished: 3 };

export function sortMatches(matches) {
  return [...matches].sort((first, second) => {
    const firstRank = first.myTurn ? 0 : PRIORITY[first.status];
    const secondRank = second.myTurn ? 0 : PRIORITY[second.status];

    return firstRank - secondRank;
  });
}

// A dónde lleva tocar una partida.
export function getMatchRoute(match) {
  if (match.status === 'preparation') {
    return `/partida/${match.id}/preparation`;
  }

  if (match.status === 'playing') {
    return `/partida/${match.id}`;
  }

  return `/partida/${match.id}/resultado`;
}
