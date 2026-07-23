import { useEffect } from 'react';

import AppTabs from '@/components/app-tabs';
import { requestTrackingConsentIfNeeded, syncTrackingConsent } from '@/services/att';

/**
 * After onboarding (or for returning users), sync ATT → Meta ATE.
 * Prompt only when status is still undetermined.
 */
export default function TabsLayout() {
  useEffect(() => {
    const timer = setTimeout(() => {
      void (async () => {
        const status = await syncTrackingConsent();
        if (status === 'undetermined') {
          await requestTrackingConsentIfNeeded();
        }
      })();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return <AppTabs />;
}
