import { Route, Routes } from 'react-router-dom';

import AppLayout from './AppLayout';
import { ADMIN_ROLES, ORGANIZER_ROLES } from './roles';

import MissingItem from '../components/common/MissingItem';
import RequireRole from '../components/common/RequireRole';

import PlayerHome from '../features/player/pages/PlayerHome';

import PlayerMatches from '../features/matches/pages/PlayerMatches';
import Preparation from '../features/matches/pages/Preparation';
import MatchView from '../features/matches/pages/MatchView';
import MatchResult from '../features/matches/pages/MatchResult';

import PlayerTournaments from '../features/tournaments/pages/PlayerTournaments';
import TournamentDetail from '../features/tournaments/pages/TournamentDetail';

import OrganizerTournaments from '../features/organizers/pages/OrganizerTournaments';

import AdminUsers from '../features/admin/pages/AdminUsers';

import PlayerStatistics from '../features/player/pages/PlayerStatistics';


// Todas las rutas de la aplicación con sesión iniciada (bajo /jugador).
// Para sumar una pantalla: agregar su <Route> en la sección de su rol y,
// si va en el menú, su entrada en navigation.js.
export default function AppRoutes({
  user,
  onLogout,
  onSessionExpired,
  player,
}) {
  const { data, services } = player;

  const matches = data ? data.matches : [];
  const tournaments = data ? data.tournaments : [];
  const board = data ? data.board : null;

  return (
    <Routes>
      <Route
        element={<AppLayout user={user} onLogout={onLogout} player={player} />}
      >
        {/* Jugador: todos los roles */}
        <Route
          index
          element={
            <PlayerHome
              data={data}
              onInvitationResponse={player.respondToInvitation}
            />
          }
        />

        <Route
          path="estadisticas"
          element={<PlayerStatistics matches={matches} />}
        />


        <Route path="partidas" element={<PlayerMatches services={services} />} />

        <Route
          path="partidas/:matchId/preparacion"
          element={
            <Preparation
              board={board}
              matches={matches}
              onPlaceShip={player.placeShip}
              onResetFleet={player.resetFleet}
              onConfirm={player.confirmFleet}
            />
          }
        />

        <Route
          path="partidas/:matchId"
          element={
            <MatchView board={board} matches={matches} onShoot={player.shoot} />
          }
        />

        <Route
          path="partidas/:matchId/resultado"
          element={
            <MatchResult
              board={board}
              matches={matches}
              services={services}
              onSessionExpired={onSessionExpired}
            />
          }
        />

        <Route
          path="torneos"
          element={
            <PlayerTournaments
              tournaments={tournaments}
              matches={matches}
              user={user}
            />
          }
        />

        <Route
          path="torneos/:tournamentId"
          element={<TournamentDetail data={data} user={user} />}
        />

        {/* Organizador y admin */}
        <Route
          path="organizar"
          element={
            <RequireRole user={user} roles={ORGANIZER_ROLES}>
              <OrganizerTournaments services={services} user={user} />
            </RequireRole>
          }
        />

        {/* Solo admin */}
        <Route
          path="usuarios"
          element={
            <RequireRole user={user} roles={ADMIN_ROLES}>
              <AdminUsers
                usersService={services.users}
                currentUserId={user.id}
              />
            </RequireRole>
          }
        />

        <Route path="*" element={<MissingItem />} />
      </Route>
    </Routes>
  );
}
