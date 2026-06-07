import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BrandColors, Spacing } from '@/constants/theme';

type OptionCardProps = {
  label: string;
  selected?: boolean;
  state?: 'default' | 'correct' | 'wrong';
  onPress: () => void;
};

export function OptionCard({ label, selected, state = 'default', onPress }: OptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={state !== 'default'}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        state === 'correct' && styles.correct,
        state === 'wrong' && styles.wrong,
        pressed && state === 'default' && styles.pressed,
      ]}>
      <ThemedText type="small">{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderColor: BrandColors.border,
    borderRadius: 16,
    padding: Spacing.three,
    backgroundColor: '#FFFFFF',
  },
  selected: {
    borderColor: BrandColors.primary,
    backgroundColor: BrandColors.primarySoft,
  },
  correct: {
    borderColor: BrandColors.success,
    backgroundColor: BrandColors.successSoft,
  },
  wrong: {
    borderColor: BrandColors.error,
    backgroundColor: BrandColors.errorSoft,
  },
  pressed: {
    opacity: 0.85,
  },
});
