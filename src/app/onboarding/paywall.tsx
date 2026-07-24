import { router, useLocalSearchParams } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/primary-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@/constants/legal';
import { BrandColors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useApp } from '@/context/app-context';
import { parsePaywallSource, track } from '@/services/analytics';

async function openLegalUrl(url: string) {
  await openBrowserAsync(url, {
    presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
  });
}

const PLANS = [
  { id: 'monthly', label: 'Monthly', price: '$11.99/mo', badge: 'Popular' },
  { id: 'annual', label: 'Annual', price: '$49.99/yr', badge: 'Best value' },
];

export default function OnboardingPaywall() {
  const { subscribe, completeOnboarding } = useApp();
  const { source: sourceParam } = useLocalSearchParams<{ source?: string }>();
  const source = parsePaywallSource(sourceParam);

  useEffect(() => {
    track('paywall_viewed', { source });
  }, [source]);

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
              subscribe({ source, plan: 'annual' });
              router.replace('/(tabs)/ideas');
            }}
          />
          <PrimaryButton
            label="Maybe later — start with ideas"
            variant="ghost"
            onPress={() => {
              completeOnboarding();
              router.replace('/(tabs)/ideas');
            }}
          />
          <ThemedText type="small" themeColor="textSecondary" style={styles.disclaimer}>
            Paywall placeholder — wire up RevenueCat or Stripe when ready. By continuing you agree to
            our Terms and acknowledge the Privacy Policy.
          </ThemedText>
          <View style={styles.legalRow}>
            <Pressable
              onPress={() => openLegalUrl(TERMS_OF_SERVICE_URL)}
              accessibilityRole="link"
              accessibilityLabel="Open Terms of Service">
              <ThemedText type="small" style={styles.legalLink}>
                Terms
              </ThemedText>
            </Pressable>
            <ThemedText type="small" themeColor="textSecondary">
              ·
            </ThemedText>
            <Pressable
              onPress={() => openLegalUrl(PRIVACY_POLICY_URL)}
              accessibilityRole="link"
              accessibilityLabel="Open Privacy Policy">
              <ThemedText type="small" style={styles.legalLink}>
                Privacy Policy
              </ThemedText>
            </Pressable>
          </View>
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
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  legalLink: {
    color: BrandColors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
