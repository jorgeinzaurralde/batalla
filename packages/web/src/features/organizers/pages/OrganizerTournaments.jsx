import { useEffect, useState } from 'react';

import InvitePlayersModal from '../components/InvitePlayersModal';
import TournamentMatchesModal from '../components/TournamentMatchesModal';

import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { ROLES } from '../../../app/roles';


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

  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const [deleting, setDeleting] = useState(null);      // torneo a confirmar
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const canDelete = (tournament) =>
    user.role === ROLES.admin || tournament.organisedBy === user.id;

  async function handleDelete() {
    if (deleteBusy) return;

    try {
      setDeleteBusy(true);
      setDeleteError('');
      await service.deleteTournament(deleting.id);
      setTournaments((current) => current.filter((t) => t.id !== deleting.id));
    } catch (err) {
      setDeleteError(err.message); // el torneo queda en la lista
    } finally {
      setDeleteBusy(false);
      setDeleting(null);
    }
  }


  function openEdit(tournament) {
    setEditing(tournament);
    setEditName(tournament.name); // RF3: arranca con el nombre actual
    setEditError('');
  }

  function closeEdit() {
    setEditing(null); // RF6: cancelar sin guardar
  }

  async function handleEditSubmit(event) {
    event.preventDefault();

    const trimmed = editName.trim();
    if (!trimmed) {
      setEditError('Escribí un nombre para el torneo.');
      return;
    }
    if (trimmed === editing.name) {
      closeEdit();
      return;
    }

    try {
      setEditSaving(true);
      setEditError('');
      const updated = await service.renameTournament(editing.id, trimmed); // RF4
      // RF5: se actualiza la lista sin recargar la página
      setTournaments((current) =>
        current.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
      );
      closeEdit();
    } catch (err) {
      setEditError(err.message); // RF7
    } finally {
      setEditSaving(false);
    }
  }


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

        {deleteError && (
          <p className="jp-error" role="alert">
            {deleteError}
          </p>
        )}


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
                className="jp-button jp-button-secondary"
                type="button"
                onClick={() => openEdit(tournament)}
              >
                Editar
              </button>                   
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
                {canDelete(tournament) && (
                    <button
                      className="jp-button jp-button-secondary"
                      type="button"
                      onClick={() => {
                        setDeleteError('');
                        setDeleting(tournament);
                      }}
                    >
                      Eliminar
                    </button>
                  )}              
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

      {editing && (
        <div className="org-modal-backdrop">
          <form
            className="org-modal"
            onSubmit={handleEditSubmit}
            aria-labelledby="editar-torneo-titulo"
          >
            <h2 id="editar-torneo-titulo">Editar torneo</h2>

            <label className="org-field">
              <span>Nombre del torneo</span>
              <input
                type="text"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                autoFocus
              />
            </label>

            {editError && <p className="jp-error">{editError}</p>}

            <div className="org-modal-actions">
              <button className="jp-button" type="submit" disabled={editSaving}>
                {editSaving ? 'Guardando…' : 'Guardar'}
              </button>
              <button
                className="jp-button jp-button-secondary"
                type="button"
                onClick={closeEdit}
                disabled={editSaving}
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

      {deleting && (
        <ConfirmDialog
          title="Eliminar torneo"
          message={`Se va a eliminar «${deleting.name}». Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          busyLabel="Eliminando…"
          busy={deleteBusy}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
      
    </>
  );
}
