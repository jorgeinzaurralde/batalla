import { apiFetch } from './client';
import { withMessages } from './errors';
import { getTournament } from './tournamentsService';

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

export async function getInvitations(token) {
  const invitations = await apiFetch('/api/me/invitations', { token });

  return Promise.all(
    invitations.map(async (invitation) => ({
      ...adaptInvitation(invitation),
      tournamentInfo: await getTournament(token, invitation.tournament),
    }))
  );
}

export async function respondToInvitation(token, invitationId, status) {
  if (status !== 'accepted' && status !== 'rejected') {
    throw new Error('La respuesta no es válida.');
  }

  const action = status === 'accepted' ? 'accept' : 'reject';

  const invitation = await withMessages(
    apiFetch(`/api/invitations/${encodeURIComponent(invitationId)}/${action}`, {
      method: 'POST',
      body: {},
      token,
    }),
    { 400: 'Esta invitación ya fue respondida.' }
  );

  return adaptInvitation(invitation);
}
