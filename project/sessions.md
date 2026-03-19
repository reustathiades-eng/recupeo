
---

## Session 11 — 2026-03-18

### Objectif
Corriger les erreurs de calcul fiscal dans MONIMPOT (barème, TMI, décote, plafonds)

### Réalisations
- 8 corrections fiscales critiques (barème, TMI, décote, plafonds, mapping V3)
- Export `getTMI()` pour calcul TMI réel basé sur le barème progressif
- Script de tests `test-monimpot-fixes.sh` (6 tests spécifiques)
- Ajout constantes : FRAIS_REELS_MAX, ABATTEMENT_PENSIONS_MIN/MAX, MINIMUM_RECOUVREMENT
- Déficits fonciers antérieurs dans charges déductibles V3

### Tests
- 16/16 rapides ✅ + 29/29 extraction ✅ + 6/6 corrections ✅ = 51/51

### Fichiers modifiés (7 + 1 script)
- `src/lib/monimpot/constants.ts`
- `src/lib/monimpot/calculations.ts`
- `src/lib/monimpot/calculations-complet.ts`
- `src/lib/monimpot/anomaly-detection.ts`
- `src/components/monimpot/SmartFormV3.tsx`
- `src/app/monimpot/page.tsx`
- `src/app/monimpot/rapport/page.tsx`
- `scripts/test-monimpot-fixes.sh` (nouveau)

---

---

## Session 12 — 2026-03-18 (journee complete)

### Objectif
Refonte UX complete du formulaire MONIMPOT : visuels, inputs, persistance, extraction→formulaire, pre-diagnostic enrichi, email, tests

### Bilan : 32 corrections + 28 tests + 1 email + 13 fichiers

#### Corrections UX (17)
- Hero cards solides, progression etape-based, scroll correct entre etapes
- Navigation libre pastilles maxEtape (revenir en avant sans re-valider)
- Suppression totale spinners type="number" (15 inputs)
- Boutons +/- enfants/jours, separateurs milliers
- Validation par etape avec indication du champ manquant
- sessionStorage persistance SmartFormV3
- Gestion erreur inline (plus de alert())

#### Extraction → Formulaire (8)
- 33 champs pre-remplis via initialData
- Fix 0-as-falsy (|| → ??) sur 12 champs
- Badges visuels "extrait" / "Non disponible"
- Bandeaux contextuels (profil + deductions)
- Inference situation + enfants depuis parts fiscales

#### Pre-diagnostic enrichi (7)
- ProfilResume + SuggestionFuture dans API
- 5 pistes calibrees TMI : PER, emploi domicile, dons, frais reels, garde
- Plafonnement universel par impot paye (impot=0 → eco=0)
- Handle "Vous ne payez pas d'impot cette annee"

#### Email + Nettoyage (4)
- Email recap Brevo pre-diagnostic (gratuit + payant)
- Transparence mise a jour (niches + location)
- Warnings debug masques
- Affichage "Impot deja a 0" sur cartes

#### Tests
- scripts/test-monimpot-30types.sh : 28/28 OK
- Email Brevo confirme fonctionnel (logs PM2)
- Inference parts testee + API testee

### Fichiers modifies (13)
- MonimpotHero.tsx, SmartFormV3.tsx, MonimpotForm.tsx, MonimpotPreDiag.tsx
- MonimpotExtraction.tsx, MonimpotSmartForm.tsx
- page.tsx (monimpot), route.ts (pre-diagnostic)
- types.ts, regex-extractor.ts, extract-mapper.ts, questions-bank.ts
- scripts/test-monimpot-30types.sh (nouveau)

### Compteur tests cumule
- 16/16 rapides + 29/29 extraction + 6/6 corrections + 28/28 types = 79 tests total


---

## Session 13 - 2026-03-18 (apres-midi)

### Decisions strategiques
1. GRATUIT = score + fourchette + nb. ZERO detail.
2. PAYANT = labels, montants, cases, guide, reclamation
3. Email optionnel partout
4. 3 offres fixes 19/39/69
5. Reclamation: 2 options, 7 champs, temps reel
6. Rapport: eco = somme optimisations

### 4 phases, ~35 corrections, 13 fichiers, 2 crees
5 cas test generes avec URLs rapport
