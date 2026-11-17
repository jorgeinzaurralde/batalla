import { useEffect, useState } from 'react';

import InvitePlayersModal from '../components/InvitePlayersModal';
import TournamentMatchesModal from '../components/TournamentMatchesModal';

import PageTitle from '../../../components/common/PageTitle';
import '../organizer.css';

export default function OrganizerTournaments({ services, user }) {
  const service = services.tournaments;

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [inviting, setInviting] = useState(null);
  const [viewingMatches, setViewingMatches] = useState(null);

  function openForm() {
    setName('');
    setError('');
    setFormOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Escribí un nombre para el torneo.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const tournament = await service.createTournament(trimmed);
      setTournaments((current) => [tournament, ...current]);
      setFormOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    service
      .getAllTournaments()
      .then((all) => {
        if (cancelled) return;
        const visible =
          user.role === 'admin'
            ? all
            : all.filter((t) => t.organisedBy === user.id);
        setTournaments(visible);
      })
      .catch((err) => !cancelled && setLoadError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [service, user]);

  return (
    <>
      <div className="org-heading">
        <PageTitle
          title="Organizar torneos"
          description="Administrá tus competencias."
        />

        <button className="jp-button" type="button" onClick={openForm}>
          Crear torneo
        </button>
      </div>

      <div className="jp-stack">
        {loading && <p role="status">Cargando torneos…</p>}
        {loadError && <p className="jp-error">{loadError}</p>}

        {!loading && !loadError && tournaments.length === 0 && (
          <section className="jp-card">
            <p>Creá un torneo para empezar a invitar jugadores.</p>
          </section>
        )}

        {tournaments.map((tournament) => (
          <article
            className="jp-card jp-match-card org-tournament-card"
            key={tournament.id}
          >
            <div>
              <h2>{tournament.name}</h2>
              <p className="jp-placeholder">
                {tournament.organisedBy === user.id
                  ? 'Organizado por vos'
                  : 'Organizado por otro usuario'}
              </p>
            </div>

            <span className="jp-badge">
              {tournament.winner ? 'Finalizado' : 'En curso'}
            </span>
            <div className="org-card-actions">
              <button
                className="jp-button"
                type="button"
                onClick={() => setInviting(tournament)}
              >
                Invitar
              </button>
              <button
                className="jp-button jp-button-secondary"
                type="button"
                onClick={() => setViewingMatches(tournament)}
              >
                Partidas
              </button>
            </div>
          </article>
        ))}
      </div>

      {formOpen && (
        <div className="org-modal-backdrop">
          <form
            className="org-modal"
            onSubmit={handleSubmit}
            aria-labelledby="crear-torneo-titulo"
          >
            <h2 id="crear-torneo-titulo">Crear torneo</h2>

            <label className="org-field">
              <span>Nombre del torneo</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Copa del Atlántico"
                autoFocus
              />
            </label>

            {error && <p className="jp-error">{error}</p>}

            <div className="org-modal-actions">
              <button className="jp-button" type="submit" disabled={saving}>
                {saving ? 'Creando…' : 'Crear torneo'}
              </button>

              <button
                className="jp-button jp-button-secondary"
                type="button"
                onClick={() => setFormOpen(false)}
                disabled={saving}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {inviting && (
        <InvitePlayersModal
          services={services}
          tournament={inviting}
          onClose={() => setInviting(null)}
        />
      )}

      {viewingMatches && (
        <TournamentMatchesModal
          services={services}
          tournament={viewingMatches}
          onClose={() => setViewingMatches(null)}
          onTournamentUpdated={(updated) =>
            setTournaments((current) =>
              current.map((t) => (t.id === updated.id ? updated : t))
            )
          }
        />
      )}
    </>
  );
}
