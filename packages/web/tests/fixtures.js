// Datos de ejemplo con la forma que devuelve la API (sección 5 de la letra).

export const NORTH = 'user-north';
export const SOUTH = 'user-south';

export const FLEET_NORTH = {
  lancha: [
    [0, 0],
    [1, 0],
  ],
};
export const FLEET_SOUTH = {
  lancha: [
    [3, 3],
    [3, 4],
  ],
};

// Partida recién creada: ningún jugador ubicó sus barcos.
export function buildMatch(overrides = {}) {
  return {
    id: 'match-1',
    tournament: 'tournament-1',
    playerNorth: NORTH,
    playerSouth: SOUTH,
    endedAt: null,
    winner: null,
    fleetNorth: null,
    fleetSouth: null,
    shotsNorth: [],
    shotsSouth: [],
    ...overrides,
  };
}

// Partida en juego: los dos ubicaron su flota. (La API le oculta a cada
// jugador la flota del rival; acá se cargan ambas para poder probar que la
// aplicación tampoco la muestra antes de que termine la partida.)
export function buildPlayingMatch(overrides = {}) {
  return buildMatch({
    fleetNorth: FLEET_NORTH,
    fleetSouth: FLEET_SOUTH,
    ...overrides,
  });
}

export const BOARD = {
  width: 5,
  height: 5,
  ships: [
    { id: 'lancha', name: 'lancha', size: 2 },
    { id: 'fragata', name: 'fragata', size: 3 },
  ],
};
