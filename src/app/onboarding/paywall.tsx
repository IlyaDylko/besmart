import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/primary-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';

const PLANS = [
  { id: 'monthly', label: 'Monthly', price: '$11.99/mo', badge: 'Popular' },
  { id: 'annual', label: 'Annual', price: '$49.99/yr', badge: 'Best value' },
];

export default function OnboardingPaywall() {
  const { subscribe, completeOnboarding } = useApp();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ProgressBar progress={1} />
          <ThemedText type="subtitle" style={styles.title}>
            Unlock all lessons
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            7-day free trial · Cancel anytime · Full access to every topic
          </ThemedText>
        </View>

        <View style={styles.plans}>
          {PLANS.map((plan) => (
            <ThemedView key={plan.id} type="backgroundElement" style={styles.planCard}>
              <View style={styles.planHeader}>
                <ThemedText type="smallBold">{plan.label}</ThemedText>
                <View style={styles.badge}>
                  <ThemedText type="small" style={styles.badgeText}>
                    {plan.badge}
                  </ThemedText>
                </View>
              </View>
              <ThemedText type="subtitle" style={styles.price}>
                {plan.price}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                All formats: text, quiz, games (coming soon)
              </ThemedText>
            </ThemedView>
          ))}
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label="Start free trial"
            onPress={() => {
              subscribe();
              router.replace('/(tabs)');
            }}
          />
          <PrimaryButton
            label="Maybe later — explore free lessons"
            variant="ghost"
            onPress={() => {
              completeOnboarding();
              router.replace('/(tabs)');
            }}
          />
          <ThemedText type="small" themeColor="textSecondary" style={styles.disclaimer}>
            Paywall placeholder — wire up RevenueCat or Stripe when ready.
          </ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  plans: {
    flex: 1,
    gap: Spacing.three,
  },
  planCard: {
    padding: Spacing.four,
    borderRadius: 20,
    gap: Spacing.two,
    borderWidth: 2,
    borderColor: BrandColors.border,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: BrandColors.primarySoft,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  badgeText: {
    color: BrandColors.primary,
  },
  price: {
    fontSize: 32,
    lineHeight: 38,
    color: BrandColors.primary,
  },
  actions: {
    gap: Spacing.two,
  },
  disclaimer: {
    textAlign: 'center',
  },
});
