# BRIEF DE REPRISE — RETRAITIA V2

**Date :** 2026-03-19
**Statut :** MVP en cours — 61/111 tâches (55%)
**Build :** ✅ SUCCESS (TS 0 erreurs, PM2 OK, HTTP 200)

---

## 1. CONTEXTE RAPIDE

RETRAITIA est la brique retraite de RÉCUPÉO (recupeo.fr), une plateforme SaaS française qui aide les particuliers à récupérer l'argent qu'on leur doit. RETRAITIA fait l'audit complet de la pension d'un retraité sur 6 niveaux (base, complémentaire, réversion, aides, fiscal, CSG) et guide le client de bout en bout pour corriger les anomalies.

**Stack :** Next.js 15.5 (App Router), Payload CMS 3.79, MongoDB 7.0, Tailwind CSS 3.4, PM2, Nginx.
**Serveur :** VPS Ubuntu 25.04, OVH, IP 51.254.138.240, /var/www/recupeo. MCP SSH connector "recupeo".

---

## 2. OÙ EN EST-ON — RÉSUMÉ

Le MVP est **fonctionnel de bout en bout** pour le parcours retraité actuel du privé (CNAV + Agirc-Arrco).

| Bloc | Description | Statut |
|------|-------------|--------|
| A — Fondations | Types V2, 15 JSON data, 2 collections Payload, catalogue 41 anomalies | ✅ |
| B — SEO + Flash | 4 pages SEO, page flash viral /retraitia/test, heuristique risque, email Brevo S1-E1 | ✅ |
| C — Paiement + Espace | 7 packs Stripe, webhook, layout espace client, documents, formulaire 3 blocs | ✅ |
| D — Extraction | Pipeline 4 niveaux (OCR existant → regex → Claude texte → Vision), 4 parseurs, API upload | ✅ |
| E — Moteur + Anomalies | SAM, taux, proratisation, MiCo, AA, CSG, détecteur, scoring, impact cumulé, score global | ✅ |
| F — Diagnostic + Rapport | Diagnostic serré (montrer/cacher), seuil gratuit, PDF pdfkit 10 sections, rapport interactif | ✅ |
| G — Démarches + Aidant | Timeline, checks interactifs, messages copiables, escalade, magic link proche | ✅ |

**Ce qui manque pour lancer (P1 — 15 tâches) :**
- 11 séquences email Brevo (cron/scheduler)
- 2 guides FranceConnect (contenu statique)
- 1 DocumentUploader drag & drop
- 1 refus intelligent documents

---

## 3. RÈGLES MCP CRITIQUES

```
- JAMAIS `npm run build` directement → `./scripts/build.sh` puis `--status`
- TOUJOURS heredoc quoté (<< 'EOF') pour écrire du code
- Pour les remplacements complexes : script Python dans /tmp/
- ⚠️ Apostrophes françaises (d', l', n') dans les strings TypeScript :
  utiliser des backticks (`) PAS des single quotes (')
- useSearchParams() dans Next.js 15 → NÉCESSITE un Suspense boundary
```

---

## 4. ARBORESCENCE CODE V2 (10 425 lignes)

### 4.1 Logique métier — src/lib/retraitia/ (5 647 lignes)

```
src/lib/retraitia/
  ├── types.ts                    (798l) — Types V2 complets + compat V1
  ├── flash.ts                    (183l) — Heuristique risque flash (8 facteurs)
  ├── webhook-handler.ts          (215l) — Création dossier au 9€, déblocage au 49€
  │
  ├── data/                       — Tables de référence (15 fichiers JSON + index)
  │   ├── index.ts                (275l) — Fonctions d'accès typées (getTrimestresRequis, calculerSAM, getTauxCSG...)
  │   ├── coefficients-revalorisation.json — 1960-2025 (circulaire CNAV 19/12/2025)
  │   ├── trimestres-requis.json  — par génération (gel LFSS 2026 intégré)
  │   ├── age-legal.json          — par génération (gel LFSS 2026 intégré)
  │   ├── pass.json               — PASS 1980-2026
  │   ├── baremes-csg.json        — seuils RFR par nb parts
  │   ├── valeur-point-agirc-arrco.json — service + achat + pré-fusion + GMP
  │   ├── minimum-contributif.json, majorations-enfants.json, esperance-vie.json
  │   ├── reversion-seuils.json, aspa-css.json, constantes-calcul.json
  │   ├── carsat-adresses.json, pays-accords.json, nb-annees-sam.json
  │   └── (15 fichiers au total)
  │
  ├── extraction/                 — Pipeline extraction documents
  │   ├── pipeline.ts             (303l) — Orchestrateur : OCR → regex → Claude → Vision
  │   ├── anonymizer.ts           (56l)  — Anonymisation N°SS + noms avant Claude
  │   ├── prompts.ts              (64l)  — 4 prompts Claude (RIS, notif, AA, avis)
  │   └── parsers/
  │       ├── ris.ts              (102l) — Parseur regex RIS
  │       ├── notification-cnav.ts(101l) — Parseur regex notification pension
  │       ├── agirc-arrco.ts      (90l)  — Parseur regex relevé points
  │       └── avis-imposition.ts  (58l)  — Parseur regex avis d'imposition
  │
  ├── calcul/                     — Moteur de calcul
  │   ├── engine.ts               (107l) — Orchestrateur (appelle les sous-moteurs)
  │   ├── regime-general.ts       (210l) — CNAV : SAM, taux, proratisation, majorations, MiCo
  │   ├── agirc-arrco.ts          (102l) — Points, pension, malus, GMP
  │   └── csg.ts                  (75l)  — Vérification taux CSG + post-variation
  │
  ├── anomalies/
  │   ├── catalogue.ts            (372l) — 41 anomalies définies statiquement
  │   └── detector.ts             (409l) — Détection + scoring + impact cumulé
  │
  ├── messages/
  │   └── generator.ts            (208l) — 10 catégories templates + injection variables
  │
  ├── pdf/
  │   └── report-generator.ts     (272l) — PDF pdfkit 10 sections
  │
  └── [LEGACY V1 — ne pas modifier, sera supprimé]
      ├── anomaly-detection.ts, calculations.ts, constants.ts
      ├── schema.ts, prompts.ts, pdf-generator.ts
      ├── extract-prompt.ts, extract-types.ts, anonymize.ts
      └── __tests__/ (4 fichiers de tests V1)
```

### 4.2 Pages publiques — src/app/retraitia/

```
/retraitia                        — Page chapeau (V1, à remplacer)
/retraitia/verifier-ma-pension    — Landing retraité actuel
/retraitia/preparer-mon-depart    — Landing pré-retraité
/retraitia/pension-de-reversion   — Landing réversion
/retraitia/test                   — Flash viral (4 questions + email + résultat + partage)
/retraitia/preview                — (V1 legacy)
/retraitia/rapport                — (V1 legacy)
```

### 4.3 Espace client — src/app/mon-espace/retraitia/

```
/mon-espace/retraitia/            — Tableau de bord (s'enrichit au fil du parcours)
/mon-espace/retraitia/documents   — Checklist 6 docs + guides + upload
/mon-espace/retraitia/informations— Formulaire 3 blocs / 16 questions
/mon-espace/retraitia/diagnostic  — Diagnostic serré (pré-49€) OU rapport interactif (post-49€)
/mon-espace/retraitia/demarches   — Vue d'ensemble démarches (verrouillé sans 49€)
/mon-espace/retraitia/demarches/:id — Détail anomalie + timeline + message + checks
/mon-espace/retraitia/rapport     — PDF téléchargeable (post-49€)
```

### 4.4 API routes — src/app/api/retraitia/

```
POST /api/retraitia/flash         — Flash : calcul risque + save Payload + email Brevo
POST /api/retraitia/checkout      — Stripe Checkout multi-pack (9€, 49€, 40€, 79€, 39€)
POST /api/retraitia/upload        — Upload document + extraction pipeline
POST /api/retraitia/analyze       — Moteur calcul + détection anomalies → save diagnostic
POST /api/retraitia/generate-pdf  — Génération rapport PDF pdfkit
POST /api/retraitia/invite-proche — Magic link proche aidant + email
[V1 legacy: extract, pre-diagnostic, full-report, generate-letters, preview, report]
```

### 4.5 Composants — src/components/retraitia/

```
espace/StatusCard.tsx       — 5 états (🔴🟡✅⚪🔒)
espace/ProgressBar.tsx      — Barre de progression
espace/TimelineAnomalie.tsx — Frise escalade 6 étapes
espace/CheckInteractif.tsx  — Check avec confirmation
espace/CompteurDelai.tsx    — Compteur J+N coloré
espace/MessageCopiable.tsx  — Message + copier + guide envoi

[V1 legacy: RetraitiaHero, RetraitiaForm, RetraitiaUpload, etc.]
```

### 4.6 Collections Payload

```
RetraitiaFlash.ts    (86l)  — Leads flash (email, score, facteurs, conversion)
RetraitiaDossiers.ts (184l) — Dossiers clients (formulaire, documents, diagnostic, démarches, paiements)
```

Enregistrées dans `src/payload.config.ts`.

---

## 5. MODULES PARTAGÉS RÉCUPÉO UTILISÉS

| Module | Fichier | Rôle |
|--------|---------|------|
| OCR | `src/lib/ocr.ts` (344l) | pdftotext (poppler) + Tesseract fra+eng — **NE PAS réimporter pdf-parse** |
| Claude API | `src/lib/anthropic.ts` | `callClaude()` + `callClaudeVision()` — Sonnet 4 |
| Email | `src/lib/email.ts` | `sendEmail()` via Brevo API |
| Analytics | `src/lib/analytics.ts` | `track()` + `trackEvent()` → GA4 |
| Payment | `src/lib/payment.ts` | `createCheckoutSession()` Stripe + `OFFERS.retraitia` (7 packs) |
| Format | `src/lib/format.ts` | `fmt()` pour l'affichage monétaire |
| Webhook Stripe | `src/app/api/webhooks/stripe/route.ts` | Dispatch vers `handleRetraitiaPayment()` quand brique=retraitia |

---

## 6. TYPES CLÉ (src/lib/retraitia/types.ts)

Le fichier types.ts (798 lignes) contient 12 sections :

1. **Enums** : RetirementPath, ClientStatus, Sex, MaritalStatus, BaseRegime, ComplementaryRegime, SpecialRegime
2. **Flash** : FlashInput, FlashRiskLevel, FlashRiskFactor, FlashResult
3. **Dossier** : DossierStatus, DocumentStatus, DocumentType, DossierDocument
4. **Formulaire** : FormIdentite, FormEnfants, FormCarriere → `DossierFormulaire` (structuré 3 blocs)
5. **Extraction** : ExtractionMethod, ExtractionRIS, ExtractionNotificationCNAV, ExtractionAgircArrco, ExtractionAvisImposition, ExtractionMensualites, DossierExtractions
6. **Calcul** : ConfidenceLevel, ValueWithConfidence, CalculCNAV, CalculAgircArrco, CalculCSG, CalculResult
7. **Anomalies** : AnomalyId (41 valeurs), AnomalyDefinition, DetectedAnomaly, DossierScore, DiagnosticResult
8. **Démarches** : EscaladeStep, AnomalyTrackingStatus, DemarcheTracking
9. **Proche aidant** : ProcheAidant
10. **Messages** : MessageCategory, MessageChannel, GeneratedMessage
11. **Paiements** : RetraitiaPack, PaymentRecord
12. **Compat V1** : RetraitiaFormData (flat), RetraitiaAnomaly, RetraitiaPreDiagResponse, etc. (marqués @deprecated)

**⚠️ Important :** Le formulaire V2 s'appelle `DossierFormulaire` (3 blocs). L'ancien `RetraitiaFormData` (flat) est conservé en compat pour le code V1.

---

## 7. DONNÉES DE RÉFÉRENCE (src/lib/retraitia/data/)

15 fichiers JSON + index.ts avec fonctions d'accès typées :

| Fonction | Retourne |
|----------|----------|
| `getTrimestresRequis(birthYear, birthMonth)` | nombre ou null (post-mars 1965) |
| `getAgeLegalMois(birthYear, birthMonth)` | mois ou null |
| `getCoefficientRevalorisation(annee)` | coefficient multiplicateur |
| `calculerSAM(salaires[], birthYear)` | { sam, meilleuresAnnees[] } |
| `getPASS(year)` | PASS en euros |
| `getValeurPointAA(year)` | valeur de service du point |
| `getTauxCSG(rfr, nombreParts, annee)` | { taux, label } |
| `getMinimumContributif(annee)` | { simple, majore, plafond, seuilTrimCotises } |
| `getEsperanceVie(birthYear, sexe)` | années restantes à 62 ans |
| `hasAccordBilateral(pays)` | boolean |

**Gel LFSS 2026** intégré : `getTrimestresRequis` et `getAgeLegalMois` retournent `null` pour les nés après mars 1965.

---

## 8. TÂCHES RESTANTES

### P1 — MVP (15 restantes sur 76)

**Emails Brevo (11 tâches)** — Le gros morceau restant :

| # | Séquence | Déclencheur |
|---|----------|-------------|
| T014 | S1 relances post-flash (E2-E4) | Flash sans paiement : J+1, J+3, J+7, J+14 |
| T042 | S3 onboarding FranceConnect | Accès non validé après 48h |
| T043 | S4 relance documents | Docs obligatoires manquants : J+1,4,7,14,30 |
| T059 | S5 extraction réussie | Upload + extraction OK |
| T082 | S6 diagnostic prêt | Diagnostic généré |
| T083 | S7 post-diagnostic non-payant | Diagnostic vu, pas de 49€ : J+2,5,10 |
| T094 | S8 bienvenue post-49€ | Paiement 49€ |
| T107 | S9 suivi démarches | Message envoyé : J+0,30,55,60 |
| T108 | S10 anomalie corrigée | Correction confirmée |
| T109 | S11 escalade proposée | Délai dépassé ou refus |
| T122 | S13 invitation proche | Email au proche aidant |

→ Brief détaillé : `cat /var/www/recupeo/project/retraitia-v2/BRIEF_EMAILS_RELANCES.md`
→ Contenu exact des emails, sujets, timing, règles anti-harcèlement

**Contenu statique (2 tâches) :**
- T034 : Diagnostic accès FranceConnect (vérifier si le client peut se connecter)
- T035 : Guides pas-à-pas pour 7 sites (Ameli, impots.gouv, La Poste, info-retraite, lassuranceretraite, agirc-arrco, msa) avec screenshots

**UX (2 tâches) :**
- T037 : DocumentUploader drag & drop (l'upload basique fonctionne déjà)
- T039 : Refus intelligent (valider que le document correspond au type attendu avant extraction)

### P2 — Extensions V2 (22 tâches)

- Moteur calcul fonctionnaires (SRE/CNRACL), MSA exploitants, CNAVPL
- Parcours pré-retraité (simulations multi-scénarios, rachat trimestres)
- Parcours réversion (formulaire, éligibilité, messages par régime)
- Pack couple (79€, sélecteur, 2 rapports)

### P3 — Avancées (13 tâches)

- LRAR intégrée (API Maileva/AR24)
- Export tribunal (ZIP)
- Cross-sell MATAXE/MONIMPOT/MESDROITS
- Notifications in-app
- Scheduler cron emails

---

## 9. BRIEFS DÉTAILLÉS SUR LE SERVEUR

Pour toute question technique détaillée, consulter le brief spécifique :

```bash
cat /var/www/recupeo/project/retraitia-v2/BRIEF_XXX.md
```

| # | Fichier | Contenu | Lignes |
|---|---------|---------|--------|
| 1 | BRIEF_RETRAITIA_V2_MASTER.md | Vision, pricing, parcours | 591 |
| 2 | BRIEF_PARCOURS_RETRAITE.md | Funnel retraité complet | 1042 |
| 3 | BRIEF_PARCOURS_PRERETRAITE.md | Funnel pré-retraité | 716 |
| 4 | BRIEF_PARCOURS_REVERSION.md | Funnel réversion | 834 |
| 5 | BRIEF_ONBOARDING_ACCES.md | FranceConnect, guides, proche aidant | 838 |
| 6 | BRIEF_COLLECTE_DOCUMENTS.md | 13 fiches documents | 864 |
| 7 | BRIEF_EXTRACTION_PARSING.md | Pipeline, parseurs, prompts Claude | 909 |
| 8 | BRIEF_MOTEUR_CALCUL.md | Formules pseudo-code tous régimes | 1247 |
| 9 | BRIEF_ANOMALY_DETECTION.md | 41 anomalies, scoring, impact | 981 |
| 10 | BRIEF_DIAGNOSTIC_GRATUIT.md | Flash + diagnostic serré | 599 |
| 11 | BRIEF_RAPPORT_PDF.md | 10 sections PDF, variantes | 792 |
| 12 | BRIEF_MESSAGES_ACTIONS.md | 24 templates, escalade | 909 |
| 13 | BRIEF_ESPACE_CLIENT_SUIVI.md | Navigation, 7 composants, couple | 906 |
| 14 | BRIEF_EMAILS_RELANCES.md | 15 séquences Brevo | 1005 |
| 15 | BRIEF_REGIMES_SPECIFIQUES.md | 7 fiches régimes | 709 |
| 16 | BRIEF_DONNEES_REFERENCE.md | Tables constantes | 668 |
| 17 | TODO_RETRAITIA.md | Backlog priorisé | ~300 |
| 18 | SESSIONS_RETRAITIA.md | Journal des sessions | ~300 |

---

## 10. PATTERNS À RESPECTER

1. **Build** : `./scripts/build.sh` puis `./scripts/build.sh --status` — JAMAIS `npm run build`
2. **Écriture code** : heredoc quoté `<< 'EOF'` ou script Python dans `/tmp/` pour les gros fichiers
3. **Apostrophes françaises** : backticks (`) dans les strings TypeScript, PAS de single quotes
4. **Suspense** : `useSearchParams()` dans Next.js 15 requiert `<Suspense>` boundary
5. **OCR** : utiliser `extractTextFromDocument()` de `@/lib/ocr` — NE PAS importer `pdf-parse`
6. **Email** : utiliser `sendEmail()` de `@/lib/email` — PAS `sendBrevoEmail`
7. **Payment** : les offres retraitia sont dans `OFFERS.retraitia` de `@/lib/payment.ts`
8. **Types** : le formulaire V2 = `DossierFormulaire`, le V1 flat = `RetraitiaFormData` (compat)
9. **Collections Payload** : enregistrées dans `src/payload.config.ts`
10. **Analytics** : `trackEvent(event, data)` — alias de `track()` avec brique='retraitia'

---

## 11. PROCHAINES ACTIONS RECOMMANDÉES

**Option A — Lancer le MVP** (priorité revenue) :
1. Coder les 11 séquences email Brevo (le plus gros morceau)
2. Créer les 2 guides FranceConnect
3. Améliorer le DocumentUploader (D&D)
4. Ajouter le refus intelligent
5. Tests manuels end-to-end
6. Lancement

**Option B — Consolider** (priorité qualité) :
1. Tests unitaires du moteur de calcul (SAM, taux, MiCo)
2. Tests des parseurs regex avec des vrais documents
3. Connecter les pages à l'API (beaucoup de pages ont encore des données mock/TODO)
4. Nettoyer le code V1 legacy

**Option C — Étendre** (priorité couverture) :
1. P2 : ajouter les régimes FP, MSA, CNAVPL
2. P2 : parcours pré-retraité + réversion
3. P3 : LRAR, tribunal, cross-sell

---

## 12. POUR DÉMARRER UNE SESSION

```
1. Lis le TODO : cat /var/www/recupeo/project/retraitia-v2/TODO_RETRAITIA.md
2. Lis les SESSIONS : cat /var/www/recupeo/project/retraitia-v2/SESSIONS_RETRAITIA.md
3. Consulte le brief détaillé correspondant à ta tâche
4. Code → npx tsc --noEmit → ./scripts/build.sh → --status
5. Mets à jour TODO + SESSIONS après chaque bloc
```
