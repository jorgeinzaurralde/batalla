import { useMatch } from 'react-router-dom';

import AppRoutes from './AppRoutes';
import { APP_BASE } from './navigation';
import usePlayerData from '../features/player/hooks/usePlayerData';

import '../styles/app.css';

// Parte de la aplicación con sesión iniciada: carga los datos del usuario
// y, si hay una partida abierta, la consulta periódicamente.
export default function AuthenticatedApp({
  user,
  token,
  onLogout,
  onSessionExpired,
}) {
  const routeMatch = useMatch(`${APP_BASE}/partidas/:matchId/*`);
  const matchId = routeMatch ? routeMatch.params.matchId : null;

  const player = usePlayerData({
    token,
    userId: user.id,
    matchId,
    onSessionExpired,
  });

  return (
    <AppRoutes
      user={user}
      onLogout={onLogout}
      onSessionExpired={onSessionExpired}
      player={player}
    />
  );
}
