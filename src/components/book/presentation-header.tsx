import { StyleSheet, View } from 'react-native';

import { BookIconButton } from '@/components/book/book-icon-button';
import { ThemedText } from '@/components/themed-text';
import { BookColors, BookTypography, Spacing } from '@/constants/theme';

type PresentationHeaderProps = {
  title: string;
  onBack: () => void;
  onClose: () => void;
  onAudio?: () => void;
};

export function PresentationHeader({ title, onBack, onClose, onAudio }: PresentationHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <BookIconButton
          name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
          size={18}
          variant="circle"
          onPress={onBack}
        />
        <ThemedText style={styles.title} numberOfLines={1}>
          {title}
        </ThemedText>
      </View>
      <View style={styles.right}>
        {onAudio && (
          <BookIconButton
            name={{ ios: 'waveform', android: 'graphic_eq', web: 'graphic_eq' }}
            size={16}
            variant="circle"
            onPress={onAudio}
          />
        )}
        <BookIconButton
          name={{ ios: 'xmark', android: 'close', web: 'close' }}
          size={14}
          weight="semibold"
          variant="circle"
          onPress={onClose}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginRight: Spacing.two,
    minWidth: 0,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    color: BookColors.brown,
    fontSize: 16,
    fontWeight: '600',
    ...BookTypography.body,
  },
});
