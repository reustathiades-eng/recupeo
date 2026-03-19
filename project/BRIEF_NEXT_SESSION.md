# BRIEF NEXT SESSION

**Date** : Fin session 13 (18 mars 2026, 15h30)

---

## Etat actuel

- 8 briques live, MONIMPOT V4 complet
- GRATUIT: score/fourchette/nb. PAYANT 19/39/69: tout le reste
- Email optionnel, guide detaille, reclamation 7 champs 2 options temps reel
- Rapport: eco=somme opts, PDF coherent
- Stripe mode test (attend SIRET)

---

## Priorites

### 1. Test navigateur complet (20 min)
- V3 avec/sans email, upload, PDF rapport, PDF reclamation 7 champs
- Cas 0 anomalies, mobile

### 2. MAPAIE (4-6h)
Brief: /mnt/project/BRIEF_MAPAIE.md

### 3. Stripe (quand SIRET)

### 4. Simulateur Phase 2 (3-4h)
Brief: BRIEF_SIMULATEUR_MONIMPOT.md

---

## URLs test rapport

- Cas 1: https://recupeo.fr/monimpot/rapport?id=69baabfa9b5f67365d5dd68f&session_id=test
- Cas 2: https://recupeo.fr/monimpot/rapport?id=69baabfa9b5f67365d5dd6b3&session_id=test
- Cas 4: https://recupeo.fr/monimpot/rapport?id=69baabfb9b5f67365d5dd6bf&session_id=test
- Cas 5: https://recupeo.fr/monimpot/rapport?id=69baabfb9b5f67365d5dd6c9&session_id=test

---

## Rappels critiques

- Build: ./scripts/build.sh (JAMAIS npm run build)
- Ecriture: heredoc quote
- Format: fmt() (JAMAIS toLocaleString)
- Monetisation: GRATUIT = score+fourchette+nb. PAYANT = tout.
- Email: optionnel partout
- Rapport eco: somme optimisations plafonnee
