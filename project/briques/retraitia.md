# 📋 RETRAITIA — Audit pension de retraite

**Statut** : 📋 À DÉVELOPPER (priorité #3)
**Dev estimé** : 10-14 jours
**Ticket** : 79€ RIS / 149€ pack complet / 199€ couple

## Marché
- 17,2M retraités + 5-6M pré-retraités (55-64 ans)
- 370 milliards €/an de pensions versées
- Taux erreur officiel : 10-14% (Cour des Comptes 2023/2025)
- 900M€ de manque à gagner pour les retraités
- 15% des dossiers Agirc-Arrco avec au moins une erreur
- Préjudice médian : 123€/an × 20 ans = ~2.460€
- Concurrence : cabinets à 500-2.500€, concurrence IA = NULLE
- Cible la plus solvable de France (55-75 ans)

## Types d'erreurs détectables
- Trimestres oubliés (service militaire, chômage, maladie, maternité)
- Salaires non comptabilisés
- Points Agirc-Arrco manquants
- Majorations enfants oubliées (10% pour 3 enfants+)
- Périodes activité partielle mal intégrées
- Surcote/décote mal calculée
- Minimum contributif non appliqué

## Logique IA (prompt Claude)
- Input : RIS (Relevé Individuel de Situation), relevé de carrière
- Analyse : vérification année par année
- Référentiels : barèmes CNAV, tables Agirc-Arrco
- Output : erreurs[], impact_financier, courrier_reclamation

## Fichiers à créer
- [ ] src/app/retraitia/page.tsx
- [ ] src/app/api/retraitia/pre-diagnostic/route.ts
- [ ] src/app/api/retraitia/full-report/route.ts
- [ ] src/lib/prompts/retraitia.ts
- [ ] src/lib/data/baremes-cnav.ts
- [ ] src/lib/data/tables-agirc-arrco.ts
- [ ] src/lib/templates/lettre-reclamation-caisse.ts
