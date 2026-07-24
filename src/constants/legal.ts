/**
 * Public legal URLs (P0-11).
 * Hosted via GitHub Pages from `docs/` — see `docs/legal/README.md`.
 * Override with EXPO_PUBLIC_PRIVACY_URL / EXPO_PUBLIC_TERMS_URL if you use a custom domain.
 */
const PAGES_BASE = 'https://ilyadylko.github.io/besmart/legal';

export const PRIVACY_POLICY_URL =
  process.env.EXPO_PUBLIC_PRIVACY_URL ?? `${PAGES_BASE}/privacy.html`;

export const TERMS_OF_SERVICE_URL =
  process.env.EXPO_PUBLIC_TERMS_URL ?? `${PAGES_BASE}/terms.html`;

export const SUPPORT_EMAIL =
  process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? 'support@besmart.app';
