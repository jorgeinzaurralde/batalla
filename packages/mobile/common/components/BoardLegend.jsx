import { StyleSheet, Text, View } from 'react-native';

import { SHOT_ICON } from '../shotIcons';
import { colors, fonts } from '../theme';

export default function BoardLegend() {
  return (
    <View style={styles.legend}>
      <Text style={styles.text}>{SHOT_ICON.water} Agua</Text>
      <Text style={[styles.text, { color: colors.hit }]}>
        {SHOT_ICON.hit} Tocado
      </Text>
      <Text style={[styles.text, { color: colors.error }]}>
        {SHOT_ICON.sunk} Hundido
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { gap: 10 },
  text: { fontSize: 14, fontFamily: fonts.body, color: colors.text },
});
