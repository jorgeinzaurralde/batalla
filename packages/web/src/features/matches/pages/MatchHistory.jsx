import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MissingItem from '../../../components/common/MissingItem';
import PageTitle from '../../../components/common/PageTitle';
import Board from '../components/Board';
import BoardLegend from '../components/BoardLegend';
import { coordinateLabel } from '../utils/coordinates';
import { buildTimeline, shotsUntil } from '../utils/shotTimeline';

const ICONS = { water: '💧 Agua', hit: '🎯 Tocado', sunk: '💥 Hundido' };

export default function MatchHistory({ board, matches }) {
  const { matchId } = useParams();
  const match = matches.find((item) => item.id === matchId);

  const timeline = match ? buildTimeline(match) : [];
  const total = timeline.length;

  // step = cantidad de jugadas visibles. step === total → partida actual.
  const [step, setStep] = useState(total);
  const [following, setFollowing] = useState(true);

  // Req. 6: cuando el polling trae disparos nuevos, si estabas en la
  // jugada actual, seguís en la actual; si estabas mirando una vieja, no te mueve.
  useEffect(() => {
    if (following) setStep(total);
  }, [total, following]);

  if (!match || !board) return <MissingItem />;

  const isLive = step === total;
  const { myShots, receivedShots } = shotsUntil(timeline, step);

  function goTo(newStep) {
    const clamped = Math.max(0, Math.min(total, newStep));
    setStep(clamped);
    setFollowing(clamped === total);
  }

  return (
    <>
      <Link className="jp-text-link jp-back" to="/jugador/historial">← Volver</Link>
      <PageTitle
        title="Historial de jugadas"
        description={`Jugada ${step} de ${total}${isLive ? ' (actual)' : ''}`}
      />

      {/* Req. 4 y 5 */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button className="jp-button" type="button" disabled={step === 0} onClick={() => goTo(step - 1)}>
          ← Anterior
        </button>
        <button className="jp-button" type="button" disabled={isLive} onClick={() => goTo(step + 1)}>
          Siguiente →
        </button>
        <button className="jp-button" type="button" disabled={isLive} onClick={() => goTo(total)}>
          Volver a la partida actual
        </button>
      </div>

      <div className="jp-game-layout">
        <section className="jp-card">
          <h2>Tus disparos</h2>
          {/* Req. 7: sin onCellClick y locked → no se puede disparar acá */}
          <Board
            width={board.width}
            height={board.height}
            label={`Tablero rival en la jugada ${step}`}
            shots={myShots}
            shipSizes={board.ships.map((ship) => ship.size)}
            locked
          />
          <BoardLegend />
        </section>

        <section className="jp-card">
          <h2>Tu flota</h2>
          <Board
            width={board.width}
            height={board.height}
            label={`Tu flota en la jugada ${step}`}
            fleet={match.fleet}
            shots={receivedShots}
          />
        </section>
      </div>

      {/* Req. 1 y 2: lista cronológica, clic para ir a esa jugada */}
      <section className="jp-card">
        <h2>Jugadas</h2>
        <ol className="jp-shot-list">
          {timeline.map((shot) => (
            <li key={shot.number}>
              <button
                className="jp-text-link"
                type="button"
                aria-current={shot.number === step ? 'step' : undefined}
                onClick={() => goTo(shot.number)}
              >
                #{shot.number} {shot.mine ? 'Vos' : 'Rival'} → {coordinateLabel(shot.coordinate)}{' '}
                <span className={`jp-text-${shot.result}`}>{ICONS[shot.result]}</span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      {/* Solo desde la jugada actual se puede ir a disparar (Req. 7) */}
      {isLive && match.myTurn && (
        <Link className="jp-button" to={`/jugador/partidas/${match.id}`}>Ir a disparar</Link>
      )}
    </>
  );
}
