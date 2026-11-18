import { backend, sessionOptions } from './client';
import { withMessages } from './errors';

export function createTournamentsService(token) {
  const options = sessionOptions(token);

  async function getTournaments() {
    return backend.get('/api/me/tournaments', options);
  }

  async function getTournament(tournamentId) {
    return backend.get(
      `/api/tournaments/${encodeURIComponent(tournamentId)}`,
      options
    );
  }

  async function createTournament(name) {
    return backend.put('/api/tournaments', { name }, options);
  }

  async function getAllTournaments() {
    return backend.get('/api/tournaments', options);
  }

  async function getTournamentMatches(tournamentId) {
    return backend.get(
      `/api/tournaments/${encodeURIComponent(tournamentId)}/matches`,
      options
    );
  }

  async function createMatch(tournamentId, playerNorth, playerSouth) {
    return withMessages(
      backend.put(
        `/api/tournaments/${encodeURIComponent(tournamentId)}/matches`,
        { playerNorth, playerSouth },
        options
      ),
      {
        400: 'No se puede crear la partida: los jugadores tienen que ser distintos y haber aceptado la invitación al torneo.',
      }
    );
  }

  async function setWinner(tournamentId, winner) {
    return withMessages(
      backend.patch(
        `/api/tournaments/${encodeURIComponent(tournamentId)}`,
        { winner },
        options
      ),
      {
        400: 'Solo puede ganar el torneo un jugador que haya ganado alguna partida del torneo.',
      }
    );
  }

    async function renameTournament(tournamentId, name) {
    return withMessages(
      backend.patch(
        `/api/tournaments/${encodeURIComponent(tournamentId)}`,
        { name },
        options
      ),
      {
        400: 'No se pudo modificar el nombre: revisá que sea válido.',
        403: 'No tenés permiso para modificar este torneo.',
        404: 'El torneo ya no existe.',
      }
    );
  }

  async function deleteTournament(tournamentId) {
  await withMessages(
    backend.delete(
      `/api/tournaments/${encodeURIComponent(tournamentId)}`,
      options
    ),
    {
      400: 'No se puede eliminar el torneo: puede que ya tenga partidas jugadas.',
      403: 'No tenés permiso para eliminar este torneo.',
      404: 'El torneo ya no existe.',
    }
  );
}



  return {
    getTournaments,
    getTournament,
    createTournament,
    getAllTournaments,
    getTournamentMatches,
    createMatch,
    setWinner,
    renameTournament,
    deleteTournament,
  };
}
