import { Tabs } from 'expo-router';

import { colors, fonts } from '../../../common/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.ink,
        tabBarActiveBackgroundColor: colors.ink,
        tabBarIconStyle: { display: 'none' },
        tabBarLabelStyle: {
          fontFamily: fonts.title,
          fontSize: 9,
          lineHeight: 14,
        },
        tabBarItemStyle: { justifyContent: 'center' },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.ink,
          borderTopWidth: 3,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="tournaments" options={{ title: 'Torneos' }} />
      <Tabs.Screen name="matches" options={{ title: 'Partidas' }} />
    </Tabs>
  );
}
