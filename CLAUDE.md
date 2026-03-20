# RECUPEO — Context Claude Code

## Identite
- **RECUPEO** : plateforme SaaS francaise, aide les particuliers a recuperer l'argent qu'on leur doit
- **URL** : recupeo.fr
- **Fondateur** : EUSTAT (micro-entreprise en cours d'enregistrement)

## Stack
- Next.js 15.5 (App Router), Payload CMS 3.79, MongoDB 7.0, Tailwind 3.4
- PM2, Nginx SSL, Certbot, Brevo (email), Stripe (test mode), GA4
- Serveur : Ubuntu 25.04, /var/www/recupeo

## Commandes critiques
- **BUILD** : ./scripts/build.sh puis ./scripts/build.sh --status (JAMAIS npm run build)
- **Ecrire du code** : heredoc quote cat > path << 'EOF' ... EOF (JAMAIS base64)
- **npm install** : TOUJOURS avec --legacy-peer-deps
- **Tests** : npx jest --config jest.config.cjs --passWithNoTests --maxWorkers=1
- **Git** : configure, remote github.com/reustathiades-eng/recupeo

## Conventions absolues
- fmt() de @/lib/format pour formater les nombres — JAMAIS toLocaleString
- Design tokens : navy #0B1426, emerald #00D68F, slate-text #1E293B, slate-muted #64748B, slate-bg #F7F9FC
- Fonts : font-heading (Bricolage Grotesque), font-body (DM Sans)
- Layout : max-w-[1200px] mx-auto px-6
- track() de @/lib/analytics pour GA4 — champ brique obligatoire
- sendEmail() de @/lib/email pour Brevo
- createCheckoutSession() de @/lib/payment pour Stripe
- extractTextFromDocument() de @/lib/ocr pour OCR
- callClaude() / callClaudeVision() de @/lib/anthropic pour IA
- anonymizeText() de @/lib/pii-detector avant tout appel Claude API
- useSearchParams() necessite un Suspense boundary (Next.js 15)
- 'use client' en haut des composants interactifs
- NE JAMAIS definir un composant React a l'interieur d'un autre composant (cause perte de focus)

## 9 briques en production
macaution, monloyer, retraitia, mataxe, mapension, mabanque, monchomage, monimpot, mapaie

## MAPAIE (brique #9) — LIVE
- 26 fichiers, build OK, HTTP 200
- Audit bulletins de paie, detection erreurs, reclamation employeur
- Ton : combatif-rassurant
- Pricing : 49 EUR (3 mois) / 129 EUR (12 mois + reclamation)
- A tester : parcours complet, upload reel, Stripe, mobile

## Prochaines briques
1. MESDROITS — aides sociales non reclamees (lead magnet gratuit)
2. MONDEPART — solde de tout compte
3. MONDPE — audit DPE immobilier
4. MONPRET — TAEG credit immobilier

## Pattern UX harmonise
Hero -> {Upload -> Extraction ->} Form -> PreDiag -> ShareBlock -> Paywall -> Report -> CrossSellBriques -> FAQ

## Exemples de code a suivre
Pour comprendre les patterns, lire :
- src/components/mabanque/ (brique similaire avec upload)
- src/components/mapaie/ (derniere brique construite)
- src/lib/mabanque/ (calculations, anomaly-detection, schema, types)
- src/app/api/mabanque/ (extract, pre-diagnostic, full-report, generate-letters)

## Contact
Email notifications : reustathiades@tendance-parfums.com
