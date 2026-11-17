import { apiFetch } from './client';
import { withMessages } from './errors';

// Convierte una partida de la API en una vista desde el lado del jugador.
export function adaptMatch(match, userId) {
  const isNorth = match.playerNorth === userId;
  const isSouth = match.playerSouth === userId;

  if (!isNorth && !isSouth) {
    throw new Error('No participás en esta partida.');
  }

  const mySide = isNorth ? 'north' : 'south';

  const ownFleet = isNorth ? match.fleetNorth : match.fleetSouth;
  const otherFleet = isNorth ? match.fleetSouth : match.fleetNorth;
  const ownShots = isNorth ? match.shotsNorth : match.shotsSouth;
  const otherShots = isNorth ? match.shotsSouth : match.shotsNorth;

  const finished = Boolean(match.endedAt || match.winner);

  let status = 'preparation';

  if (finished) {
    status = 'finished';
  } else if (ownFleet !== null) {
    status = 'playing';
  }

  const northCount = match.shotsNorth.length;
  const southCount = match.shotsSouth.length;

  const myTurn =
    !finished &&
    ownFleet !== null &&
    (isNorth ? northCount === southCount : northCount === southCount + 1);

  let result = null;

  if (match.winner) {
    result = match.winner === mySide ? 'victory' : 'defeat';
  }

  return {
    ...match,
    tournamentId: match.tournament,
    mySide,
    opponentId: isNorth ? match.playerSouth : match.playerNorth,
    status,
    myTurn,
    fleet: ownFleet ?? {},
    opponentFleet: finished ? otherFleet : null,
    shots: ownShots.map(([coordinate, shotResult]) => ({
      coordinate,
      result: shotResult,
    })),
    receivedShots: otherShots.map(([coordinate, shotResult]) => ({
      coordinate,
      result: shotResult,
    })),
    result,
  };
}

export async function getMatches(token, userId) {
  const matches = await apiFetch('/api/me/matches', { token });

  return matches.map((match) => adaptMatch(match, userId));
}

// Tamaño del tablero y barcos disponibles.
export async function getBoard(token) {
  const board = await apiFetch('/api/board', { token });

  return {
    width: board.width,
    height: board.height,
    ships: Object.entries(board.ships).map(([name, size]) => ({
      id: name,
      name,
      size,
    })),
  };
}

// Primer movimiento de la partida: la ubicación de los barcos.
export async function submitFleet(token, matchId, fleetSetup, userId) {
  const match = await withMessages(
    apiFetch(`/api/matches/${encodeURIComponent(matchId)}/moves`, {
      method: 'POST',
      body: { fleetSetup },
      token,
    }),
    { 400: 'La ubicación de los barcos no es válida.' }
  );

  return adaptMatch(match, userId);
}

// Una partida por id (se usa para actualizar mientras está abierta).
export async function getMatch(token, matchId, userId) {
  const match = await apiFetch(`/api/matches/${encodeURIComponent(matchId)}`, {
    token,
  });

  return adaptMatch(match, userId);
}

// Un disparo puede fallar por varios motivos (sección 6.5 de la letra).
// El de las flotas sin ubicar es el único que conviene distinguir.
function shotErrorMessage(error) {
  if (error.message === 'Both fleets must be placed before shooting') {
    return 'Ambos jugadores deben confirmar su flota antes de disparar.';
  }

  return 'No se pudo disparar: puede que no sea tu turno, que ya hayas disparado a esa casilla o que la partida haya terminado.';
}

// Un disparo. coordinate = [columna, fila], empezando en 0.
export async function submitShot(token, matchId, coordinate, userId) {
  const match = await withMessages(
    apiFetch(`/api/matches/${encodeURIComponent(matchId)}/moves`, {
      method: 'POST',
      body: { shot: coordinate },
      token,
    }),
    { 400: shotErrorMessage }
  );

  return adaptMatch(match, userId);
}

// Historial completo de jugadas. La API solo lo entrega si la partida
// terminó, y lo devolvemos ordenado por index.
export async function getMoves(token, matchId) {
  const moves = await withMessages(
    apiFetch(`/api/matches/${encodeURIComponent(matchId)}/moves`, { token }),
    { 400: 'El historial está disponible cuando termina la partida.' }
  );

  return [...moves].sort((first, second) => first.index - second.index);
}
