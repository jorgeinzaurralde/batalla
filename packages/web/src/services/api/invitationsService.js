import { backend, sessionOptions } from './client';
import { withMessages } from './errors';

export function createInvitationsService(token) {
  const options = sessionOptions(token);

  function adaptInvitation(invitation) {
    let status = 'pending';

    if (invitation.acceptedAt) {
      status = 'accepted';
    } else if (invitation.rejectedAt) {
      status = 'rejected';
    }

    return {
      ...invitation,
      tournamentId: invitation.tournament,
      status,
    };
  }

  async function getInvitations() {
    const invitations = await backend.get('/api/me/invitations', options);

    return Promise.all(
      invitations.map(async (invitation) => {
        const tournamentInfo = await backend
          .get(
            `/api/tournaments/${encodeURIComponent(invitation.tournament)}`,
            options
          )
          .catch(() => null);

        return {
          ...adaptInvitation(invitation),
          tournamentInfo,
        };
      })
    );
  }

  async function respondToInvitation(invitationId, status) {
    if (status !== 'accepted' && status !== 'rejected') {
      throw new Error('La respuesta no es válida.');
    }

    const action = status === 'accepted' ? 'accept' : 'reject';

    const invitation = await withMessages(
      backend.post(
        `/api/invitations/${encodeURIComponent(invitationId)}/${action}`,
        {},
        options
      ),
      { 400: 'Esta invitación ya fue respondida.' }
    );

    return adaptInvitation(invitation);
  }

  async function getTournamentInvitations(tournamentId) {
    const list = await backend.get(
      `/api/tournaments/${encodeURIComponent(tournamentId)}/invitations`,
      options
    );
    return list.map(adaptInvitation);
  }

  async function invitePlayers(tournamentId, playerIds) {
    const results = await Promise.allSettled(
      playerIds.map((invitedUser) =>
        withMessages(
          backend.put(
            '/api/invitations',
            { invitedUser, tournament: tournamentId },
            options
          ),
          {
            400: 'Algún usuario ya tenía una invitación a este torneo o es su organizador.',
          }
        )
      )
    );
    return {
      invited: results
        .filter((r) => r.status === 'fulfilled')
        .map((r) => adaptInvitation(r.value)),
      // Sin repetir el mismo mensaje por cada usuario que falló.
      errors: [
        ...new Set(
          results
            .filter((r) => r.status === 'rejected')
            .map((r) => r.reason.message)
        ),
      ],
    };
  }

  async function revokeInvitation(invitationId) {
    await withMessages(
      backend.delete(
        `/api/invitations/${encodeURIComponent(invitationId)}`,
        options
      ),
      {
        400: 'No se puede revocar: el jugador ya participó en partidas de este torneo.',
      }
    );
  }

  return {
    getInvitations,
    respondToInvitation,
    getTournamentInvitations,
    invitePlayers,
    revokeInvitation,
  };
}
