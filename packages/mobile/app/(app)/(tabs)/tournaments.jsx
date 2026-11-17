import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePlayerData } from '../../../common/player/PlayerDataContext';
import {
  getTournamentRoute,
  getWinnerLabel,
} from '../../../common/player/tournamentHelpers';
import { colors, fonts, shadow } from '../../../common/theme';
import { useAuth } from '../../../common/auth/authContext';

export default function Tournaments() {
  const router = useRouter();
  const { session } = useAuth();
  const {
    data,
    loading,
    refreshing,
    pending,
    error,
    retry,
    refresh,
    respondToInvitation,
  } = usePlayerData();

  const invitations = [];

  if (data) {
    const sortedInvitations = [...data.invitations].sort(
      (first, second) => new Date(second.createdAt) - new Date(first.createdAt)
    );

    sortedInvitations.forEach((invitation) => {
      const exists = invitations.some(
        (item) => item.tournamentId === invitation.tournamentId
      );

      if (!exists) {
        invitations.push(invitation);
      }
    });
  }

  async function handleResponse(invitationId, status) {
    try {
      await respondToInvitation(invitationId, status);
    } catch (err) {
      Alert.alert('No se pudo responder', err.message);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.title} accessibilityRole="header">
        Torneos
      </Text>

      <Text style={styles.description}>Torneos a los que fuiste invitado.</Text>

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
              onRefresh={pending ? undefined : refresh}
              tintColor={colors.brand}
              colors={[colors.brand]}
            />
          }
        >
          {error !== '' && (
            <View style={styles.errorBox} accessibilityRole="alert">
              <Text style={styles.error}>{error}</Text>

              <Pressable
                onPress={data ? refresh : retry}
                disabled={pending || refreshing}
                accessibilityRole="button"
              >
                <Text style={styles.link}>Reintentar</Text>
              </Pressable>
            </View>
          )}

          {data && invitations.length === 0 && (
            <Text style={styles.empty}>
              Todavía no recibiste invitaciones a torneos.
            </Text>
          )}

          {invitations.map((invitation) => {
            const tournament = invitation.tournamentInfo;
            const isPending = invitation.status === 'pending';
            const finished = Boolean(tournament.winner);

            return (
              <View style={styles.card} key={tournament.id}>
                <Text style={styles.cardTitle}>{tournament.name}</Text>

                <View style={[styles.badge, isPending && styles.badgePending]}>
                  <Text style={styles.badgeText}>
                    {invitation.status === 'accepted'
                      ? 'Invitación aceptada'
                      : invitation.status === 'rejected'
                        ? 'Invitación rechazada'
                        : 'Pendiente de respuesta'}
                  </Text>
                </View>

                <Text style={styles.detail}>
                  Estado del torneo:{' '}
                  {finished ? 'Finalizado' : 'Sin ganador definido'}
                </Text>

                {finished && (
                  <Text style={styles.detail}>
                    {getWinnerLabel(tournament, session)}
                  </Text>
                )}

                {invitation.status === 'accepted' && (
                  <Pressable
                    style={[
                      styles.button,
                      styles.buttonSecondary,
                      styles.viewButton,
                    ]}
                    onPress={() => router.push(getTournamentRoute(tournament))}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver torneo ${tournament.name}`}
                  >
                    <Text style={styles.buttonSecondaryText}>Ver torneo</Text>
                  </Pressable>
                )}

                {isPending && (
                  <View style={styles.actions}>
                    <Pressable
                      style={[
                        styles.button,
                        styles.buttonPrimary,
                        (pending || refreshing) && styles.buttonDisabled,
                      ]}
                      disabled={pending || refreshing}
                      onPress={() => handleResponse(invitation.id, 'accepted')}
                      accessibilityRole="button"
                      accessibilityLabel={`Aceptar invitación a ${tournament.name}`}
                    >
                      <Text style={styles.buttonPrimaryText}>Aceptar</Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.button,
                        styles.buttonSecondary,
                        (pending || refreshing) && styles.buttonDisabled,
                      ]}
                      disabled={pending || refreshing}
                      onPress={() => handleResponse(invitation.id, 'rejected')}
                      accessibilityRole="button"
                      accessibilityLabel={`Rechazar invitación a ${tournament.name}`}
                    >
                      <Text style={styles.buttonSecondaryText}>Rechazar</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
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
  description: {
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 8,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.muted,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 32,
  },
  empty: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.muted,
  },
  card: {
    marginBottom: 14,
    padding: 16,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: shadow.md,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  viewButton: {
    flex: 0,
    marginTop: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  badgePending: {
    borderColor: colors.ink,
    backgroundColor: colors.brandSoft,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  detail: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  button: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 3,
    boxShadow: shadow.md,
  },
  buttonPrimary: {
    borderColor: colors.ink,
    backgroundColor: colors.brand,
    boxShadow: shadow.md,
  },
  buttonSecondary: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: shadow.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: colors.surface,
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: colors.text,
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
