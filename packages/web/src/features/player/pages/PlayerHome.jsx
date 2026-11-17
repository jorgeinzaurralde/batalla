import { Link } from 'react-router-dom';

import PageTitle from '../../../components/common/PageTitle';
import MatchCard from '../../matches/components/MatchCard';

import { getMatchPath } from '../../matches/utils/matchHelpers';

export default function PlayerHome({ data, onInvitationResponse }) {
  const invitations = data.invitations.filter(
    (invitation) => invitation.status === 'pending'
  );

  const currentMatch = data.matches.find(
    (match) => match.status === 'playing' && match.myTurn
  );

  return (
    <>
      <PageTitle
        title="¡Hola, Capitán!"
        description="Tu próxima jugada te espera."
      />

      <section className="jp-hero">
        <div>
          <p>{currentMatch ? currentMatch.tournamentName : 'Batalla Naval'}</p>

          <h2>
            {currentMatch
              ? 'Tenés una partida en curso'
              : 'Consultá tus partidas'}
          </h2>
        </div>

        <Link
          className="jp-button"
          to={currentMatch ? getMatchPath(currentMatch) : '/jugador/partidas'}
        >
          {currentMatch ? 'Continuar partida' : 'Ver partidas'}
        </Link>
      </section>

      <div className="jp-two-columns">
        <section className="jp-card">
          <h2>Invitaciones {'  '}
            <span className="jp-badge">{invitations.length}</span>
          </h2>


          {invitations.length === 0 && <p>No tenés invitaciones pendientes.</p>}

          {invitations.map((invitation) => (
            <article className="jp-list-item" key={invitation.id}>
              <h3>{invitation.tournamentInfo?.name ?? 'Torneo'}</h3>

              <p className="jp-placeholder">
                Te invitaron a participar en este torneo.
              </p>

              <div className="jp-actions">
                <button
                  className="jp-button"
                  type="button"
                  onClick={() =>
                    onInvitationResponse(invitation.id, 'accepted')
                  }
                >
                  Aceptar
                </button>

                <button
                  className="jp-button jp-button-secondary"
                  type="button"
                  onClick={() =>
                    onInvitationResponse(invitation.id, 'rejected')
                  }
                >
                  Rechazar
                </button>
              </div>
            </article>
          ))}
        </section>

        <section className="jp-card">
          <h2>Mis partidas</h2>

          {data.matches.length === 0 && <p>Todavía no tenés partidas.</p>}

          {data.matches.slice(0, 3).map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}

          <Link className="jp-text-link" to="/jugador/partidas">
            Ver todas las partidas
          </Link>
        </section>
      </div>
    </>
  );
}
