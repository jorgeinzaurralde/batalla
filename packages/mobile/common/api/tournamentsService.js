import { apiFetch } from './client';

export function getTournaments(token) {
  return apiFetch('/api/me/tournaments', { token });
}

export function getTournament(token, tournamentId) {
  return apiFetch(`/api/tournaments/${encodeURIComponent(tournamentId)}`, {
    token,
  });
}
