/**
 * iOS App Tracking Transparency (ATT) + Meta Advertiser Tracking Enabled (ATE).
 * Strategy without IDFA: docs/ATT.md
 */

import { Platform } from 'react-native';

import { setMetaAdvertiserTrackingEnabled } from '@/services/analytics';

export type TrackingConsentStatus = 'granted' | 'denied' | 'undetermined' | 'unavailable';

let requestInFlight: Promise<TrackingConsentStatus> | null = null;

function mapPermissionStatus(status: string | undefined): TrackingConsentStatus {
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  if (status === 'undetermined') return 'undetermined';
  return 'unavailable';
}

async function loadTrackingModule(): Promise<typeof import('expo-tracking-transparency') | null> {
  if (Platform.OS !== 'ios') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-tracking-transparency') as typeof import('expo-tracking-transparency');
  } catch {
    return null;
  }
}

/** Apply current ATT status to Meta without prompting. */
export async function syncTrackingConsent(): Promise<TrackingConsentStatus> {
  if (Platform.OS !== 'ios') {
    // Android: Meta can use GAID when available; no ATT dialog.
    setMetaAdvertiserTrackingEnabled(true);
    return 'granted';
  }

  const mod = await loadTrackingModule();
  if (!mod?.isAvailable?.()) {
    setMetaAdvertiserTrackingEnabled(false);
    return 'unavailable';
  }

  const { status } = await mod.getTrackingPermissionsAsync();
  const mapped = mapPermissionStatus(status);
  setMetaAdvertiserTrackingEnabled(mapped === 'granted');
  return mapped;
}

/**
 * Request ATT once when undetermined, then sync Meta ATE.
 * Safe to call multiple times — coalesces in-flight requests; no re-prompt after decide.
 */
export async function requestTrackingConsentIfNeeded(): Promise<TrackingConsentStatus> {
  if (requestInFlight) return requestInFlight;

  requestInFlight = (async () => {
    if (Platform.OS !== 'ios') {
      setMetaAdvertiserTrackingEnabled(true);
      return 'granted' as TrackingConsentStatus;
    }

    const mod = await loadTrackingModule();
    if (!mod?.isAvailable?.()) {
      setMetaAdvertiserTrackingEnabled(false);
      return 'unavailable';
    }

    const current = await mod.getTrackingPermissionsAsync();
    let status = mapPermissionStatus(current.status);

    if (status === 'undetermined') {
      const next = await mod.requestTrackingPermissionsAsync();
      status = mapPermissionStatus(next.status);
    }

    setMetaAdvertiserTrackingEnabled(status === 'granted');

    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[att] tracking consent', status);
    }

    return status;
  })();

  try {
    return await requestInFlight;
  } finally {
    requestInFlight = null;
  }
}
