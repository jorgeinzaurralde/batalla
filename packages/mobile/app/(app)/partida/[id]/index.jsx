import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Board, { BOARD_GUTTER } from '../../../../common/components/Board';
import BoardLegend from '../../../../common/components/BoardLegend';
import { coordinateLabel } from '../../../../common/player/coordinates';
import {
  getMatchChip,
  labelUser,
} from '../../../../common/player/matchHelpers';
import { usePlayerData } from '../../../../common/player/PlayerDataContext';
import useBoard from '../../../../common/player/useBoard';
import useMatchPolling from '../../../../common/player/useMatchPolling';
import { colors, fonts, shadow } from '../../../../common/theme';

const MAX_BOARD_WIDTH = 480;
const SCREEN_PADDING = 20;
const SMALL_BOARD_SIZE = 160;
const SMALL_GUTTER = 12;

const RESULT_TEXT = {
  water: 'Agua.',
  hit: '¡Tocado!',
  sunk: '¡Hundido!',
};

// Mobile · Partida en curso (y "esperando rival" cuando todavía no hay disparos)
export default function Partida() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  const { data, loading, shoot } = usePlayerData();
  const { board, error: boardError, loading: boardLoading, retry } = useBoard();

  const match = data?.matches.find((item) => item.id === id);

  // Mientras la partida está en curso y la pantalla abierta, se consulta
  // la API cada pocos segundos para saber si el rival ya jugó.
  useMatchPolling(id, match?.status === 'playing');

  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [pending, setPending] = useState(false);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/matches');
    }
  }

  if (loading || boardLoading) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]}>
        <ActivityIndicator color={colors.brand} size="large" />
      </SafeAreaView>
    );
  }

  if (boardError) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]}>
        <Text style={styles.error}>{boardError}</Text>
        <Pressable onPress={retry}>
          <Text style={styles.link}>Reintentar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]}>
        <Text style={styles.message}>No encontramos esta partida.</Text>
        <Pressable onPress={goBack}>
          <Text style={styles.link}>Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (match.status === 'preparation') {
    return <Redirect href={`/partida/${match.id}/preparation`} />;
  }

  if (match.status === 'finished') {
    return <Redirect href={`/partida/${match.id}/resultado`} />;
  }

  const chip = getMatchChip(match);
  const noShots = match.shots.length === 0 && match.receivedShots.length === 0;

  // Sin disparos y sin ser mi turno: esperando que el rival esté listo.
  const waitingStart = !match.myTurn && noShots;

  const cellSize = Math.floor(
    (Math.min(screenWidth, MAX_BOARD_WIDTH) -
      SCREEN_PADDING * 2 -
      BOARD_GUTTER -
      2) /
      board.width
  );

  const smallCellSize = Math.max(
    10,
    Math.floor((SMALL_BOARD_SIZE - SMALL_GUTTER - 2) / board.width)
  );

  function handleCellPress(column, row) {
    if (pending) {
      return;
    }

    const alreadyShot = match.shots.some(
      ({ coordinate }) => coordinate[0] === column && coordinate[1] === row
    );

    if (alreadyShot) {
      setError('Ya disparaste a esa casilla.');
      return;
    }

    setSelected([column, row]);
    setError('');
    setFeedback('');
  }

  async function handleShoot() {
    if (!selected || !match.myTurn || pending) {
      return;
    }

    setPending(true);
    setError('');

    try {
      const updated = await shoot(match.id, selected);
      const last = updated.shots[updated.shots.length - 1];

      setSelected(null);
      setFeedback(last ? RESULT_TEXT[last.result] : '');
    } catch (err) {
      setError(err.message || 'No se pudo registrar el disparo.');
    } finally {
      setPending(false);
    }
  }

  const header = (
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
        <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
          {match.tournamentName}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          vs {labelUser(match.opponentId)}
        </Text>
      </View>

      <View style={[styles.chip, chip.highlight && styles.chipHighlight]}>
        <Text style={styles.chipText}>{chip.label}</Text>
      </View>
    </View>
  );

  // 6. Esperando rival
  if (waitingStart) {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          {header}

          <Text style={styles.label}>Tu flota</Text>

          <View style={styles.boardWrapper}>
            <Board
              width={board.width}
              height={board.height}
              cellSize={cellSize}
              fleet={match.fleet}
            />
          </View>

          <View style={styles.waitingBox}>
            <Text style={styles.waitingTitle}>Flota enviada</Text>
            <Text style={styles.waitingText}>
              Esperando que {labelUser(match.opponentId)} ubique sus barcos.
              Después empiezan los turnos.
            </Text>

            <View style={styles.polling}>
              <View style={styles.pollingDot} />
              <Text style={styles.pollingText}>
                Consultando la partida cada pocos segundos
              </Text>
            </View>
          </View>

          <Text style={styles.note}>Dispara primero el jugador Norte.</Text>

          <View style={[styles.action, styles.actionDisabled]}>
            <Text style={styles.actionTextDisabled}>Esperando al rival</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 3. Partida en curso
  const canShoot = match.myTurn && selected !== null && !pending;

  let actionLabel = 'Esperando al rival';

  if (match.myTurn) {
    actionLabel = selected
      ? `Disparar a ${coordinateLabel(selected)}`
      : 'Elegí una casilla para disparar';
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {header}

        <Text style={styles.label}>Tablero rival · tus disparos</Text>

        <View style={styles.boardWrapper}>
          <Board
            width={board.width}
            height={board.height}
            cellSize={cellSize}
            shots={match.shots}
            shipSizes={board.ships.map((ship) => ship.size)}
            selected={selected}
            onCellPress={match.myTurn ? handleCellPress : undefined}
          />
        </View>

        <View style={styles.fleetRow}>
          <View>
            <Text style={styles.smallLabel}>Tu flota</Text>
            <Board
              width={board.width}
              height={board.height}
              cellSize={smallCellSize}
              gutter={SMALL_GUTTER}
              fleet={match.fleet}
              shots={match.receivedShots}
            />
          </View>

          <BoardLegend />
        </View>

        <Text style={styles.feedback} accessibilityLiveRegion="polite">
          {feedback}
        </Text>

        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>

        <Pressable
          style={[styles.action, !canShoot && styles.actionDisabled]}
          onPress={handleShoot}
          disabled={!canShoot}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canShoot }}
        >
          {pending ? (
            <ActivityIndicator color={colors.onBrand} />
          ) : (
            <Text
              style={canShoot ? styles.actionText : styles.actionTextDisabled}
            >
              {actionLabel}
            </Text>
          )}
        </Pressable>
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
    padding: SCREEN_PADDING,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  back: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.text,
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
    marginTop: 2,
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.muted,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipHighlight: {
    borderColor: colors.ink,
    backgroundColor: colors.brandSoft,
  },
  chipText: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.text,
  },
  label: {
    marginBottom: 10,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.text,
  },
  smallLabel: {
    marginBottom: 6,
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.text,
  },
  boardWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fleetRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 28,
    marginBottom: 12,
  },
  feedback: {
    minHeight: 22,
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  error: {
    minHeight: 20,
    marginBottom: 10,
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.error,
  },
  message: {
    fontSize: 15,
    fontFamily: fonts.body,
    color: colors.text,
  },
  link: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.brand,
  },
  waitingBox: {
    padding: 16,
    borderWidth: 3,
    borderColor: colors.ink,
    backgroundColor: colors.brandSoft,
    boxShadow: shadow.md,
  },
  waitingTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  waitingText: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.text,
  },
  polling: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  pollingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand,
  },
  pollingText: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.text,
  },
  note: {
    marginVertical: 14,
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.muted,
  },
  action: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    boxShadow: shadow.md,
  },
  actionDisabled: {
    backgroundColor: colors.grid,
  },
  actionText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.onBrand,
  },
  actionTextDisabled: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.text,
  },
});
