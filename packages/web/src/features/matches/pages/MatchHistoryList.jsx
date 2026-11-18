import { Link } from 'react-router-dom';
import PageTitle from '../../../components/common/PageTitle';
import Placeholder from '../../../components/common/Placeholder';

export default function MatchHistoryList({ matches }) {
  const playing = matches.filter((match) => match.status === 'playing');

  return (
    <>
      <PageTitle title="Historial de jugadas" description="Elegí una partida en curso." />
      {playing.length === 0 ? (
        <Placeholder>No tenés partidas en curso.</Placeholder>
      ) : (
        <ul className="jp-shot-list">
          {playing.map((match) => (
            <li key={match.id}>
              <strong>{match.tournamentName}</strong>
              <Link className="jp-text-link" to={`/jugador/partidas/${match.id}/historial`}>
                Ver historial
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
