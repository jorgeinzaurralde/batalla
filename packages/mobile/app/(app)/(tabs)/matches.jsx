import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { colors, fonts, shadow } from '../../../common/theme';

const FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'playing', label: 'En curso' },
  { id: 'finished', label: 'Terminadas' },
];

const EMPTY_TEXT = {
  all: 'Todavía no tenés partidas.',
  playing: 'No tenés partidas en curso.',
  finished: 'Todavía no terminaste ninguna partida.',
};

export default function Matches() {
  const router = useRouter();
  const { data, loading, refreshing, error, retry, refresh } = usePlayerData();

  const [filter, setFilter] = useState('all');

  const matches = data
    ? sortMatches(data.matches).filter((match) => {
        if (filter === 'playing') {
          return match.status !== 'finished';
        }

        if (filter === 'finished') {
          return match.status === 'finished';
        }

        return true;
      })
    : [];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.title} accessibilityRole="header">
        Partidas
      </Text>

      <View style={styles.filters} accessibilityRole="tablist">
        {FILTERS.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.filter, filter === item.id && styles.filterActive]}
            onPress={() => setFilter(item.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: filter === item.id }}
          >
            <Text
              style={[
                styles.filterText,
                filter === item.id && styles.filterTextActive,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

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

          {data && matches.length === 0 && (
            <Text style={styles.empty}>{EMPTY_TEXT[filter]}</Text>
          )}

          {matches.map((match) => (
            <View style={styles.cardWrapper} key={match.id}>
              <MatchCard
                match={match}
                onPress={
                  getMatchRoute(match)
                    ? () => router.push(getMatchRoute(match))
                    : undefined
                }
              />
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    paddingHorizontal: 20,
    paddingTop: 16,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.title,
    color: colors.text,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  filter: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: shadow.sm,
  },
  filterActive: {
    borderColor: colors.ink,
    backgroundColor: colors.brandSoft,
  },
  filterText: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.text,
  },
  filterTextActive: {
    color: colors.brand,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  empty: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.muted,
  },
  errorBox: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 3,
    borderColor: colors.error,
  },
  error: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.error,
  },
  link: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.brand,
  },
});
