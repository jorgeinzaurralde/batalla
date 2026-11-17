import { Link, useParams } from 'react-router-dom';

import PageTitle from '../../../components/common/PageTitle';
import MissingItem from '../../../components/common/MissingItem';

import MatchCard from '../../matches/components/MatchCard';
import { getWinnerLabel } from '../utils/winnerLabel';

export default function TournamentDetail({ data, user }) {
  const { tournamentId } = useParams();

  const tournament = data.tournaments.find((item) => item.id === tournamentId);

  if (!tournament) {
    return <MissingItem />;
  }

  const matches = data.matches.filter(
    (match) => match.tournamentId === tournament.id
  );

  return (
    <>
      <Link className="jp-text-link jp-back" to="/jugador/torneos">
        ← Volver a torneos
      </Link>

      <PageTitle
        title={tournament.name}
        description="Información del torneo."
      />

      <section className="jp-card">
        <h2>Información del torneo</h2>

        <p className="jp-text-accent">Tu invitación está aceptada.</p>

        <p>{getWinnerLabel(tournament, user)}</p>
      </section>

      <section className="jp-card">
        <h2>Tus partidas en este torneo</h2>

        {matches.length === 0 && <p>Todavía no tenés partidas disponibles.</p>}

        {matches.map((match) => (
          <div className="jp-list-item" key={match.id}>
            <MatchCard match={match} />
          </div>
        ))}
      </section>
    </>
  );
}
