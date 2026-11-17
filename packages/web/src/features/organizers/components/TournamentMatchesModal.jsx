import { useEffect, useState } from 'react';

import ConfirmDialog from '../../../components/common/ConfirmDialog';

export default function TournamentMatchesModal({
  services,
  tournament,
  onClose,
  onTournamentUpdated,
}) {
  const [matches, setMatches] = useState([]);
  const [emails, setEmails] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [abandoning, setAbandoning] = useState(null); //partida seleccionada
  const [saving, setSaving] = useState(false);

  /*Armado de partidas****/
  const [players, setPlayers] = useState([]);
  const [north, setNorth] = useState('');
  const [south, setSouth] = useState('');
  const [creating, setCreating] = useState(false);

  /*Ganador del torneo****/
  const [winner, setWinner] = useState(tournament.winner);
  const [candidate, setCandidate] = useState('');
  const [savingWinner, setSavingWinner] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(null);

  const busy = creating || savingWinner || saving || deletingId !== null;

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      services.users.getUsers(),
      services.tournaments.getTournamentMatches(tournament.id),
      services.invitations.getTournamentInvitations(tournament.id),
    ])
      .then(([users, list, invitations]) => {
        if (cancelled) return;
        setEmails(new Map(users.map((u) => [u.id, u.email])));
        setMatches(list);
        setPlayers(
          invitations
            .filter((i) => i.status === 'accepted')
            .map((i) => i.invitedUser)
        );
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [services, tournament]);

  useEffect(() => {
    function handleKey(event) {
      if (event.key !== 'Escape' || busy) return;
      if (abandoning) {
        setAbandoning(null);
      } else {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [abandoning, busy, onClose]);

  const emailOf = (id) => emails.get(id) ?? id;
  const loginOf = (id) => emailOf(id).split('@')[0];
  const isFinished = (m) => Boolean(m.endedAt || m.winner);
  const winnerOf = (m) =>
    m.winner === 'north' ? m.playerNorth : m.playerSouth;

  const winnerCandidates = [
    ...new Set(matches.filter((m) => m.winner).map(winnerOf)),
  ];

  const sortedMatches = [
    ...matches.filter((m) => !isFinished(m)),
    ...matches.filter(isFinished),
  ];

  async function handleSetWinner(event) {
    event.preventDefault();

    if (!candidate) {
      setError('Seleccione al ganador del torneo.');
      return;
    }

    try {
      setSavingWinner(true);
      setError('');
      const updated = await services.tournaments.setWinner(
        tournament.id,
        candidate
      );
      setWinner(updated.winner);
      setCandidate('');
      onTournamentUpdated?.(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingWinner(false);
    }
  }

  async function handleAbandon(abandonedSide) {
    // El que abandona pierde: gana el otro lado
    const winner = abandonedSide === 'north' ? 'south' : 'north';

    try {
      setSaving(true);
      setError('');
      const updated = await services.matches.endMatch(abandoning.id, winner);
      setMatches((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
      setAbandoning(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(match) {
    try {
      setDeletingId(match.id);
      setError('');
      await services.matches.deleteMatch(match.id);
      setMatches((prev) => prev.filter((m) => m.id !== match.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
      setConfirmingDelete(null);
    }
  }

  async function handleCreate(event) {
    event.preventDefault();

    if (!north || !south) {
      setError('Elegí los dos jugadores.');
      return;
    }
    if (north === south) {
      setError('Un jugador no puede jugar contra sí mismo.');
      return;
    }

    try {
      setCreating(true);
      setError('');
      const match = await services.tournaments.createMatch(
        tournament.id,
        north,
        south
      );
      setMatches((prev) => [match, ...prev]);
      setNorth('');
      setSouth('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function handleBackdropClick(event) {
    if (event.target !== event.currentTarget || busy) return;
    if (abandoning) {
      setAbandoning(null);
    } else {
      onClose();
    }
  }

  if (abandoning) {
    const north = loginOf(abandoning.playerNorth);
    const south = loginOf(abandoning.playerSouth);

    return (
      <div className="org-modal-backdrop" onMouseDown={handleBackdropClick}>
        <div
          className="org-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="abandono-titulo"
        >
          <h2 id="abandono-titulo">Marcar abandono</h2>
          <p>¿Qué jugador abandonó?</p>

          <div className="org-abandon-options">
            <button
              className="jp-button jp-button-secondary"
              type="button"
              disabled={saving}
              onClick={() => handleAbandon('north')}
            >
              {north}
            </button>
            <button
              className="jp-button jp-button-secondary"
              type="button"
              disabled={saving}
              onClick={() => handleAbandon('south')}
            >
              {south}
            </button>
          </div>

          {error && <p className="jp-error">{error}</p>}

          <div className="org-modal-actions">
            <button
              className="jp-button jp-button-secondary"
              type="button"
              disabled={saving}
              onClick={() => {
                setAbandoning(null);
                setError('');
              }}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="org-modal-backdrop" onMouseDown={handleBackdropClick}>
      <div
        className="org-modal org-modal-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="partidas-titulo"
      >
        <header className="org-modal-header">
          <div>
            <h2 id="partidas-titulo">{tournament.name}</h2>
            <p className="org-modal-subtitle">
              {winner ? `Ganador: ${loginOf(winner)}` : 'Torneo en curso'}
            </p>
          </div>

          <button
            className="org-modal-close"
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        <div className="org-modal-body">
          {error && (
            <p className="jp-error" role="alert">
              {error}
            </p>
          )}

          {loading && <p role="status">Cargando partidas…</p>}

          {!loading && (
            <>
              <section
                className="org-section"
                aria-labelledby="nueva-partida-titulo"
              >
                <h3 id="nueva-partida-titulo">Nueva partida</h3>

                {players.length < 2 ? (
                  <p className="jp-placeholder">
                    Se necesitan al menos 2 jugadores con la invitación
                    aceptada.
                  </p>
                ) : (
                  <form className="org-inline-form" onSubmit={handleCreate}>
                    <label className="org-field">
                      <span>Norte (dispara primero)</span>
                      <select
                        value={north}
                        onChange={(e) => setNorth(e.target.value)}
                      >
                        <option value="">Elegí</option>
                        {players.map((id) => (
                          <option key={id} value={id} disabled={id === south}>
                            {loginOf(id)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="org-field">
                      <span>Sur</span>
                      <select
                        value={south}
                        onChange={(e) => setSouth(e.target.value)}
                      >
                        <option value="">Elegí</option>
                        {players.map((id) => (
                          <option key={id} value={id} disabled={id === north}>
                            {loginOf(id)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      className="jp-button"
                      type="submit"
                      disabled={creating}
                    >
                      {creating ? 'Creando…' : 'Crear'}
                    </button>
                  </form>
                )}
              </section>

              <section
                className="org-section"
                aria-labelledby="lista-partidas-titulo"
              >
                <h3 id="lista-partidas-titulo">Partidas ({matches.length})</h3>

                {matches.length === 0 ? (
                  <p className="jp-placeholder">
                    Este torneo todavía no tiene partidas.
                  </p>
                ) : (
                  <ul className="org-match-list">
                    {sortedMatches.map((m) => (
                      <li key={m.id}>
                        <span className="org-match-players">
                          {loginOf(m.playerNorth)} <small>vs</small>{' '}
                          {loginOf(m.playerSouth)}
                        </span>

                        {isFinished(m) ? (
                          <span className="org-chip org-chip-done">
                            Ganó {loginOf(winnerOf(m))}
                          </span>
                        ) : (
                          <>
                            <span className="org-chip">En curso</span>
                            <button
                              className="org-link-button"
                              type="button"
                              onClick={() => setAbandoning(m)}
                            >
                              Marcar abandono
                            </button>
                          </>
                        )}

                        <button
                          className="org-link-button"
                          type="button"
                          disabled={busy}
                          onClick={() => setConfirmingDelete(m)}
                        >
                          {deletingId === m.id ? 'Eliminando…' : 'Eliminar'}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="org-section" aria-labelledby="ganador-titulo">
                <h3 id="ganador-titulo">Ganador del torneo</h3>

                {winnerCandidates.length === 0 ? (
                  <p className="jp-placeholder">
                    Para definir un ganador tiene que haber al menos una partida
                    terminada.
                  </p>
                ) : (
                  <form className="org-inline-form" onSubmit={handleSetWinner}>
                    <label className="org-field">
                      <span>
                        {winner ? 'Cambiar ganador' : 'Jugadores con victorias'}
                      </span>
                      <select
                        value={candidate}
                        onChange={(e) => setCandidate(e.target.value)}
                      >
                        <option value="">Elegí</option>
                        {winnerCandidates.map((id) => (
                          <option key={id} value={id} disabled={id === winner}>
                            {loginOf(id)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      className="jp-button"
                      type="submit"
                      disabled={savingWinner}
                    >
                      {savingWinner ? 'Guardando…' : 'Definir'}
                    </button>
                  </form>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          title="Eliminar partida"
          message={`Se va a eliminar la partida ${loginOf(confirmingDelete.playerNorth)} vs ${loginOf(confirmingDelete.playerSouth)}. No se puede deshacer.`}
          confirmLabel="Eliminar"
          busy={deletingId !== null}
          onConfirm={() => handleDelete(confirmingDelete)}
          onCancel={() => setConfirmingDelete(null)}
        />
      )}
    </div>
  );
}
