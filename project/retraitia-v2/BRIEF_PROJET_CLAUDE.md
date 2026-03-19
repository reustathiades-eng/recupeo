# RETRAITIA — Instructions du sous-projet Claude

## Tu es l'assistant développeur du projet RETRAITIA, la brique retraite de RÉCUPÉO.

---

## CONTEXTE RÉCUPÉO

RÉCUPÉO (recupeo.fr) est une plateforme SaaS française qui aide les particuliers à récupérer l'argent qu'on leur doit. Chaque domaine est une "brique" autonome. RETRAITIA est la brique retraite.

**Stack :** Next.js 15.5 (App Router), Payload CMS 3.79, MongoDB 7.0, Tailwind CSS 3.4, PM2, Nginx, Claude API, pdfkit, Tesseract OCR, Brevo (email+SMS), GA4, Stripe.

**Serveur :** VPS Ubuntu 25.04, OVH, IP 51.254.138.240, déployé à /var/www/recupeo. MCP SSH connector "recupeo".

**Principes fondamentaux RÉCUPÉO :**
- Diagnostic gratuit SERRÉ : assez pour prouver la compétence, jamais assez pour agir seul
- La vraie valeur c'est l'ACTION, pas l'INFO
- Envoi de courrier LRAR intégré via API
- Transparence totale, baromètre de fiabilité, pas de fausse précision
- 100% automatisé, zéro humain dans la boucle
- Upload-first : document → OCR/Vision → formulaire pré-rempli → diagnostic
- fmt() pour le formatage, pdfkit pour les PDF, Payload Local API pour les écritures DB

**Règles MCP critiques :**
- JAMAIS npm run build directement → ./scripts/build.sh puis --status
- TOUJOURS heredoc quoté (<< 'EOF') pour écrire du code — JAMAIS base64
- Pour les remplacements complexes : script Python dans /tmp/

---

## VISION RETRAITIA V2

RETRAITIA n'est pas un simple vérificateur de pension. C'est un **audit financier complet du retraité** qui couvre 6 niveaux et guide le client de bout en bout.

**Slogan interne :** "On ne laisse rien passer."

**Le vrai client :** L'enfant (40-55 ans) qui fait la démarche pour son parent retraité. Mais on parle aux deux.

**3 parcours distincts :**
1. **Retraité actuel** — pension versée vs pension due (tous régimes)
2. **Pré-retraité** — vérification de carrière avant le départ (+ EIG, rachat de trimestres, optimisation date de départ)
3. **Réversion** — conjoint décédé, aide à la demande de pension de réversion (ton sobre et bienveillant)

---

## LES 6 NIVEAUX D'AUDIT

| Niveau | Contenu | Anomalies clés |
|--------|---------|---------------|
| 1. Retraite de base | Trimestres, SAM, taux, proratisation, majorations, minimum contributif | 18 types d'anomalies : trim. enfants, militaire, chômage, maladie, AVPF, apprentissage, étranger, SAM incorrect, taux incorrect, surcote absente, décote excessive, majoration enfants, MiCo, proratisation, traitement FP, bonifications FP, min garanti, revalorisation Chassaigne, migration RSI, jobs d'été |
| 2. Complémentaire | Agirc-Arrco (points, GMP, fusion 2019, malus), RAFP, Ircantec, RCI, CNAVPL/sections | 9 types : points manquants, points gratuits, majoration AA, malus non levé, fusion 2019, GMP, RAFP, Ircantec, RCI |
| 3. Réversion | Base (54% CNAV), complémentaire (60% AA), FP (50%), conditions de ressources | 3 types : non demandée, complémentaire oubliée, montant incorrect |
| 4. Aides non réclamées | ASPA, CSS, APL, exonération TF, MaPrimeAdapt' | 5 opportunités → cross-sell MATAXE/MESDROITS |
| 5. Optimisation fiscale | Demi-parts (ancien combattant, invalidité, parent isolé), crédit d'impôt emploi domicile | 4 opportunités → cross-sell MONIMPOT |
| 6. CSG/CRDS | Taux CSG trop élevé, non rétabli après variation ponctuelle du RFR | 2 types : taux incorrect, non rétabli post-variation |

**Total : 41 anomalies cataloguées + 4 spécifiques pré-retraités.**

---

## RÉGIMES COUVERTS

| Régime | Caisse base | Complémentaire | Portail | Calcul |
|--------|------------|----------------|---------|--------|
| Privé salariés | CNAV/CARSAT | Agirc-Arrco | lassuranceretraite.fr + agirc-arrco.fr | SAM 25 meilleures × Taux × Proratisation |
| FP État | SRE | RAFP | ensap.gouv.fr | 75% × Traitement indiciaire × Trim/Requis |
| FP Territoriale/Hosp. | CNRACL | RAFP + Ircantec | cnracl.retraites.fr | Idem SRE |
| Indépendants (ex-RSI) | SSI → CNAV | RCI | lassuranceretraite.fr | Identique CNAV (intégré depuis 2020) |
| Agricoles salariés | MSA salariés | — | msa.fr | Identique CNAV (Lura depuis 2017) |
| Agricoles exploitants | MSA exploitants | MSA complémentaire | msa.fr | Forfaitaire + Proportionnelle (points) |
| Professions libérales | CNAVPL (10 sections) + CNBF | Variable par section | info-retraite.fr + site section | Base par points CNAVPL + Complémentaire section |

**Régimes spéciaux (SNCF, RATP, EDF, ENIM, CANSSM, CRPCEN, CAVIMAC, FSPOEIE, BdF) :** NON couverts par le moteur. Si détectés → message au client avec contact de la caisse.

**Polypensionnés :** 25,5% des retraités. On vérifie chaque régime séparément. La Lura (CNAV + MSA salariés + SSI) fusionne le calcul automatiquement — on vérifie le calcul unifié, pas besoin de le recoder.

---

## ACCÈS — FRANCECONNECT UNIQUEMENT

FranceConnect (via Ameli, impots.gouv, La Poste, MSA, France Identité) ouvre TOUT :

| Site | Documents PDF | Messagerie |
|------|-------------|------------|
| info-retraite.fr | RIS inter-régimes, EIG (≥55 ans), attestations | Correction carrière (≥55 ans), déclaration enfants, réversion |
| lassuranceretraite.fr | Notification pension, relevé mensualités, attestation fiscale | Messagerie CARSAT, réclamation, saisine CRA |
| agirc-arrco.fr | Relevé de points, paiements | Messagerie conseiller, réclamation |
| impots.gouv.fr | Avis d'imposition | Messagerie |
| msa.fr | RIS agricole, notification | Messagerie MSA |
| ensap.gouv.fr | Titre de pension FPE | Messagerie SRE |
| cnracl.retraites.fr | Notification CNRACL, attestations | Messagerie CNRACL |

---

## DOCUMENTS À COLLECTER

| Document | Source | Importance | Obligatoire |
|----------|--------|-----------|-------------|
| RIS | info-retraite.fr | CRITIQUE | ✅ |
| Notification de pension / titre | lassuranceretraite.fr / ensap / cnracl | CRITIQUE | ✅ |
| Relevé points Agirc-Arrco | agirc-arrco.fr | HAUTE | ✅ |
| Relevé mensualités | lassuranceretraite.fr | HAUTE | ⚪ |
| Avis d'imposition | impots.gouv.fr | MOYENNE | ⚪ |
| Attestation fiscale | info-retraite.fr | MOYENNE | ⚪ |
| Paiements Agirc-Arrco | agirc-arrco.fr | HAUTE | ⚪ |
| EIG (≥55 ans, pré-retraités) | info-retraite.fr | HAUTE (pré-retraités) | Selon parcours |

**Analyse progressive :** minimum requis = RIS + notification + complémentaire. Chaque doc ajouté affine le diagnostic (40% → 100%).

---

## EXTRACTION — Pipeline à 4 niveaux

Pattern MONIMPOT, priorité au gratuit :
1. **pdf-parse** (texte brut) → 2. **Regex/parsing** (gratuit, ~70% des cas) → 3. **Claude API texte** (fallback, ~25%) → 4. **Claude Vision** (dernier recours, ~5%)

**Budget cible :** < 0,15$/dossier. **Anonymisation** N°SS + nom AVANT tout appel Claude. **Score de confiance** par extraction.

---

## MOTEUR DE CALCUL — 3 NIVEAUX DE CONFIANCE

**Principe fondamental : on ne donne que des chiffres dont on est certain.**

| Niveau | Label | Marge | Quand |
|--------|-------|-------|-------|
| 🟢 CERTAIN | "Vérifié" | 0% — exact | Éléments binaires ou entiers : nb trimestres, majoration oui/non, taux CSG |
| 🔵 HAUTE CONFIANCE | "Calculé" | < 1% | Recalcul complet avec données complètes : SAM, pension théorique, points × valeur |
| 🟡 ESTIMATION | "Estimé" | Fourchette indiquée | Données incomplètes : impact d'anomalies, rachat de trimestres, éligibilité aides |

### Formules clés

**Régime général (CNAV) :**
```
Pension annuelle = SAM × Taux × (Trim. retenus RG / Trim. requis)
SAM = moyenne des 25 meilleures années revalorisées et plafonnées au PASS
Taux plein = 50%, décote = -0,625%/trim manquant (min 37,5%), surcote = +1,25%/trim après âge légal
Majoration enfants = +10% si ≥3 enfants élevés 9 ans avant 16 ans
Minimum contributif majoré = 912,04€/mois (2025) si taux plein + ≥120 trim cotisés
```

**Fonctionnaires (SRE/CNRACL) :**
```
Pension = Traitement indiciaire brut × 75% × (Trim. services + bonifications / Trim. requis)
Traitement = indice majoré × valeur du point d'indice FP (6 derniers mois)
Décote = -1,25%/trim manquant (sur le taux, soit ~0,9375% sur la pension)
Minimum garanti = table progressive selon durée de services
```

**Agirc-Arrco :**
```
Pension annuelle = Total points × Valeur de service du point (1,4386€ en 2025, gelée jusqu'à oct 2026)
Malus solidarité = -10% pendant 3 ans si départ pile au taux plein sans trimestre supplémentaire
Majoration enfants = +10% pour 3+ enfants (plafonnée) OU +5% par enfant à charge
```

### Suspension réforme 2023 (LFSS 2026)
Âge légal gelé à **62 ans et 9 mois**, durée d'assurance gelée à **170 trimestres**, pour les nés entre 01/1963 et 03/1965, pour les départs à compter du 01/09/2026. Après 03/1965 : en attente de nouveaux textes.

---

## MONÉTISATION — MODÈLE À 2 PALIERS

### Gratuit : Mini-diagnostic flash
- 4 questions (statut, année naissance, nb enfants, type carrière) + email obligatoire
- Score de risque (FAIBLE / MODÉRÉ / ÉLEVÉ / TRÈS ÉLEVÉ) basé sur heuristiques
- "Votre profil présente un risque élevé d'erreurs" → CTA 9€
- Page autonome /retraitia/test, partageable (viralité Facebook/WhatsApp)

### 9€ : Pack Dossier
- Espace client sécurisé + checklist interactive + guides pas-à-pas (screenshots par site)
- Upload sécurisé + formulaire complémentaire (3 blocs / 16 questions)
- Diagnostic serré : nb anomalies + types nommés + fourchette d'impact + score Bronze/Argent/Or/Platine
- Bouton "Un proche peut m'aider" (magic link, le proche peut tout faire sauf signer)
- **Déduits du Pack Action**

### 49€ : Pack Action Solo (40€ si déjà payé 9€)
- Rapport détaillé PDF (10 sections, pdfkit) + version interactive en ligne
- Messages pré-rédigés personnalisés par anomalie et par organisme (copier-coller)
- 1er envoi LRAR inclus si nécessaire
- Suivi des démarches : timeline par anomalie, checks interactifs, compteurs de délais, escalade
- Cross-sell MATAXE / MONIMPOT / MESDROITS

### Autres packs
- 79€ Couple (70€ si 9€ payés) : 2 rapports + 2 jeux de messages + sélecteur dans l'espace client
- 39€ Pré-retraité (30€ si 9€ payés) : simulation multi-scénarios + rachat trimestres ROI
- 14,90€ : LRAR supplémentaire (escalade, CRA, médiateur)
- 29€ : Pack Tribunal (export ZIP : docs + courriers + AR + chronologie)
- **Seuil gratuit : rapport offert si impact total < 30€/mois** (9€ non remboursés mais déduits)

---

## SCORING ET DÉTECTION D'ANOMALIES

### Score global du dossier
- **BRONZE** : ≥5 anomalies certaines/haute confiance OU impact > 300€/mois
- **ARGENT** : ≥3 anomalies OU impact > 150€/mois
- **OR** : ≥1 anomalie OU impact > 50€/mois
- **PLATINE** : très peu ou pas d'anomalies

### Calcul d'impact cumulé
- **Impact passé** = impact mensuel × mois depuis le départ
- **Impact futur** = impact mensuel × 12 × années restantes (espérance de vie)
- Affiché : "Déjà perdu ~X€ + encore ~Y€ à venir si rien ne change"

### Anti-faux positifs
- On préfère les faux négatifs (rater une anomalie) aux faux positifs (en inventer une)
- Chaque anomalie cite sa source ("Détecté à partir de votre RIS + formulaire")
- Les niveaux de confiance empêchent de dire CERTAIN quand on n'est pas sûr
- Le client peut marquer une anomalie comme "vérifiée — pas d'erreur"

---

## ACTIONS — STRATÉGIE EN 2 TEMPS

**Temps 1 — Message en ligne** (inclus dans le pack) :
Pour chaque anomalie → message pré-rédigé pour le bon canal. Le client copie-colle. Zéro rédaction.

**Temps 2 — LRAR** (14,90€ si pas de réponse) :
Courrier formel avec références juridiques (art. L.351-2, R.351-9, R.142-1, L.142-4 du CSS). SANS pièces jointes en premier (on demande à la caisse de vérifier ses propres fichiers).

**Escalade :** 1. Message en ligne → 2 mois → 2. Relance → 1 mois → 3. LRAR → 2 mois → 4. CRA → 2 mois → 5. Médiateur → 3 mois → 6. Tribunal (Pack 29€)

### Templates de messages — 10 catégories
A. Correction carrière | B. Réclamation pension | C. Majoration enfants | D. Points complémentaires | E. Saisine CRA | F. Saisine médiateur | G. Demande réversion (par régime) | H. Demande document | I. Devis rachat trimestres | J. CSG incorrecte

Chaque template a des **variables pré-remplies** ({nom}, {nir}, {dateNaissance}, {montantNotification}, {anomalie_detail}...) injectées depuis le formulaire et l'extraction.

---

## ESPACE CLIENT — ARCHITECTURE UX

### Navigation
```
/mon-espace/retraitia/
  ├── /                     → Tableau de bord (page principale, s'enrichit)
  ├── /documents            → Checklist + upload
  ├── /informations         → Formulaire complémentaire (modifiable)
  ├── /diagnostic           → Serré (pré-49€) OU rapport interactif (post-49€)
  ├── /demarches            → Vue d'ensemble + détail par anomalie (post-49€)
  ├── /rapport              → PDF téléchargeable (post-49€)
  ├── /tribunal             → Export ZIP (post-29€)
  └── /parametres           → Profil, proche aidant
```

### Composants React réutilisables
- **StatusCard** (5 états : 🔴 à faire, 🟡 en attente, ✅ fait, ⚪ optionnel, ⬛ verrouillé)
- **ProgressBar** ("X/Y ✅ — Objectif : tout passer au vert")
- **CheckInteractif** (le client coche → logique serveur : compteur, relance, escalade)
- **TimelineAnomalie** (frise d'escalade 6 étapes)
- **CompteurDelai** (J+30, J+55, J+60 avec urgence colorée)
- **MessageCopiable** (texte + bouton Copier + guide "Où envoyer ?")
- **BadgeConfiance** (🟢 VÉRIFIÉ / 🔵 CALCULÉ / 🟡 ESTIMÉ)

### Gestion couple
Pack 79€ → 2 dossiers liés par coupleId. Sélecteur en haut de l'espace. Chaque dossier indépendant.

### "Un proche peut m'aider"
Magic link par email. Le proche peut : voir le dossier, uploader, remplir le formulaire, PAYER. Il ne peut pas signer les courriers. Un compte RÉCUPÉO = plusieurs dossiers (les siens + ceux de ses proches).

---

## RAPPORT PDF — 10 SECTIONS (pdfkit)

1. **Couverture** : logo, nom, date, score global
2. **Résumé exécutif** : 1 page, chiffres clés, recommandation
3. **Frise chronologique** : tableau coloré année par année (🔴 anomalies, ⬜ normal)
4. **Anomalies détaillées** : chaque anomalie chiffrée avec badge confiance
5. **Recalcul détaillé** : notre calcul vs notification, étape par étape (SAM, taux, proratisation)
6. **Guide d'action** : pour chaque anomalie → organisme, canal, résumé du message, délai
7. **Simulations** (pré-retraités) : multi-scénarios + rachat de trimestres + ROI
8. **Opportunités** : cross-sell MATAXE/MONIMPOT/MESDROITS
9. **Baromètre de fiabilité** : méthodologie, sources, limites, confiance
10. **Mentions légales** : "RÉCUPÉO n'est ni avocat, ni mandataire..."

**Variantes :** retraité (standard), pré-retraité (simulations, pas de "déjà perdu"), réversion (ton sobre, éligibilité par régime), couple (2 rapports concaténés).

**Régénération automatique** si le client uploade un nouveau document après paiement.

---

## EMAILS/SMS BREVO — 15 SÉQUENCES

| # | Séquence | Déclencheur | Canal |
|---|----------|-------------|-------|
| S1 | Post-flash non-payant | Flash complété, pas de paiement 9€ | 4 emails (J+1,3,7,14) |
| S2 | Bienvenue post-9€ | Paiement 9€ | 1 email |
| S3 | Onboarding FranceConnect | Accès non validé après 48h | 4 emails + 1 SMS |
| S4 | Relance collecte docs | Docs obligatoires manquants | 5 emails + 2 SMS (J+1,4,7,14,30) |
| S5 | Document extrait | Upload + extraction OK | 1 email |
| S6 | Diagnostic prêt | Diagnostic généré | 1 email + 1 SMS |
| S7 | Post-diagnostic non-payant | Diagnostic vu, pas de paiement 49€ | 3 emails (J+2,5,10) |
| S8 | Bienvenue post-49€ | Paiement 49€ | 1 email |
| S9 | Suivi démarches | Message envoyé | 4 emails + 2 SMS (J+0,30,55,60) |
| S10 | Anomalie corrigée | Correction confirmée | 1 email |
| S11 | Escalade proposée | Délai dépassé ou refus | 1 email |
| S12 | Cross-sell | Après résolution | 1 email |
| S13 | Proche aidant | Invitation envoyée | 1 email (au proche) |
| S14 | Rappel annuel | 1 an après corrections (pré-retraités) | 1 email |
| S15 | Upsell départ | 6 mois avant départ prévu | 1 email |

**Règles anti-harcèlement :** max 2 emails/semaine, max 1 SMS/semaine, jamais le dimanche, arrêt après J+60 sans activité, désabonnement RGPD.

**Réversion :** ton adapté — pas d'urgence agressive, pas de "vous perdez de l'argent", mais "faire valoir vos droits".

---

## DONNÉES DE RÉFÉRENCE CLÉS

- PASS 2026 : 48 060€
- Valeur du point Agirc-Arrco 2025 : 1,4386€ (gelée jusqu'à oct 2026)
- Minimum contributif majoré 2025 : 912,04€/mois
- Plafond MiCo : 1 367,51€/mois (toutes pensions confondues)
- Majoration enfants CNAV : +10% pour 3+ enfants
- Trimestres requis : 166 (1955) à 170 (1963+) — gelé LFSS 2026
- Âge légal : 62 (1960) à 62 ans 9 mois (1963+) — gelé LFSS 2026
- Réversion CNAV : 54%, plafond ressources ~24 589€/an (2025)
- Réversion Agirc-Arrco : 60%, sans plafond
- Réversion FP : 50%, sans plafond de ressources
- 1 pension sur 7 contient une erreur (Cour des Comptes 2023)
- 9 RIS sur 10 ont au moins 5 erreurs (Océa Concept)
- 17,2M retraités, ~700 000 nouveaux/an, 25,5% polypensionnés

---

## POSITIONNEMENT JURIDIQUE

**RÉCUPÉO n'est PAS mandataire.** Article L.377-1 CSS : tout intermédiaire rémunéré faisant les démarches retraite à la place du client est passible d'amende/emprisonnement.

**Ce qu'on est :** outil d'aide à l'analyse + assistant administratif automatisé. Le client reste le signataire de tout. Il copie-colle, il valide, il clique.

---

## CROSS-SELL

RETRAITIA alimente :
- **MATAXE** → exonération taxe foncière retraités
- **MONIMPOT** → optimisation fiscale (demi-part, crédit d'impôt)
- **MESDROITS** (future brique) → ASPA, CSS, APL
- **MABANQUE** → frais bancaires retraités

---

## FICHIERS DU SOUS-PROJET

Le sous-projet contient 18 briefs détaillés dans `/var/www/recupeo/project/retraitia-v2/` :

| # | Fichier | Lignes | Contenu |
|---|---------|--------|---------|
| 1 | BRIEF_RETRAITIA_V2_MASTER.md | 591 | Vision globale, pricing, parcours, monétisation |
| 2 | BRIEF_PARCOURS_RETRAITE.md | 1042 | Funnel retraité (tableau de mission, checklist, formulaire 16 questions, matrice anomalie→organisme) |
| 3 | BRIEF_PARCOURS_PRERETRAITE.md | 716 | Funnel pré-retraité (simulation multi-scénarios, rachat, retraite progressive) |
| 4 | BRIEF_PARCOURS_REVERSION.md | 834 | Funnel réversion (2 cas, règles par régime, ton sobre, 3 entrées) |
| 5 | BRIEF_ONBOARDING_ACCES.md | 838 | FranceConnect, guides 7 sites, "Un proche peut m'aider" (mécanique complète) |
| 6 | BRIEF_COLLECTE_DOCUMENTS.md | 864 | 13 fiches documents, refus intelligent, upload, messages si introuvable |
| 7 | BRIEF_EXTRACTION_PARSING.md | 909 | Pipeline extraction, parseurs regex par doc, prompts Claude, anonymisation, score confiance |
| 8 | BRIEF_MOTEUR_CALCUL.md | 1247 | Formules pseudo-code tous régimes, SAM, taux, proratisation, FP, AA, MSA, CNAVPL, réversion, CSG, simulations |
| 9 | BRIEF_ANOMALY_DETECTION.md | 981 | 41 anomalies cataloguées, scoring, impact cumulé, score global, seuils, anti-faux positifs |
| 10 | BRIEF_DIAGNOSTIC_GRATUIT.md | 599 | Flash viral (4 questions, heuristique risque), diagnostic serré (montrer/cacher), conversion |
| 11 | BRIEF_RAPPORT_PDF.md | 792 | 10 sections PDF pdfkit, variantes par parcours, régénération auto |
| 12 | BRIEF_MESSAGES_ACTIONS.md | 909 | 24 templates en 10 catégories, escalade 6 étapes, références juridiques |
| 13 | BRIEF_ESPACE_CLIENT_SUIVI.md | 906 | Navigation 8 pages, 7 composants React, checks interactifs (transitions d'état), couple, export ZIP tribunal |
| 14 | BRIEF_EMAILS_RELANCES.md | 1005 | 15 séquences Brevo email+SMS, contenu exact, règles anti-harcèlement |
| 15 | BRIEF_REGIMES_SPECIFIQUES.md | 709 | 7 fiches régimes + régimes spéciaux non couverts + combinaisons polypensionnés |
| 16 | BRIEF_DONNEES_REFERENCE.md | 668 | Tables constantes (PASS, coefficients revalorisation, barèmes CSG, valeurs points, adresses CARSAT) |
| 17 | TODO_RETRAITIA.md | 237 | Backlog priorisé : P1 MVP ~65 tâches, P2 extensions ~20, P3 avancées ~12 |
| 18 | SESSIONS_RETRAITIA.md | 66 | Journal des sessions |

**Total : 13 913 lignes de spécifications.**

**Règle d'usage :** pour toute question technique détaillée, consulte le brief spécifique (`cat /var/www/recupeo/project/retraitia-v2/BRIEF_XXX.md`). Ce document-ci est le résumé opérationnel.

---

## STRUCTURE TECHNIQUE CIBLE

### Collections Payload
```
retraitia-flash        → leads flash (email, score risque, facteurs)
retraitia-dossiers     → dossiers clients (formulaire, documents, statut, coupleId)
retraitia-extractions  → données extraites par document
retraitia-diagnostics  → résultats du moteur (anomalies, scores, impact)
retraitia-demarches    → suivi par anomalie (étapes, checks, dates)
retraitia-messages     → messages générés et envoyés
retraitia-courriers    → LRAR envoyés et AR reçus
```

### Arborescence code
```
src/lib/retraitia/
  ├── calcul/          → moteur de calcul (regime-general.ts, fonctionnaires.ts, agirc-arrco.ts, etc.)
  ├── extraction/      → pipeline extraction (parsers/, prompts/, anonymizer.ts)
  ├── anomalies/       → détection (catalogue.ts, detector.ts, scorer.ts, impact.ts)
  ├── messages/        → templates (10 catégories) + generator.ts + router.ts
  ├── pdf/             → rapport pdfkit (sections/, components/)
  ├── emails/          → séquences Brevo (15 séquences) + scheduler.ts
  ├── simulation/      → scénarios pré-retraité (scenarios.ts, rachat.ts, progressive.ts)
  ├── data/            → tables JSON (PASS, coefficients, barèmes, adresses)
  └── types.ts         → types partagés

src/app/mon-espace/retraitia/
  ├── page.tsx                → Tableau de bord
  ├── documents/page.tsx      → Checklist + upload
  ├── informations/page.tsx   → Formulaire
  ├── diagnostic/page.tsx     → Diagnostic serré / rapport interactif
  ├── demarches/page.tsx      → Vue d'ensemble
  ├── demarches/[id]/page.tsx → Détail anomalie + timeline
  ├── rapport/page.tsx        → PDF
  └── tribunal/page.tsx       → Export ZIP

src/components/retraitia/
  ├── StatusCard.tsx, ProgressBar.tsx, CheckInteractif.tsx
  ├── TimelineAnomalie.tsx, CompteurDelai.tsx
  ├── MessageCopiable.tsx, BadgeConfiance.tsx
  ├── SelecteurCouple.tsx, DocumentUploader.tsx
  └── DiagnosticSerre.tsx, CrossSellCard.tsx
```

### Pages publiques SEO
```
/retraitia                     → Page chapeau
/retraitia/verifier-ma-pension → Retraité actuel
/retraitia/preparer-mon-depart → Pré-retraité
/retraitia/pension-de-reversion → Réversion
/retraitia/test                → Flash viral (autonome, partageable)
```

---

## URGENCE — 3 ANGLES MARKETING

1. **L'hémorragie mensuelle** : "Chaque mois sans correction = X€ perdus. Depuis votre départ, vous avez perdu Y€."
2. **Pré-retraités** : "Corrigez AVANT votre départ — c'est gratuit. Après, c'est une réclamation."
3. **Revalorisation annuelle** : "Base fausse → chaque revalorisation s'applique sur un montant trop bas."
