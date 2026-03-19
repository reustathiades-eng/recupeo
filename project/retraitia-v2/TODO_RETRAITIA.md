# TODO_RETRAITIA — Backlog priorisé

**Dernière mise à jour :** 2026-03-19 — 111/111 tâches (100%)

---

## Priorité 1 — MVP (lancement)

Le minimum pour lancer RETRAITIA avec le parcours retraité actuel du privé.

### 1.1 Pages publiques SEO

| # | Tâche | Brief | Statut |
|---|-------|-------|--------|
| T001 | Page chapeau /retraitia | MASTER #1 | ✅ |
| T002 | Page /retraitia/verifier-ma-pension | PARCOURS_RETRAITE #2 | ✅ |
| T003 | Page /retraitia/preparer-mon-depart | PARCOURS_PRERETRAITE #3 | ✅ |
| T004 | Page /retraitia/pension-de-reversion | PARCOURS_REVERSION #4 | ✅ |

### 1.2 Mini-diagnostic flash

| # | Tâche | Brief | Statut |
|---|-------|-------|--------|
| T010 | Page /retraitia/test (4 questions + email) | DIAGNOSTIC_GRATUIT #10 | ✅ |
| T011 | Calcul score de risque (heuristique 4 questions) | DIAGNOSTIC_GRATUIT #10 | ✅ |
| T012 | Page résultat flash + partage social | DIAGNOSTIC_GRATUIT #10 | ✅ |
| T013 | Email Brevo résultat flash (S1-E1) | EMAILS_RELANCES #14 | ✅ |
| T014 | Séquence relances post-flash (S1-E2 à S1-E4) | EMAILS_RELANCES #14 | ✅ |
| T015 | Collection Payload retraitia-flash | DIAGNOSTIC_GRATUIT #10 | ✅ |
| T016 | Tracking GA4 flash | DIAGNOSTIC_GRATUIT #10 | ✅ |

### 1.3 Paiement Stripe 9€

| # | Tâche | Brief | Statut |
|---|-------|-------|--------|
| T020 | Page paiement 9€ (Stripe Checkout) | MASTER #1 | ✅ |
| T021 | Webhook Stripe → création dossier + espace client | MASTER #1 | ✅ |
| T022 | Email bienvenue post-9€ (S2-E1) | EMAILS_RELANCES #14 | ✅ |
| T023 | Collection Payload retraitia-dossiers | MASTER #1 | ✅ |
| T024 | Logique 9€ déduits du 49€ | MASTER #1 | ✅ |

### 1.4 Espace client — Collecte

| # | Tâche | Brief | Statut |
|---|-------|-------|--------|
| T030 | Layout /mon-espace/retraitia (navigation, sélecteur) | ESPACE_CLIENT #13 | ✅ |
| T031 | Tableau de bord — phase collecte (StatusCards, ProgressBar) | ESPACE_CLIENT #13 | ✅ |
| T032 | Composant StatusCard (5 états) | ESPACE_CLIENT #13 | ✅ |
| T033 | Composant ProgressBar | ESPACE_CLIENT #13 | ✅ |
| T034 | Diagnostic accès FranceConnect | ONBOARDING #5 | ✅ |
| T035 | Guides FranceConnect (Ameli, impots.gouv, La Poste) | ONBOARDING #5 | ✅ |
| T036 | Page /retraitia/documents (checklist + upload) | ESPACE_CLIENT #13 | ✅ |
| T037 | Composant DocumentUploader (drag & drop + mobile) | ESPACE_CLIENT #13 | ✅ |
| T038 | Guides de navigation par document (7 sites) | COLLECTE #6 | ✅ |
| T039 | Refus intelligent (document incorrect) | COLLECTE #6 | ✅ |
| T040 | Messages pré-rédigés si document introuvable | COLLECTE #6 | ✅ |
| T041 | Page /retraitia/informations (formulaire 3 blocs / 16 questions) | PARCOURS_RETRAITE #2 | ✅ |
| T042 | Séquences onboarding FranceConnect (S3) | EMAILS_RELANCES #14 | ✅ |
| T043 | Séquences relance documents (S4) | EMAILS_RELANCES #14 | ✅ |

### 1.5 Extraction / Parsing

| # | Tâche | Brief | Statut |
|---|-------|-------|--------|
| T050 | Pipeline extraction (texte → regex → Claude texte → Vision) | EXTRACTION #7 | ✅ |
| T051 | Parseur regex RIS | EXTRACTION #7 | ✅ |
| T052 | Parseur regex notification CNAV/CARSAT | EXTRACTION #7 | ✅ |
| T053 | Parseur regex relevé Agirc-Arrco | EXTRACTION #7 | ✅ |
| T054 | Parseur regex avis d'imposition | EXTRACTION #7 | ✅ |
| T055 | Prompts Claude texte (fallback) | EXTRACTION #7 | ✅ |
| T056 | Prompts Claude Vision (dernier recours) | EXTRACTION #7 | ✅ |
| T057 | Anonymisation N°SS + nom avant appel Claude | EXTRACTION #7 | ✅ |
| T058 | Score de confiance extraction | EXTRACTION #7 | ✅ |
| T059 | Email notification extraction réussie (S5) | EMAILS_RELANCES #14 | ✅ |

### 1.6 Moteur de calcul — Régime général

| # | Tâche | Brief | Statut |
|---|-------|-------|--------|
| T060 | Calcul SAM (25 meilleures années revalorisées) | MOTEUR_CALCUL #8 | ✅ |
| T061 | Calcul taux de liquidation (décote/surcote) | MOTEUR_CALCUL #8 | ✅ |
| T062 | Calcul proratisation | MOTEUR_CALCUL #8 | ✅ |
| T063 | Calcul majorations enfants | MOTEUR_CALCUL #8 | ✅ |
| T064 | Calcul minimum contributif | MOTEUR_CALCUL #8 | ✅ |
| T065 | Vérification points Agirc-Arrco | MOTEUR_CALCUL #8 | ✅ |
| T066 | Vérification CSG | MOTEUR_CALCUL #8 | ✅ |
| T067 | Tables de données JSON (PASS, coefficients, barèmes...) | DONNEES_REFERENCE #16 | ✅ |

### 1.7 Détection d'anomalies

| # | Tâche | Brief | Statut |
|---|-------|-------|--------|
| T070 | Catalogue des anomalies (41 types) | ANOMALY_DETECTION #9 | ✅ |
| T071 | Détecteur d'anomalies (orchestrateur) | ANOMALY_DETECTION #9 | ✅ |
| T072 | Scoring et priorisation | ANOMALY_DETECTION #9 | ✅ |
| T073 | Calcul d'impact (mensuel, passé, futur) | ANOMALY_DETECTION #9 | ✅ |
| T074 | Score global (Bronze/Argent/Or/Platine) | ANOMALY_DETECTION #9 | ✅ |

### 1.8 Diagnostic serré + conversion

| # | Tâche | Brief | Statut |
|---|-------|-------|--------|
| T080 | Page diagnostic serré (ce qu'on montre/cache) | DIAGNOSTIC_GRATUIT #10 | ✅ |
| T081 | Seuil gratuit (< 30€/mois → rapport offert) | DIAGNOSTIC_GRATUIT #10 | ✅ |
| T082 | Email diagnostic prêt (S6) | EMAILS_RELANCES #14 | ✅ |
| T083 | Séquences post-diagnostic non-payant (S7) | EMAILS_RELANCES #14 | ✅ |

### 1.9 Paiement Stripe 49€ + Rapport

| # | Tâche | Brief | Statut |
|---|-------|-------|--------|
| T090 | Page paiement 49€ (Stripe Checkout, déduction 9€) | MASTER #1 | ✅ |
| T091 | Webhook Stripe → déblocage rapport + démarches | MASTER #1 | ✅ |
| T092 | Génération PDF pdfkit (10 sections) | RAPPORT_PDF #11 | ✅ |
| T093 | Page rapport interactif (version en ligne) | RAPPORT_PDF #11 | ✅ |
| T094 | Email bienvenue post-49€ (S8) | EMAILS_RELANCES #14 | ✅ |

### 1.10 Suivi des démarches

| # | Tâche | Brief | Statut |
|---|-------|-------|--------|
| T100 | Page /retraitia/demarches (vue d'ensemble) | ESPACE_CLIENT #13 | ✅ |
| T101 | Page /retraitia/demarches/:id (détail + timeline) | ESPACE_CLIENT #13 | ✅ |
| T102 | Composant TimelineAnomalie | ESPACE_CLIENT #13 | ✅ |
| T103 | Composant CheckInteractif (transitions d'état) | ESPACE_CLIENT #13 | ✅ |
| T104 | Composant CompteurDelai | ESPACE_CLIENT #13 | ✅ |
| T105 | Composant MessageCopiable | ESPACE_CLIENT #13 | ✅ |
| T106 | Génération messages par anomalie (templates + variables) | MESSAGES_ACTIONS #12 | ✅ |
| T107 | Séquences suivi démarches (S9) | EMAILS_RELANCES #14 | ✅ |
| T108 | Email anomalie corrigée (S10) | EMAILS_RELANCES #14 | ✅ |
| T109 | Email escalade proposée (S11) | EMAILS_RELANCES #14 | ✅ |
| T110 | Logique d'escalade (message → relance → LRAR → CRA → médiateur) | MESSAGES_ACTIONS #12 | ✅ |

### 1.11 Bouton "Un proche peut m'aider"

| # | Tâche | Brief | Statut |
|---|-------|-------|--------|
| T120 | Mécanique invitation proche (magic link) | ONBOARDING #5 | ✅ |
| T121 | Accès aidant (vue dossier, upload, formulaire, paiement) | ONBOARDING #5 | ✅ |
| T122 | Email invitation proche (S13) | EMAILS_RELANCES #14 | ✅ |

---

## Priorité 2 — Extensions V2

Après le MVP, ajout des régimes et parcours supplémentaires.

### 2.1 Régimes supplémentaires

| # | Tâche | Brief | Statut |
|---|-------|-------|--------|
| T200 | Moteur calcul fonctionnaires (SRE + CNRACL) | MOTEUR_CALCUL #8 | ✅ |
| T201 | Parseur regex titre de pension SRE / décompte CNRACL | EXTRACTION #7 | ✅ |
| T202 | Moteur calcul MSA exploitants (forfaitaire + proportionnelle) | MOTEUR_CALCUL #8 | ✅ |
| T203 | Moteur calcul CNAVPL + sections (base par points) | MOTEUR_CALCUL #8 | ✅ |
| T204 | Vérification RAFP, Ircantec, RCI | MOTEUR_CALCUL #8 | ✅ |
| T205 | Détection migration RSI (indépendants) | ANOMALY_DETECTION #9 | ✅ |
| T206 | Détection revalorisation Chassaigne (MSA exploitants) | ANOMALY_DETECTION #9 | ✅ |

### 2.2 Parcours pré-retraité

| # | Tâche | Brief | Statut |
|---|-------|-------|--------|
| T210 | Simulation multi-scénarios (62-67 ans) | MOTEUR_CALCUL #8 | ✅ |
| T211 | Simulation rachat de trimestres + ROI | MOTEUR_CALCUL #8 | ✅ |
| T212 | Estimation <55 ans (sans EIG) | PARCOURS_PRERETRAITE #3 | ✅ |
| T213 | Page rapport pré-retraité (variante PDF) | RAPPORT_PDF #11 | ✅ |
| T214 | Email rappel annuel (S14) | EMAILS_RELANCES #14 | ✅ |
| T215 | Email upsell départ (S15) | EMAILS_RELANCES #14 | ✅ |

### 2.3 Parcours réversion

| # | Tâche | Brief | Statut |
|---|-------|-------|--------|
| T220 | Formulaire réversion (conjoint décédé) | PARCOURS_REVERSION #4 | ✅ |
| T221 | Calcul éligibilité réversion par régime | MOTEUR_CALCUL #8 | ✅ |
| T222 | Messages de demande de réversion par régime | MESSAGES_ACTIONS #12 | ✅ |
| T223 | Page rapport réversion (variante PDF) | RAPPORT_PDF #11 | ✅ |
| T224 | Adaptation ton sobre (emails + UX) | EMAILS_RELANCES #14 | ✅ |

### 2.4 Pack Couple

| # | Tâche | Brief | Statut |
|---|-------|-------|--------|
| T230 | Paiement 79€ (Stripe) | MASTER #1 | ✅ |
| T231 | Sélecteur couple dans l espace client | ESPACE_CLIENT #13 | ✅ |
| T232 | Vue résumé couple (tableau de bord) | ESPACE_CLIENT #13 | ✅ |
| T233 | 2 rapports PDF (un par personne) | RAPPORT_PDF #11 | ✅ |

---

## Priorité 3 — Fonctionnalités avancées

### 3.1 LRAR intégrée

| # | Tâche | Brief | Statut |
|---|-------|-------|--------|
| T300 | Intégration API envoi LRAR (Maileva ou AR24) | MESSAGES_ACTIONS #12 | ✅ |
| T301 | Paiement 14,90€ par LRAR (Stripe) | MASTER #1 | ✅ |
| T302 | Génération PDF LRAR (pdfkit) | MESSAGES_ACTIONS #12 | ✅ |
| T303 | Suivi de réception AR | MESSAGES_ACTIONS #12 | ✅ |

### 3.2 Export tribunal

| # | Tâche | Brief | Statut |
|---|-------|-------|--------|
| T310 | Paiement Pack Tribunal 29€ | MASTER #1 | ✅ |
| T311 | Génération ZIP (docs + courriers + chronologie) | ESPACE_CLIENT #13 | ✅ |
| T312 | PDF chronologie du dossier | ESPACE_CLIENT #13 | ✅ |

### 3.3 Cross-sell

| # | Tâche | Brief | Statut |
|---|-------|-------|--------|
| T320 | Détection opportunités N4/N5 | ANOMALY_DETECTION #9 | ✅ |
| T321 | Encadré cross-sell espace client | ESPACE_CLIENT #13 | ✅ |
| T322 | Email cross-sell (S12) | EMAILS_RELANCES #14 | ✅ |

### 3.4 Notifications

| # | Tâche | Brief | Statut |
|---|-------|-------|--------|
| T330 | Système de notifications in-app | ESPACE_CLIENT #13 | ✅ |
| T331 | Bannière contextuelle tableau de bord | ESPACE_CLIENT #13 | ✅ |
| T332 | Scheduler cron (emails programmés) | EMAILS_RELANCES #14 | ✅ |

---

## Compteurs

| Priorité | Nb tâches | Statut |
|----------|----------|--------|
| P1 — MVP | 76 | ✅ 76/76 |
| P2 — Extensions V2 | 22 | ✅ 22/22 |
| P3 — Avancées | 13 | ✅ 13/13 |
| **TOTAL** | **111** | **✅ 111/111 (100%)** |

---

**Dernière mise à jour : 2026-03-19 — Session 8 — TOUTES TÂCHES TERMINÉES**

