# 🔑 MACAUTION — Récupération dépôt de garantie

**Statut** : 📋 À DÉVELOPPER (priorité #1)
**Dev estimé** : 5-7 jours
**Ticket** : 29€ rapport / 49€ rapport + lettre CDC

## Marché
- 1,2M déménagements/an, 30% litiges = 240-360K litiges/an
- Taux conciliation CDC : 62-64%
- Pénalité automatique : 10% loyer HC/mois de retard (art. 22 loi 89-462)
- Enjeu moyen : 500-1.500€
- Délai action : 3 ans
- Concurrence IA : NULLE
- SEO : 40-60K recherches/mois

## Parcours utilisateur
1. Landing /macaution → Formulaire (upload EDL ou saisie manuelle)
2. Pré-diagnostic GRATUIT → "3 anomalies détectées, ~X€ récupérable"
3. Paywall → 29€ rapport / 49€ rapport + lettre CDC
4. Rapport complet PDF + courriers pré-remplis
5. Cross-sell MONLOYER, MESDROITS

## Logique IA (prompt Claude)
- Input : EDL entrée, EDL sortie, montant caution, loyer HC, date sortie
- Analyse : comparaison poste par poste EDL entrée vs sortie
- Grille vétusté FNAIM : calcul usure normale par type de surface/équipement
- Retenues abusives : détection des retenues non justifiées par l'usure
- Pénalités : 10% loyer HC × nombre de mois de retard (si > 2 mois)
- Output : anomalies[], montant_recuperable, lettres[]

## Fichiers à créer
- [ ] src/app/macaution/page.tsx (landing brique)
- [ ] src/app/api/macaution/pre-diagnostic/route.ts
- [ ] src/app/api/macaution/full-report/route.ts
- [ ] src/lib/prompts/macaution.ts (system prompt Claude)
- [ ] src/lib/grille-vetuste.ts (données FNAIM)
- [ ] src/lib/templates/lettre-mise-en-demeure.ts
- [ ] src/lib/templates/lettre-cdc.ts
- [ ] src/lib/pdf/generate-report.ts
