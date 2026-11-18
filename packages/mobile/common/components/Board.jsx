import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { coordinateLabel } from '../player/coordinates';
import { markSunkShips } from '../player/sunkShips';
import { colors, fonts, shadow } from '../theme';

import { SHOT_ICON } from '../shotIcons';


export const BOARD_GUTTER = 20;

const SHOT_TEXT = {
  water: 'agua',
  hit: 'tocado',
  sunk: 'hundido',
};

export default function Board({
  width,
  height,
  cellSize,
  gutter = BOARD_GUTTER,
  fleet = {},
  highlightedShip = null,
  shots = [],
  shipSizes = [],
  selected = null,
  onCellPress,
}) {
  // Qué barco ocupa cada casilla ("columna,fila" -> id del barco).
  const shipAt = useMemo(() => {
    const map = new Map();

    Object.entries(fleet).forEach(([shipId, cells]) => {
      cells.forEach(([column, row]) => map.set(`${column},${row}`, shipId));
    });

    return map;
  }, [fleet]);

  // Todas las casillas de un barco hundido se muestran como hundidas.
  // Sin flota a la vista (tablero del rival), se deduce con los tamaños.
  const shotAt = useMemo(() => {
    const map = new Map();
    const knownFleet = Object.keys(fleet).length > 0 ? fleet : null;

    markSunkShips(shots, { fleet: knownFleet, shipSizes }).forEach(
      ({ coordinate: [column, row], result }) => {
        map.set(`${column},${row}`, result);
      }
    );

    return map;
  }, [shots, fleet, shipSizes]);

  const markerSize = Math.max(6, Math.round(cellSize * 0.55));
  const labelFontSize = Math.max(8, Math.min(12, Math.round(cellSize * 0.45)));

  // Las referencias se leen en cada casilla, no hace falta anunciarlas.
  const hiddenFromReaders = {
    accessibilityElementsHidden: true,
    importantForAccessibility: 'no-hide-descendants',
  };

  return (
    <View accessibilityLabel="Tablero">
      <View
        style={[styles.lettersRow, { marginLeft: gutter + 1, height: gutter }]}
        {...hiddenFromReaders}
      >
        {Array.from({ length: width }, (_, column) => (
          <View
            key={column}
            style={[styles.letterCell, { width: cellSize, height: gutter }]}
          >
            <Text style={[styles.label, { fontSize: labelFontSize }]}>
              {String.fromCharCode(65 + column)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.body}>
        <View style={{ width: gutter, marginTop: 1 }} {...hiddenFromReaders}>
          {Array.from({ length: height }, (_, row) => (
            <View
              key={row}
              style={[styles.numberCell, { width: gutter, height: cellSize }]}
            >
              <Text style={[styles.label, { fontSize: labelFontSize }]}>
                {row + 1}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.grid,
            { width: cellSize * width + 2, height: cellSize * height + 2 },
          ]}
        >
          {Array.from({ length: height }, (_, row) => (
            <View style={styles.row} key={row}>
              {Array.from({ length: width }, (_, column) => {
                const key = `${column},${row}`;
                const shipId = shipAt.get(key);
                const shot = shotAt.get(key);

                const isSelected =
                  selected !== null &&
                  selected[0] === column &&
                  selected[1] === row;

                const cellStyle = [
                  styles.cell,
                  { width: cellSize, height: cellSize },
                  shipId && styles.cellShip,
                  shipId &&
                    shipId === highlightedShip &&
                    styles.cellHighlighted,
                  shot === 'sunk' && styles.cellSunk,
                  isSelected && styles.cellSelected,
                ];

                const state = [
                  shipId ? `barco ${shipId}` : '',
                  shot ? SHOT_TEXT[shot] : '',
                  isSelected ? 'elegida' : '',
                ]
                  .filter(Boolean)
                  .join(', ');

                return (
                  <Pressable
                    key={column}
                    style={cellStyle}
                    onPress={() => onCellPress?.(column, row)}
                    disabled={!onCellPress}
                    accessibilityRole="button"
                    accessibilityLabel={`${coordinateLabel([column, row])}${
                      state ? `, ${state}` : ''
                    }`}
                  >
                    {shot && (
                      <Text
                        style={{ fontSize: markerSize, lineHeight: cellSize }}
                        accessible={false}
                      >
                        {SHOT_ICON[shot]}
                      </Text>
                    )}

                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lettersRow: {
    flexDirection: 'row',
  },
  letterCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flexDirection: 'row',
  },
  numberCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.title,
    color: colors.ink,
  },
  grid: {
    borderWidth: 3,
    borderColor: colors.ink,
    backgroundColor: colors.water,
    boxShadow: shadow.md,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.grid,
  },
  cellShip: {
    borderWidth: 1,
    borderColor: colors.shipBorder,
    backgroundColor: colors.ship,
  },
  cellHighlighted: {
    borderColor: colors.ink,
    backgroundColor: colors.gold,
  },
  cellSunk: {
    borderWidth: 2,
    borderColor: colors.error,
    backgroundColor: colors.errorSoft,
  },
  cellSelected: {
    borderWidth: 3,
    borderColor: colors.gold,
    backgroundColor: colors.brandSoft,
  },
  markerWater: {
    backgroundColor: colors.muted,
  },
  markerHit: {
    backgroundColor: colors.hit,
  },
});
