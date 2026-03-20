# BRIEF REPRISE — Session 15

**Date :** 2026-03-20
**Derniere session :** Session 14 — MAPAIE construite via Claude Code

---

## 1. ETAT DU PROJET

### 9 briques en production
| # | Brique | URL | Statut |
|---|--------|-----|--------|
| 1 | MACAUTION | /macaution | Live |
| 2 | RETRAITIA | /retraitia | Live (V2 77/113) |
| 3 | MONLOYER | /monloyer | Live |
| 4 | MATAXE | /mataxe | Live |
| 5 | MAPENSION | /mapension | Live |
| 6 | MABANQUE | /mabanque | Live |
| 7 | MONCHOMAGE | /monchomage | Live |
| 8 | MONIMPOT | /monimpot | Live (V3, tests finaux) |
| 9 | MAPAIE | /mapaie | **NOUVEAU — Live, a tester** |

### MAPAIE — Ce qui est fait
- 26 fichiers (types, schema, constants, conventions, calculations, anomaly-detection, prompts)
- 4 API routes (extract, pre-diagnostic, full-report, generate-letters)
- 7 composants React (Hero, Upload, Form, PreDiag, Paywall, Report, FAQ)
- Page + layout + SEO
- Transversal : payment (49EUR/129EUR), sitemap, chat knowledge, constants, CrossSell
- 4 bugs corriges (Hero scroll, apostrophes, Field focus, Form->API mapping)
- Build OK, HTTP 200

### MAPAIE — Ce qui reste a tester/corriger
- Parcours complet formulaire -> pre-diagnostic -> resultat
- Upload PDF bulletins -> extraction OCR -> formulaire pre-rempli
- Paiement Stripe -> rapport complet
- Generation LRAR + saisine CPH
- Mobile responsive
- Composant Extraction.tsx manquant (entre Upload et Form)
- Test avec vrais bulletins de paie

### Infrastructure
- Git : github.com/reustathiades-eng/recupeo (prive) — TOKEN A REGENERER
- Jest : configure (jest.config.cjs)
- Claude Code : installe sur VPS v2.1.80, CLAUDE.md a la racine
- Stripe : mode test (attend SIRET)
- SIRET : depose 16/03/2026, 1-4 semaines

---

## 2. METHODE DE TRAVAIL VALIDEE

### Claude Code via MCP (depuis Claude Desktop)

Ecrire un script /home/ubuntu/task.sh, lancer avec screen -dmS, verifier le resultat.
Claude Code -p "..." --dangerously-skip-permissions pour autonomie totale.
Pour taches multiples : script bash comme /home/ubuntu/mapaie-complete.sh.

---

## 3. PROCHAINES ETAPES

### Option A — Finir MAPAIE (1-2h)
Tester le parcours complet, corriger les bugs restants, ajouter Extraction.tsx.

### Option B — Lancer MESDROITS (2-3h)
Brief : BRIEF_MESDROITS.md. 100% formulaire JS, lead magnet gratuit, cross-sell.

### Option C — Lancer MONDEPART (3-4h)
Brief : BRIEF_MONDEPART.md. Upload solde tout compte, pattern similaire a MAPAIE.

Recommandation : A d'abord puis B.

---

## 4. REGLES CRITIQUES

- JAMAIS npm run build -> ./scripts/build.sh puis --status
- TOUJOURS heredoc quote pour ecrire du code
- npm install avec --legacy-peer-deps
- fmt() jamais toLocaleString
- track() avec brique obligatoire
- useSearchParams() necessite Suspense boundary

---

## 5. COMMANDES ESSENTIELLES

pm2 status
git -C /var/www/recupeo log --oneline -10
cd /var/www/recupeo && npx tsc --noEmit 2>&1 | grep mapaie
find /var/www/recupeo/src -path "*mapaie*" -type f | sort
