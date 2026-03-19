# TODO — Prochaines etapes

**Derniere mise a jour** : 2026-03-18 15:30 UTC (fin session 13)

---

## PRIORITE 1 — MONIMPOT Tests finaux

### Fait session 13 — Monetisation V4 + Rapport + Reclamation

#### Phase 1 : Teaser + paywall 3 offres
- [x] MonimpotPreDiag : score /100 + jauge + fourchette uniquement
- [x] Suppression seuil gratuit 60€
- [x] MonimpotPaywall : 3 offres Express 19€ / Standard 39€ / Premium 69€
- [x] payment.ts : 5 offres → 3 (monimpot_express/standard/premium)
- [x] Email teaser (nb + fourchette, plus de details)
- [x] Wording "verification gratuite" partout
- [x] GA4 paliers express_19/standard_39/premium_69

#### Phase 2 : Corrections post-test
- [x] getBlurredLabel 30/30 types (fix collision per)
- [x] Paywall masque si economie=0
- [x] Chat IA knowledge base tarifs 19/39/69€
- [x] getFourchette() → utils.ts (DRY)
- [x] Fix age validation min/max + schema Zod align
- [x] Erreurs Zod detaillees + RecapStep teaser

#### Phase 3 : Frontiere gratuit/payant definitive
- [x] GRATUIT = score + fourchette + nb optimisations SEULEMENT
- [x] PAYANT = tout le reste (labels, montants, cases, descriptions)
- [x] Suggestions goodwill si 0 anomalies, absentes si anomalies
- [x] Paywall : apercu rapport (3 icones + extrait floute)
- [x] Email optionnel dans 3 formulaires + schema + types

#### Phase 4 : Rapport + Guide + Reclamation
- [x] PDF separateur : marge augmentee (fix trait sur texte)
- [x] Guide correction : sous-etapes detaillees a/b/c + introduction + rappel delai
- [x] Reclamation : formulaire 7 champs (nom, adresse, CP, ville, n fiscal, n avis, centre)
- [x] Reclamation : Option 1 courrier recommande + Option 2 message impots.gouv.fr
- [x] Courrier + message mis a jour en temps reel (getPersonalizedCorps)
- [x] PDF reclamation : substitution placeholders depuis sensitiveData (nom, adresse, CP, ville, nf, na, centre)
- [x] PDF reclamation : corps depuis "Madame, Monsieur" (plus de doublon en-tete)
- [x] Report-builder : economie = somme optimisations (plus bareme)
- [x] Synthese : eco depuis somme optimisations aussi
- [x] PDF rapport : supprime override bareme (rapport fait foi)
- [x] economie_3ans ajoute au rapport

### Reste a faire
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
- [ ] Decommenter verification paid dans 8 routes full-report
- [ ] Test paiement reel (8 briques)

---

## PRIORITE 3 — Prochaines briques

Briefs dans le projet Claude :
- MAPAIE (49-129 euros, upload bulletin, enjeu 1800-7200 euros) — 33% erreurs de paie
- MESDROITS (19-49 euros, formulaire pur, enjeu variable) — 10 Mds aides non reclamees
- MONDEPART (69-199 euros, upload solde tout compte, enjeu 1000-5000 euros)

---

## PRIORITE 4 — Ameliorations transversales

### SEO & Acquisition
- [ ] Simulateur MONIMPOT gratuit (Phase 2 SEO — brief BRIEF_SIMULATEUR_MONIMPOT.md)
- [ ] Blog SEO (articles thematiques par brique)
- [ ] Pictos BriquesGrid Midjourney

### Engagement & Retention
- [ ] Email cross-sell J+3 (Brevo Automation)
- [ ] Cron PM2 emails avis J+2 et J+30

### Qualite
- [ ] Tests utilisateurs reels (3-5 personnes)
- [ ] Test responsive iOS/Android
