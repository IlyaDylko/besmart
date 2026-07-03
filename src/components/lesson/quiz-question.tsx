import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { OptionCard } from '@/components/ui/option-card';
import { Spacing } from '@/constants/theme';
import type { QuizQuestion as QuizQuestionType } from '@/types/learning';

type QuizQuestionProps = {
  question: QuizQuestionType;
  selectedIndex: number | null;
  showResult: boolean;
  onSelect: (index: number) => void;
};

export function QuizQuestion({
  question,
  selectedIndex,
  showResult,
  onSelect,
}: QuizQuestionProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        {question.question}
      </ThemedText>
      <View style={styles.options}>
        {question.options.map((option, index) => {
          let state: 'default' | 'correct' | 'wrong' = 'default';
          if (showResult) {
            if (index === question.correctIndex) state = 'correct';
            else if (index === selectedIndex) state = 'wrong';
          }

          return (
            <OptionCard
              key={option}
              label={option}
              selected={selectedIndex === index}
              state={state}
              onPress={() => onSelect(index)}
            />
          );
        })}
      </View>
      {showResult && (
        <ThemedText type="small" themeColor="textSecondary">
          {question.explanation}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.three,
    paddingTop: Spacing.two,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
  },
  options: {
    gap: Spacing.two,
  },
});
