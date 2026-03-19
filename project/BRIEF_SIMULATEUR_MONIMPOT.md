# BRIEF — Simulateur MONIMPOT (Phase 2 SEO)

**Statut** : À planifier (Phase 2 — après stabilisation monétisation V4)
**Estimation** : 3-4h de développement
**Priorité** : Moyenne — projet SEO à part entière

---

## Contexte

Suite à la refonte monétisation MONIMPOT V4 (mars 2026), un simulateur d'impôt gratuit a été identifié comme excellent levier d'acquisition SEO. Ce simulateur est **séparé du tunnel d'audit payant** : il constitue un outil autonome pour calculer son impôt et comprendre son TMI, avec un CTA naturel vers l'audit complet.

## Objectif

Créer une page `/monimpot/simulateur` qui :
- Permet de calculer son impôt sur le revenu (formulaire V3 existant, sans détection d'anomalies)
- Affiche le résultat : impôt estimé, TMI, parts fiscales, détail par tranche
- **NE détecte PAS d'optimisations** (c'est le produit payant)
- **NE compare PAS avec l'impôt réellement payé**
- Propose un CTA naturel : "Vous pensez payer trop ? Faites un audit complet →"

## Architecture

### Ce qu'on réutilise
- `SmartFormV3` (formulaire 10 étapes) — à adapter pour ne pas déclencher le pre-diagnostic
- `computeFullCalculations()` — calcul impôt en temps réel
- Design system + layout existants

### Ce qu'on crée
- `src/app/monimpot/simulateur/page.tsx` — page simulateur
- `src/app/monimpot/simulateur/layout.tsx` — SEO metadata
- `src/components/monimpot/SimulateurResult.tsx` — affichage résultat (impôt, TMI, tranches)
- Mise à jour `sitemap.ts` (ajout URL)

### Ce qu'on ne fait PAS
- Pas de sauvegarde en base (outil gratuit, anonyme)
- Pas d'appel API pre-diagnostic
- Pas d'email
- Pas de tracking GA4 détaillé (juste un event `simulateur_completed`)

## SEO

- Title : "Simulateur impôt sur le revenu 2026 — Calculez votre impôt gratuitement | RÉCUPÉO"
- H1 : "Simulateur d'impôt sur le revenu"
- Mots-clés cibles : simulateur impôt, calcul impôt revenu, simulateur fiscal, combien d'impôt je paie
- FAQ structurée (Schema.org)

## Maquette résultat

```
┌─────────────────────────────────────────┐
│         Votre impôt estimé              │
│         ┌─────────────┐                 │
│         │  2 340 €     │                │
│         └─────────────┘                 │
│  TMI : 30%  |  Parts : 2  |  RFR : ... │
│                                         │
│  ┌── Détail par tranche ──────────────┐ │
│  │ 0 - 11 497€ : 0%      →    0€     │ │
│  │ 11 497 - 29 315€ : 11% →  ...€    │ │
│  │ 29 315 - 83 823€ : 30% →  ...€    │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ Vous pensez payer trop ?           │ │
│  │ Notre IA détecte les optimisations │ │
│  │ [Faire l'audit complet →]          │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Dépendances

- Aucune nouvelle dépendance
- Le formulaire V3 existe déjà
- Le calcul temps réel existe déjà

## Notes

Ce brief a été créé lors de la session 13 (18/03/2026) dans le cadre de la refonte monétisation MONIMPOT V4. La décision a été prise de **ne pas développer le simulateur immédiatement** afin de se concentrer d'abord sur l'optimisation du tunnel de conversion existant (teaser + paywall 3 offres).

Le simulateur sera développé en Phase 2, une fois que les métriques de conversion V4 auront été validées.
