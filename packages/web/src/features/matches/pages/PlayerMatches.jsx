import { useState } from 'react';
import MatchCard from '../components/MatchCard';
import PageTitle from '../../../components/common/PageTitle';

export default function PlayerMatches({ matches }) {
  const [filter, setFilter] = useState('all');

  const visibleMatches = matches.filter((match) => {
    if (filter === 'active') {
      return match.status !== 'finished';
    }

    if (filter === 'finished') {
      return match.status === 'finished';
    }

    return true;
  });

  return (
    <>
      <PageTitle
        title="Mis partidas"
        description="Continuá jugando o consultá tus resultados."
      />

      <div className="jp-filter">
        <label htmlFor="jp-match-filter">Mostrar</label>

        <select
          id="jp-match-filter"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">Todas las partidas</option>
          <option value="active">Sin terminar</option>
          <option value="finished">Terminadas</option>
        </select>
      </div>

      <div className="jp-stack">
        {visibleMatches.length === 0 ? (
          <section className="jp-card">
            <p>No hay partidas para este filtro.</p>
          </section>
        ) : (
          visibleMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))
        )}
      </div>
    </>
  );
}
