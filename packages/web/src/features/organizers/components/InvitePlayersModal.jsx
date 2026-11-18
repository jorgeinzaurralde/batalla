import { useEffect, useState } from 'react';

import ConfirmDialog from '../../../components/common/ConfirmDialog';

const STATUS_LABEL = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
};

// Si un jugador rechazó y lo volvieron a invitar, tiene dos invitaciones.
// Manda la vigente (pendiente o aceptada) sobre la rechazada.
function latestByUser(invitations) {
  const map = new Map();

  for (const invitation of invitations) {
    const current = map.get(invitation.invitedUser);
    if (!current || current.status === 'rejected') {
      map.set(invitation.invitedUser, invitation);
    }
  }

  return map;
}

function plural(count, singular, pluralForm) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

export default function InvitePlayersModal({ services, tournament, onClose }) {
  const [players, setPlayers] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [invitations, setInvitations] = useState([]);
  const [revoking, setRevoking] = useState(null);
  const [confirmingRevoke, setConfirmingRevoke] = useState(null);

  useEffect(() => {
    Promise.all([
      services.users.getUsers(),
      services.invitations.getTournamentInvitations(tournament.id),
    ])
      .then(([users, list]) => {
        // No se puede invitar al organizador
        setPlayers(users.filter((u) => u.id !== tournament.organisedBy));
        setInvitations(list);
      })
      .catch((err) => setError(err.message));
  }, [services, tournament]);

  const invitationsByUser = latestByUser(invitations);

  const counts = { accepted: 0, pending: 0, rejected: 0 };
  invitationsByUser.forEach((i) => {
    counts[i.status] += 1;
  });

  const summary = [
    plural(counts.accepted, 'aceptada', 'aceptadas'),
    plural(counts.pending, 'pendiente', 'pendientes'),
    plural(counts.rejected, 'rechazada', 'rechazadas'),
  ].join(' · ');

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (selected.size === 0) return setError('Elegí al menos un jugador.');

    setSaving(true);
    setError('');
    const { invited, errors } = await services.invitations.invitePlayers(
      tournament.id,
      [...selected]
    );
    setSaving(false);

    // Las que salieron bien se suman aunque otras fallen; el modal sigue abierto.
    setInvitations((prev) => [...prev, ...invited]);
    setSelected(new Set());
    if (errors.length) setError(errors.join(' · '));
  }

  async function handleRevoke(userId) {
    const invitation = invitationsByUser.get(userId);
    if (!invitation) return;

    try {
      setRevoking(userId);
      setError('');
      await services.invitations.revokeInvitation(invitation.id);
      setInvitations((prev) => prev.filter((i) => i.id !== invitation.id));
    } catch (err) {
      setError(err.message); // p.ej. el jugador ya jugó partidas en el torneo
    } finally {
      setRevoking(null);
      setConfirmingRevoke(null);
    }
  }

  const playerToRevoke = players.find((p) => p.id === confirmingRevoke);

  return (
    <div className="org-modal-backdrop">
      <form className="org-modal" onSubmit={handleSubmit}>
        <h2>Invitar jugadores a {tournament.name}</h2>

        <p className="org-invite-summary">{summary}</p>

        <ul className="org-player-list">
          {players.map((p) => {
            const invitation = invitationsByUser.get(p.id);
            const status = invitation?.status;
            const active = status === 'pending' || status === 'accepted';

            return (
              <li key={p.id}>
                <label>
                  <input
                    type="checkbox"
                    disabled={active}
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                  />
                  {p.email}
                  {status && (
                    <span className={`org-status org-status-${status}`}>
                      {STATUS_LABEL[status]}
                    </span>
                  )}
                </label>

                {active && (
                  <button
                    type="button"
                    className="jp-button jp-button-secondary"
                    onClick={() => setConfirmingRevoke(p.id)}
                    disabled={revoking !== null || saving}
                  >
                    {revoking === p.id ? 'Revocando…' : 'Revocar'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {error && <p className="jp-error">{error}</p>}

        <div className="org-modal-actions">
          <button className="jp-button" type="submit" disabled={saving}>
            {saving ? 'Invitando…' : 'Invitar'}
          </button>
          <button
            className="jp-button jp-button-secondary"
            type="button"
            onClick={onClose}
            disabled={revoking !== null || saving}
          >
            Cerrar
          </button>
        </div>
      </form>

      {playerToRevoke && (
        <ConfirmDialog
          title="Revocar invitación"
          message={`${playerToRevoke.email} ya no va a poder participar de ${tournament.name}.`}
          confirmLabel="Revocar"
          busy={revoking !== null}
          onConfirm={() => handleRevoke(playerToRevoke.id)}
          onCancel={() => setConfirmingRevoke(null)}
        />
      )}
    </div>
  );
}


/*import { useEffect, useState } from 'react';

import ConfirmDialog from '../../../components/common/ConfirmDialog';

export default function InvitePlayersModal({ services, tournament, onClose }) {
  const [players, setPlayers] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [invitationsByUser, setInvitationsByUser] = useState(new Map());
  const [revoking, setRevoking] = useState(null);
  const [confirmingRevoke, setConfirmingRevoke] = useState(null);

  useEffect(() => {
    Promise.all([
      services.users.getUsers(),
      services.invitations.getTournamentInvitations(tournament.id),
    ])
      .then(([users, invitations]) => {
        // No se puede invitar al organizador; las rechazadas se pueden reinvitar
        setPlayers(users.filter((u) => u.id !== tournament.organisedBy));
        setInvitationsByUser(
          new Map(
            invitations
              .filter((i) => i.status !== 'rejected')
              .map((i) => [i.invitedUser, i])
          )
        );
      })
      .catch((err) => setError(err.message));
  }, [services, tournament]);

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (selected.size === 0) return setError('Elegí al menos un jugador.');
    setSaving(true);
    const { errors } = await services.invitations.invitePlayers(tournament.id, [
      ...selected,
    ]);
    setSaving(false);
    if (errors.length) setError(errors.join(' · '));
    else onClose();
  }

  async function handleRevoke(userId) {
    const invitation = invitationsByUser.get(userId);
    if (!invitation) return;

    try {
      setRevoking(userId);
      setError('');
      await services.invitations.revokeInvitation(invitation.id);
      setInvitationsByUser((prev) => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    } catch (err) {
      setError(err.message); // p.ej. el jugador ya jugó partidas en el torneo
    } finally {
      setRevoking(null);
      setConfirmingRevoke(null);
    }
  }

  const playerToRevoke = players.find((p) => p.id === confirmingRevoke);

  return (
    <div className="org-modal-backdrop">
      <form className="org-modal" onSubmit={handleSubmit}>
        <h2>Invitar jugadores a {tournament.name}</h2>
        <ul className="org-player-list">
          {players.map((p) => {
            const invitation = invitationsByUser.get(p.id);
            return (
              <li key={p.id}>
                <label>
                  <input
                    type="checkbox"
                    disabled={!!invitation}
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                  />
                  {p.email}{' '}
                  {invitation && (
                    <small>
                      (
                      {invitation.status === 'accepted'
                        ? 'aceptó'
                        : 'pendiente'}
                      )
                    </small>
                  )}
                </label>
                {invitation && (
                  <button
                    type="button"
                    className="jp-button jp-button-secondary"
                    onClick={() => setConfirmingRevoke(p.id)}
                    disabled={revoking === p.id}
                  >
                    {revoking === p.id ? 'Revocando…' : 'Revocar'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {error && <p className="jp-error">{error}</p>}
        <div className="org-modal-actions">
          <button className="jp-button" type="submit" disabled={saving}>
            {saving ? 'Invitando…' : 'Invitar'}
          </button>
          <button
            className="jp-button jp-button-secondary"
            type="button"
            onClick={onClose}
            disabled={revoking !== null}
          >
            Cancelar
          </button>
        </div>
      </form>

      {playerToRevoke && (
        <ConfirmDialog
          title="Revocar invitación"
          message={`${playerToRevoke.email} ya no va a poder participar de ${tournament.name}.`}
          confirmLabel="Revocar"
          busy={revoking !== null}
          onConfirm={() => handleRevoke(playerToRevoke.id)}
          onCancel={() => setConfirmingRevoke(null)}
        />
      )}
    </div>
  );
}*/
