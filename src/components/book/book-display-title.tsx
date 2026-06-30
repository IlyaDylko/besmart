import { StyleSheet, Text, type TextProps } from 'react-native';

import { BookColors, BookTypography, Spacing } from '@/constants/theme';

type BookDisplayTitleProps = TextProps & {
  children: string;
};

export function BookDisplayTitle({ children, style, ...rest }: BookDisplayTitleProps) {
  return (
    <Text style={[styles.title, style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    ...BookTypography.display,
    fontSize: 34,
    lineHeight: 42,
    color: BookColors.brown,
    marginBottom: Spacing.two,
  },
});
