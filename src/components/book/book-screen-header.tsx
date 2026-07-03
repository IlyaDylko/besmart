import { StyleSheet, View } from 'react-native';

import { BookIconButton } from '@/components/book/book-icon-button';
import { BookColors, Spacing } from '@/constants/theme';

type BookScreenHeaderProps = {
  onBack: () => void;
  onMenu?: () => void;
};

export function BookScreenHeader({ onBack, onMenu }: BookScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <BookIconButton
        name={{ ios: 'chevron.left', android: 'chevron_left' }}
        size={20}
        onPress={onBack}
      />
      {onMenu ? (
        <BookIconButton
          name={{ ios: 'ellipsis', android: 'more_horiz' }}
          size={18}
          onPress={onMenu}
        />
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.two,
  },
  spacer: {
    width: 28,
  },
});
