# TODO — Prochaines etapes

**Derniere mise a jour** : 2026-03-20 12:00 UTC (session MAPAIE + Claude Code)

---

## PRIORITE 0 — MAPAIE Bugs a corriger / tester

- [ ] Tester parcours complet formulaire → pre-diagnostic → resultat (navigateur)
- [ ] Tester Upload bulletins PDF → extraction OCR → formulaire pre-rempli
- [ ] Tester paiement Stripe 49EUR / 129EUR → rapport complet
- [ ] Tester generation courrier LRAR + saisine CPH
- [ ] Verifier mobile responsive (Hero + Form + PreDiag + Paywall)
- [ ] Verifier que le cross-sell MAPAIE apparait sur les autres briques
- [ ] Verifier chat IA knowledge base mapaie
- [ ] Ajouter Extraction.tsx (affichage donnees extraites avant formulaire)
- [ ] Tester avec de vrais bulletins de paie (ou fixtures realistes)

---

## PRIORITE 1 — MONIMPOT Tests finaux

- [ ] Tester parcours complet Upload → Extraction → SmartForm → resultat (navigateur)
- [ ] Tester parcours complet Formulaire V3 → resultat SANS email
- [ ] Tester PDF rapport (chiffres coherents)
- [ ] Tester PDF reclamation (7 champs repris)
- [ ] Mobile responsive formulaire V3
- [ ] Tester avec de vrais avis DGFiP multi-pages

---

## PRIORITE 2 — Activation Stripe Production (attend SIRET)

SIRET depose le 16/03/2026, reception 1-4 semaines.
- [ ] Reception SIRET
- [ ] Mettre a jour SIRET dans 3 pages legales
- [ ] Ouvrir compte Indy + obtenir IBAN
- [ ] Completer onboarding Stripe (SIRET + IBAN)
- [ ] Basculer cles test vers prod dans .env
- [ ] Reconfigurer webhook production
- [ ] Decommenter verification paid dans 9 routes full-report (8 briques + mapaie)
- [ ] Test paiement reel (9 briques)

---

## PRIORITE 3 — Prochaines briques (Claude Code)

Ordre valide :
1. **MESDROITS** — aides sociales non reclamees (lead magnet gratuit + cross-sell)
2. **MONDEPART** — solde de tout compte (upload + extraction)
3. **MONDPE** — audit DPE immobilier (formulaire + calcul)
4. **MONPRET** — TAEG credit immobilier (le plus complexe)

Briefs dans le projet Claude Desktop.

---

## PRIORITE 4 — RETRAITIA V2 (EUSTAT s'en occupe)

77/113 taches. MVP fonctionnel. Reste : P2 (regimes supplementaires, pre-retraite, reversion, couple) + P3 (LRAR, tribunal, cross-sell).

---

## Infra

- [ ] Regenerer token GitHub (expose dans conversation Claude)
- [ ] Regenerer cle API Anthropic si necessaire
- [ ] Surveiller consommation API Anthropic (Claude Code)
