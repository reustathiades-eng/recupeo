# CHANGELOG

**Derniere mise a jour** : 2026-03-18 12:10 UTC (fin session 12)

---

## Session 12 — 2026-03-18 (UX MONIMPOT — 32 corrections + 28 tests)

### 1. Hero & Navigation (5 fixes)
- Cards Hero : bg-white/5 transparent → bg-emerald/10 solide (lisibilite)
- Barre progression SmartFormV3 : computeProgression (67% bug) → etape-based (0% depart)
- Scroll Suivant/Precedent SmartFormV3 : window.scrollTo(top:0) → scrollIntoView #smartform-v3-top
- Scroll MonimpotForm etapes : ajout scrollIntoView #form-steps sur Continuer + Retour
- Navigation libre pastilles : maxEtape track etape max, pastilles cliquables en avant/arriere
- CTA Hero : #upload → #parcours-choix

### 2. Inputs & Validation (8 fixes)
- Suppression totale type="number" → type="text" inputMode="numeric" (15 inputs, 0 spinner)
- Champs enfants/jours (max<=20) : boutons +/- custom
- Champs age (max>20) : input texte simple sans spinner
- Separateurs milliers (30000 → 30 000) dans SmartFormV3 (formatMontant) + MonimpotForm (fmtInput)
- SmartFormV3 : validation required sur salairesD1 + pensionRetraiteD1, bouton grise + message
- MonimpotForm : validation par etape (profil: situation+age, revenus: revenu+parts+impot 0-safe)
- MonimpotForm : message d'erreur submit indique le champ manquant
- SmartForm post-extraction : jours teletravail number → select dropdown 1-5

### 3. Persistance & Resilience (3 fixes)
- sessionStorage auto-save SmartFormV3 (formData + etape + maxEtape, cle recupeo_monimpot_v3)
- Restauration automatique au F5/rechargement/build PM2
- alert() → bandeau inline rouge + bouton Fermer (donnees conservees)

### 4. Extraction → Formulaire manuel (8 fixes)
- initialData prop MonimpotForm : 33 champs pre-remplis depuis extraction OCR
- Fix || → ?? sur 12 champs numeriques (0 traite comme valeur valide, plus comme falsy)
- fmtInput(0) affiche "0" au lieu de "" (impot paye = 0 visible)
- Badges visuels : "✓ extrait" (vert) sur champs importes, "⚠ Non disponible" (ambre) sur age
- Bordures : importedCls (emerald) pour champs extraits, needInputCls (amber) pour manquants
- Bandeau vert profil : "Donnees pre-remplies depuis votre avis"
- Bandeau gradient deductions : "Cherchons vos economies" avec explication
- Inference situation depuis parts (regex C + >=2 parts + 0 enfants → M)
- Inference enfants depuis parts (3 parts M → 2 enfants = 0.5 + 0.5)

### 5. Pre-diagnostic enrichi (7 ajouts)
- ProfilResume (situation, age, parts, TMI, revenu, impot) dans reponse API
- SuggestionFuture : 5 pistes (PER, emploi domicile, dons, frais reels, garde enfant)
- Suggestions calibrees TMI reel (ex: PER 3000€ × 30% = 900€)
- Bloc recap profil compact (4 cols) avec optimisations + detaille (2 cols) sans
- Bloc "Pistes pour optimiser l'annee prochaine" si 0 optimisation
- Plafonnement universel optimisations par impot paye (impot=0 → eco=0 par optimisation)
- Handle "Vous ne payez pas d'impot cette annee" + affichage "Impot deja a 0" sur cartes

### 6. Transparence & Nettoyage (3 fixes)
- "Ce que nous verifions" : +niches courantes (Pinel, outre-mer, foret, borne, renovation) +location
- "Ce que nous ne pouvons pas" : reformule (SCI IS, demembrement, Dutreil, international)
- Warnings techniques masques (RNI infere depuis RBG, extraction: regex)

### 7. Email (1 ajout)
- Email recap Brevo a chaque pre-diagnostic (gratuit ou payant)
- Contenu adaptatif : economie detectee ou declaration bien remplie
- Resume situation + CTA vers rapport ou nouvelle verification
- Non-bloquant (fire-and-forget)

### 8. Tests (1 script)
- scripts/test-monimpot-30types.sh : 28 types testes, 28/28 OK
- Couvre : frais reels, case T, case L, dons, emploi domicile, garde, pension, EHPAD, PER,
  abattement senior, case 2OP, scolarite x3, syndicat, borne, pret etudiant, deficit foncier,
  micro-foncier, micro-BIC, CSG, Pinel, outre-mer, foret, renovation, rattachement, prestation, DOM-TOM
- 2 types non testables isolement : case_perdue + quotient_familial (contexte multi-avis)

### Fichiers modifies (13)
- src/components/monimpot/MonimpotHero.tsx
- src/components/monimpot/SmartFormV3.tsx
- src/components/monimpot/MonimpotForm.tsx
- src/components/monimpot/MonimpotPreDiag.tsx
- src/components/monimpot/MonimpotExtraction.tsx
- src/components/monimpot/MonimpotSmartForm.tsx
- src/app/monimpot/page.tsx
- src/app/api/monimpot/pre-diagnostic/route.ts
- src/lib/monimpot/types.ts
- src/lib/monimpot/regex-extractor.ts
- src/lib/monimpot/extract-mapper.ts
- src/lib/monimpot/questions-bank.ts
- scripts/test-monimpot-30types.sh (nouveau)

---

## Session 11 — 2026-03-18

### 8 corrections fiscales critiques
- Bareme 2026 bornes continues
- Abattement 10% salaires plafonne 14 171€
- TMI reel getTMI() dans anomaly-detection + SmartFormV3
- Minimum recouvrement < 61€
- Decote appliquee AVANT reductions/credits
- Abattement pensions min/max en V3
- Bug mapping V3 fraisReels
- Message chargement rapport adapte V3
- 51/51 tests OK

---

## Session 10 — 2026-03-17

### MONIMPOT V3 Phases 3+4 + Audit qualite
- +17 optimisations (30 au total)
- Seuil gratuit 60€ + grille dynamique 29/59/99€
- SmartFormV3 enrichi
- 8 bugs corriges
- SEO : og:image + twitter card
- Outil audit UX

---

## Sessions 1-9

Voir archives dans /var/www/recupeo/project/sessions.md


---

## Session 13 - 2026-03-18

### Refonte monetisation MONIMPOT V4 + Rapport/Reclamation

#### Monetisation
- GRATUIT = score /100 + fourchette + nb (zero detail)
- PAYANT 19/39/69 = labels, montants, cases, descriptions, guide, reclamation
- Seuil 60 supprime, email optionnel, suggestions conditionnelles

#### Rapport
- economie = somme optimisations plafonnee (plus bareme)
- PDF: supprime override, economie_3ans, fix separateur

#### Guide correction
- Sous-etapes detaillees a/b/c par optimisation + intro + rappel delai

#### Reclamation
- 7 champs: nom, adresse, CP, ville, n fiscal, n avis, centre impots
- 2 options: courrier recommande PDF + message impots.gouv.fr
- Temps reel dans les 2 modeles + PDF substitution complete

---

## 2026-03-20 — Session 14 : MAPAIE + Claude Code

### Added
- Brique MAPAIE complete (26 fichiers, 9eme brique)
- Git + GitHub (repo prive reustathiades-eng/recupeo)
- Jest configure
- Claude Code installe sur VPS (v2.1.80)
- CLAUDE.md a la racine du projet
- 11 events GA4 mapaie_*
- 2 offres Stripe mapaie_audit_3m (49EUR) + mapaie_audit_12m (129EUR)
- Knowledge base chat IA pour mapaie
- CrossSell mapaie sur toutes les briques

### Fixed
- Hero.tsx : boutons scrollent au lieu de naviguer vers pages inexistantes
- Form.tsx : apostrophes unicode, Field extrait hors composant (bug focus), mapping donnees vers API
- analytics.ts : ajout events mapaie manquants

### Infrastructure
- Orchestrateur multi-agents construit puis abandonne (taux succes insuffisant)
- Migration vers Claude Code (taux succes ~95%)
- Script de taches sequentielles via screen/tmux + Claude Code -p --dangerously-skip-permissions
