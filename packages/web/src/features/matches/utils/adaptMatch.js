// La API describe cada partida desde sus dos lados (north y south).
// Esta función la traduce al punto de vista del usuario que la mira,
// para que las pantallas no repitan esa lógica.

export function getSide(match, userId) {
  if (match.playerNorth === userId) {
    return 'north';
  }

  if (match.playerSouth === userId) {
    return 'south';
  }

  return null;
}

export function isFinished(match) {
  return Boolean(match.endedAt || match.winner);
}

// North dispara primero: le toca cuando ambos dispararon la misma cantidad.
export function isMyTurn(match, side) {
  const ownFleet = side === 'north' ? match.fleetNorth : match.fleetSouth;

  if (isFinished(match) || ownFleet === null) {
    return false;
  }

  const northCount = match.shotsNorth.length;
  const southCount = match.shotsSouth.length;

  return side === 'north'
    ? northCount === southCount
    : northCount === southCount + 1;
}

function toShotList(shots) {
  return shots.map(([coordinate, result]) => ({ coordinate, result }));
}

export function adaptMatch(match, userId) {
  const side = getSide(match, userId);

  if (!side) {
    throw new Error('No participás en esta partida.');
  }

  const isNorth = side === 'north';
  const ownFleet = isNorth ? match.fleetNorth : match.fleetSouth;
  const otherFleet = isNorth ? match.fleetSouth : match.fleetNorth;
  const finished = isFinished(match);

  let status = 'preparation';

  if (finished) {
    status = 'finished';
  } else if (ownFleet !== null) {
    status = 'playing';
  }

  let result = null;

  if (match.winner) {
    result = match.winner === side ? 'victory' : 'defeat';
  }

  return {
    ...match,
    tournamentId: match.tournament,
    mySide: side,
    opponentId: isNorth ? match.playerSouth : match.playerNorth,
    status,
    myTurn: isMyTurn(match, side),
    fleet: ownFleet ?? {},
    opponentFleet: finished ? otherFleet : null,
    shots: toShotList(isNorth ? match.shotsNorth : match.shotsSouth),
    receivedShots: toShotList(isNorth ? match.shotsSouth : match.shotsNorth),
    result,
  };
}
