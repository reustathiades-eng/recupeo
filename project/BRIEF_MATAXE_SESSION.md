# MATAXE — Brief Session de Build (Brique 4)

## Contexte

Tu es l'assistant développeur du projet RÉCUPÉO. Tu as accès au serveur de production via le connecteur MCP SSH "recupeo".

### Briques déjà en prod
| # | Brique | URL | Statut |
|---|--------|-----|--------|
| 1 | **MACAUTION** — Dépôt de garantie | /macaution | ✅ V2 live |
| 2 | **RETRAITIA** — Pension de retraite | /retraitia | ✅ Live (upload → extraction → form prérempli → diagnostic IA → rapport 10 sections → 3 courriers → PDF) |
| 3 | **MONLOYER** — Encadrement des loyers | /monloyer | ✅ Live (formulaire → diagnostic gratuit JS pur → résultat 3 cas → upsell courriers 29€ → 3 courriers IA → PDF LRAR) |
| 4 | **MATAXE** — Taxe foncière | /mataxe | ❌ **À CONSTRUIRE** |

### Serveur
- **MCP** : `recupeo` (SSH) → IP 51.254.138.240
- **App** : `/var/www/recupeo`
- **Stack** : Next.js 15.5 (App Router), Payload CMS 3.79, MongoDB 7.0, Tailwind 3.4, PM2, Nginx + SSL
- **Build** : **JAMAIS `npm run build` directement** (timeout 60s). Utiliser :
  ```bash
  cd /var/www/recupeo && ./scripts/build.sh        # Lance le build async
  ./scripts/build.sh --status                       # Vérifier 30-60s après
  ```

### Libs partagées existantes (à réutiliser)
| Fichier | Contenu |
|---------|---------|
| `src/lib/anthropic.ts` | Client Claude API (callClaude + callClaudeVision) |
| `src/lib/format.ts` | `fmt(n)` — formatage nombres avec espaces normaux |
| `src/lib/anonymizer.ts` | Anonymisation PII |
| `src/lib/pii-detector.ts` | Détection PII française |
| `src/lib/payment.ts` | Stub PayPlug (à brancher) |
| `src/lib/constants.ts` | SITE config + tableau BRIQUES (MATAXE déjà listé avec `available: false`) |

### Collections Payload existantes
- `Diagnostics` — brique: "mataxe" déjà prévu dans les options select
- `Reports` — Stocke rapports + courriers (title + diagnostic + reportContent + generatedLetters)
- `Users` — Collection utilisateurs

### Composants partagés existants
- `src/components/layout/Navbar.tsx` — Navbar avec briqueLinks (ajouter MATAXE)
- `src/components/layout/Footer.tsx` — Footer (ajouter lien /mataxe)
- `src/components/shared/TrustBadges.tsx` — TrustBanner, TrustBadgesCompact, LegalDisclaimer

### Design tokens
- **Couleurs** : navy (#0B1426), emerald (#00D68F), slate-text (#1E293B), slate-muted (#64748B), slate-bg (#F7F9FC), slate-border (#E2E8F0)
- **Fonts** : `font-heading` (Bricolage Grotesque), `font-body` (DM Sans)
- **CSS classes** : `.cta-primary`, `.cta-outline`, `.brique-card`, `.pricing-card`, `.pricing-featured`
- **Layout** : `max-w-[1200px] mx-auto px-6`

---

## Objectif MATAXE

**Permettre à un propriétaire français de vérifier si sa taxe foncière est surévaluée en auditant la valeur locative cadastrale, estimer le trop-perçu récupérable, et générer la réclamation fiscale.**

### Positionnement stratégique
- **Pré-diagnostic GRATUIT** (teaser) → nombre d'anomalies + économie estimée
- **Rapport complet + réclamation fiscale → 49€** (paiement unique)
- **Saisonnalité forte** : lancement idéal avant septembre (avis TF fin août)
- Cross-sell vers MACAUTION, RETRAITIA, MONLOYER

### Chiffres clés
- 30-40% des avis comportent une erreur de base
- Bases cadastrales datant de 1970, rarement mises à jour
- Enjeu moyen : 200–2 000€/an récupérables (rétroactif 4 ans)
- Ticket : 49€ (rapport + réclamation)

---

## Cadre juridique

### Textes
- **CGI**, articles 1380-1391 (taxe foncière)
- **CGI**, articles 1494-1508 (évaluation propriétés bâties)
- **LPF**, article R*196-2 (délai réclamation)
- **BOI-IF-TFB** (doctrine fiscale)

### Formule de calcul
```
Taxe foncière = (VLC × 50%) × Taux collectivités

VLC = Surface pondérée × Tarif catégorie × Coeff entretien × Coeff situation
```

### Surface pondérée (≠ surface habitable)
Intègre des pondérations et des m² fictifs d'équipements :

| Élément | Coeff / m² ajoutés |
|---------|-------------------|
| Surface habitable principale | ×1,00 |
| Pièces secondaires (couloir, entrée) | ×0,50 |
| Dépendances (garage, cave) | ×0,20 à 0,60 |
| Terrasse couverte | ×0,20 à 0,40 |
| Balcon | ×0,10 à 0,30 |
| Baignoire | +3 m² |
| Douche | +2 m² |
| Lavabo | +1 m² |
| WC | +1 m² |
| Évier | +1 m² |
| Chauffage central | +2 m² par pièce chauffée |
| Ascenseur | +2 m² par pièce principale |
| Gaz | +1 m² par pièce principale |
| Électricité | +2 m² (forfait) |
| Eau courante | +4 m² (forfait) |
| Tout-à-l'égout | +3 m² (forfait) |
| Vide-ordures | +1 m² (forfait) |

### Catégories (1 à 8)
| Cat | Description | Niveau |
|-----|------------|--------|
| 1-2 | Grand luxe / Luxe | Très élevé |
| 3-4 | Très confortable / Confortable | Au-dessus moyenne |
| 5 | Assez confortable | Moyen |
| 6 | Ordinaire | Standard |
| 7-8 | Médiocre / Très médiocre | Bas |

### Coefficient d'entretien
| État | Coeff |
|------|-------|
| Bon | 1,20 |
| Assez bon | 1,10 |
| Passable | 1,00 |
| Médiocre | 0,90 |
| Mauvais | 0,80 |

### 6 anomalies les plus fréquentes
1. **Coefficient d'entretien surévalué** → 10-20% d'écart sur la taxe
2. **Équipements supprimés** encore comptés (SdB, cheminée) → 50-300€/an
3. **Surface pondérée incorrecte** → 100-500€/an
4. **Catégorie surévaluée** → 200-800€/an
5. **Dépendances fictives** (garage inexistant) → 50-200€/an
6. **Exonération non appliquée** (âge, ASPA, AAH) → 100% de la taxe

### Exonérations
- **Totales** : ASPA, AAH, +75 ans sous condition RFR
- **Partielles** : 65-75 ans (dégrèvement 100€), constructions neuves (2 ans), rénovation énergétique

### Procédure de réclamation
1. Obtenir la fiche d'évaluation cadastrale (**formulaire 6675-M**) via impots.gouv.fr ou au guichet
2. Analyser les paramètres (surface, catégorie, entretien, équipements)
3. Réclamation en ligne (impots.gouv.fr → messagerie) ou courrier LRAR au centre des impôts fonciers
4. Réponse de l'administration (2-6 mois)
5. Si refus → recours tribunal administratif

**Délai** : avant le 31 décembre de l'année suivant la mise en recouvrement
**Rétroactivité** : année en cours + jusqu'à 4 ans antérieurs

---

## Parcours utilisateur

```
[Landing /mataxe] → [Formulaire 23 champs] → [Pré-diagnostic GRATUIT teaser] → [Paywall 49€] → [Rapport complet + Réclamation fiscale]
```

### Formulaire (23 champs, 4 sections)

#### Section 1 — Votre bien
1. Type de bien : appartement | maison | autre
2. Année de construction (approximative)
3. Surface habitable réelle (m²)
4. Nombre de pièces principales
5. Étage (si appartement)
6. Ascenseur : oui | non | NA
7. Nombre de salles de bain / salles d'eau
8. Nombre de WC
9. Chauffage : central collectif | central individuel | individuel | aucun
10. Garage / parking : oui | non
11. Cave : oui | non
12. Balcon / terrasse : oui (surface m²) | non

#### Section 2 — État du bien
13. État général de l'immeuble (copro) : très bon | bon | passable | médiocre | mauvais | NA
14. État du logement : très bon | bon | passable | médiocre | mauvais
15. Équipements supprimés depuis l'achat : oui (détail) | non | je ne sais pas

#### Section 3 — Taxe foncière
16. Montant taxe foncière (dernier avis, €)
17. Commune du bien
18. VLC connue : oui (montant) | non
19. Formulaire 6675-M disponible : oui | non

#### Section 4 — Situation personnelle
20. Âge du propriétaire
21. Bénéficiaire ASPA / AAH / ASI : oui | non
22. Résidence principale : oui | non
23. Email

### Pré-diagnostic (GRATUIT — teaser)
- Nombre d'anomalies détectées
- Économie annuelle estimée (fourchette)
- Remboursement potentiel sur 4 ans
- Types d'anomalies (titres seuls, pas le détail)
- → Paywall 49€ pour rapport complet + réclamation

### Rapport complet (49€)
- Analyse détaillée de chaque paramètre
- Estimation de la surface pondérée théorique vs probable de l'admin
- Montant estimé de la réduction
- Réclamation fiscale pré-remplie
- Guide pour obtenir le 6675-M
- Pièces justificatives à rassembler

---

## Architecture technique

### Fichiers à créer

```
src/
├── app/
│   ├── mataxe/
│   │   ├── page.tsx              # Landing + formulaire + résultat
│   │   └── layout.tsx            # SEO metadata
│   └── api/
│       └── mataxe/
│           ├── pre-diagnostic/route.ts    # POST → pré-diag gratuit (teaser)
│           ├── full-report/route.ts       # POST → rapport complet (payant)
│           ├── generate-letters/route.ts  # POST → réclamation fiscale IA
│           └── generate-pdf/route.ts      # POST → PDF rapport + réclamation
│
├── components/
│   └── mataxe/
│       ├── MataxeHero.tsx        # Hero dark
│       ├── MataxeForm.tsx        # Formulaire 4 sections (23 champs)
│       ├── MataxePreDiag.tsx     # Teaser pré-diagnostic gratuit
│       ├── MataxePaywall.tsx     # Paywall 49€
│       ├── MataxeReport.tsx      # Rapport complet + réclamation
│       └── MataxeFAQ.tsx         # FAQ 10 questions
│
└── lib/
    └── mataxe/
        ├── types.ts              # Types TypeScript
        ├── constants.ts          # Équivalences m², catégories, coefficients, exonérations
        ├── schema.ts             # Validation Zod (23 champs)
        ├── calculations.ts       # Surface pondérée, estimation VLC, détection exonérations
        ├── anomaly-detection.ts  # 6 règles JS pré-détection anomalies
        ├── prompts.ts            # Prompts Claude (pré-diag + rapport + réclamation)
        └── pdf-generator.ts      # PDF rapport + réclamation (réutiliser pattern RETRAITIA)
```

### Répartition JS pur vs IA

| Calcul | JS pur | Claude API |
|--------|--------|------------|
| Surface pondérée théorique | ✅ | |
| Équivalences superficielles (m² fictifs) | ✅ | |
| Détection exonérations manquantes | ✅ | |
| Écart taxe théorique vs payée | ✅ | |
| Analyse qualitative du profil | | ✅ |
| Interprétation état → coefficient adapté | | ✅ |
| Rédaction rapport détaillé | | ✅ |
| Rédaction réclamation fiscale | | ✅ |

### Flow données
```
[Formulaire] → POST /api/mataxe/pre-diagnostic
  → Validation Zod → Calculs JS (surface pondérée, VLC estimée, exonérations) 
  → Détection anomalies JS → Anonymisation → Claude API (analyse qualitative)
  → Désanonymisation → Save DB → JSON teaser

[Pré-diag gratuit affiché]
  → [Paiement 49€] → POST /api/mataxe/full-report
    → Claude API (rapport 8 sections) → Save DB
  → POST /api/mataxe/generate-letters
    → Claude API (réclamation fiscale) → Save DB
  → POST /api/mataxe/generate-pdf → PDF
```

---

## SEO

### Meta tags
```
title: "Taxe foncière trop élevée ? Vérifiez gratuitement | RÉCUPÉO"
description: "40% des avis de taxe foncière contiennent une erreur. Vérifiez en 2 minutes si vous payez trop et récupérez jusqu'à 4 ans de trop-perçu."
```

### FAQ (10 questions)
1. Comment savoir si ma taxe foncière est trop élevée ?
2. Comment obtenir ma fiche d'évaluation cadastrale (6675-M) ?
3. Qu'est-ce que la valeur locative cadastrale ?
4. Comment contester sa taxe foncière ?
5. Quel est le délai pour réclamer un remboursement ?
6. Qu'est-ce que le coefficient d'entretien ?
7. Peut-on être remboursé sur les années passées ?
8. Quelles sont les exonérations de taxe foncière ?
9. Comment est calculée la surface pondérée ?
10. La suppression d'une salle de bain réduit-elle la taxe foncière ?

### Mots-clés cibles
- "taxe foncière trop élevée", "erreur taxe foncière", "contester taxe foncière"
- "coefficient d'entretien taxe foncière", "valeur locative cadastrale"
- "formulaire 6675-M", "réduction taxe foncière", "calcul taxe foncière"

---

## Conventions de code

- Composants React : `export function MataxeXxx()` dans fichier nommé
- `'use client'` en première ligne si state/hooks
- Tailwind inline, design tokens navy/emerald/slate
- `font-heading` pour titres, `font-body` pour texte
- Layout `max-w-[1200px] mx-auto px-6`
- CSS classes : `.cta-primary`, `.pricing-card`, `.pricing-featured`
- Utiliser `fmt()` de `@/lib/format` pour les nombres (JAMAIS `toLocaleString`)
- UTF-8 natif (pas d'entités HTML)
- Collection existante `Diagnostics` pour stocker les résultats (brique: "mataxe")
- Collection `Reports` pour rapport + réclamation
- **Build** : `./scripts/build.sh` puis `./scripts/build.sh --status` (JAMAIS `npm run build`)

---

## Navbar

Ajouter MATAXE dans `src/components/layout/Navbar.tsx` :
```typescript
'/mataxe': {
  links: [
    { href: '#formulaire', label: 'Vérifier ma taxe' },
    { href: '#faq', label: 'FAQ' },
  ],
  cta: { href: '#formulaire', label: 'Vérifier gratuitement' },
},
```
Et dans le `servicesDropdown` + Footer.

---

## Constante brique

Dans `constants.ts`, MATAXE est déjà listé mais `available: false`. **Passer à `available: true`** une fois la brique live.

---

## Plan d'implémentation (ordre suggéré)

### Phase A — Backend (lib + API pré-diagnostic)
1. `lib/mataxe/types.ts`
2. `lib/mataxe/constants.ts` (équivalences m², catégories, coefficients, seuils exonérations)
3. `lib/mataxe/schema.ts` (Zod, 23 champs, 4 sections)
4. `lib/mataxe/calculations.ts` (surface pondérée, VLC estimée, exonérations)
5. `lib/mataxe/anomaly-detection.ts` (6 règles JS)
6. `lib/mataxe/prompts.ts` (pré-diagnostic + rapport + réclamation)
7. `api/mataxe/pre-diagnostic/route.ts`

### Phase B — Frontend
8. `MataxeHero.tsx`
9. `MataxeForm.tsx` (4 sections, 23 champs, UX progressive)
10. `MataxePreDiag.tsx` (teaser : anomalies + économie estimée)
11. `MataxePaywall.tsx` (49€)
12. `MataxeFAQ.tsx` (10 questions)
13. `app/mataxe/page.tsx` + `layout.tsx`

### Phase C — Rapport complet + Réclamation (IA)
14. `api/mataxe/full-report/route.ts`
15. `api/mataxe/generate-letters/route.ts` (réclamation fiscale)
16. `lib/mataxe/pdf-generator.ts`
17. `api/mataxe/generate-pdf/route.ts`
18. `MataxeReport.tsx`

### Phase D — Polish
19. Navbar + Footer + servicesDropdown
20. LegalDisclaimer (cas mataxe)
21. JSON-LD FAQ structurée
22. Tests API edge cases
23. `available: true` dans constants.ts
24. Cross-sell vers MACAUTION/RETRAITIA/MONLOYER

---

## Points d'attention spécifiques

1. **Formulaire long (23 champs)** → Découper en 4 sections avec progress bar (comme MACAUTION/RETRAITIA)
2. **Sans le 6675-M** → Notre estimation reste approximative. Le rapport DOIT guider vers son obtention comme action prioritaire.
3. **Risque de redressement** → Si le propriétaire a fait des travaux non déclarés (agrandissement), une réclamation peut déclencher une mise à jour à la HAUSSE. Le rapport DOIT prévenir de ce risque.
4. **Saisonnalité** → Les avis TF arrivent fin août. Le pic de trafic est septembre-octobre. Idéal pour campagnes SEA.
5. **Concurrence à 200-500€** → Notre positionnement à 49€ est très compétitif face aux cabinets fiscalistes.
6. **Disclaimer obligatoire** : "Cette analyse est un outil d'aide à la vérification. Elle ne constitue pas un avis fiscal."

---

## Métriques de succès
- [ ] Formulaire complété en < 3 minutes
- [ ] Pré-diagnostic (teaser) en < 10 secondes
- [ ] Anomalies détectées réalistes (pas de faux positifs)
- [ ] Rapport actionnable avec réclamation prête à envoyer
- [ ] Guide clair pour obtenir le 6675-M
- [ ] Page responsive mobile-first
- [ ] SEO : title, description, OG, FAQ structurée JSON-LD
- [ ] Cross-sell MACAUTION/RETRAITIA/MONLOYER visible
