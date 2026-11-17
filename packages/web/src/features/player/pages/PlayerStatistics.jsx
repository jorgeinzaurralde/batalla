import PageTitle from '../../../components/common/PageTitle';

function formatPercent(value) {
  return `${value.toLocaleString('es-AR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export default function PlayerStatistics({ matches }) {
  const finished = matches.filter((match) => match.status === 'finished');

  const played = finished.length;
  const victories = finished.filter((m) => m.result === 'victory').length;
  const defeats = finished.filter((m) => m.result === 'defeat').length;

  const winRate = played === 0 ? 0 : (victories / played) * 100;

  const stats = [
    { value: played, label: 'Partidas jugadas' },
    { value: victories, label: 'Victorias' },
    { value: defeats, label: 'Derrotas' },
    { value: formatPercent(winRate), label: 'Porcentaje de victorias' },
  ];

  return (
    <>
      <PageTitle
        title="Mis estadísticas"
        description="Resumen de tus partidas terminadas."
      />

      <div className="jp-two-columns">
        {stats.map((stat) => (
          <section className="jp-card" key={stat.label}>
            <h2>{stat.value}</h2>
            <p>{stat.label}</p>
          </section>
        ))}
      </div>
    </>
  );
}
