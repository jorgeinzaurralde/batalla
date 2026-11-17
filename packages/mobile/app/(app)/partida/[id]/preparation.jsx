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

import Board from '../../../../common/components/Board';
import {
  buildCells,
  isFleetComplete,
  randomFleet,
  validatePlacement,
} from '../../../../common/player/fleet';
import { labelUser } from '../../../../common/player/matchHelpers';
import { usePlayerData } from '../../../../common/player/PlayerDataContext';
import useBoard from '../../../../common/player/useBoard';
import { colors, fonts, shadow } from '../../../../common/theme';

const ORIENTATIONS = [
  { id: 'horizontal', label: 'Horizontal' },
  { id: 'vertical', label: 'Vertical' },
];

const MAX_BOARD_WIDTH = 480;
const SCREEN_PADDING = 20;

// Mobile · Colocar flota
export default function Preparation() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  const { data, loading, confirmFleet } = usePlayerData();
  const { board, error: boardError, loading: boardLoading, retry } = useBoard();

  const [fleet, setFleet] = useState({});
  const [selectedShip, setSelectedShip] = useState(null);
  const [orientation, setOrientation] = useState('horizontal');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const match = data?.matches.find((item) => item.id === id);

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

  // Si la flota ya está enviada (por ejemplo, recién confirmada), vuelve.
  if (match.status === 'finished') {
    return <Redirect href={`/partida/${match.id}/resultado`} />;
  }

  // Si la flota ya fue confirmada, abre el juego.
  if (match.status === 'playing') {
    return <Redirect href={`/partida/${match.id}`} />;
  }

  const activeShip = selectedShip ?? board.ships[0]?.id;
  const complete = isFleetComplete(board, fleet);

  const cellSize = Math.floor(
    (Math.min(screenWidth, MAX_BOARD_WIDTH) - SCREEN_PADDING * 2 - 2) /
      board.width
  );

  function handleCellPress(column, row) {
    if (pending) {
      return;
    }

    const ship = board.ships.find((item) => item.id === activeShip);
    const cells = buildCells([column, row], ship.size, orientation);
    const problem = validatePlacement(board, fleet, ship.id, cells);

    if (problem) {
      setError(problem);
      return;
    }

    setFleet({ ...fleet, [ship.id]: cells });
    setError('');
  }

  function handleReset() {
    if (pending) {
      return;
    }

    setFleet({});
    setError('');
  }

  function handleRandom() {
    if (pending) {
      return;
    }

    setFleet(randomFleet(board));
    setError('');
  }

  async function handleConfirm() {
    if (!complete || pending) {
      return;
    }

    setPending(true);
    setError('');

    try {
      await confirmFleet(match.id, fleet);
    } catch (error) {
      setError(error.message || 'No se pudo enviar la flota.');
      setPending(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
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
              Colocar flota
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {match.tournamentName} · vs {labelUser(match.opponentId)}
            </Text>
          </View>
        </View>

        <Text style={styles.instruction}>
          Tocá una casilla para ubicar el barco elegido
        </Text>

        <View style={styles.boardWrapper}>
          <Board
            width={board.width}
            height={board.height}
            cellSize={cellSize}
            fleet={fleet}
            highlightedShip={activeShip}
            onCellPress={handleCellPress}
          />
        </View>

        <View style={styles.ships}>
          {board.ships.map((ship) => {
            const selected = ship.id === activeShip;

            return (
              <Pressable
                key={ship.id}
                style={[styles.ship, selected && styles.optionActive]}
                disabled={pending}
                onPress={() => {
                  setSelectedShip(ship.id);
                  setError('');
                }}
                accessibilityRole="button"
                accessibilityState={{
                  selected,
                  disabled: pending,
                }}
              >
                <Text style={styles.shipName}>
                  {ship.name} {ship.size}
                </Text>
                <Text style={styles.shipState}>
                  {selected
                    ? 'elegido'
                    : fleet[ship.id]
                      ? 'ubicado'
                      : 'sin ubicar'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.row}>
          {ORIENTATIONS.map((item) => (
            <Pressable
              key={item.id}
              style={[
                styles.option,
                orientation === item.id && styles.optionActive,
              ]}
              disabled={pending}
              onPress={() => setOrientation(item.id)}
              accessibilityRole="button"
              accessibilityState={{
                selected: orientation === item.id,
                disabled: pending,
              }}
            >
              <Text style={styles.optionText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.note}>
          Los barcos no se pueden superponer, pero sí tocarse.
        </Text>
        <View style={styles.row}>
          <Pressable
            style={styles.option}
            onPress={handleReset}
            disabled={pending}
            accessibilityRole="button"
            accessibilityState={{ disabled: pending }}
          >
            <Text style={styles.optionText}>Reiniciar</Text>
          </Pressable>

          <Pressable
            style={styles.option}
            onPress={handleRandom}
            disabled={pending}
            accessibilityRole="button"
            accessibilityState={{ disabled: pending }}
          >
            <Text style={styles.optionText}>Aleatoria</Text>
          </Pressable>
        </View>

        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>

        <Pressable
          style={[styles.confirm, (!complete || pending) && styles.disabled]}
          onPress={handleConfirm}
          disabled={!complete || pending}
          accessibilityRole="button"
          accessibilityState={{ disabled: !complete || pending }}
        >
          {pending ? (
            <ActivityIndicator color={colors.onBrand} />
          ) : (
            <Text style={styles.confirmText}>Confirmar flota</Text>
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
    gap: 16,
    marginBottom: 20,
  },
  back: {
    width: 48,
    height: 48,
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
  instruction: {
    marginBottom: 12,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.text,
  },
  boardWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ships: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  ship: {
    flexGrow: 1,
    minWidth: 100,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  shipName: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.text,
  },
  shipState: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.muted,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  option: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionActive: {
    borderColor: colors.ink,
    backgroundColor: colors.brandSoft,
  },
  optionText: {
    fontSize: 15,
    fontFamily: fonts.body,
    color: colors.text,
  },
  note: {
    marginBottom: 14,
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.muted,
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
  confirm: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
  },
  disabled: {
    opacity: 0.5,
  },
  confirmText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.onBrand,
  },
});
