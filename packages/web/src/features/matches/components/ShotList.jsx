import Placeholder from '../../../components/common/Placeholder';
import { coordinateLabel } from '../utils/coordinates';

export default function ShotList({ shots, emptyText }) {
  if (shots.length === 0) {
    return <Placeholder>{emptyText}</Placeholder>;
  }

  return (
    <ul className="jp-shot-list">
      {shots.map((shot) => (
        <li key={coordinateLabel(shot.coordinate)}>
          <strong>{coordinateLabel(shot.coordinate)}</strong>

          <span>
            {{
              water: '💧 Agua',
              hit: '🎯 Tocado',
              sunk: '💥 Hundido',
            }[shot.result] ?? 'Sin resultado'}
          </span>
        </li>
      ))}
    </ul>
  );
}
