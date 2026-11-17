import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getMatchChip, getMatchSubtitle } from '../player/matchHelpers';
import { colors, fonts, pressedStyle, shadow } from '../theme';

// Tarjeta de partida. Si recibe onPress, se puede tocar.
export default function MatchCard({ match, onPress }) {
  const chip = getMatchChip(match);

  const content = (
    <>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {match.tournamentName}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {getMatchSubtitle(match)}
        </Text>
      </View>

      <View
        style={[
          styles.chip,
          chip.highlight && styles.chipHighlight,
          chip.danger && styles.chipDanger,
        ]}
      >
        <Text style={styles.chipText}>{chip.label}</Text>
      </View>
    </>
  );

  const cardStyle = [styles.card, chip.highlight && styles.cardHighlight];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [cardStyle, pressed && pressedStyle]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${match.tournamentName}, ${getMatchSubtitle(
          match
        )}, ${chip.label}`}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: shadow.md,
  },
  cardHighlight: {
    borderColor: colors.ink,
    backgroundColor: colors.brandSoft,
    boxShadow: shadow.md,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
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
  },
  chipDanger: {
    borderColor: colors.error,
    backgroundColor: colors.errorSoft,
  },
  chipText: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.text,
  },
});
