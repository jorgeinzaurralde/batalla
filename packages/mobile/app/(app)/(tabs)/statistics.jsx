import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePlayerData } from '../../../common/player/PlayerDataContext';
import { colors, fonts, shadow } from '../../../common/theme';

// Con coma decimal (66,7%). No usa toLocaleString porque
// Intl no siempre está completo en Android.
function formatPercent(value) {
  return `${value.toFixed(1).replace('.', ',')}%`;
}

function getStats(matches) {
  const finished = matches.filter((m) => m.status === 'finished');
  const played = finished.length;
  const victories = finished.filter((m) => m.result === 'victory').length;
  const defeats = finished.filter((m) => m.result === 'defeat').length;
  const winRate = played === 0 ? 0 : (victories / played) * 100;

  return { played, victories, defeats, winRate };
}

export default function Statistics() {
  const { data, loading, refreshing, error, retry, refresh } = usePlayerData();

  const stats = data ? getStats(data.matches) : null;

  const items = stats
    ? [
        { label: 'Partidas jugadas', value: stats.played },
        { label: 'Victorias', value: stats.victories },
        { label: 'Derrotas', value: stats.defeats },
        { label: 'Porcentaje de victorias', value: formatPercent(stats.winRate) },
      ]
    : [];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.title} accessibilityRole="header">
        Mis estadísticas
      </Text>
      <Text style={styles.description}>
        Resumen de tus partidas terminadas.
      </Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.brand}
              colors={[colors.brand]}
            />
          }
        >
          {error !== '' && (
            <View style={styles.errorBox} accessibilityRole="alert">
              <Text style={styles.error}>{error}</Text>
              <Pressable onPress={data ? refresh : retry}>
                <Text style={styles.link}>Reintentar</Text>
              </Pressable>
            </View>
          )}

          {stats && stats.played === 0 && (
            <Text style={styles.empty}>
              Todavía no terminaste ninguna partida.
            </Text>
          )}

          {stats && stats.played > 0 && (
            <View style={styles.grid}>
              {items.map((item) => (
                <View
                  style={styles.card}
                  key={item.label}
                  accessible
                  accessibilityLabel={`${item.label}: ${item.value}`}
                >
                  <Text style={styles.value}>{item.value}</Text>
                  <Text style={styles.label}>{item.label}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    paddingHorizontal: 20,
    paddingTop: 16,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.title,
    color: colors.text,
  },
  description: {
    paddingHorizontal: 20,
    paddingTop: 4,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.muted,
  },
  content: { padding: 20, paddingBottom: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    padding: 16,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: shadow.md,
  },
  value: {
    fontSize: 20,
    lineHeight: 30,
    fontFamily: fonts.title,
    color: colors.brand,
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.text,
  },
  empty: { fontSize: 14, fontFamily: fonts.body, color: colors.muted },
  errorBox: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 3,
    borderColor: colors.error,
  },
  error: { fontSize: 13, fontFamily: fonts.body, color: colors.error },
  link: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.brand,
  },
});
