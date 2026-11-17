import { useState, useEffect } from 'react';
import MatchCard from '../components/MatchCard';
import PageTitle from '../../../components/common/PageTitle';

export default function PlayerMatches({ services }) {
  const [filter, setFilter] = useState('all');
  const [matches, setMatches] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  //1. Nuevo estado para el orden (requerimiento 2):
  const [order, setOrder] = useState('newest');

  //2. Filtrar primero y ordenar después (requerimientos 3, 4 y 5):
  const visibleMatches = matches
    .filter((match) => {
      if (filter === 'active') return match.status !== 'finished';
      if (filter === 'finished') return match.status === 'finished';
      return true;
    })
    .sort((a, b) => {
      const diff = new Date(b.createdAt) - new Date(a.createdAt);
      return order === 'newest' ? diff : -diff;
  });

  useEffect(() => {
    let cancelled = false;

    async function loadMatches() {
      setStatus('loading');
      setError('');

      try {
        const result = await services.matches.getMatches();

        if (!cancelled) {
          setMatches(result);
          setStatus('success');
        }
      } catch (error) {
        if (!cancelled) {
          setError(error.message);
          setStatus('error');
        }
      }
    }

    loadMatches();

    return () => {
      cancelled = true;
    };
  }, [services, attempt]);

  function retry() {
    setAttempt((current) => current + 1);
  }

  return (
    <>
      <PageTitle
        title="Mis partidas"
        description="Continuá jugando o consultá tus resultados."
      />

            {status === 'loading' && <p role="status">Cargando partidas...</p>}

      {status === 'error' && (
        <section className="jp-card" role="alert">
          <p className="jp-error">No se pudieron cargar las partidas. {error}</p>
          <button className="jp-button" type="button" onClick={retry}>
            Reintentar
          </button>
        </section>
      )}

      {status === 'success' && (
        <>
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

        <label htmlFor="jp-match-order">Ordenar</label>
        <select
          id="jp-match-order"
          value={order}
          onChange={(event) => setOrder(event.target.value)}
        >
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguas</option>
        </select>

      </div>

          <div className="jp-stack">
            {matches.length === 0 ? (
              <section className="jp-card">
                <p>Todavía no tenés partidas.</p>
              </section>
            ) : visibleMatches.length === 0 ? (
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
      )}
    </>
  );
}
