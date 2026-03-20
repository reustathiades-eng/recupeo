# RÉCUPÉO — Context Claude Code

## Identité
- **RÉCUPÉO** : plateforme SaaS française, aide les particuliers à récupérer l'argent qu'on leur doit
- **URL** : recupeo.fr
- **Fondateur** : EUSTAT (micro-entreprise en cours d'enregistrement)

## Stack
- Next.js 15.5 (App Router), Payload CMS 3.79, MongoDB 7.0, Tailwind 3.4
- PM2, Nginx SSL, Certbot, Brevo (email), Stripe (test mode), GA4
- Serveur : Ubuntu 25.04, /var/www/recupeo

## Commandes critiques
- **BUILD** : `./scripts/build.sh` puis `./scripts/build.sh --status` (JAMAIS npm run build)
- **Écrire du code** : heredoc quoté `cat > path << 'EOF' ... EOF` (JAMAIS base64)
- **npm install** : TOUJOURS avec `--legacy-peer-deps`
- **Tests** : `npx jest --config jest.config.cjs --passWithNoTests --maxWorkers=1`
- **Git** : configuré, remote github.com/reustathiades-eng/recupeo

## Conventions absolues
- `fmt()` de `@/lib/format` pour formater les nombres — JAMAIS `toLocaleString`
- Design tokens : navy #0B1426, emerald #00D68F, slate-text #1E293B, slate-muted #64748B, slate-bg #F7F9FC
- Fonts : font-heading (Bricolage Grotesque), font-body (DM Sans)
- Layout : max-w-[1200px] mx-auto px-6
- `track()` de `@/lib/analytics` pour GA4 — champ `brique` obligatoire
- `sendEmail()` de `@/lib/email` pour Brevo
- `createCheckoutSession()` de `@/lib/payment` pour Stripe
- `extractTextFromDocument()` de `@/lib/ocr` pour OCR
- `callClaude()` / `callClaudeVision()` de `@/lib/anthropic` pour IA
- `anonymizeText()` de `@/lib/pii-detector` avant tout appel Claude API
- `useSearchParams()` nécessite un Suspense boundary (Next.js 15)
- `'use client'` en haut des composants interactifs

## 8 briques en production
macaution, monloyer, retraitia, mataxe, mapension, mabanque, monchomage, monimpot

## Brique en construction : MAPAIE
- Audit bulletins de paie, détection erreurs, réclamation employeur
- Ton : combatif-rassurant ("On va récupérer ce qu'on vous doit")
- Pricing : 49€ (3 mois) / 129€ (12 mois + réclamation)
- Brief complet : /var/www/recupeo/project/BRIEF_ORCHESTRATOR.md
- Fichiers déjà créés : voir src/lib/mapaie/ et src/components/mapaie/

## Fichiers créés pour MAPAIE (compilent)
- src/lib/mapaie/types/ (base, bulletin, anomaly, convention, index)
- src/lib/mapaie/schema.ts (validation Zod)
- src/lib/mapaie/constants.ts (SMIC, majorations, cotisations)
- src/lib/mapaie/conventions.ts (CCN > 1000 salariés)
- src/components/mapaie/Hero.tsx

## Fichiers restants à créer pour MAPAIE
1. src/lib/mapaie/calculations.ts — calculs HS, rappel, minimum conventionnel
2. src/lib/mapaie/anomaly-detection.ts — détection anomalies paie
3. src/lib/mapaie/prompts.ts — prompts Claude pour extraction et rapport
4. src/app/api/mapaie/extract/route.ts — extraction bulletin OCR/Vision
5. src/app/api/mapaie/pre-diagnostic/route.ts
6. src/app/api/mapaie/full-report/route.ts
7. src/app/api/mapaie/generate-letters/route.ts
8. src/components/mapaie/Upload.tsx — upload bulletins
9. src/components/mapaie/Form.tsx — formulaire emploi + rémunération
10. src/components/mapaie/PreDiag.tsx — résultat pré-diagnostic
11. src/components/mapaie/Paywall.tsx — offres 49€ / 129€
12. src/components/mapaie/Report.tsx — rapport détaillé
13. src/components/mapaie/FAQ.tsx
14. src/app/mapaie/page.tsx + layout.tsx
15. Transversal : payment.ts (offres), sitemap.ts, chat knowledge, CrossSellBriques

## Pattern UX harmonisé (toutes les briques suivent ce pattern)
Hero → {Upload → Extraction →} Form → PreDiag → ShareBlock → Paywall → Report → CrossSellBriques → FAQ

## Track events disponibles pour MAPAIE
mapaie_cta_click, mapaie_form_started, mapaie_upload_started, mapaie_upload_completed,
mapaie_prediag_generated, mapaie_paywall_viewed, mapaie_purchase_clicked,
mapaie_report_generated, mapaie_pdf_downloaded, mapaie_reclamation_generated

## Exemples de code existant à suivre
Pour comprendre les patterns, lire :
- src/components/mabanque/ (brique similaire avec upload)
- src/components/monchomage/ (brique similaire avec upload)
- src/lib/mabanque/ (calculations, anomaly-detection, schema, types)
- src/app/api/mabanque/ (extract, pre-diagnostic, full-report, generate-letters)

## Prochaines briques après MAPAIE
1. MESDROITS — aides sociales non réclamées (lead magnet gratuit)
2. MONDEPART — solde de tout compte
3. MONDPE — audit DPE immobilier
4. MONPRET — TAEG crédit immobilier

## Contact
Email notifications : reustathiades@tendance-parfums.com
