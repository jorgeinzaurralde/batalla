import { useLocalSearchParams, useRouter } from 'expo-router';
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

import MatchCard from '../../../common/components/MatchCard';
import {
  getMatchRoute,
  sortMatches,
} from '../../../common/player/matchHelpers';
import { usePlayerData } from '../../../common/player/PlayerDataContext';
import { getWinnerLabel } from '../../../common/player/tournamentHelpers';
import { colors, fonts, shadow } from '../../../common/theme';
import { useAuth } from '../../../common/auth/authContext';

// Detalle de un torneo en el que participa el jugador: estado, ganador y
// sus partidas en ese torneo.
export default function TournamentDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useAuth();
  const { data, loading, refreshing, pending, refresh } = usePlayerData();

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/tournaments');
    }
  }

  if (loading || !data) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]}>
        <ActivityIndicator color={colors.brand} size="large" />
      </SafeAreaView>
    );
  }

  const tournament = data.tournaments.find((item) => item.id === id);

  if (!tournament) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]}>
        <Text style={styles.empty}>No encontramos este torneo.</Text>
        <Pressable onPress={goBack} accessibilityRole="button">
          <Text style={styles.link}>Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const matches = sortMatches(
    data.matches.filter((match) => match.tournamentId === tournament.id)
  );

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={pending ? undefined : refresh}
            tintColor={colors.brand}
            colors={[colors.brand]}
          />
        }
      >
        <View style={styles.header}>
          <Pressable
            style={styles.back}
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel="Volver"
          >
            <Text style={styles.backText}>←</Text>
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title} accessibilityRole="header">
              {tournament.name}
            </Text>
            <Text style={styles.subtitle}>Información del torneo</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.accepted}>Tu invitación está aceptada.</Text>
          <Text style={styles.detail}>
            Estado: {tournament.winner ? 'Finalizado' : 'En curso'}
          </Text>
          <Text style={styles.detail}>
            {getWinnerLabel(tournament, session)}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Tus partidas</Text>

        {matches.length === 0 && (
          <Text style={styles.empty}>
            Todavía no tenés partidas en este torneo.
          </Text>
        )}

        {matches.map((match) => (
          <View style={styles.cardWrapper} key={match.id}>
            <MatchCard
              match={match}
              onPress={() => router.push(getMatchRoute(match))}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  back: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    boxShadow: shadow.sm,
  },
  backText: {
    fontSize: 22,
    fontFamily: fonts.body,
    color: colors.text,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.title,
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.muted,
  },
  card: {
    marginBottom: 28,
    padding: 16,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: shadow.md,
  },
  accepted: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.brand,
  },
  detail: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.text,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 10,
    lineHeight: 16,
    fontFamily: fonts.title,
    color: colors.brand,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  empty: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.muted,
  },
  link: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.brand,
  },
});
