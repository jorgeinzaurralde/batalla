import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

// Qué significa cada marca de los disparos.
export default function BoardLegend() {
  return (
    <View style={styles.legend}>
      <View style={styles.item}>
        <View style={[styles.dot, { backgroundColor: colors.border }]} />
        <Text style={styles.text}>Agua</Text>
      </View>

      <View style={styles.item}>
        <View style={[styles.dot, { backgroundColor: colors.hit }]} />
        <Text style={styles.text}>Tocado</Text>
      </View>

      <View style={styles.item}>
        <View style={styles.square} />
        <Text style={styles.text}>Hundido</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    gap: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
  },
  square: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: colors.error,
    backgroundColor: colors.errorSoft,
  },
  text: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.text,
  },
});
