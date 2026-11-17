import { Redirect, Stack } from 'expo-router';

import { useAuth } from '../../common/auth/authContext';
import { PlayerDataProvider } from '../../common/player/PlayerDataContext';

// Todo lo que está en este grupo requiere sesión iniciada.
// (tabs) tiene la barra inferior; las demás pantallas son completas.
export default function AppLayout() {
  const { session } = useAuth();

  if (!session) {
    return <Redirect href="/" />;
  }

  return (
    <PlayerDataProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PlayerDataProvider>
  );
}
