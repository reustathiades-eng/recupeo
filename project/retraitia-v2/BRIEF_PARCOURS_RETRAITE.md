# BRIEF_PARCOURS_RETRAITE — Funnel retraité actuel

**Statut :** ✅ Validé
**Date :** 2026-03-18
**Dépendances :** MASTER (validé), REGIMES_SPECIFIQUES (#15), MOTEUR_CALCUL (#8), MESSAGES_ACTIONS (#12)

---

## 1. Vue d'ensemble

Ce brief décrit le parcours complet du **retraité actuel** — le cœur du produit (70%+ des clients). Du premier clic sur la landing page jusqu'à la dernière anomalie corrigée et passée en vert.

**Principe fondamental :** le client voit TOUT dès le début. Pas de surprise, pas de "ah il faut encore ça". Un tableau de mission complet, un objectif clair : tout passer en vert ✅.

**Le client type :** l'enfant de 47 ans qui aide sa mère de 72 ans un dimanche après-midi. Ou le retraité lui-même, motivé par l'enjeu financier.

---

## 2. Le funnel complet — étape par étape

```
ÉTAPE 0 — Landing /retraitia/verifier-ma-pension
    │
    ▼
ÉTAPE 1 — Question filtre (gratuit)
"Je suis à la retraite" / "Pour un proche"
    │
    ▼
ÉTAPE 2 — Mini-diagnostic flash (gratuit)
4 questions + email obligatoire → score de risque
    │
    ▼
ÉTAPE 3 — Paywall 9€ (Pack Dossier)
    │
    ▼
ÉTAPE 4 — Espace client : Tableau de mission
4a. Accès FranceConnect
4b. Collecte documents (adaptée au régime)
4c. Formulaire complémentaire (3 blocs, 16 questions)
4d. Diagnostic serré (auto-déclenché)
    │
    ▼
ÉTAPE 5 — Paywall 49€ (Pack Action) — 40€ si 9€ déjà payés
    │
    ▼
ÉTAPE 6 — Rapport détaillé + messages pré-rédigés
    │
    ▼
ÉTAPE 7 — Suivi des démarches (tableau de mission étendu)
Actions par anomalie → checks → relances → escalade
    │
    ▼
ÉTAPE 8 — Résolution
Anomalies corrigées → gains confirmés → cross-sell
```

---

## 3. Étape 0 — Landing page /retraitia/verifier-ma-pension

### Hero
- H1 : "1 pension sur 7 contient une erreur — source : Cour des Comptes"
- Sous-titre : "Vérifiez gratuitement si vos parents touchent la pension qu'ils méritent"
- CTA principal : "Tester en 30 secondes"
- Réassurance : "Gratuit · 4 questions · Sans engagement"

### Contenu de la page
- Les 6 niveaux d'audit expliqués simplement (icônes + une phrase chacun)
- Chiffres clés : "10,5% des pensions contiennent une erreur", "75% des erreurs sont en défaveur des retraités", "900 millions d'euros de manque à gagner"
- Témoignages / WallOfWins (quand on aura des données)
- FAQ : "C'est légal ?", "Combien ça coûte ?", "C'est vraiment automatique ?", "Comment ça marche pour mes parents ?"
- ShareBlock : partage Facebook/WhatsApp/email (cible = enfants de retraités actifs sur Facebook)

---

## 4. Étape 1 — Question filtre

Première question après le CTA :

**"Quelle est votre situation ?"**
1. ✅ Je suis déjà à la retraite → **ce parcours**
2. Je prépare ma retraite (dans les 5 prochaines années) → parcours pré-retraité
3. Mon conjoint est décédé — je veux vérifier mes droits → parcours réversion
4. Je fais cette démarche pour un proche → même choix, mais on adapte le ton ("votre parent" au lieu de "vous")

Si option 4, on demande aussi : "Votre proche est..." → retraité / pré-retraité / veuf(ve)

---

## 5. Étape 2 — Mini-diagnostic flash

### Les 4 questions
1. **Année de naissance** (du retraité) → détermine génération, trimestres requis, âge légal
2. **Nombre d'enfants** → trimestres maternité/éducation, majoration +10%
3. **Type de carrière principal** → privé / fonctionnaire (État) / fonctionnaire (territorial/hospitalier) / agricole / indépendant / libéral / mixte (plusieurs régimes)
4. **Email** (obligatoire) → "Où voulez-vous recevoir votre résultat ?"

### Le résultat
Basé sur les statistiques publiques (Cour des Comptes, Sapiendo) croisées avec le profil :

"**Marie, née en 1953 avec 3 enfants et une carrière mixte privé/public :**
- Les femmes de votre génération ont **73% de chances** d'avoir au moins une anomalie sur leur pension
- Le manque à gagner moyen pour votre profil est de **127€/mois**
- Depuis votre départ en retraite, vous avez potentiellement perdu **entre 10 000€ et 30 000€**"

### Conversion vers les 9€
"Pour 9€, on prend votre dossier en main."
- ✓ Votre espace personnel sécurisé
- ✓ Guides pas-à-pas pour récupérer chaque document
- ✓ Suivi de votre dossier en temps réel
- ✓ Diagnostic automatique dès vos documents uploadés
- ✓ "Ces 9€ sont déduits si vous poursuivez l'analyse"

### Email Brevo envoyé au client
Récap du résultat du flash + lien vers le paiement des 9€.
Si pas de paiement → séquence de relance : J+1, J+3, J+7, J+14 (voir brief #14).

---

## 6. Étape 3 — Paiement 9€ et ouverture du compte

### Stripe Checkout
- Produit : "RETRAITIA — Pack Dossier"
- Prix : 9,00€
- Mention : "Ces 9€ seront déduits de votre Pack Action si vous poursuivez"
- Après paiement : création automatique du compte client (email du flash, magic link Brevo)

### Premier email post-paiement
"Votre espace RETRAITIA est prêt. Connectez-vous pour commencer."
- Lien magic link vers l'espace client
- Récap de ce qui l'attend : "4 étapes, environ 30 minutes"
- "Vous pouvez vous arrêter et reprendre à tout moment"
- "Un proche peut vous aider ? Transmettez-lui ce lien"

---

## 7. Étape 4 — L'espace client : le tableau de mission

### 7.1 Principes UX

**Transparence totale :** tout est visible dès l'entrée. Le client voit les 14+ items de son tableau de mission. Pas de "étape 2 sur ?". Il sait exactement ce qui l'attend.

**Gamification douce :** chaque action complétée passe en vert ✅. La barre de progression avance. L'objectif est de tout passer au vert. C'est motivant, clair, et donne envie de finir.

**Non-bloquant :** si le client ne trouve pas un document, il passe au suivant. On ne bloque JAMAIS. Les items obligatoires restent rouges mais le client peut avancer sur le reste.

**Session fragmentée :** le client peut s'arrêter et revenir à tout moment. Chaque retour = "Bienvenue [Prénom], voici où vous en êtes" + rappel de ce qui reste.

**Adapté au régime :** la checklist est personnalisée selon le type de carrière détecté au flash. Un salarié du privé ne voit pas les documents CNRACL. Un fonctionnaire ne voit pas Agirc-Arrco.

### 7.2 Les 5 états visuels

| État | Icône | Signification |
|------|-------|---------------|
| À faire | 🔴 | Action obligatoire requise |
| En attente | 🟡 | Action faite, on attend une réponse (organisme, etc.) |
| Fait | ✅ | Complété et validé |
| Optionnel | ⚪ | Recommandé mais pas obligatoire |
| Verrouillé | ⬛ | Se débloque automatiquement quand les prérequis sont remplis |

### 7.3 Le tableau de mission — structure complète

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  VOTRE DOSSIER RETRAITIA — [Prénom Nom]
  Né(e) en [année] · [N] enfants · Carrière [type]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Progression : ██░░░░░░░░ [X]/[total] ✅
  Objectif : tout passer au vert ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📡 VOS ACCÈS
  [état] FranceConnect

📄 VOS DOCUMENTS (adaptés au régime)
  [état] Document 1 — obligatoire
  [état] Document 2 — obligatoire
  [état] Document 3 — obligatoire
  [état] Document 4 — optionnel
  [état] Document 5 — optionnel
  ...

📝 VOS INFORMATIONS
  [état] Situation familiale        5 questions · ⏱ 2 min
  [état] Parcours professionnel     7 questions · ⏱ 3 min
  [état] Vos droits complémentaires 4 questions · ⏱ 1 min

🔍 VOTRE DIAGNOSTIC
  [⬛ verrouillé jusqu'à ce que les 🔴 obligatoires soient ✅]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [👨‍👩‍👧 Un proche peut m'aider]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 7.4 Section ACCÈS — FranceConnect

**Objectif :** s'assurer que le client peut se connecter aux sites avant de chercher les documents.

**Ce que le client voit :**
- "Pour récupérer vos documents, vous avez besoin d'un accès FranceConnect."
- "Avez-vous un compte sur l'un de ces sites ?"
  - Ameli.fr → ✅ "Parfait"
  - Impots.gouv.fr → ✅ "Parfait"
  - La Poste (Identité Numérique) → ✅ "Parfait"
  - Aucun → guide création compte Ameli (le plus simple : numéro sécu + email + SMS)

**Si "Aucun" :**
- Guide pas-à-pas : "Comment créer votre compte Ameli en 5 minutes"
- Alternative : "Comment retrouver votre mot de passe impots.gouv"
- Dernier recours : lien vers France Services le plus proche (2 800 points, < 30 min de tout domicile)

**Question supplémentaire :**
- "Êtes-vous avec votre parent en ce moment ?"
  - Oui → on guide en temps réel
  - Non → "Envoyez-lui ce guide par email" (champ email du parent)

**Check de validation :**
☑️ "J'ai accès à FranceConnect" → passe en ✅, débloque la section Documents

---

### 7.5 Section DOCUMENTS — Checklist adaptée par régime

#### Documents par type de carrière

**Salarié du privé :**
| # | Document | Source | Obligatoire |
|---|----------|--------|-------------|
| 1 | RIS | info-retraite.fr | ✅ OUI |
| 2 | Notification de pension | lassuranceretraite.fr | ✅ OUI |
| 3 | Relevé de points Agirc-Arrco | agirc-arrco.fr | ✅ OUI |
| 4 | Relevé de mensualités | lassuranceretraite.fr | ⚪ Optionnel |
| 5 | Attestation fiscale | info-retraite.fr | ⚪ Optionnel |
| 6 | Avis d'imposition | impots.gouv.fr | ⚪ Optionnel |
| 7 | Paiements Agirc-Arrco | agirc-arrco.fr | ⚪ Optionnel |

**Fonctionnaire d'État :**
| # | Document | Source | Obligatoire |
|---|----------|--------|-------------|
| 1 | RIS | info-retraite.fr | ✅ OUI |
| 2 | Titre de pension | ensap.gouv.fr | ✅ OUI |
| 3 | Relevé RAFP | info-retraite.fr | ✅ OUI |
| 4 | Attestation de paiement | ensap.gouv.fr | ⚪ Optionnel |
| 5 | Avis d'imposition | impots.gouv.fr | ⚪ Optionnel |

**Fonctionnaire territorial/hospitalier :**
| # | Document | Source | Obligatoire |
|---|----------|--------|-------------|
| 1 | RIS | info-retraite.fr | ✅ OUI |
| 2 | Décompte de pension CNRACL | cnracl.retraites.fr | ✅ OUI |
| 3 | Relevé RAFP | info-retraite.fr | ✅ OUI |
| 4 | Relevé Ircantec (si contractuel) | info-retraite.fr | ⚪ Selon profil |
| 5 | Avis d'imposition | impots.gouv.fr | ⚪ Optionnel |

**Agriculteur (MSA) :**
| # | Document | Source | Obligatoire |
|---|----------|--------|-------------|
| 1 | RIS | info-retraite.fr | ✅ OUI |
| 2 | Notification de pension MSA | msa.fr | ✅ OUI |
| 3 | Relevé complémentaire MSA | msa.fr | ✅ OUI |
| 4 | Avis d'imposition | impots.gouv.fr | ⚪ Optionnel |

**Indépendant (ex-RSI → SSI → CNAV) :**
| # | Document | Source | Obligatoire |
|---|----------|--------|-------------|
| 1 | RIS | info-retraite.fr | ✅ OUI |
| 2 | Notification de pension | lassuranceretraite.fr | ✅ OUI |
| 3 | Relevé RCI (complémentaire indépendants) | lassuranceretraite.fr | ✅ OUI |
| 4 | Avis d'imposition | impots.gouv.fr | ⚪ Optionnel |

**Profession libérale (CNAVPL) :**
| # | Document | Source | Obligatoire |
|---|----------|--------|-------------|
| 1 | RIS | info-retraite.fr | ✅ OUI |
| 2 | Notification de pension CNAVPL | info-retraite.fr ou section | ✅ OUI |
| 3 | Relevé complémentaire (section) | CIPAV/CARMF/CARPIMKO/etc. | ✅ OUI |
| 4 | Avis d'imposition | impots.gouv.fr | ⚪ Optionnel |

**Carrière mixte (polypensionné) :**
Combinaison des documents de chaque régime concerné. Le formulaire flash détecte "mixte" et pose la question "Quels régimes avez-vous connus ?" pour personnaliser la checklist.

#### Ce que le client voit pour chaque document

**État 🔴 (à faire) :**
```
📄 [NOM DU DOCUMENT]                          🔴 À faire

C'est quoi ?
[Explication en 1 phrase de ce que c'est et pourquoi on en a besoin]

Où le trouver ?
→ [site] → FranceConnect → [chemin exact]

[📖 Guide pas-à-pas avec screenshots]    ⏱ Environ [N] minutes

[⬆️ J'ai le document → Uploader]

[❓ Je ne le trouve pas]
   → Message prêt à copier dans la messagerie de [organisme] :
   "[Message pré-rédigé avec N° SS pré-rempli]"
   [📋 Copier le message]
   [☑️ J'ai envoyé le message]

[⏭️ Passer au suivant]
```

**État 🟡 (en attente — message envoyé à un organisme) :**
```
📄 [NOM DU DOCUMENT]                          🟡 En attente

Message envoyé à [organisme] le [date]
→ Délai de réponse habituel : 2 à 4 semaines
→ Relance automatique programmée le [date J+30]

[☑️ J'ai reçu le document → Uploader]
[☑️ Ils n'ont pas répondu / ont refusé]
   → On vous prépare une relance
```

**État ✅ (uploadé et extrait) :**
```
📄 [NOM DU DOCUMENT]                          ✅ Uploadé le [date]

Résumé de l'extraction :
• [N] années de carrière détectées
• [N] trimestres validés
• Régimes détectés : [liste]
• [Autres données clés extraites]

[👁️ Voir le détail] [🔄 Remplacer le document]
```

**L'extraction se fait en temps réel** après l'upload. Le client voit le résumé en quelques secondes. Ça le rassure ("la machine a bien lu mon document") et le motive pour uploader le suivant.

---

### 7.6 Section INFORMATIONS — Formulaire complémentaire

**Chapeau :** "Ces questions nous permettent de vérifier ce que vos documents ne disent pas. Votre RIS ne contient ni vos trimestres enfants, ni votre service militaire, ni vos droits sociaux."

#### Bloc A — Situation familiale (5 questions, ⏱ 2 min)

| # | Question | Type | Pourquoi |
|---|----------|------|----------|
| 1 | Combien d'enfants avez-vous ? | Nombre | Trimestres maternité/éducation (8/enfant pour les mères), majoration +10% si 3+ |
| 2 | Dates de naissance des enfants | Dates | Vérification trimestres par enfant |
| 3 | Votre conjoint est-il décédé ? | Oui/Non | Détection réversion (N3) |
| 3b | Si oui : percevez-vous une pension de réversion ? | Oui/Non/Ne sais pas | Si non ou ne sais pas → anomalie N3 |
| 4 | Êtes-vous ancien combattant ? | Oui/Non | Demi-part fiscale si +75 ans (N5) |
| 5 | Invalidité reconnue ? Taux ? | Non / Oui + % | Demi-part si +80% (N5), impact calcul pension |

#### Bloc B — Parcours professionnel (7 questions, ⏱ 3 min)

| # | Question | Type | Pourquoi |
|---|----------|------|----------|
| 6 | Service militaire effectué ? Durée ? | Oui/Non + mois | 1 trim/90 jours, souvent absent du RIS |
| 7 | Périodes de chômage non indemnisé ? | Oui/Non + périodes | 6 trim max, absentes du RIS si anciennes |
| 8 | Périodes à l'étranger ? Pays + durée ? | Oui/Non + détail | Accords bilatéraux (UE, Suisse, Maroc, Tunisie, Algérie, Canada...) |
| 9 | Apprentissage avant 2014 ? | Oui/Non + période | Souvent mal reporté |
| 10 | Changement de régime en carrière ? | Liste de régimes | Polypensionné : vérification Lura, coordination inter-régimes |
| 11 | Activité professionnelle encore en cours ? | Oui/Non + type | Cumul emploi-retraite, nouveaux droits depuis 2023 |
| 12 | Périodes de temps partiel significatives ? | Oui/Non + périodes | Impact sur trimestres et SAM |

#### Bloc C — "On vérifie tout pour vous" (4 questions, ⏱ 1 min)

Chapeau : "Notre audit couvre aussi vos droits sociaux et fiscaux. Répondez à ces questions pour une analyse complète."

| # | Question | Type | Ce que ça déclenche |
|---|----------|------|---------------------|
| 13 | Pension mensuelle actuellement perçue ? (base + complémentaire séparément) | Montants | Comparaison avec notre recalcul = détection de l'écart |
| 14 | Locataire ou propriétaire ? | Choix | Propriétaire +75 ans → vérification exonération TF → cross-sell MATAXE |
| 15 | Emploi à domicile ? (aide ménagère, jardinage...) | Oui/Non | Crédit d'impôt 50% → cross-sell MONIMPOT |
| 16 | Mutuelle actuelle ? Coût mensuel ? | Oui/Non + montant | Éligibilité CSS (gratuite ou 1€/jour) si revenus modestes |

**Présentation du bloc C :** intégré naturellement comme partie de l'audit, pas comme du commercial. Le client se dit "ils vérifient vraiment tout". Les cross-sells sont présentés comme des résultats du diagnostic, pas comme des ventes additionnelles.

**Chaque bloc validé** → passe en ✅ sur le tableau de mission.

---

### 7.7 Section DIAGNOSTIC — Auto-déclenchement

#### Conditions de déclenchement
Le diagnostic se lance automatiquement quand :
- ✅ Au moins RIS uploadé + notification/titre de pension uploadé
- ✅ Les 3 blocs du formulaire complétés
- (Les documents optionnels améliorent la précision mais ne bloquent pas)

#### Ce que le client voit

**Pendant l'analyse (quelques secondes) :**
"Analyse en cours... Nous croisons vos documents avec les barèmes officiels."

**Résultat — le diagnostic serré :**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 VOTRE DIAGNOSTIC RETRAITIA

Précision : ████████░░ 75%
(Uploadez votre relevé Agirc-Arrco pour améliorer la précision)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 7 anomalies détectées sur 5 niveaux

📊 Score de fiabilité : BRONZE
   Votre dossier nécessite une vérification approfondie

💰 Impact estimé : entre 150 et 400€/mois de manque à gagner
📈 Cumul potentiel : entre 45 000 et 120 000€
⏱️ Depuis votre départ en retraite (2018) :
   entre 14 400 et 38 400€ potentiellement perdus

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Anomalies détectées :

  Retraite de base
  • Trimestres potentiellement manquants
  • Majoration enfants non vérifiable

  Retraite complémentaire
  • Points à vérifier

  Droits sociaux
  • Éligibilité ASPA à vérifier

  Optimisation fiscale
  • Demi-part potentiellement non utilisée

  Prélèvements sociaux
  • Taux CSG à vérifier

  Réversion
  • Droits à vérifier

  → Aucun montant détaillé
  → Aucun guide d'action

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[🔓 OBTENIR MON RAPPORT COMPLET — 40€]
   (9€ déjà déduits de votre Pack Dossier)

   ✓ Détail chiffré de chaque anomalie
   ✓ Messages prêts à envoyer à chaque organisme
   ✓ Guide d'action étape par étape
   ✓ Suivi complet de vos démarches
   ✓ 1er envoi recommandé inclus si nécessaire

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Seuil gratuit
Si l'impact estimé est < 30€/mois :
- Le diagnostic complet est offert (pas de paywall)
- Message : "Bonne nouvelle : les anomalies détectées ont un impact limité. Voici quand même le détail gratuitement."
- Les 9€ ne sont PAS remboursés (ils ont payé pour le service de collecte)

#### Mise à jour dynamique
Si le client uploade un document optionnel après le diagnostic :
- L'analyse se relance automatiquement
- La précision monte
- De nouvelles anomalies peuvent être détectées
- Le diagnostic se met à jour en temps réel

---

## 8. Étape 5 — Paiement 49€ et rapport

### Stripe
- Produit : "RETRAITIA — Pack Action"
- Prix : 49,00€ — coupon automatique -9€ si Pack Dossier déjà payé (lié à l'email)
- Prix affiché : "40€ (9€ déjà déduits)"

### Ce que le client débloque

**Le rapport PDF détaillé (voir brief #11) :**
- Frise chronologique de carrière
- Détail chiffré de chaque anomalie avec impact mensuel et cumulé
- Recalcul complet : pension théorique vs pension versée
- Pour chaque anomalie : explication + action recommandée
- Baromètre de fiabilité avec méthodologie transparente
- Cross-sell (MATAXE, MONIMPOT, MESDROITS)

**Les messages pré-rédigés (voir brief #12) :**
- Un message par anomalie, adapté à l'organisme et au canal
- Prêts à copier-coller
- Variables pré-remplies (nom, N° SS, dates, montants)

**Le suivi des démarches :**
- Le tableau de mission s'étend avec les actions par anomalie

---

## 9. Étape 6-7 — Suivi des démarches (post-49€)

### Le tableau de mission étendu

Après paiement, le tableau de mission se transforme. La partie collecte passe en arrière-plan (tout est ✅), et une nouvelle section apparaît :

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  VOS DÉMARCHES — 0/7 anomalies résolues
  Objectif : tout passer au vert ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Structure par anomalie

Chaque anomalie a sa propre carte avec :
- Le type d'anomalie et le niveau (N1 à N6)
- L'impact chiffré (mensuel + cumulé)
- L'organisme concerné
- Le canal recommandé (messagerie en ligne ou LRAR)
- Les étapes de résolution avec checks interactifs
- Le statut actuel (🔴 / 🟡 / ✅ / ❌)

#### Anomalie de type "réclamation" (ex : trimestres manquants)

```
🔴 ANOMALIE #1 — Trimestres chômage 2008-2009 manquants
   Niveau 1 — Retraite de base
   Impact : +65€/mois · +780€/an · Cumulé depuis 2018 : ~6 240€
   Organisme : CARSAT [région]
   Canal : Messagerie lassuranceretraite.fr

   ÉTAPE 1 — Envoyer le message                      🔴 À faire
   Message prêt à copier :
   "Bonjour, suite à l'analyse de mon relevé de carrière,
   je constate que mes trimestres de chômage indemnisé pour
   la période mars-décembre 2008 et janvier-juin 2009
   n'apparaissent pas dans mon relevé..."
   [📋 Copier le message]  [📖 Guide : où coller ce message]
   [☑️ J'ai envoyé le message]

   ÉTAPE 2 — Réponse de la CARSAT                    ⬛ Verrouillé
   Délai légal : 2 mois
   → Se déverrouille quand l'étape 1 est ✅

   ÉTAPE 3 — Relance si pas de réponse               ⬛ Verrouillé
   → LRAR de relance [14,90€]

   ÉTAPE 4 — Saisine CRA si refus                    ⬛ Verrouillé
   → Saisine en ligne ou LRAR [14,90€]

   ÉTAPE 5 — Médiateur                               ⬛ Verrouillé
   → Courrier médiateur [14,90€]

   ÉTAPE 6 — Tribunal                                ⬛ Verrouillé
   → Pack Tribunal [29€]
```

#### Quand le client coche "J'ai envoyé le message"

L'étape 1 passe en ✅. L'étape 2 se déverrouille :

```
   ÉTAPE 1 — Message envoyé                          ✅ 18/03/2026

   ÉTAPE 2 — Réponse de la CARSAT                    🟡 En attente
   ⏱ Délai légal : 2 mois → échéance le 18/05/2026
   → Relance automatique programmée le 13/05/2026

   Quand vous recevez la réponse :
   ○ ✅ Anomalie corrigée → Sélectionner
   ○ ❌ La CARSAT refuse → Sélectionner
   ○ 📎 Ils demandent des justificatifs → Sélectionner
   ○ 🔇 Pas de réponse après 2 mois → Sélectionner
```

#### Quand le client sélectionne le résultat

**Si "Anomalie corrigée" :**
```
   ✅ ANOMALIE #1 — CORRIGÉE                         ✅ 15/05/2026
   Réponse favorable de la CARSAT le 15/05/2026
   Gain confirmé : +65€/mois
   → Le nouveau montant sera visible dans 1 à 2 versements

   🎉 Bravo ! Vous récupérez 65€/mois soit 780€/an.
```

**Si "La CARSAT refuse" :**
L'étape 3 (LRAR) se déverrouille :
```
   ÉTAPE 3 — LRAR de contestation                    🔴 À faire
   "La CARSAT a refusé votre demande. Voici un courrier
   recommandé de contestation."
   [👁️ Voir le courrier]  [✅ Valider et envoyer — 14,90€]
```

**Si "Ils demandent des justificatifs" :**
```
   📎 La CARSAT demande des justificatifs
   Documents demandés : bulletins de paie 2008, attestation Pôle Emploi
   [⬆️ Uploader les justificatifs]
   → On prépare l'envoi complémentaire [14,90€]
```

**Si "Pas de réponse après 2 mois" :**
Même traitement que le refus → LRAR de relance.

#### Anomalie de type "double démarche" (ex : majoration enfants)

La majoration enfants nécessite une démarche auprès de DEUX organismes :
- CARSAT pour la majoration base (+10%)
- Agirc-Arrco pour la majoration complémentaire (+10% ou +5%/enfant)

```
🔴 ANOMALIE #2 — Majoration enfants non appliquée
   Niveau 1 + Niveau 2
   Impact : +185€/mois (base +95€ + complémentaire +90€)

   DÉMARCHE A — CARSAT (majoration 10% base)
   🔴 Envoyer le message    [📋 Copier]  [📖 Guide]
   ⬛ Réponse reçue
   ⬛ Escalade si nécessaire

   DÉMARCHE B — Agirc-Arrco (majoration complémentaire)
   🔴 Envoyer le message    [📋 Copier]  [📖 Guide]
   ⬛ Réponse reçue
   ⬛ Escalade si nécessaire

   → L'anomalie passe en ✅ quand les deux démarches sont résolues
```

#### Anomalie de type "cross-sell" (N4, N5)

```
💡 OPPORTUNITÉ #4 — Exonération taxe foncière
   Niveau 4 — Aides non réclamées
   Impact potentiel : ~800€/an
   → Vous êtes propriétaire, +75 ans, et vos revenus
     semblent compatibles avec l'exonération.

   [🔍 Vérifier avec MATAXE — brique RÉCUPÉO dédiée]
```

```
💡 OPPORTUNITÉ #5 — Crédit d'impôt emploi à domicile
   Niveau 5 — Optimisation fiscale
   Impact potentiel : ~1 200€/an
   → Vous déclarez un emploi à domicile. Le crédit d'impôt
     de 50% est-il bien appliqué ?

   [🔍 Vérifier avec MONIMPOT — brique RÉCUPÉO dédiée]
```

#### Anomalie qui nécessite un document manquant

```
🟡 ANOMALIE #7 — Taux CSG potentiellement incorrect
   Niveau 6 — Prélèvements sociaux
   Impact : +35€/mois estimé

   ⚠️ Pour confirmer cette anomalie, nous avons besoin
   de votre avis d'imposition.
   [⬆️ Uploader mon avis d'imposition]
   → L'analyse sera mise à jour automatiquement
```

---

## 10. Les 6 niveaux d'audit — ce qu'on vérifie

### Niveau 1 — Retraite de base

**Ce qu'on fait :** on recalcule la pension théorique à partir du RIS corrigé (avec les informations du formulaire), et on compare avec la notification de pension.

**Anomalies recherchées :**
| Anomalie | Source de détection | Fréquence estimée |
|----------|--------------------|--------------------|
| Trimestres cotisés manquants | RIS : trous dans la carrière | Très fréquent |
| Trimestres chômage indemnisé non reportés | RIS + formulaire | Fréquent |
| Trimestres maladie/maternité manquants | RIS + formulaire | Fréquent |
| Trimestres service militaire absents | RIS + formulaire | Fréquent (hommes >60 ans) |
| Trimestres enfants non comptés | Formulaire (absents du RIS) | Très fréquent (femmes) |
| Trimestres AVPF non attribués | Formulaire | Sous-détecté |
| Trimestres apprentissage mal reportés | RIS + formulaire | Avant 2014 |
| Trimestres à l'étranger ignorés | RIS + formulaire | Polypensionnés |
| Salaires mal revalorisés dans le SAM | RIS + coefficients de revalorisation | Nécessite moteur de calcul |
| Décote calculée sur trop de trimestres | Notification vs recalcul | Rare mais gros impact |
| Surcote non appliquée | RIS (trimestres post-taux plein) vs notification | Fréquent |
| Minimum contributif non appliqué | Recalcul vs notification | Fréquent (petites pensions) |
| Majoration +10% pour 3+ enfants absente | Formulaire vs notification | Très fréquent |
| Proratisation incorrecte | Recalcul vs notification | Rare |

**Spécificités fonctionnaires :**
| Anomalie | Détection |
|----------|-----------|
| Traitement indiciaire mal retenu | Titre de pension vs grille indiciaire |
| Bonification enfants non comptée | Formulaire vs titre de pension |
| NBI non prise en compte | Titre de pension |
| Services outre-mer non bonifiés | RIS + formulaire |
| Minimum garanti non appliqué | Recalcul vs titre de pension |
| Temps partiel surcotisé mal compté | RIS vs titre de pension |

**Spécificités indépendants (ex-RSI) :**
| Anomalie | Détection |
|----------|-----------|
| Erreur de migration RSI → SSI (2020) | RIS : trous autour de 2020 |
| Points RCI mal convertis | Relevé RCI vs conversion officielle |
| Cotisations minimales non validées | RIS : années à 0 trimestre alors que actif |

**Spécificités agriculteurs (MSA) :**
| Anomalie | Détection |
|----------|-----------|
| Revalorisation petites pensions non appliquée | Notification vs recalcul post-revalorisation |
| Points complémentaires MSA manquants | Relevé MSA vs périodes d'activité |
| Périodes d'aide familial non comptées | RIS + formulaire |

**Spécificités professions libérales (CNAVPL) :**
| Anomalie | Détection |
|----------|-----------|
| Points base CNAVPL manquants | RIS vs périodes de cotisation |
| Points complémentaire section mal comptés | Relevé section vs cotisations |
| Majoration enfants non appliquée (depuis 2023) | Formulaire vs relevé |

### Niveau 2 — Retraite complémentaire

**Ce qu'on fait :** on vérifie que chaque année de cotisation a généré des points, et que le montant versé correspond aux points × valeur du point.

**Anomalies recherchées :**
| Anomalie | Détection |
|----------|-----------|
| Points manquants pour certaines années | Relevé Agirc-Arrco : années à 0 point |
| Points gratuits non attribués (chômage, maladie, maternité) | Relevé vs RIS (périodes d'arrêt) |
| Majoration enfants Agirc-Arrco non appliquée (+10% ou +5%/enfant) | Formulaire vs relevé |
| Coefficient de solidarité (malus 10%) toujours appliqué après 3 ans | Paiements Agirc-Arrco vs date liquidation |
| Erreur conversion Agirc→Arrco 2019 | Relevé : comparaison points avant/après fusion |
| GMP (Garantie Minimale Points) non comptée (cadres avant 2019) | Relevé : années cadre avec peu de points |
| RAFP mal calculé (fonctionnaires) | Relevé RAFP vs primes déclarées |
| Ircantec non comptée (contractuels FP) | RIS : périodes contractuel vs points Ircantec |

### Niveau 3 — Pension de réversion

**Déclenchement :** formulaire question "Conjoint décédé ?" = Oui ET "Réversion perçue ?" = Non ou "Ne sais pas"

**Anomalies :**
| Anomalie | Action |
|----------|--------|
| Réversion CNAV non demandée (54%) | Guide demande unique info-retraite.fr |
| Réversion Agirc-Arrco non demandée (60%) | Guide demande agirc-arrco.fr |
| Réversion fonctionnaire non demandée (50%) | Guide demande SRE/CNRACL |
| Réversion perçue mais montant à vérifier | Recalcul vs attestation de paiement |

### Niveau 4 — Aides non réclamées

**Déclenchement :** croisement formulaire (revenus, situation) + avis d'imposition si uploadé

| Aide | Condition détectée | Action |
|------|-------------------|--------|
| ASPA | Pension totale < seuil (~1 012€/mois seul) | Alerte + guide demande |
| CSS | Revenus < seuil (~12 000€/an) et mutuelle coûteuse | Alerte + cross-sell MESDROITS |
| APL/ALS | Locataire + revenus modestes | Alerte + guide CAF |
| Exonération TF | Propriétaire +75 ans + revenus sous seuil | Cross-sell MATAXE |
| MaPrimeAdapt' | +70 ans | Information |

### Niveau 5 — Optimisation fiscale

**Déclenchement :** formulaire + avis d'imposition si uploadé

| Opportunité | Condition | Action |
|------------|-----------|--------|
| Demi-part ancien combattant | +75 ans + ancien combattant | Cross-sell MONIMPOT |
| Demi-part invalidité | Invalidité +80% | Cross-sell MONIMPOT |
| Crédit impôt emploi domicile | Emploi à domicile déclaré | Cross-sell MONIMPOT |
| Demi-part parent isolé | Veuf/veuve ayant élevé seul(e) un enfant 5 ans | Cross-sell MONIMPOT |

### Niveau 6 — CSG/CRDS

**Déclenchement :** avis d'imposition uploadé + attestation de paiement

| Anomalie | Détection |
|----------|-----------|
| Taux CSG trop élevé | RFR (avis d'imposition) vs taux appliqué (attestation de paiement) |
| Taux pas revenu à la normale après variation ponctuelle du RFR | Comparaison RFR N-1 vs N-2 si disponible |

---

## 11. Matrice anomalie → organisme → canal

### Pour le régime général privé

| Anomalie | Organisme | Canal principal | Escalade LRAR |
|----------|-----------|----------------|---------------|
| Trimestres manquants | CARSAT [région] | Messagerie lassuranceretraite.fr OU "Corriger ma carrière" info-retraite.fr (≥55 ans) | CARSAT [adresse] |
| SAM / décote / surcote / proratisation | CARSAT [région] | Messagerie lassuranceretraite.fr (réclamation) | CARSAT [adresse] |
| Minimum contributif | CARSAT [région] | Messagerie lassuranceretraite.fr | CARSAT [adresse] |
| Majoration enfants base | CARSAT [région] | Messagerie lassuranceretraite.fr | CARSAT [adresse] |
| Points Agirc-Arrco | Agirc-Arrco | Messagerie agirc-arrco.fr | 16-18 rue Jules César 75592 Paris Cedex 12 |
| Majoration enfants Agirc-Arrco | Agirc-Arrco | Messagerie agirc-arrco.fr | Idem |
| Coefficient solidarité | Agirc-Arrco | Messagerie agirc-arrco.fr | Idem |
| Réversion base | CNAV | Demande unique info-retraite.fr | CARSAT [adresse] |
| Réversion complémentaire | Agirc-Arrco | Formulaire agirc-arrco.fr | Idem |
| CSG incorrecte | CARSAT [région] | Messagerie lassuranceretraite.fr | CARSAT [adresse] |

### Pour les fonctionnaires d'État

| Anomalie | Organisme | Canal principal | Escalade |
|----------|-----------|----------------|----------|
| Trimestres / bonifications | SRE | Messagerie ensap.gouv.fr | SRE — 10 bd Gaston Doumergue 44964 Nantes Cedex 9 |
| Traitement indiciaire / calcul | SRE | Messagerie ensap.gouv.fr | Idem |
| RAFP | ERAFP | info-retraite.fr | ERAFP — 12 rue Portalis 75008 Paris |
| Réversion | SRE | Messagerie ensap.gouv.fr | Idem |

### Pour les fonctionnaires territoriaux/hospitaliers

| Anomalie | Organisme | Canal principal | Escalade |
|----------|-----------|----------------|----------|
| Trimestres / calcul | CNRACL | Messagerie cnracl.retraites.fr | CNRACL — rue du Vergne 33059 Bordeaux Cedex |
| RAFP | ERAFP | info-retraite.fr | Idem ci-dessus |
| Ircantec | Ircantec | info-retraite.fr | Ircantec — même adresse CDC |
| Réversion | CNRACL | Messagerie cnracl.retraites.fr | Idem |

### Pour les agriculteurs (MSA)

| Anomalie | Organisme | Canal principal | Escalade |
|----------|-----------|----------------|----------|
| Trimestres / calcul | MSA [département] | Messagerie msa.fr | MSA [adresse départementale] |
| Complémentaire MSA | MSA [département] | Messagerie msa.fr | Idem |
| Réversion | MSA [département] | Messagerie msa.fr | Idem |

### Pour les indépendants (ex-RSI)

| Anomalie | Organisme | Canal principal | Escalade |
|----------|-----------|----------------|----------|
| Trimestres / migration RSI | CARSAT [région] | Messagerie lassuranceretraite.fr | CARSAT [adresse] |
| Points RCI | CARSAT [région] | Messagerie lassuranceretraite.fr | Idem |

### Pour les professions libérales (CNAVPL)

| Anomalie | Organisme | Canal principal | Escalade |
|----------|-----------|----------------|----------|
| Points base CNAVPL | CNAVPL | info-retraite.fr | CNAVPL — 102 rue de Miromesnil 75008 Paris |
| Points complémentaire | Section (CIPAV, CARMF, etc.) | Site/messagerie de la section | Adresse de la section |
| Réversion | CNAVPL + section | info-retraite.fr | CNAVPL + section |

---

## 12. Cas spéciaux

### Polypensionnés (carrière mixte)
- Détecté par le formulaire ("Changement de régime en carrière ?") et par le RIS (plusieurs régimes)
- La Lura (Liquidation Unique des Régimes Alignés) s'applique depuis 2017 pour CNAV + MSA salariés + SSI → vérifier qu'elle a été correctement appliquée
- Chaque régime est vérifié séparément avec ses propres règles
- Les messages sont envoyés à chaque organisme concerné
- L'espace client regroupe toutes les démarches dans un tableau unique

### Indépendants ex-RSI
- Migration RSI → SSI → CNAV en 2020 : source majeure d'erreurs
- Points RCI (Retraite Complémentaire des Indépendants) convertis en euros → vérifier le taux de conversion
- Certains trimestres "tombés" pendant la migration
- Conjoints collaborateurs : droits spécifiques souvent méconnus

### Agriculteurs MSA
- Revalorisation des petites pensions agricoles (loi Chassaigne) → vérifier que le nouveau montant est appliqué
- Double affiliation possible : MSA salariés + MSA exploitants
- Périodes d'aide familial (avant installation) : souvent oubliées

### Professions libérales
- Base CNAVPL commune (régime par points) + complémentaire spécifique par section
- La CIPAV a été épinglée par la Cour des Comptes pour gestion défaillante → vivier d'erreurs
- Depuis 2018, les micro-entrepreneurs non listés vont au régime général (pas CIPAV)
- Avocats : régime autonome CNBF (base + complémentaire), pas CNAVPL
- Chaque section a sa propre valeur de point, ses propres majorations

### Cumul emploi-retraite
- Question posée dans le formulaire : "Activité professionnelle encore en cours ?"
- Depuis la réforme 2023 : le cumul emploi-retraite intégral crée de NOUVEAUX droits à pension
- Beaucoup de retraités ne le savent pas → opportunité de surcote ou de 2nde pension
- Vérification : le client cumule-t-il en intégral ou en plafonné ? A-t-il demandé ses nouveaux droits ?

### Rachat de trimestres
- Détecté si le client n'a pas le taux plein et a des années d'études supérieures ou années incomplètes
- Calcul du ROI : coût du rachat vs gain annuel de pension × espérance de vie
- On ne fait pas le rachat → on détecte l'opportunité et on guide vers le formulaire CERFA 51463
- Inclus dans le rapport comme "Optimisation suggérée"

---

## 13. Les freins client et les réponses

| Frein | Moment | Réponse RÉCUPÉO |
|-------|--------|-----------------|
| "Est-ce que ça vaut le coup ?" | Flash | Stats personnalisées convaincantes : "73% de chances d'erreur pour votre profil" |
| "C'est compliqué, je vais pas y arriver" | Entrée espace client | Tableau de mission clair, "30 minutes", "arrêtez et reprenez à tout moment" |
| "Je n'ai pas les identifiants de mes parents" | Accès FranceConnect | "Êtes-vous avec votre parent ?", guide récupération mot de passe, bouton "envoyer à un proche" |
| "Je ne trouve pas le document" | Collecte | 3 niveaux : guide screenshots → message pré-rédigé → "passez au suivant" |
| "J'ai uploadé, et maintenant ?" | Post-upload | Extraction en temps réel, résumé visible, diagnostic auto-déclenché |
| "7 anomalies mais je sais pas quoi faire" | Diagnostic serré | Paywall clair et évident : "Pour 40€, on vous dit exactement lesquelles et on prépare tout" |
| "J'ai peur d'envoyer les messages" | Post-49€ | "C'est votre droit", "Vous demandez simplement une vérification", "Si refus, on prépare la suite" |
| "La CARSAT n'a pas répondu" | Suivi | Relances automatiques + déblocage escalade, le client n'est jamais abandonné |
| "C'est trop long, je laisse tomber" | Toute étape | Relances email/SMS Brevo à chaque étape, compteur de pertes cumulées ("chaque mois = X€ perdus") |
| "Je ne suis pas sûr que c'est fiable" | Toute étape | Baromètre de fiabilité transparent, sources citées (Cour des Comptes, barèmes officiels), mentions légales |

---

## 14. Le couple — Pack à 79€

### Mécanique
- L'enfant crée UN compte et achète le Pack Couple (79€, ou 70€ si 9€ déjà payés)
- DEUX dossiers sont créés, liés par un `coupleId`
- Un sélecteur en haut de l'espace client : "Dossier de [Prénom 1] / Dossier de [Prénom 2]"
- Chaque dossier a sa propre checklist, son propre formulaire, son propre diagnostic, ses propres actions
- Les documents et formulaires sont indépendants (chaque parent a sa propre carrière)

### Cas particulier : réversion croisée
Si l'un des conjoints est décédé, on le détecte dans le formulaire du survivant et on bascule sur le parcours réversion pour cette anomalie spécifique. Le dossier du défunt sert alors de source pour le calcul de la réversion.

---

## 15. Données techniques pour ce parcours

### Collections Payload

```
retraitia-clients {
  email: string (unique)
  prenom: string
  nom: string
  anneeNaissance: number
  nbEnfants: number
  typeCarriere: enum
  parcours: 'retraite' | 'preretraite' | 'reversion'
  pourUnProche: boolean
  emailProche?: string
  coupleId?: string
  packDossierPaye: boolean
  packActionPaye: boolean
  packType: 'solo' | 'couple' | 'preretraite'
  stripeCustomerId?: string
  createdAt: date
}

retraitia-dossiers {
  clientId: ref → retraitia-clients
  documents: [{
    type: enum (ris, notification, agirc_arrco, mensualites, attestation_fiscale, avis_imposition, paiements_agirc, eig, rafp, cnracl, msa, rci, cnavpl_section)
    status: 'todo' | 'waiting' | 'uploaded' | 'extracted' | 'error'
    obligatoire: boolean
    fileId?: ref → uploads
    extractedData?: object
    messageSent?: boolean
    messageSentDate?: date
    uploadDate?: date
  }]
  formulaire: {
    blocA: object  // situation familiale
    blocB: object  // parcours professionnel
    blocC: object  // droits complémentaires
    completedAt?: date
  }
  regimesDetectes: enum[]
  precisionAudit: number (0-100)
}

retraitia-diagnostics {
  dossierId: ref → retraitia-dossiers
  anomalies: [{
    id: string
    niveau: 1-6
    type: enum
    label: string
    description: string
    impactMensuel: { min: number, max: number }
    impactCumule: { min: number, max: number }
    organisme: string
    canal: string
    fiabilite: 'haute' | 'moyenne' | 'basse'
    crossSell?: string
  }]
  scoreGlobal: 'platine' | 'or' | 'argent' | 'bronze'
  impactTotal: { min: number, max: number }
  nbAnomalies: number
  niveauxConcernes: number[]
  seuilGratuit: boolean
  createdAt: date
  updatedAt: date  // mis à jour si nouveau document uploadé
}

retraitia-suivi {
  diagnosticId: ref → retraitia-diagnostics
  anomalieId: string
  etapes: [{
    numero: number
    type: 'message' | 'lrar' | 'cra' | 'mediateur' | 'tribunal'
    status: 'locked' | 'todo' | 'done' | 'waiting' | 'refused'
    messageTemplate?: string
    messageSentDate?: date
    responseDate?: date
    responseType?: 'corrected' | 'refused' | 'docs_requested' | 'no_response'
    relanceDate?: date
    paiementId?: string  // si escalade payante
  }]
  resolved: boolean
  resolvedDate?: date
  gainConfirme?: number
}
```

### Routes API

```
POST /api/retraitia/flash           → mini-diagnostic (4 questions + email)
POST /api/retraitia/create-client   → après paiement 9€, création compte
POST /api/retraitia/extract         → upload + extraction OCR/Vision
POST /api/retraitia/formulaire      → sauvegarde formulaire complémentaire
POST /api/retraitia/diagnostic      → analyse croisée → diagnostic serré
POST /api/retraitia/report          → génération rapport PDF (après 49€)
POST /api/retraitia/messages        → génération messages par anomalie (après 49€)
POST /api/retraitia/check           → mise à jour check interactif (message envoyé, réponse reçue...)
POST /api/retraitia/escalade        → génération LRAR/CRA/médiateur (14,90€)
POST /api/retraitia/export-zip      → export dossier tribunal (29€)
GET  /api/retraitia/dossier/:id     → état complet du dossier (tableau de mission)
```

---

## 16. Métriques spécifiques à ce parcours

| Métrique | Cible |
|----------|-------|
| Taux complétion flash | > 80% |
| Taux conversion flash → 9€ | > 15% |
| Nb docs uploadés / dossier | > 4 |
| Temps moyen phase collecte | < 14 jours |
| Taux complétion formulaire | > 90% |
| Nb anomalies moyennes détectées | > 3 |
| Taux conversion diagnostic → 49€ | > 40% |
| Taux "message envoyé" (1er check) | > 70% |
| Taux anomalie corrigée | > 50% |
| Gain moyen confirmé / client | > 80€/mois |
| Délai moyen résolution | < 4 mois |

