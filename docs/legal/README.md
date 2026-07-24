# BeSmart — Legal documents

**Task:** P0-11 — Privacy Policy + Terms of Service  
**Last updated:** July 24, 2026  
**Status:** Draft for App Store / Play / Meta Ads. **Not legal advice** — have counsel review before scaled paid traffic or paid subscriptions.

## Files

| Document | Markdown (edit here) | HTML (publish this) |
|----------|----------------------|---------------------|
| Privacy Policy | [privacy-policy.md](./privacy-policy.md) | [privacy.html](./privacy.html) |
| Terms of Service | [terms-of-service.md](./terms-of-service.md) | [terms.html](./terms.html) |

App links (see `src/constants/legal.ts`):

- Privacy: `https://ilyadylko.github.io/besmart/legal/privacy.html`
- Terms: `https://ilyadylko.github.io/besmart/legal/terms.html`

## Publish (GitHub Pages)

1. Repo **Settings → Pages → Build and deployment**
2. Source: **Deploy from a branch**
3. Branch: `main` · Folder: **/docs**
4. After deploy, confirm the two URLs above load over HTTPS
5. Paste the same URLs into App Store Connect / Play Console / Meta App settings

If you move to a custom domain (e.g. `https://besmart.app/privacy`), update `src/constants/legal.ts` and store listing fields.

## Fill before production ads / paid IAP

- [ ] Legal entity / operator name (if not “BeSmart” alone)
- [ ] Working support inbox (`support@besmart.app` or substitute)
- [ ] Confirm GitHub Pages URLs are live
- [ ] Update Terms § Subscriptions when RevenueCat / real IAP ships
- [ ] Lawyer review (recommended before Meta Ads on subscription)

## In-app

Paywall and Profile open these URLs via in-app browser (`expo-web-browser`).
