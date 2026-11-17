import { backend, sessionOptions } from './client';
import { withMessages } from './errors';
import { adaptMatch as adaptMatchFor } from '../../features/matches/utils/adaptMatch';

// Un disparo puede fallar por varios motivos (sección 6.5 de la letra).
// El de las flotas sin ubicar es el único que conviene distinguir.
function shotErrorMessage(error) {
  if (error.message === 'Both fleets must be placed before shooting') {
    return 'Ambos jugadores deben confirmar su flota antes de disparar.';
  }

  return 'No se pudo disparar: puede que no sea tu turno, que ya hayas disparado a esa casilla o que la partida haya terminado.';
}

export function createMatchesService(token, userId) {
  const options = sessionOptions(token);

  const adaptMatch = (match) => adaptMatchFor(match, userId);

  async function getBoard() {
    const board = await backend.get('/api/board', options);

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

  async function getMatches() {
    const matches = await backend.get('/api/me/matches', options);

    return matches.map(adaptMatch);
  }

  async function getMatch(matchId) {
    const match = await backend.get(
      `/api/matches/${encodeURIComponent(matchId)}`,
      options
    );

    return adaptMatch(match);
  }

  async function confirmFleet(matchId, fleetSetup) {
    const match = await withMessages(
      backend.post(
        `/api/matches/${encodeURIComponent(matchId)}/moves`,
        { fleetSetup },
        options
      ),
      { 400: 'La ubicación de los barcos no es válida.' }
    );

    return adaptMatch(match);
  }

  async function shoot(matchId, coordinate) {
    const match = await withMessages(
      backend.post(
        `/api/matches/${encodeURIComponent(matchId)}/moves`,
        { shot: coordinate },
        options
      ),
      { 400: shotErrorMessage }
    );

    return adaptMatch(match);
  }

  async function getMoves(matchId) {
    const moves = await withMessages(
      backend.get(`/api/matches/${encodeURIComponent(matchId)}/moves`, options),
      { 400: 'El historial está disponible cuando termina la partida.' }
    );

    return [...moves].sort((first, second) => first.index - second.index);
  }

  async function endMatch(matchId, winner) {
    if (winner !== 'north' && winner !== 'south') {
      throw new Error('El ganador no es válido.');
    }

    return withMessages(
      backend.post(
        `/api/matches/${encodeURIComponent(matchId)}/end`,
        { winner },
        options
      ),
      { 400: 'No se pudo terminar la partida: puede que ya haya terminado.' }
    );
  }

  // Solo organizadores y admins.
  async function deleteMatch(matchId) {
    await backend.delete(
      `/api/matches/${encodeURIComponent(matchId)}`,
      options
    );
  }

  return {
    getBoard,
    getMatches,
    getMatch,
    confirmFleet,
    shoot,
    getMoves,
    endMatch,
    deleteMatch,
  };
}
