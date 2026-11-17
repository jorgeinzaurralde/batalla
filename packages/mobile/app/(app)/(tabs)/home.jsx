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

import { useAuth } from '../../../common/auth/authContext';
import MatchCard from '../../../common/components/MatchCard';
import {
  getMatchRoute,
  sortMatches,
} from '../../../common/player/matchHelpers';
import { usePlayerData } from '../../../common/player/PlayerDataContext';
import { colors, fonts, shadow } from '../../../common/theme';

const MAX_MATCHES = 3;

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuth();

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

  async function handleResponse(invitationId, status) {
    try {
      await respondToInvitation(invitationId, status);
    } catch (err) {
      Alert.alert('No se pudo responder', err.message);
    }
  }

  const invitations = data
    ? data.invitations.filter((item) => item.status === 'pending')
    : [];

  const matches = data ? sortMatches(data.matches) : [];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.email} numberOfLines={1}>
            {user.email}
          </Text>
        </View>

        <Pressable
          style={styles.logout}
          onPress={logout}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
        >
          <Text style={styles.logoutText}>Salir</Text>
        </Pressable>
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

          {data && (
            <>
              <Text style={styles.sectionLabel}>
                INVITACIONES ({invitations.length})
              </Text>

              {invitations.length === 0 && (
                <Text style={styles.empty}>
                  No tenés invitaciones pendientes.
                </Text>
              )}

              {invitations.map((invitation) => (
                <View style={styles.invitation} key={invitation.id}>
                  <Text style={styles.invitationTitle}>
                    {invitation.tournamentInfo.name}
                  </Text>
                  <Text style={styles.invitationText}>
                    Te invitó el organizador
                  </Text>

                  <View style={styles.actions}>
                    <Pressable
                      style={[
                        styles.button,
                        styles.buttonPrimary,
                        pending && styles.buttonDisabled,
                      ]}
                      disabled={pending}
                      onPress={() => handleResponse(invitation.id, 'accepted')}
                      accessibilityRole="button"
                    >
                      <Text style={styles.buttonPrimaryText}>Aceptar</Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.button,
                        styles.buttonSecondary,
                        pending && styles.buttonDisabled,
                      ]}
                      disabled={pending}
                      onPress={() => handleResponse(invitation.id, 'rejected')}
                      accessibilityRole="button"
                    >
                      <Text style={styles.buttonSecondaryText}>Rechazar</Text>
                    </Pressable>
                  </View>
                </View>
              ))}

              <Text style={[styles.sectionLabel, styles.sectionSpaced]}>
                MIS PARTIDAS
              </Text>

              {matches.length === 0 && (
                <Text style={styles.empty}>Todavía no tenés partidas.</Text>
              )}

              {matches.slice(0, MAX_MATCHES).map((match) => (
                <View style={styles.matchWrapper} key={match.id}>
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

              {matches.length > MAX_MATCHES && (
                <Pressable onPress={() => router.navigate('/matches')}>
                  <Text style={styles.link}>Ver todas las partidas</Text>
                </Pressable>
              )}
            </>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerText: {
    flex: 1,
  },
  hello: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.muted,
  },
  email: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  logout: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 3,
    borderColor: colors.text,
    boxShadow: shadow.sm,
  },
  logoutText: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  sectionLabel: {
    marginBottom: 12,
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.muted,
  },
  sectionSpaced: {
    marginTop: 24,
  },
  empty: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.muted,
  },
  invitation: {
    marginBottom: 12,
    padding: 16,
    borderWidth: 3,
    borderColor: colors.ink,
    backgroundColor: colors.brandSoft,
    boxShadow: shadow.md,
  },
  invitationTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  invitationText: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  button: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  matchWrapper: {
    marginBottom: 12,
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
