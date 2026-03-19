# BRIEF DE REPRISE — RETRAITIA V2

**Date :** 2026-03-19
**Statut :** Code V2 complet — 111/111 tâches (100%)
**Build :** ✅ SUCCESS (TS 0 erreurs, PM2 OK, HTTP 200)
**Phase actuelle :** Tests, intégration finale, préparation lancement

---

## 1. CONTEXTE RAPIDE

RETRAITIA est la brique retraite de RÉCUPÉO (recupeo.fr), une plateforme SaaS française qui aide les particuliers à récupérer l'argent qu'on leur doit. RETRAITIA fait l'audit complet de la pension d'un retraité sur 6 niveaux (base, complémentaire, réversion, aides, fiscal, CSG) et guide le client de bout en bout pour corriger les anomalies.

**Stack :** Next.js 15.5 (App Router), Payload CMS 3.79, MongoDB 7.0, Tailwind CSS 3.4, PM2, Nginx.
**Serveur :** VPS Ubuntu 25.04, OVH, IP 51.254.138.240, /var/www/recupeo. MCP SSH connector "recupeo".

---

## 2. OÙ EN EST-ON — RÉSUMÉ

Le code V2 est **100% écrit** pour les 3 parcours (retraité, pré-retraité, réversion), tous les régimes couverts, et toutes les fonctionnalités (emails, LRAR, tribunal, cross-sell, notifications). **20 209 lignes de code V2.**

| Bloc | Description | Statut |
|------|-------------|--------|
| A — Fondations | Types V2, 16 JSON data, 2 collections Payload, catalogue 41+ anomalies | ✅ |
| B — SEO + Flash | 4 pages SEO, page flash viral, heuristique risque, email Brevo S1-E1 | ✅ |
| C — Paiement + Espace | 7 packs Stripe, webhook (9€/49€/79€/39€), layout espace client, documents, formulaire | ✅ |
| D — Extraction | Pipeline 4 niveaux, 5 parseurs regex, validator refus intelligent 3 niveaux | ✅ |
| E — Moteur + Anomalies | 7 moteurs (CNAV, FP, MSA, CNAVPL, AA, complémentaires, réversion), détecteur, scoring | ✅ |
| F — Diagnostic + Rapport | Diagnostic serré, seuil gratuit, PDF pdfkit 10+ sections, variantes (pré-retraité, réversion, couple) | ✅ |
| G — Démarches + Aidant | Timeline, checks interactifs, messages copiables, escalade, magic link proche | ✅ |
| H — Emails Brevo | 15 séquences, scheduler cron, conditions anti-harcèlement, SMS, désabonnement RGPD | ✅ |
| I — Régimes spéciaux | FP (SRE+CNRACL), MSA exploitants (Chassaigne), CNAVPL, RAFP, Ircantec, RCI | ✅ |
| J — Simulation pré-retraité | Multi-scénarios 62-67 ans, rachat trimestres ROI, estimation <55 ans | ✅ |
| K — Réversion | Éligibilité 10 régimes, formulaire dédié, messages par canal, variante PDF | ✅ |
| L — Couple | Webhook 2 dossiers liés, sélecteur, vue résumé, 2 PDFs | ✅ |
| M — LRAR | API AR24 (stub), PDF formel, suivi AR | ✅ |
| N — Tribunal | Chronologie PDF, buildChronologie, route API | ✅ |
| O — Cross-sell + Notifs | Détection ASPA/CSS/APL/MaPrimeAdapt, encadré, bannière contextuelle, notifications | ✅ |

### CE QUI RESTE POUR LANCER

Le code est écrit. Les étapes restantes sont :

1. **Tests end-to-end** : tester les 3 parcours avec des données réelles (RIS, notifications)
2. **Intégration upload réel** : connecter le DocumentUploader à l'API upload avec un vrai dossier
3. **Cron email** : configurer le cron système (`crontab`) pour appeler `/api/cron/retraitia-emails` toutes les heures
4. **AR24** : créer un compte AR24 et configurer `AR24_API_KEY` dans `.env` (LRAR en mode stub sinon)
5. **Pages espace client** : brancher les pages sur les vraies données Payload (actuellement mock/TODO)
6. **SEO** : meta tags, sitemap, robots.txt pour les 4 pages publiques
7. **Monitoring** : alertes PM2, logs Brevo, tracking GA4 sur les événements clés
8. **Données de référence 2026** : vérifier/mettre à jour les barèmes quand les circulaires 2026 sortiront

---

## 3. RÈGLES MCP CRITIQUES

```
- JAMAIS `npm run build` directement → `./scripts/build.sh` puis `--status`
- TOUJOURS heredoc quoté (<< 'EOF') pour écrire du code — JAMAIS base64
- Pour les remplacements complexes : script Python dans /tmp/
- ⚠️ Apostrophes françaises (d', l', n') dans les strings TypeScript :
  utiliser des backticks (`) PAS des single quotes (')
- useSearchParams() dans Next.js 15 → NÉCESSITE un Suspense boundary
- Payload findByID retourne id: string | number → toujours String(dossier.id)
```

---

## 4. ARBORESCENCE CODE V2 (20 209 lignes)

### 4.1 Logique métier — src/lib/retraitia/ (~11 950 lignes)

```
src/lib/retraitia/
  ├── types.ts                    (~950l) — Types V2 complets (90+ interfaces/types)
  ├── flash.ts                    (183l)  — Heuristique risque flash (8 facteurs)
  ├── webhook-handler.ts          (~290l) — Création dossier 9€, déblocage 49€, couple 79€, pré-retraité 39€
  │
  ├── data/                       (1153l) — Tables de référence
  │   ├── index.ts                (~340l) — 30+ fonctions d'accès typées
  │   ├── coefficients-revalorisation.json, trimestres-requis.json, age-legal.json, pass.json
  │   ├── baremes-csg.json, valeur-point-agirc-arrco.json, minimum-contributif.json
  │   ├── majorations-enfants.json, esperance-vie.json, reversion-seuils.json, aspa-css.json
  │   ├── constantes-calcul.json, carsat-adresses.json, pays-accords.json, nb-annees-sam.json
  │   └── regimes-complementaires.json — RAFP, Ircantec, RCI, CNAVPL, MSA, min garanti FP
  │
  ├── extraction/                 (1224l) — Pipeline extraction documents
  │   ├── pipeline.ts             (303l)  — Orchestrateur : OCR → regex → Claude → Vision
  │   ├── anonymizer.ts           (56l)   — Anonymisation N°SS + noms
  │   ├── prompts.ts              (64l)   — 4 prompts Claude directifs
  │   ├── validator.ts            (324l)  — Refus intelligent 3 niveaux (illisible/mauvais type/incomplet)
  │   └── parsers/                — 5 parseurs regex
  │       ├── ris.ts, notification-cnav.ts, agirc-arrco.ts, avis-imposition.ts
  │       └── notification-fp.ts  (126l)  — SRE / CNRACL
  │
  ├── calcul/                     (1475l) — 8 moteurs de calcul
  │   ├── engine.ts               (213l)  — Orchestrateur (dispatche 7 sous-moteurs)
  │   ├── regime-general.ts       (210l)  — SAM, taux, proratisation, majorations, MiCo
  │   ├── agirc-arrco.ts          (102l)  — Points, pension, malus, GMP
  │   ├── fonctionnaires.ts       (199l)  — Traitement×75%, décote/surcote, bonif, min garanti, NBI
  │   ├── msa-exploitants.ts      (133l)  — Forfaitaire + proportionnelle + Chassaigne
  │   ├── cnavpl.ts               (98l)   — Points × valeur, décote/surcote
  │   ├── complementaires.ts      (120l)  — RAFP (capital/rente), Ircantec, RCI
  │   ├── csg.ts                  (75l)   — Vérification taux CSG
  │   └── reversion.ts            (325l)  — Éligibilité 10 régimes, conditions, estimation
  │
  ├── anomalies/                  (908l)
  │   ├── catalogue.ts            (372l)  — 41+ anomalies définies
  │   └── detector.ts             (536l)  — Détection N1-N6 + FP + Chassaigne + complémentaires + N4/N5 enrichis
  │
  ├── simulation/                 (422l)
  │   ├── scenarios.ts            (174l)  — Multi-scénarios 62→67 ans
  │   ├── rachat.ts               (160l)  — Rachat trimestres + ROI (2 options)
  │   ├── estimation.ts           (80l)   — Estimation <55 ans sans EIG
  │   └── index.ts                (8l)
  │
  ├── messages/                   (578l)
  │   ├── generator.ts            (208l)  — 10 catégories templates + injection variables
  │   └── reversion-messages.ts   (188l)  — 8 templates réversion par régime
  │
  ├── emails/                     (1693l) — 15 séquences Brevo
  │   ├── types.ts                (157l)  — SequenceId, EmailVars (80+ vars), EmailLog, EmailSequenceState
  │   ├── renderer.ts             (118l)  — Helpers HTML (wrapEmail, ctaButton, impactBlock...)
  │   ├── sms.ts                  (68l)   — Envoi SMS Brevo
  │   ├── conditions.ts           (203l)  — Anti-harcèlement, conditions d'arrêt, adaptation réversion
  │   ├── scheduler.ts            (411l)  — triggerSequence, runScheduler, stopSequence
  │   ├── index.ts                (21l)
  │   └── sequences/              (715l)  — s01 à s15 (15 fichiers)
  │
  ├── courriers/                  (454l)
  │   ├── lrar.ts                 (158l)  — API AR24 (envoi + suivi)
  │   ├── lrar-pdf.ts             (113l)  — PDF courrier formel
  │   ├── tribunal.ts             (176l)  — Chronologie PDF + buildChronologie
  │   └── index.ts                (7l)
  │
  ├── pdf/
  │   └── report-generator.ts     (538l)  — PDF pdfkit 10+ sections + variantes
  │
  └── [LEGACY V1 — ne pas modifier : anomaly-detection.ts, calculations.ts, constants.ts, etc.]
```

### 4.2 Composants React — src/components/retraitia/espace/ (2186l)

```
  ├── StatusCard.tsx              — 5 états (🔴 🟡 ✅ ⚪ 🔒)
  ├── ProgressBar.tsx             — X/Y ✅
  ├── DocumentUploader.tsx        (~525l) — Drag&drop, multi-fichiers, réordonnement, progress, refus 3 niveaux
  ├── DiagnosticAccesFC.tsx       (311l)  — Flux 3 étapes FranceConnect
  ├── GuidesFranceConnect.tsx     (294l)  — Accordéon 7 sites
  ├── FormulaireReversion.tsx     (288l)  — 3 blocs / 16 questions, stepper, alerte remariage
  ├── TimelineAnomalie.tsx        — Frise escalade 6 étapes
  ├── CheckInteractif.tsx         — Transitions d'état serveur
  ├── CompteurDelai.tsx           — J+30, J+55, J+60
  ├── MessageCopiable.tsx         — Texte + Copier + guide
  ├── CrossSellCard.tsx           (124l)  — Encadré opportunités MATAXE/MONIMPOT/MESDROITS
  ├── SelecteurCouple.tsx         (91l)   — Sélecteur + VueResumeCouple
  └── NotificationBanner.tsx      (160l)  — Bannière contextuelle + generateNotifications
```

### 4.3 Pages et API

```
Pages publiques (7) :
  /retraitia                          — Page chapeau
  /retraitia/test                     — Flash viral (4 questions)
  /retraitia/verifier-ma-pension      — Landing retraité
  /retraitia/preparer-mon-depart      — Landing pré-retraité
  /retraitia/pension-de-reversion     — Landing réversion
  /retraitia/preview, /retraitia/rapport

Espace client (7 pages) :
  /mon-espace/retraitia/              — Tableau de bord
  /mon-espace/retraitia/documents     — Checklist + upload + guides FC
  /mon-espace/retraitia/informations  — Formulaire 3 blocs
  /mon-espace/retraitia/diagnostic    — Serré (9€) / interactif (49€)
  /mon-espace/retraitia/demarches     — Vue d'ensemble
  /mon-espace/retraitia/demarches/[id]— Détail anomalie + timeline
  /mon-espace/retraitia/rapport       — PDF téléchargeable

API (18 routes) :
  POST /api/retraitia/flash           — Calcul risque + Payload + Brevo
  POST /api/retraitia/checkout        — Stripe multi-pack (9/49/79/39/15/29€)
  POST /api/retraitia/upload          — Upload + extraction + validation refus intelligent
  POST /api/retraitia/analyze         — Moteur calcul + anomalies
  POST /api/retraitia/generate-pdf    — PDF pdfkit
  POST /api/retraitia/simulation      — Scénarios de départ pré-retraité
  POST /api/retraitia/rachat          — Analyse rachat trimestres + ROI
  POST /api/retraitia/invite-proche   — Magic link
  POST /api/retraitia/tribunal        — PDF chronologie
  POST /api/retraitia/emails/trigger  — Déclencher séquence email
  GET+POST /api/retraitia/emails/unsubscribe — Désabonnement RGPD
  GET  /api/cron/retraitia-emails     — Scheduler horaire (auth CRON_SECRET)
  + routes legacy V1 (extract, preview, report, etc.)

Collections Payload :
  RetraitiaFlash, RetraitiaDossiers (dans payload.config.ts)
```

---

## 5. MODULES PARTAGÉS UTILISÉS

| Module | Import | ⚠️ |
|--------|--------|-----|
| OCR | `@/lib/ocr` → `extractTextFromDocument()` | **NE PAS** importer pdf-parse |
| Claude | `@/lib/anthropic` → `callClaude()` + `callClaudeVision()` | Sonnet 4 |
| Email | `@/lib/email` → `sendEmail()` | **PAS** sendBrevoEmail |
| Payment | `@/lib/payment` → `createCheckoutSession()` + `OFFERS.retraitia` | 7 packs |
| Analytics | `@/lib/analytics` → `trackEvent()` | Alias de track() |
| Webhook | `src/app/api/webhooks/stripe/route.ts` | Dispatch handleRetraitiaPayment() |

---

## 6. TYPES CLÉ

### Formulaire & Dossier
- `DossierFormulaire` = { identite: FormIdentite, enfants: FormEnfants, carriere: FormCarriere }
- `FormEnfants` = { nombreEnfants, enfants[], enfantsACharge, parentIsole }
- `FormCarriere` = { regimes, serviceMilitaire, periodes*, salaireBrutMensuel, ageDepartSouhaite, ... }

### Extraction
- `ExtractionRIS` = { trimestres: TrimestreRIS[], totalTrimestresValides, regimesPresents, ... }
- `ExtractionNotificationCNAV` = { montantMensuelBrut, sam, taux, trimestresRetenus, majorationEnfants, ... }
- `ExtractionNotificationFP` = { regime, indiceMajore, traitementIndiciaireBrut, trimestresServices, ... }

### Calcul
- `CalculResult` = { cnav?, fonctionnaires?, agircArrco?, msaExploitant?, cnavpl?, complementaires?, csg?, pensionTotalRecalculee?, ... }
- `CalculCNAV`, `CalculFP`, `CalculMSAExploitant`, `CalculCNAVPL`, `CalculComplementaire`, `CalculAgircArrco`, `CalculCSG`

### Anomalies
- `AnomalyId` = 41+ valeurs (N1_TRIM_MILITAIRE, N2_POINTS_MANQUANTS, etc.)
- `DetectedAnomaly` = { id, label, detail, confidence, impact, score, organisme, ... }
- `DiagnosticResult` = { anomalies[], scoreGlobal, impactCumule, ... }

### Simulation
- `ScenarioDepart` = { age, trimestresTotal, taux, decotePct, surcotePct, pensionTotaleMensuelle, ... }
- `SimulationResult` = { scenarios[], scenarioRecommande, ageTauxPlein }
- `ScenarioRachat`, `RachatResult`

### Réversion
- `DefuntInfo`, `SurvivantInfo`, `ReversionRegime`, `ReversionResult`

### Emails
- `SequenceId` = 'S1' | ... | 'S15'
- `EmailSequenceState` = { active: Record<string, {...}>, logs: EmailLog[] }

### Scores
- `ConfidenceLevel` = 'CERTAIN' | 'HAUTE_CONFIANCE' | 'ESTIMATION'
- `DossierScore` = 'BRONZE' | 'ARGENT' | 'OR' | 'PLATINE'

### Gel LFSS 2026
- `getTrimestresRequis()` et `getAgeLegalMois()` retournent `null` pour nés après 03/1965

---

## 7. TRAVAIL RESTANT POUR LANCER

### P0 — Bloquant lancement

| # | Tâche | Priorité | Effort |
|---|-------|----------|--------|
| L01 | Brancher les pages espace client sur les vraies données Payload (useEffect + fetch API) | CRITIQUE | 3-4h |
| L02 | Tester le parcours retraité E2E avec un vrai RIS + notification | CRITIQUE | 2h |
| L03 | Tester le parcours pré-retraité E2E | CRITIQUE | 1h |
| L04 | Tester le parcours réversion E2E | CRITIQUE | 1h |
| L05 | Configurer crontab pour le scheduler email (`*/60 * * * * curl -H "Authorization: Bearer $CRON_SECRET" ...`) | CRITIQUE | 15min |
| L06 | Vérifier les emails Brevo en envoi réel (templates, rendu, liens) | HAUTE | 1h |
| L07 | Tester paiement Stripe en mode live (9€, 49€, 79€) | HAUTE | 30min |
| L08 | Meta tags SEO sur les 4 pages publiques | HAUTE | 30min |

### P1 — Souhaitable pour le lancement

| # | Tâche | Priorité | Effort |
|---|-------|----------|--------|
| L10 | Tests unitaires moteur de calcul (SAM, taux, proratisation) | HAUTE | 2h |
| L11 | Tests unitaires détecteur d'anomalies | HAUTE | 1h |
| L12 | Tests unitaires parseurs regex (RIS, notification) | HAUTE | 1h |
| L13 | Page 404 / erreur dans l'espace client | MOYENNE | 30min |
| L14 | Responsive check mobile sur toutes les pages espace | MOYENNE | 1h |
| L15 | Ajouter Google Structured Data (FAQ schema) sur les pages SEO | MOYENNE | 30min |

### P2 — Post-lancement

| # | Tâche | Priorité |
|---|-------|----------|
| L20 | Créer compte AR24 + brancher API LRAR | BASSE (stub OK pour lancement) |
| L21 | ZIP complet tribunal (docs uploadés + courriers + AR + chrono) | BASSE |
| L22 | Monitoring alertes PM2 + Brevo bounces | MOYENNE |
| L23 | Dashboard admin Payload (stats dossiers, conversions) | MOYENNE |
| L24 | A/B test landing pages (titre, CTA, prix) | BASSE |
| L25 | Mise à jour barèmes 2026 quand circulaires publiées | ROUTINE |

---

## 8. BRIEFS SUR LE SERVEUR

```bash
cat /var/www/recupeo/project/retraitia-v2/BRIEF_XXX.md
```

18 briefs (13 913 lignes) couvrant tout le produit :
- BRIEF_RETRAITIA_V2_MASTER.md (591l) — Vision globale
- BRIEF_PARCOURS_RETRAITE.md (1042l) — Funnel retraité
- BRIEF_PARCOURS_PRERETRAITE.md (716l) — Funnel pré-retraité
- BRIEF_PARCOURS_REVERSION.md (834l) — Funnel réversion
- BRIEF_ONBOARDING_ACCES.md (838l) — FranceConnect
- BRIEF_COLLECTE_DOCUMENTS.md (864l) — 13 fiches documents
- BRIEF_EXTRACTION_PARSING.md (909l) — Pipeline extraction
- BRIEF_MOTEUR_CALCUL.md (1247l) — Formules tous régimes
- BRIEF_ANOMALY_DETECTION.md (981l) — 41+ anomalies
- BRIEF_DIAGNOSTIC_GRATUIT.md (599l) — Flash + diagnostic serré
- BRIEF_RAPPORT_PDF.md (792l) — 10 sections PDF
- BRIEF_MESSAGES_ACTIONS.md (909l) — 24 templates
- BRIEF_ESPACE_CLIENT_SUIVI.md (906l) — Navigation, composants
- BRIEF_EMAILS_RELANCES.md (1005l) — 15 séquences Brevo
- BRIEF_REGIMES_SPECIFIQUES.md (709l) — 7 fiches régimes
- BRIEF_DONNEES_REFERENCE.md (668l) — Tables constantes
- TODO_RETRAITIA.md — Backlog 111/111 ✅
- SESSIONS_RETRAITIA.md — Journal des sessions

---

## 9. POUR DÉMARRER

```
1. cat /var/www/recupeo/project/retraitia-v2/BRIEF_REPRISE_RETRAITIA_V2.md
2. Identifier la tâche prioritaire (section 7)
3. Consulte le brief détaillé si besoin
4. Code → npx tsc --noEmit → ./scripts/build.sh → --status
5. Mets à jour ce brief et SESSIONS
```
