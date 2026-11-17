import { Link } from 'react-router-dom';

import { getMatchPath, getMatchStatus } from '../utils/matchHelpers';

export default function MatchCard({ match }) {
  let buttonText = 'Abrir partida';

  if (match.status === 'preparation') {
    buttonText = 'Preparar flota';
  } else if (match.status === 'finished') {
    buttonText = 'Ver resultado e historial';
  }

  return (
    <article className="jp-card jp-match-card">
      <div>
        <h3>Partida contra rival</h3>

        <p className="jp-placeholder">{match.tournamentName}</p>

        <span className="jp-badge">{getMatchStatus(match)}</span>
      </div>

      <Link
        className={match.myTurn ? 'jp-button' : 'jp-button jp-button-secondary'}
        to={getMatchPath(match)}
      >
        {buttonText}
      </Link>
    </article>
  );
}
