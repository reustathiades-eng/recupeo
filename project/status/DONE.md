# DONE — Ce qui est termine

**Derniere mise a jour** : 2026-03-18 12:10 UTC (fin session 12)

---

## SESSION 7 — 17 mars 2026 (apres-midi)

### MONIMPOT V2 — 10 optimisations + 3 bugs corriges ✅

#### Bugs corriges
- **Bug #4 / O1** — Economie fantome V1 : si 0 optimisations en mode formulaire → eco force a 0
- **Bug #5** — Confirme non-bug : detectCasesVides exclut deja les cases renseignees
- **Bug #7** — Reclamation generee meme sans sensitiveData (placeholders n fiscal/adresse)

#### Optimisations deployees (10/10)
- **O1** — Garde-fou V1 (pas d extraction + 0 optimisations → eco=0)
- **O2** — PreDiag enrichi (messages adaptatifs < 200€ / > 1000€, barre progression, cross-sell)
- **O3** — Validation croisee extraction (7 checks : impotNet/Brut, RFR/RNI, parts min/max, revenus negatifs, etc.)
- **O4** — Prompt extraction cas complexes (couple 2 salaires 1AJ+1BJ, fonciers 4BA/4BE, micro-BIC/BNC, plus-values, deficits)
- **O5** — Calcul 2OP precis base sur revenusCapitaux reels (ex: 3000€ × 1.8% = 54€ au lieu de forfait 100€)
- **O6** — Detection periode correction en ligne (aout-dec = ouvert, sinon reclamation contentieuse)
- **O7** — PDF ameliore : logo RECUPEO couverture + en-tete, graphique barres (impot paye vs optimise), coordonnees centre impots dans reclamation
- **O8** — Email post-paiement enrichi monimpot (resume economie, contenu rapport, CTA)
- **O9** — Analytics funnel complet (paywall_viewed + report_generated ajoutes)
- **O10** — Tests E2E automatises : script ./scripts/test-monimpot.sh (15 tests, mode rapide 10s + mode full avec Claude IA 2min)

#### Tests passes (15/15)
- T1 — Fix impot/restitution (229€ correct)
- T4a — V1 sans optimisation (eco=0, O1 guard)
- T4b — V1 parent isole (case T detectee)
- T6 — Non imposable (eco=0 coherent)
- T7 — Restitution + impot > 0 (correct)
- T8 — Anonymisation base MongoDB (aucune PII)
- T9 — Logs serveur propres
- Full-report Claude IA : synthese + 3 postes OK
- PDF rapport : 273 Ko, valide, avec logo
- PDF reclamation : avec coordonnees centre
- 15/15 tests E2E automatises PASS

#### Fichiers modifies (~15)
- src/app/api/monimpot/pre-diagnostic/route.ts (O1)
- src/app/api/monimpot/extract/route.ts (O3, O4 parsing)
- src/app/api/monimpot/full-report/route.ts (O9)
- src/app/api/monimpot/generate-letters/route.ts (Bug #7)
- src/app/api/monimpot/generate-pdf/route.ts (O7 sensitiveData)
- src/app/api/webhooks/stripe/route.ts (O8)
- src/lib/monimpot/extract-types.ts (O4 types complexes)
- src/lib/monimpot/extract-prompt.ts (O4 prompts)
- src/lib/monimpot/anomaly-detection.ts (O5 calcul 2OP)
- src/lib/monimpot/pdf-generator.ts (O7 logo+graphique+centre)
- src/lib/monimpot/prompts.ts (O6 periode correction)
- src/lib/monimpot/types.ts (O5 champs V2)
- src/lib/monimpot/schema.ts (O5 extractedRevenusCapitaux)
- src/lib/email.ts (O8 template monimpot)
- src/components/monimpot/MonimpotPreDiag.tsx (O2 messages+barre)
- src/components/monimpot/MonimpotPaywall.tsx (O9 paywall_viewed)
- src/components/monimpot/MonimpotSmartForm.tsx (O5 pass revenusCapitaux)
- src/components/monimpot/MonimpotReport.tsx (O7 pass sensitiveData PDF)
- scripts/test-monimpot.sh (O10 tests E2E)

---

## SESSION 6 — 16-17 mars 2026 (nuit)

### Chantier 1 — Compte Client
- Auth magic link Brevo + JWT cookie jose (Edge-compatible)
- Middleware protection /mon-espace/*
- 9 pages : connexion, tableau-de-bord, mes-diagnostics, mes-documents, mes-demarches, parrainage, profil, parametres
- 11 routes API auth (magic-link, verify, me, logout, dashboard, diagnostics, demarche, profile, referral, export, delete)
- Navbar UserMenu (avatar, dropdown, logout)
- 8 briques avec persistence Payload + userEmail
- AccountPrompt post-achat sur 3 pages rapport
- RGPD : export JSON + suppression J+30
- ~45 fichiers

### Chantier 2 — Chat IA
- Widget flottant emerald, 3 modes (orientation/assistance/post-achat)
- Streaming SSE Claude claude-sonnet-4, knowledge base 8 briques
- Suggestions + CTA dynamiques, rate limiting
- ~12 fichiers

### Chantier 3 — Avis Clients
- Collection Reviews + 4 routes API (submit/list/stats/request)
- Token JWT verifie, moderation auto, notification admin
- Page /avis + ReviewMiniProof 8 paywalls + ReviewJsonLd 8 briques
- 8 avis de test (4.6/5, 6577 euros recuperes)
- ~20 fichiers

### Chantier 4 — Partage Social + Parrainage
- ShareBlock 8 briques (6 canaux, montant anonymise)
- Image OG dynamique satori+sharp (1200x630, cache 1h)
- WallOfWins vrais chiffres MongoDB
- Collection Referrals
- ~15 fichiers

### MONIMPOT — 8eme brique (V1 formulaire + V2 upload)
- V1 : Formulaire 3 etapes (profil fiscal, revenus, deductions) 20+ champs
- V2 : Upload avis d imposition → OCR/Vision → SmartForm 4-7 questions
- 13 types optimisations fiscales, bareme 2026
- Multi-avis 3 ans + comparaison + cases perdues
- Pre-diagnostic gratuit JS pur + rapport IA + guide correction + reclamation pre-remplie
- Page /monimpot/rapport 3 onglets + PDF telechargeable
- Paywall 39/79 euros
- 28 fichiers, 4632 lignes

---

## SESSION 5 — 16 mars 2026 (soiree)

### MABANQUE — 6eme brique
- 21 fichiers : formulaire + upload releve bancaire OCR+Vision
- 7 types anomalies bancaires, plafonds legaux, client fragile
- Paywall 19/29 euros

### MONCHOMAGE — 7eme brique
- 21 fichiers : upload notification FT + attestation + bulletins
- Calcul ARE complet (SJR, AJ, degressivite, duree par age)
- 8 types anomalies, paywall 69/129 euros

---

## SESSIONS 1-4 — 15-16 mars 2026

### 5 premieres briques
- MACAUTION : Upload etat des lieux OCR+Vision, vetuste, 29/49 euros
- RETRAITIA : Upload releve carriere OCR+Vision, anomalies retraite, 79/149/199 euros
- MONLOYER : Formulaire pur, encadrement loyers 50 villes, gratuit + 29 euros
- MATAXE : Upload 6675-M OCR+Vision, anomalies taxe fonciere, gratuit + 49 euros
- MAPENSION : Formulaire pur, calcul INSEE mois par mois, 29/49 euros

### Infrastructure complete
- Next.js 15.5.12 + Payload CMS 3.79.0 + MongoDB 7.0.30
- PM2 + Nginx + SSL Certbot (recupeo.fr + recupeo.com)
- Stripe mode test + Brevo email + GA4 + Search Console
- Pages legales + SEO (robots, sitemap, JSON-LD FAQ)
- Home page 15 sections funnel AIDA
- 5 composants shared (7 configs chacun)

---

## SESSION 7 — 17 mars 2026 (matin)

### MONIMPOT V2 — Upload avis + OCR/Vision
- Upload multi-fichiers (PDF/JPG/PNG/WEBP, max 3 fichiers, max 10 Mo)
- Extraction OCR local (Tesseract) + fallback Vision (Claude API)
- SmartForm 4-7 questions adaptatives basées sur les cases vides
- 10 optimisations (O1-O10) : frais réels, case T/L, 2OP, PER, foncier, seniors...
- Page rapport /monimpot/rapport (3 onglets : rapport, guide, réclamation)
- PDF rapport + PDF réclamation avec sensitiveData
- 8 optimisations (O1-O6, O8, O9) déployées + 3 bugs corrigés + 7 tests passés

---

## SESSION 8 — 17 mars 2026 (après-midi)

### Tests MONIMPOT V2 en conditions réelles
- Générateur 8 PDF synthétiques (scripts/generate-test-avis.cjs)
- 8/8 profils extraction testés et validés
- 3 corrections extraction : prompt renforcé + validation post-extraction + rejet doc invalide

### BUG-CALC — Correction calcul économie
- Ajout de la décote dans calculations.ts (calculDecote, calculImpotApresDecote)
- Harmonisation pré-diagnostic : estimations marginales plafonnées par impôt payé
- PDF generator utilise calc JS prioritairement
- Résultat : T-01=383€, T-06=144€, T-03=0€, E2E-6=54€ — tous cohérents

### Robustesse validée
- Faux document rejeté, JPEG OK, format invalide rejeté, >10Mo rejeté
- Multi-avis 2 fichiers OK, mode V1 fallback OK

### Tests E2E v2
- Script test-monimpot.sh réécrit avec 3 modes (rapide/extract/full)
- 16/16 tests rapides passent

### Fichiers modifiés (7)
- scripts/generate-test-avis.cjs (nouveau)
- scripts/test-monimpot.sh (réécrit)
- src/lib/monimpot/extract-prompt.ts
- src/app/api/monimpot/extract/route.ts
- src/lib/monimpot/calculations.ts
- src/app/api/monimpot/pre-diagnostic/route.ts
- src/lib/monimpot/pdf-generator.ts

---

## SESSION 9 — 17 mars 2026 (soiree)

### MONIMPOT V3 — Phase 1 Zero API + Phase 2 Formulaire Intelligent

#### Phase 1 — Zero API (extraction + rapport + lettres)
- `regex-extractor.ts` (659L) : extraction avis d'imposition 100% regex, 0 appel API
- `templates.ts` (423L, 13 types) : templates rapport/guide/reclamation avec articles CGI
- `report-builder.ts` (351L) : assembleur JS pour rapport complet sans Claude
- 3 routes modifiees : extract (regex first, fallback Claude), full-report (0 API), generate-letters (0 API)
- V3.1 Hardening : normalizeOCRText, inferMissingFields, scoring recalibre
- 8/8 PDF + JPEG = regex pur (conf 85-95%), seul faux bulletin en fallback
- Perf : 65s → 0.3s (270x plus rapide), cout 0.06€ → 0€/client

#### Phase 2 — Formulaire intelligent (SmartFormV3)
- `form-complet-types.ts` (218L) : types FormComplet avec 131 cases fiscales
- `questions-bank.ts` (904L) : 65 questions adaptatives conditionnelles
- `calculations-complet.ts` (455L) : calcul fiscal complet cote client (bareme, QF, decote, reductions, credits)
- `SmartFormV3.tsx` (392L) : formulaire 10 etapes avec calcul temps reel
- Page monimpot : choix A/B (upload ou formulaire intelligent)
- 29/29 tests extract OK, 16/16 rapides OK

---

## SESSION 10 — 17 mars 2026 (nuit)

### MONIMPOT V3 — Phases 3+4 (30 optimisations + grille tarifaire)

#### Phase 3 — 30 optimisations (+17 nouveaux types)
- `anomaly-detection.ts` (248→503L) : +17 types de detection
- `templates.ts` (423→866L) : +17 templates rapport/guide/reclamation avec articles CGI
- 17 nouveaux types : scolarite_college (7EA), scolarite_lycee (7EC), scolarite_superieur (7EF), syndicat (7UR), pinel (7CQ), outre_mer (7GH), foret (7WN), renovation_energetique (7RN), borne_electrique (7ZQ), pret_etudiant (7TD), micro_foncier_vs_reel (4BE/4BA), micro_bic_vs_reel (5ND/5NK), deficit_foncier (4BD), csg_deductible (6DE), rattachement_enfant, prestation_compensatoire (7WJ/6GU), abattement_dom_tom
- 30/30 types API verifies avec curl

#### Phase 4 — Seuil 60€ gratuit + grille tarifaire dynamique
- `MonimpotPreDiag.tsx` reecrit : < 60€ = gratuit (diagnostic + conseils offerts, badge, pas de paywall)
- `MonimpotPaywall.tsx` reecrit : grille dynamique basee sur economieAnnuelle
  - 60-500€ → 29€ (rapport detaille)
  - 500-2000€ → 59€ (rapport + suivi)
  - > 2000€ → 99€ (premium + accompagnement email 30j)
- `payment.ts` : 3 nouvelles offres (monimpot_standard, monimpot_plus, monimpot_premium)
- Montants d'economie "floutes" dans le paywall (blurAmount)
- GA4 tracking enrichi par palier (gratuit/standard_29/plus_59/premium_99)

#### SmartFormV3 enrichi
- Question `impotPayeActuel` ajoutee (etape 3) pour comparer impot reel vs optimise
- Scolarite split en 3 questions nombre (college/lycee/superieur au lieu de oui/non)
- 7 questions Phase 3 : prestation_compensatoire, cotisations_syndicales, pret_etudiant, outre_mer, invest_forestier, borne_electrique_montant, dom_tom
- Indicateur economie enrichi : compteur "avantages fiscaux identifies" + badges en temps reel
- Mapping FormComplet → MonimpotFormData etendu (17 champs Phase 3)
- `domTom` ajoute dans FormComplet + defaults

#### Audit code qualite (8 bugs corriges)
1. CRITIQUE — revenuNetImposable dans page.tsx ignorait foncier/BIC/gerant → utilise fullCalc.revenuNetImposable
2. CRITIQUE — impotPaye: || ignorait la valeur 0 → remplace par ??
3. ERREUR — toLocaleString dans email.ts → Intl.NumberFormat avec espace normal
4. ERREUR — 'use client' apres import dans MacautionPreDiag + MabanqueForm → deplace en L1
5. IMPORTANT — Credit borne min(count, 600) au lieu de count*300 → corrige
6. IMPORTANT — Scolarite superieur invisible pour enfants majeurs → hasEnfantsOuMajeurs
7. MOYEN — Syndicat reserve salaries → etendu aux retraites
8. PERF — Double appel computeFullCalculations() → mis en cache fullCalc

#### SEO corrections
- og:image + twitter card ajoutes dans root layout.tsx
- og:image ajoute dans 6 child layouts (monimpot, macaution, retraitia, monloyer, mataxe, avis)
- 3 titres raccourcis (monimpot, monloyer, mapension) pour < 70 chars

#### Outil audit UX cree
- `scripts/audit/ux-audit.mjs` (463L) — pure Node.js, zero dependance
- Analyse 14 pages, 56 API routes, 129 liens
- Resultat final : 0 erreurs, 30 warnings (acceptables)

#### Fichiers modifies (~20)
- src/lib/monimpot/anomaly-detection.ts (248→503L)
- src/lib/monimpot/templates.ts (423→866L)
- src/lib/monimpot/form-complet-types.ts (+2 champs)
- src/lib/monimpot/questions-bank.ts (+8 questions, split scolarite)
- src/lib/monimpot/types.ts (+17 champs Phase 3)
- src/lib/monimpot/schema.ts (+17 champs Zod)
- src/lib/monimpot/calculations-complet.ts (borne fix + syndicat comment)
- src/components/monimpot/SmartFormV3.tsx (indicateur optimisations)
- src/components/monimpot/MonimpotPreDiag.tsx (seuil 60€ gratuit)
- src/components/monimpot/MonimpotPaywall.tsx (grille dynamique)
- src/lib/payment.ts (3 offres monimpot)
- src/lib/email.ts (toLocaleString fix)
- src/app/monimpot/page.tsx (mapping Phase 3 + seuil paywall + fullCalc cache)
- src/app/api/monimpot/pre-diagnostic/route.ts (GA4 palier)
- src/app/layout.tsx (og:image + twitter card)
- src/app/monimpot/layout.tsx (og:image + titre raccourci)
- src/app/macaution/layout.tsx (og:image)
- src/app/retraitia/layout.tsx (og:image)
- src/app/monloyer/layout.tsx (og:image + titre raccourci)
- src/app/mataxe/layout.tsx (og:image)
- src/app/mapension/layout.tsx (titre raccourci)
- src/app/avis/layout.tsx (og:image)
- src/components/macaution/MacautionPreDiag.tsx (use client fix)
- src/components/mabanque/MabanqueForm.tsx (use client fix)
- scripts/audit/ux-audit.mjs (nouveau)

---

## SESSION 12 — 18 mars 2026 (complete)

### UX MONIMPOT — 32 corrections + 28 tests + email

**Derniere mise a jour** : 2026-03-18 12:10 UTC

#### Hero & Navigation (5 fixes)
- [x] Cards Hero transparentes → bg-emerald/10 solide
- [x] Progression 67% bug → etape-based 0% au depart
- [x] Scroll Suivant/Precedent → scrollIntoView #smartform-v3-top + #form-steps
- [x] Navigation libre pastilles (maxEtape, revenir en avant sans re-valider)
- [x] CTA Hero → #parcours-choix

#### Inputs & Validation (8 fixes)
- [x] 15 inputs type="number" → type="text" inputMode="numeric" (0 spinner)
- [x] Boutons +/- custom enfants/jours (max<=20)
- [x] Input texte age (max>20)
- [x] Separateurs milliers tous champs montant
- [x] Validation required SmartFormV3 : salairesD1 + pensionRetraiteD1
- [x] Validation par etape MonimpotForm : profil (situation+age) + revenus (revenu+parts+impot)
- [x] Validation 0-safe (|| → ?? sur 12 champs) + fmtInput(0) = "0"
- [x] Jours teletravail SmartForm → select 1-5

#### Persistance & Resilience (3 fixes)
- [x] sessionStorage auto-save SmartFormV3 (formData + etape + maxEtape)
- [x] Restauration auto au F5/rechargement
- [x] alert() → bandeau inline rouge (donnees conservees)

#### Extraction → Formulaire manuel (8 fixes)
- [x] 33 champs pre-remplis via initialData prop
- [x] Fix || → ?? (0 = valide)
- [x] Badges "✓ extrait" (vert) / "⚠ Non disponible" (ambre)
- [x] Bandeau vert profil + bandeau gradient deductions
- [x] Message validation indique le champ manquant
- [x] Inference situation depuis parts (C + 2 parts → M)
- [x] Inference enfants depuis parts (3 parts M → 2 enfants)
- [x] Bordures visuelles importedCls / needInputCls

#### Pre-diagnostic enrichi (7 ajouts)
- [x] ProfilResume dans API (situation, age, parts, TMI, revenu, impot)
- [x] SuggestionFuture : PER, emploi domicile, dons, frais reels, garde
- [x] Suggestions calibrees TMI reel
- [x] Recap profil (compact + detaille)
- [x] Bloc "Pistes pour optimiser" si 0 optimisation
- [x] Plafonnement universel optimisations par impot paye
- [x] Handle "Vous ne payez pas d'impot cette annee" (impot=0)

#### Email + Transparence + Nettoyage (4 fixes)
- [x] Email recap Brevo a chaque pre-diagnostic (non-bloquant)
- [x] Transparence : +niches courantes, +location, reformulation limites
- [x] Warnings techniques masques
- [x] Affichage "Impot deja a 0" sur cartes optimisation

#### Tests
- [x] scripts/test-monimpot-30types.sh : 28/28 types OK
- [x] Email Brevo fonctionnel (confirme dans logs)
- [x] Inference parts testee (3 parts C → M + 2 enfants)
- [x] API pre-diagnostic testee (profil + suggestions retournes)

### 13 fichiers modifies, 32 corrections, 28 tests, 0 erreurs build



---

## Session 13 - 2026-03-18 (apres-midi)

### Bilan : 4 phases, ~35 corrections, 13 fichiers modifies, 2 crees

#### Phase 1 - Teaser + Paywall 3 offres
- [x] PreDiag score/jauge/fourchette, seuil 60 supprime, 3 offres 19/39/69
- [x] Email teaser, wording verification gratuite, GA4 paliers

#### Phase 2 - Corrections post-test
- [x] getBlurredLabel 30/30, paywall eco=0, chat tarifs, utils.ts DRY
- [x] Fix age validation, erreurs Zod, RecapStep teaser

#### Phase 3 - Frontiere gratuit/payant
- [x] GRATUIT = score+fourchette+nb SEULEMENT, PAYANT = tout le reste
- [x] Suggestions goodwill/absentes, apercu rapport, email optionnel

#### Phase 4 - Rapport + Guide + Reclamation
- [x] PDF fix separateur, guide sous-etapes a/b/c + intro + delai
- [x] Reclamation 7 champs (nom, adresse, CP, ville, nf, na, centre)
- [x] Option 1 courrier + Option 2 message impots.gouv.fr
- [x] Mise a jour temps reel courrier+message (getPersonalizedCorps)
- [x] PDF reclamation: substitution placeholders + corps depuis Madame Monsieur
- [x] Report-builder: eco=somme opts, synthese coherente, economie_3ans
- [x] PDF rapport: supprime override bareme

### 13 fichiers modifies + 2 crees

---

## Session 14 — 2026-03-20 — MAPAIE (Brique #9)

### Contexte
Premiere brique construite via Claude Code (apres tentative orchestrateur multi-agents).
Construite en 27 minutes via script de 16 taches executees par Claude Code en autonomie.

### Infrastructure mise en place
- [x] Git initialise sur VPS + push GitHub (github.com/reustathiades-eng/recupeo, prive)
- [x] Jest + ts-jest configures (jest.config.cjs)
- [x] Claude Code installe sur VPS (v2.1.80)
- [x] CLAUDE.md cree a la racine du projet (contexte persistant)
- [x] Node.js 22 installe sur WSL + SSH WSL→VPS configure

### Orchestrateur multi-agents (tentative abandonnee)
- Construit un orchestrateur TypeScript complet (12 fichiers, 911 lignes)
- Agents : planner (Haiku), coder (Sonnet), reviewer (Sonnet), tester (Sonnet), escalation (Opus)
- Probleme : taux de succes ~30% (troncature fichiers, manque de contexte projet)
- Decision : abandonner au profit de Claude Code (taux succes ~95%, lit les vrais fichiers)
- Budget depense sur orchestrateur : ~$2.19 (74 appels API)
- L'orchestrateur reste dans /home/ubuntu/orchestrator/ comme reference

### MAPAIE — 26 fichiers crees

**Backend (lib) :**
- [x] src/lib/mapaie/types/ (base.ts, bulletin.ts, anomaly.ts, convention.ts, index.ts)
- [x] src/lib/mapaie/schema.ts — validation Zod (emploi, remuneration, upload, pre-diagnostic)
- [x] src/lib/mapaie/constants.ts — SMIC 2026, majorations HS, PMSS, cotisations
- [x] src/lib/mapaie/conventions.ts — CCN > 1000 salaries (IDCC, minima, primes)
- [x] src/lib/mapaie/calculations.ts — calculs HS, rappel salaire, SMIC, anciennete
- [x] src/lib/mapaie/anomaly-detection.ts — 8 types anomalies paie
- [x] src/lib/mapaie/prompts.ts — extraction, pre-diag, rapport, reclamation

**API routes :**
- [x] /api/mapaie/extract — OCR + Vision + anonymisation PII
- [x] /api/mapaie/pre-diagnostic — detection anomalies (JS pur, gratuit)
- [x] /api/mapaie/full-report — rapport complet (Stripe + Claude)
- [x] /api/mapaie/generate-letters — LRAR employeur + saisine CPH

**Frontend (composants) :**
- [x] Hero.tsx — landing, stats, CTA scroll
- [x] Upload.tsx — drag & drop PDF, multi-fichiers, extraction
- [x] Form.tsx — emploi + remuneration (Field extrait hors composant)
- [x] PreDiag.tsx — resultat pre-diagnostic (anomalies, rappel, score)
- [x] Paywall.tsx — 2 offres 49EUR / 129EUR
- [x] Report.tsx — rapport complet (sections, bilan, LRAR, CPH)
- [x] FAQ.tsx — 10 questions

**Pages :**
- [x] /mapaie/page.tsx — orchestration Hero→Upload→Form→PreDiag→Paywall→Report→FAQ
- [x] /mapaie/layout.tsx — metadata SEO

**Transversal :**
- [x] payment.ts — offres mapaie_audit_3m (49EUR), mapaie_audit_12m (129EUR)
- [x] sitemap.ts — URL /mapaie ajoutee
- [x] chat/knowledge/mapaie.ts — knowledge base chat IA
- [x] constants.ts — available: true, tag: Disponible
- [x] CrossSellBriques — mapaie ajoute
- [x] analytics.ts — 11 events mapaie_*

### Bugs corriges
- [x] Hero boutons → scrollIntoView au lieu de router.push inexistant
- [x] Form apostrophes \u2019 → apostrophes normales
- [x] Form Field recree a chaque frappe → extrait hors composant
- [x] Form → API mapping plat vers structure PreDiagnosticSchema

### Build
TS : 0 erreurs mapaie / Build : SUCCESS / PM2 : online / HTTP 200

### Statistiques
- 26 fichiers crees
- 16 taches Claude Code en 27 minutes
- 4 bugs corriges post-deploiement
- ~20 commits git
- Budget API Claude Code : inclus dans abonnement Pro
