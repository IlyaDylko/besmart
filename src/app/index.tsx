import { Redirect } from 'expo-router';

import { useApp } from '@/context/app-context';

export default function Index() {
  const { hasCompletedOnboarding } = useApp();

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
