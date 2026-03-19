# 📄 Pages et Composants

**Dernière mise à jour** : 2026-03-16 11:00 UTC

## Pages en production

| URL | Type | Brique | Statut |
|-----|------|--------|--------|
| / | Landing page | - | ✅ Live |
| /admin | Payload CMS admin | - | ✅ Live |
| /macaution | Landing + formulaire | MACAUTION | ✅ Live |
| /monloyer | Landing + formulaire | MONLOYER | ✅ Live |
| /retraitia | Landing + formulaire | RETRAITIA | ✅ Live |
| /mataxe | Landing + formulaire | MATAXE | ✅ Live |
| /mataxe/rapport | Page post-paiement | MATAXE | ✅ Live |

## Pages à créer

| URL | Type | Priorité |
|-----|------|----------|
| /mentions-legales | Légal | 🔴 Urgent |
| /cgu | CGU/CGV | 🔴 Urgent |
| /confidentialite | RGPD | 🔴 Urgent |
| /mapension | Brique 5 | 🔵 V2 |
| /monchomage | Brique 6 | 🔵 V2 |

## Composants partagés

### Layout
- `Navbar.tsx` — responsive, dropdown 4 services, liens contextuels par brique, CTA
- `Footer.tsx` — 4 colonnes, liens 4 briques + légal

### Shared
- `TrustBadges.tsx` — TrustBanner, TrustBadgesCompact, LegalDisclaimer (macaution/monloyer/retraitia/mataxe)
- `CrossSellBriques.tsx` — Cross-sell entre 4 briques (exclu la courante)

### Libs partagées
- `lib/anthropic.ts` — Client Claude API (callClaude + callClaudeVision)
- `lib/format.ts` — fmt() nombres avec espaces
- `lib/anonymizer.ts` — AnonymizationSession (PII)
- `lib/pii-detector.ts` — Détection PII française
- `lib/ocr.ts` — Tesseract OCR local + PDF→images
- `lib/email.ts` — Client Brevo transactionnel (prêt, attend clé)
- `lib/analytics.ts` — Tracking GA4 + Plausible (prêt, attend clé)
- `lib/payment.ts` — Stub PayPlug (à brancher)
- `lib/constants.ts` — SITE config + tableau 14 BRIQUES
