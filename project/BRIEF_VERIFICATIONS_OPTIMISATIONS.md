# BRIEF — Vérifications & Optimisations RÉCUPÉO

**Date** : 17/03/2026 — Post-session 10
**Objectif** : Audit exhaustif UX/code/SEO + corrections sur l'ensemble du site

---

## Contexte

RÉCUPÉO est un SaaS IA (recupeo.fr) avec 8 briques en production. La session 10 a déployé MONIMPOT V3 (30 optimisations fiscales, grille tarifaire 29/59/99€, seuil gratuit 60€) et un premier audit code qualité (8 bugs critiques corrigés). Un outil d'audit automatisé a été créé (`scripts/audit/ux-audit.mjs`).

**État actuel de l'audit** : 0 erreurs, 30 warnings (acceptables — pages légales sans CrossSell, tracking GA4 dans les composants enfants).

---

## Outil d'audit existant

```bash
# Audit complet (14 pages + 56 API + source code)
cd /var/www/recupeo && node scripts/audit/ux-audit.mjs --all --api

# Audit une seule page
node scripts/audit/ux-audit.mjs /monimpot

# Rapport JSON complet
cat scripts/audit/last-report.json
```

L'outil vérifie : HTTP status, meta/OG tags, liens internes (129 testés), HTML (undefined/NaN/[object Object]), imports cassés, `toLocaleString`, `use client` mal placé, composants manquants.

---

## CHANTIER 1 — Test UX SmartFormV3 navigateur

### Ce qu'il faut tester
Ouvrir https://recupeo.fr/monimpot → cliquer "Je n'ai pas mon avis sous la main" → Chemin B complet.

**10 étapes à parcourir :**
1. Situation (célibataire/marié/divorcé/veuf) + âge + invalidité
2. Famille (enfants mineurs, garde alternée, majeurs rattachés, handicapés)
3. Revenus (type, salaires, pensions, gérant) + **impôt payé actuellement** (nouveau)
4. Frais pro (voiture, distance, télétravail, repas)
5. Autres revenus (placements, foncier, auto-entrepreneur)
6. Charges déductibles (pension alimentaire, PER, CSG, prestation compensatoire)
7. Réductions (dons, emploi domicile, garde, **scolarité collège/lycée/supérieur** (nouveau split), syndicat, prêt étudiant)
8. Investissements (PME, Pinel, borne électrique, outre-mer, forêt, rénovation)
9. Situations particulières (changement, étranger, compte étranger, **DOM-TOM** (nouveau))
10. Récapitulatif (profil, revenus, impôt estimé, email, checkbox)

**Points de vérification à chaque étape :**
- Questions conditionnelles : les questions sautent correctement (ex: pas de conjoint si célibataire, pas de frais pro si retraité)
- Boutons Oui/Non : réponse visuelle (border emerald + bg)
- Inputs montant : accepte les nombres, affiche l'unité €
- Barre de progression : avance à chaque étape
- Indicateur temps réel (étapes 4+) : montre l'impôt estimé + "X avantages fiscaux identifiés"
- Navigation : Précédent/Suivant fonctionne, scroll to top

**Points spécifiques Phase 3 :**
- La question `impotPayeActuel` apparaît à l'étape 3 pour tous les profils
- La scolarité est en 3 questions nombre (collège/lycée/supérieur), pas un oui/non
- `scolarite_superieur` apparaît aussi si enfants majeurs rattachés (pas seulement mineurs)
- Les questions syndicat apparaissent pour salariés ET retraités
- Les questions Phase 3 (borne montant, outre-mer, forêt, etc.) apparaissent à l'étape 8
- DOM-TOM apparaît à l'étape 9

**Test du résultat :**
- Soumission → spinner → résultat PreDiag
- Si économie < 60€ → badge "🎁 Diagnostic et conseils offerts", pas de paywall, cross-sell
- Si économie 60-500€ → paywall 29€
- Si économie 500-2000€ → paywall 59€
- Si économie > 2000€ → paywall 99€
- Montant flouté dans le paywall (~450€ au lieu de 447€)
- ROI affiché (×N)
- Après le paywall : TransparencyBlock, ReviewSection, CrossSellBriques, FAQ

**Test mobile :**
- Vérifier que le formulaire est responsive (boutons Oui/Non, inputs, navigation)
- Tester sur viewport 375px et 768px

---

## CHANTIER 2 — Audit qualité code source approfondi

### Vérifications automatisées à enrichir dans l'outil d'audit

**Ajouter à `ux-audit.mjs` :**
```javascript
// 1. Vérifier les imports dynamiques non utilisés
// 2. Détecter les composants sans 'use client' qui utilisent useState/useEffect
// 3. Vérifier la cohérence des noms de props entre parent et enfant
// 4. Détecter les fetch() sans try/catch
// 5. Vérifier que chaque page a un H1 unique
// 6. Détecter les images sans loading="lazy"
// 7. Vérifier la taille des bundles (chunks > 200KB)
```

### Fichiers à auditer manuellement

**Composants monimpot (priorité haute) :**
```
src/components/monimpot/SmartFormV3.tsx      (430L) — formulaire V3
src/components/monimpot/MonimpotPreDiag.tsx  (140L) — seuil 60€
src/components/monimpot/MonimpotPaywall.tsx  (140L) — grille dynamique
src/components/monimpot/MonimpotUpload.tsx   (313L) — upload avis
src/components/monimpot/MonimpotExtraction.tsx (236L) — affichage extraction
src/components/monimpot/MonimpotSmartForm.tsx (396L) — formulaire V2 post-extraction
src/components/monimpot/MonimpotReport.tsx   (341L) — page rapport
```

**Lib monimpot (priorité haute) :**
```
src/lib/monimpot/anomaly-detection.ts    (503L) — 30 types détection
src/lib/monimpot/templates.ts            (866L) — 30 templates
src/lib/monimpot/calculations-complet.ts (455L) — calcul V3
src/lib/monimpot/questions-bank.ts       (960L) — 72+ questions
src/lib/monimpot/regex-extractor.ts      (659L) — extraction Zero API
```

**Points à vérifier dans chaque fichier :**
- Typos dans les textes français (accents, guillemets)
- Calculs fiscaux : barème 2026 correct, plafonds à jour
- Cohérence entre detect (anomaly-detection) et template (templates.ts)
- Cohérence entre question (questions-bank) et champ (form-complet-types)
- Mapping complet dans page.tsx (FormComplet → MonimpotFormData)

---

## CHANTIER 3 — Tests automatisés Phase 3

### Tests existants
```bash
./scripts/test-monimpot.sh              # 16 tests rapides (~15s)
./scripts/test-monimpot.sh --extract    # 29 tests extraction (~30s)
```

### Tests à ajouter pour les 30 types

Créer `scripts/test-monimpot-phase3.sh` qui teste chaque type d'optimisation via curl :

| # | Type | Scénario test | Résultat attendu |
|---|------|---------------|------------------|
| 14 | scolarite_college | enfantsMineurs=2, enfantsCollege=2 | eco=122€ |
| 15 | scolarite_lycee | enfantsMineurs=1, enfantsLycee=1 | eco=153€ |
| 16 | scolarite_superieur | enfantsMajeursRattaches=1, enfantsSuperieur=1 | eco=183€ |
| 17 | syndicat | cotisationsSyndicales=300 | eco=198€ |
| 18 | pinel | pinelMontant=200000 | eco≈4000€ |
| 19 | outre_mer | outreMerMontant=50000 | eco=12500€ |
| 20 | foret | investForestier=5000 | eco=1250€ |
| 21 | renovation_energetique | renovationEnergetique=15000 | eco≈4500€ |
| 22 | borne_electrique | borneElectriqueMontant=2 | eco=600€ |
| 23 | pret_etudiant | pretEtudiantMontant=2000 | eco=500€ |
| 24 | micro_foncier_vs_reel | loyersBruts=12000, chargesLocatives=5000 | eco>0 |
| 25 | micro_bic_vs_reel | locationMeubleeCA=20000, chargesLocatives=12000 | eco>0 |
| 26 | deficit_foncier | deficitsFonciersAnterieurs=5000 | eco>0 |
| 27 | csg_deductible | csgDeductibleMontant=1000 | eco>0 |
| 28 | rattachement_enfant | enfantsMajeurs=1, revenuNetImposable=50000 | eco>0 |
| 29 | prestation_compensatoire | prestationCompensatoireMontant=20000 | eco=5000€ |
| 30 | abattement_dom_tom | domTom=true | eco>0 |

### Tests seuil gratuit + paliers
| Scénario | economieAnnuelle | Palier attendu |
|---|---|---|
| Déclaration optimale | 0€ | hasOptimisations=false |
| Petite optimisation syndicat 50€ | 33€ | < 60€ = gratuit |
| Scolarité collège | 61€ | 29€ (standard) |
| Borne + scolarité | ~760€ | 59€ (plus) |
| Pinel + prestation compensatoire | ~9000€ | 99€ (premium) |

---

## CHANTIER 4 — SEO & Performance

### SEO à vérifier
- [ ] Vérifier og:image rendu correct sur https://recupeo.fr/api/og (1200x630)
- [ ] Tester avec Facebook Sharing Debugger + Twitter Card Validator
- [ ] Vérifier sitemap.ts inclut les 15 URLs
- [ ] Vérifier robots.txt
- [ ] Vérifier JSON-LD FAQ sur chaque page brique
- [ ] Meta description unique par page (pas le default du layout)

### Performance
- [ ] Vérifier temps de chargement des 8 pages briques (< 3s)
- [ ] Vérifier taille des chunks JavaScript
- [ ] Vérifier cache headers (stale-while-revalidate)
- [ ] Vérifier que les images CDN (cdn2.tendance-parfums.com) chargent correctement

### Accessibilité
- [ ] Vérifier contraste couleurs (navy sur blanc, emerald sur blanc)
- [ ] Vérifier alt text sur toutes les images
- [ ] Vérifier navigation clavier (tab order, focus visible)
- [ ] Vérifier labels sur tous les inputs du SmartFormV3

---

## CHANTIER 5 — Cohérence UX cross-briques

### Pattern UX attendu sur chaque brique
```
Hero → {Upload → Extraction →} Form → PreDiag (+ MethodologyNote)
→ ShareBlock → Paywall (+ ReviewMiniProof) (si anomalies)
→ TransparencyBlock → ReviewJsonLd → ReviewSection → CrossSellBriques → TrustBanner → FAQ → LegalDisclaimer
```

### Vérifier pour les 8 briques :
| Composant | macaution | retraitia | monloyer | mataxe | mapension | mabanque | monchomage | monimpot |
|-----------|-----------|-----------|----------|--------|-----------|----------|------------|----------|
| Hero | ? | ? | ? | ? | ? | ? | ? | ? |
| Upload | ? | ? | — | ? | — | ? | ? | ? |
| Form | ? | ? | ? | ? | ? | ? | ? | ? |
| PreDiag | ? | ? | ? | ? | ? | ? | ? | ✅ |
| ShareBlock | ? | ? | ? | ? | ? | ? | ? | ✅ |
| Paywall | ? | ? | ? | ? | ? | ? | ? | ✅ |
| ReviewMiniProof | ? | ? | ? | ? | ? | ? | ? | ✅ |
| TransparencyBlock | ? | ? | ? | ? | ? | ? | ? | ✅ |
| ReviewJsonLd | ? | ? | ? | ? | ? | ? | ? | ✅ |
| ReviewSection | ? | ? | ? | ? | ? | ? | ? | ✅ |
| CrossSellBriques | ? | ? | ? | ? | ? | ? | ? | ✅ |
| TrustBanner | ? | ? | ? | ? | ? | ? | ? | ✅ |
| FAQ | ? | ? | ? | ? | ? | ? | ? | ✅ |
| LegalDisclaimer | ? | ? | ? | ? | ? | ? | ? | ✅ |

Utiliser `grep` pour remplir ce tableau :
```bash
for brique in macaution retraitia monloyer mataxe mapension mabanque monchomage monimpot; do
  echo "=== $brique ==="
  for comp in Hero Upload Form PreDiag ShareBlock Paywall ReviewMiniProof TransparencyBlock ReviewJsonLd ReviewSection CrossSellBriques TrustBanner FAQ LegalDisclaimer; do
    found=$(grep -c "$comp" src/app/$brique/page.tsx 2>/dev/null)
    echo "  $comp: $found"
  done
done
```

---

## CHANTIER 6 — Warnings restants à traiter (optionnel)

### Warnings audit actuels (30)
| Type | Count | Action recommandée |
|------|-------|-------------------|
| CODE: No GA4 tracking in page.tsx | 10 | Acceptable — tracking dans les composants enfants |
| CODE: Missing CrossSellBriques (pages légales) | 4 | Acceptable — pages info |
| CODE: Missing LegalDisclaimer (pages légales) | 4 | Acceptable — elles SONT la page légale |
| CODE: No layout.tsx | 4 | Acceptable — héritent du parent |
| MISSING: og:image | 0 | ✅ Résolu session 10 |
| Hardcoded price without fmt() | 4 | MOYEN — prix en texte (FAQ, Hero), pas dans du calcul |

---

## Commandes essentielles

```bash
# Build (JAMAIS npm run build)
cd /var/www/recupeo && ./scripts/build.sh
./scripts/build.sh --status  # vérifier 30-60s après

# Tests
./scripts/test-monimpot.sh              # 16 tests rapides
./scripts/test-monimpot.sh --extract    # 29 tests extraction

# Audit UX
node scripts/audit/ux-audit.mjs --all --api

# Logs
pm2 logs recupeo --lines 50 --nostream

# Suivi projet
cat project/status/TODO.md
cat project/status/DONE.md
cat project/status/CHANGELOG.md
cat project/status/BLOCKERS.md
cat project/status/sessions.md
cat project/BRIEF_NEXT_SESSION.md
```

## Convention code
- **Heredoc quoté** (`<< 'EOF'`) pour tout déploiement — JAMAIS base64
- **fmt()** de `@/lib/format` pour les nombres — JAMAIS `toLocaleString`
- **track()** de `@/lib/analytics` pour GA4
- **Design** : navy (#0B1426), emerald (#00D68F), Bricolage Grotesque / DM Sans
- **Layout** : `max-w-[1200px] mx-auto px-6`
