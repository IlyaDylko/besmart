import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BookColors, BookShadow, BookTypography, Spacing } from '@/constants/theme';

type BookBottomBarProps = {
  ideaIndex: number;
  ideaTitle: string;
  onContinue: () => void;
  onAudio?: () => void;
};

export function BookBottomBar({ ideaIndex, ideaTitle, onContinue, onAudio }: BookBottomBarProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>
        #{ideaIndex} {ideaTitle}
      </ThemedText>
      <View style={styles.actions}>
        <Pressable onPress={onContinue} style={styles.continueButton}>
          <ThemedText style={styles.continueLabel}>Continue Reading</ThemedText>
        </Pressable>
        {/* <Pressable onPress={onAudio ?? (() => {})} style={styles.audioButton}>
          <SymbolView
            name={{ ios: 'headphones', android: 'headphones' }}
            size={20}
            tintColor="#FFFFFF"
          />
        </Pressable> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BookColors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
    padding: Spacing.three,
    gap: Spacing.two,
    ...BookShadow.floating,
  },
  label: {
    color: BookColors.brownMuted,
    textAlign: 'center',
    fontSize: 13,
    ...BookTypography.body,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  continueButton: {
    flex: 1,
    backgroundColor: BookColors.brown,
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
  },
  continueLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    ...BookTypography.body,
  },
  audioButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: BookColors.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
