// Arma la lista cronológica de disparos de ambos jugadores.
// North siempre dispara primero y los turnos se alternan.
export function buildTimeline(match) {
  const iAmNorth = match.mySide === 'north';
  const north = iAmNorth ? match.shots : match.receivedShots;
  const south = iAmNorth ? match.receivedShots : match.shots;

  const timeline = [];
  for (let i = 0; i < Math.max(north.length, south.length); i += 1) {
    if (north[i]) timeline.push({ ...north[i], mine: iAmNorth });
    if (south[i]) timeline.push({ ...south[i], mine: !iAmNorth });
  }
  return timeline.map((shot, index) => ({ ...shot, number: index + 1 }));
}

export function shotsUntil(timeline, step) {
  const visible = timeline.slice(0, step);
  return {
    myShots: visible.filter((shot) => shot.mine),
    receivedShots: visible.filter((shot) => !shot.mine),
  };
}
