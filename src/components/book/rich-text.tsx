import { StyleSheet, Text, type TextStyle } from 'react-native';

import { BookColors, BookTypography } from '@/constants/theme';

type RichTextProps = {
  children: string;
  style?: TextStyle;
  baseColor?: string;
};

type Segment = { text: string; bold?: boolean; italic?: boolean };

function parseRichText(input: string): Segment[] {
  const segments: Segment[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|[^*]+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match[2]) {
      segments.push({ text: match[2], bold: true });
    } else if (match[3]) {
      segments.push({ text: match[3], italic: true });
    } else if (match[0]) {
      segments.push({ text: match[0] });
    }
  }

  return segments.length > 0 ? segments : [{ text: input }];
}

export function RichText({ children, style, baseColor = BookColors.brown }: RichTextProps) {
  const paragraphs = children.split('\n');

  return (
    <>
      {paragraphs.map((paragraph, index) => {
        const segments = parseRichText(paragraph);
        const isLast = index === paragraphs.length - 1;

        return (
          <Text key={index} style={[styles.paragraph, { color: baseColor }, style, isLast && styles.lastParagraph]}>
            {segments.map((segment, segIndex) => (
              <Text
                key={segIndex}
                style={[
                  segment.bold && styles.bold,
                  segment.italic && styles.italic,
                ]}>
                {segment.text}
              </Text>
            ))}
          </Text>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  paragraph: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 16,
    ...BookTypography.body,
  },
  lastParagraph: {
    marginBottom: 0,
  },
  bold: {
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
  },
});
