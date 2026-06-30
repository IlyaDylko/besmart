import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { BookColors, Spacing } from '@/constants/theme';

type BookIconButtonProps = PressableProps & {
  name: SymbolViewProps['name'];
  size?: number;
  tintColor?: string;
  weight?: SymbolViewProps['weight'];
  variant?: 'plain' | 'circle';
};

export function BookIconButton({
  name,
  size = 18,
  tintColor = BookColors.brown,
  weight = 'medium',
  variant = 'plain',
  style,
  ...rest
}: BookIconButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        variant === 'circle' && styles.circle,
        pressed && styles.pressed,
        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
      ]}
      hitSlop={8}
      {...rest}>
      <SymbolView name={name} size={size} weight={weight} tintColor={tintColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BookColors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BookColors.cardBorder,
  },
  pressed: {
    opacity: 0.7,
  },
});
