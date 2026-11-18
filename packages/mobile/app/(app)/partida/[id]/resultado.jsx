import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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

import { getMoves } from '../../../../common/api/matchesService';
import Board, { BOARD_GUTTER } from '../../../../common/components/Board';
import BoardLegend from '../../../../common/components/BoardLegend';
import { coordinateLabel } from '../../../../common/player/coordinates';
import {
  getMatchChip,
  getMatchRoute,
} from '../../../../common/player/matchHelpers';
import { usePlayerData } from '../../../../common/player/PlayerDataContext';
import useBoard from '../../../../common/player/useBoard';
import { useAuth } from '../../../../common/auth/authContext';
import { colors, fonts, shadow } from '../../../../common/theme';

import { SHOT_ICON } from '../../../../common/shotIcons';


const RESULT_LABEL = {
  water: `${SHOT_ICON.water} Agua`,
  hit: `${SHOT_ICON.hit} Tocado`,
  sunk: `${SHOT_ICON.sunk} Hundido`,
};

const MAX_BOARD_WIDTH = 480;
const SCREEN_PADDING = 20;
// Lugar que ocupan el borde grueso y la sombra dura del tablero.
const BOARD_FRAME = 3 * 2 + 4;

/*const RESULT_LABEL = {
  water: 'Agua',
  hit: 'Tocado',
  sunk: 'Hundido',
};*/

const TITLES = {
  victory: 'Victoria en el mar.',
  defeat: 'Esta vez no pudo ser.',
};

function sameCoordinate(first, second) {
  return first[0] === second[0] && first[1] === second[1];
}

// Mobile · Partida terminada: resultado, las dos flotas al descubierto y el
// historial completo de jugadas (GET /api/matches/:id/moves).
export default function Resultado() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  const { token, expireSession } = useAuth();
  const { data, loading } = usePlayerData();
  const { board, error: boardError, loading: boardLoading, retry } = useBoard();

  const match = data?.matches.find((item) => item.id === id);
  const finished = match?.status === 'finished';

  const [moves, setMoves] = useState([]);
  const [movesLoading, setMovesLoading] = useState(true);
  const [movesError, setMovesError] = useState('');
  const [reload, setReload] = useState(0);

  // El historial solo existe cuando la partida terminó.
  useEffect(() => {
    if (!finished) {
      return undefined;
    }

    let cancelled = false;

    async function loadMoves() {
      try {
        const result = await getMoves(token, id);

        if (!cancelled) {
          setMoves(result);
          setMovesError('');
        }
      } catch (err) {
        if (!cancelled) {
          if (err.status === 401) {
            expireSession();
          } else {
            setMovesError(err.message || 'No pudimos cargar el historial.');
          }
        }
      } finally {
        if (!cancelled) {
          setMovesLoading(false);
        }
      }
    }

    loadMoves();

    return () => {
      cancelled = true;
    };
  }, [token, id, finished, reload, expireSession]);

  const retryMoves = useCallback(() => {
    setMovesError('');
    setMovesLoading(true);
    setReload((current) => current + 1);
  }, []);

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

  // Si la partida todavía no terminó, se va a la pantalla que corresponde.
  if (!finished) {
    return <Redirect href={getMatchRoute(match)} />;
  }

  const chip = getMatchChip(match);
  const title = TITLES[match.result] ?? 'Partida finalizada';

  const cellSize = Math.floor(
    (Math.min(screenWidth, MAX_BOARD_WIDTH) -
      SCREEN_PADDING * 2 -
      BOARD_GUTTER -
      BOARD_FRAME) /
      board.width
  );

  // Solo los disparos; la ubicación de flotas ya se ve en los tableros.
  const shotMoves = moves.filter((item) => Array.isArray(item.move));

  function resultOf(item) {
    const shots =
      item.player === match.mySide ? match.shots : match.receivedShots;

    const shot = shots.find((candidate) =>
      sameCoordinate(candidate.coordinate, item.move)
    );

    return shot ? RESULT_LABEL[shot.result] : 'Sin resultado';
  }

  const endedAt = match.endedAt
    ? new Date(match.endedAt).toLocaleString()
    : 'Sin fecha disponible';

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
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
              {title}
            </Text>
            <Text style={styles.subtitle}>{match.tournamentName}</Text>
          </View>
        </View>

        <View
          style={[
            styles.summary,
            match.result === 'defeat' && styles.summaryDefeat,
          ]}
        >
          <Text style={styles.summaryLabel}>Resultado de la partida</Text>
          <Text
            style={[
              styles.summaryResult,
              match.result === 'defeat' && styles.summaryResultDefeat,
            ]}
          >
            {chip.label}
          </Text>
          <Text style={styles.summaryText}>Finalización: {endedAt}</Text>
        </View>

        <Text style={styles.sectionTitle}>Flota rival</Text>
        <View style={styles.boardWrapper}>
          <Board
            width={board.width}
            height={board.height}
            cellSize={cellSize}
            fleet={match.opponentFleet ?? {}}
            shots={match.shots}
          />
        </View>

        <Text style={styles.sectionTitle}>Tu flota</Text>
        <View style={styles.boardWrapper}>
          <Board
            width={board.width}
            height={board.height}
            cellSize={cellSize}
            fleet={match.fleet}
            shots={match.receivedShots}
          />
        </View>

        <BoardLegend />

        <Text style={[styles.sectionTitle, styles.historyTitle]}>
          Historial completo
        </Text>

        {movesLoading && (
          <View style={styles.loadingRow} accessibilityRole="progressbar">
            <ActivityIndicator color={colors.brand} />
            <Text style={styles.message}>Cargando historial…</Text>
          </View>
        )}

        {movesError !== '' && (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Text style={styles.error}>{movesError}</Text>

            <Pressable onPress={retryMoves}>
              <Text style={styles.link}>Reintentar</Text>
            </Pressable>
          </View>
        )}

        {!movesLoading && movesError === '' && (
          <View style={styles.history}>
            {shotMoves.length === 0 && (
              <Text style={styles.empty}>No hay disparos registrados.</Text>
            )}

            {shotMoves.map((item, position) => {
              const mine = item.player === match.mySide;

              return (
                <View
                  style={[
                    styles.historyRow,
                    position > 0 && styles.historyRowDivider,
                  ]}
                  key={item.id}
                  accessible
                  accessibilityLabel={`Movimiento ${position + 1}, ${
                    mine ? 'vos' : 'rival'
                  }, disparo a ${coordinateLabel(item.move)}, ${resultOf(
                    item
                  )}`}
                >
                  <Text style={styles.historyIndex}>{position + 1}</Text>

                  <View style={styles.historyInfo}>
                    <Text style={styles.historyPlayer}>
                      {mine ? 'Vos' : 'Rival'}
                    </Text>
                    <Text style={styles.historyMove}>
                      Disparo a {coordinateLabel(item.move)}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.historyResult,
                      resultOf(item) === RESULT_LABEL.sunk && styles.resultSunk,
                      resultOf(item) === RESULT_LABEL.hit && styles.resultHit,

                    ]}
                  >
                    {resultOf(item)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
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
  summary: {
    marginBottom: 28,
    padding: 16,
    borderWidth: 3,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    boxShadow: shadow.accent,
  },
  summaryDefeat: {
    boxShadow: shadow.danger,
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.muted,
  },
  summaryResult: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.title,
    color: colors.brand,
  },
  summaryResultDefeat: {
    color: colors.error,
  },
  summaryText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.text,
  },
  sectionTitle: {
    marginBottom: 14,
    fontSize: 10,
    lineHeight: 16,
    fontFamily: fonts.title,
    color: colors.brand,
  },
  historyTitle: {
    marginTop: 28,
  },
  boardWrapper: {
    alignItems: 'center',
    marginBottom: 26,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  history: {
    borderWidth: 3,
    borderColor: colors.ink,
    backgroundColor: colors.surface,
    boxShadow: shadow.md,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  historyRowDivider: {
    borderTopWidth: 2,
    borderTopColor: colors.grid,
    borderStyle: 'dashed',
  },
  historyIndex: {
    minWidth: 28,
    fontSize: 10,
    fontFamily: fonts.title,
    color: colors.muted,
  },
  historyInfo: {
    flex: 1,
  },
  historyPlayer: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  historyMove: {
    marginTop: 2,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.muted,
  },
  historyResult: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  resultHit: {
    color: colors.hit,
  },
  resultSunk: {
    color: colors.error,
  },
  empty: {
    padding: 14,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.muted,
  },
  errorBox: {
    padding: 12,
    borderWidth: 3,
    borderColor: colors.error,
    backgroundColor: colors.surface,
  },
  error: {
    fontSize: 14,
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
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.brand,
  },
});
