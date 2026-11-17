import { createInvitationsService } from './api/invitationsService';
import { createMatchesService } from './api/matchesService';
import { createTournamentsService } from './api/tournamentsService';
import { createUsersService } from './api/usersService';

// Un service por recurso de la API, todos con el token de la sesión.
// Para sumar un recurso nuevo: crear su archivo en api/ y agregarlo acá.
export function createServices(token, userId) {
  return {
    invitations: createInvitationsService(token),
    matches: createMatchesService(token, userId),
    tournaments: createTournamentsService(token),
    users: createUsersService(token),
  };
}
