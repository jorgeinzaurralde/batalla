import { Link } from 'react-router-dom';

import PageTitle from '../../../components/common/PageTitle';
import { getWinnerLabel } from '../utils/winnerLabel';

export default function PlayerTournaments({ tournaments, matches, user }) {
  return (
    <>
      <PageTitle
        title="Torneos"
        description="Los torneos de los que formás parte."
      />

      <div className="jp-stack">
        {tournaments.length === 0 && (
          <section className="jp-card">
            <p>Todavía no aceptaste invitaciones a torneos.</p>
          </section>
        )}

        {tournaments.map((tournament) => {
          const tournamentMatches = matches.filter(
            (match) => match.tournamentId === tournament.id
          );

          return (
            <article className="jp-card jp-match-card" key={tournament.id}>
              <div>
                <h2>{tournament.name}</h2>

                <p className="jp-placeholder">
                  {getWinnerLabel(tournament, user)}
                </p>

                <span className="jp-badge">
                  {tournamentMatches.length} partidas tuyas
                </span>
              </div>

              <Link
                className="jp-button jp-button-secondary"
                to={`/jugador/torneos/${tournament.id}`}
              >
                Ver torneo
              </Link>
            </article>
          );
        })}
      </div>
    </>
  );
}
