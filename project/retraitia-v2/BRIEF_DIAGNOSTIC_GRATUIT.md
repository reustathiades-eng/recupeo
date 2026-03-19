# BRIEF_DIAGNOSTIC_GRATUIT — Flash viral + diagnostic serré + conversion

**Statut :** ✅ Validé
**Date :** 2026-03-18
**Dépendances :** ANOMALY_DETECTION (#9), PARCOURS_RETRAITE (#2), EMAILS_RELANCES (#14)

---

## 1. Vue d'ensemble

Ce brief couvre les deux outils de conversion de RETRAITIA :

1. **Le mini-diagnostic flash** (gratuit, avant les 9€) — outil d'acquisition virale
2. **Le diagnostic serré** (inclus dans les 9€, après upload) — levier de conversion vers les 49€

**Philosophie RÉCUPÉO :** assez pour prouver la compétence, jamais assez pour agir seul. Le client voit qu'on sait de quoi on parle. Mais pour agir, il doit payer.

---

## 2. Le mini-diagnostic flash

### 2.1 Objectif

Convertir un visiteur en lead qualifié (email collecté) puis en payant (9€). C'est la porte d'entrée de tout le funnel.

**Cible :** l'enfant de 40-55 ans qui tape "erreur pension retraite" sur Google, ou qui voit un lien partagé sur Facebook par un ami.

### 2.2 Page autonome /retraitia/test

Le flash vit sur une page autonome, accessible sans inscription, partageable :
- URL : `recupeo.fr/retraitia/test`
- Titre de la page : "Votre pension contient-elle une erreur ? Test gratuit en 30 secondes"
- Pas de header complexe, pas de menu — focus total sur le test
- Mobile-first (la majorité du trafic Facebook est mobile)

### 2.3 Les 4 questions

Présentées une par une (pas un formulaire monolithique), avec transition fluide.

**Question 1 — Le statut (routing)**
```
Quelle est votre situation ?

○ Je suis déjà à la retraite
○ Je prépare ma retraite
○ Mon conjoint est décédé
○ Je fais cette démarche pour un proche
```
→ Route vers le bon parcours. Le reste du flash est le même pour tous.

**Question 2 — L'année de naissance**
```
Quelle est l'année de naissance [du retraité] ?

[1940] ────────●──────── [1975]
        sélecteur ou input
```
→ Détermine la génération, les trimestres requis, l'âge légal.

**Question 3 — Le nombre d'enfants**
```
Combien d'enfants ont été élevés ?

[0] [1] [2] [3] [4] [5+]
```
→ Trimestres enfants, majoration 10%, probabilité d'anomalie.

**Question 4 — Le type de carrière**
```
Quel a été le secteur d'activité principal ?

○ Salarié du privé
○ Fonctionnaire (État, territorial ou hospitalier)
○ Agriculteur
○ Indépendant (artisan, commerçant, auto-entrepreneur)
○ Profession libérale
○ Carrière mixte (plusieurs secteurs)
○ Je ne sais pas
```
→ Régime, risques spécifiques.

### 2.4 La collecte d'email — entre les questions et le résultat

Après la question 4, AVANT de montrer le résultat :

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Votre analyse est prête.

Risque détecté : ██████████ ÉLEVÉ

Où souhaitez-vous recevoir votre résultat détaillé ?

Email : [_________________________________]

[📩 Recevoir mon résultat]

Vos données sont protégées. Pas de spam, pas d'abonnement.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Le teaser AVANT l'email :** on montre le niveau de risque (barre colorée + mot "ÉLEVÉ") pour motiver la saisie. Le client voit que l'analyse a tourné, que le résultat existe, il veut le détail → il donne son email.

**L'email est obligatoire.** Sans email, pas de résultat. C'est le deal.

### 2.5 Le résultat du flash

Affiché immédiatement après la saisie de l'email + envoyé par email Brevo.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 VOTRE RÉSULTAT — Test pension de retraite

[Prénom si fourni], née en 1955
3 enfants · Carrière mixte privé/fonctionnaire

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Niveau de risque : ÉLEVÉ
██████████░░ 

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pourquoi votre profil présente un risque élevé :

• Trimestres enfants — Vous avez 3 enfants. Les trimestres 
  maternité et éducation (jusqu'à 24 trimestres) sont absents
  du relevé de carrière officiel (RIS). C'est l'anomalie la 
  plus fréquente chez les femmes retraitées.

• Majoration enfants — Avec 3 enfants ou plus, votre pension 
  de base ET votre complémentaire doivent être majorées de 10%. 
  Cette majoration n'est pas toujours appliquée automatiquement.

• Carrière mixte — Vous avez travaillé dans plusieurs régimes.
  La coordination entre les régimes est une source fréquente 
  d'erreurs (trimestres comptés en double ou oubliés).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 En France :
• 1 pension sur 7 contient une erreur (Cour des Comptes)
• 75% des erreurs sont en défaveur des retraités
• Le manque à gagner moyen : 37€/mois

Pour votre profil, le risque est supérieur à la moyenne.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pour 9€, on vérifie votre pension en détail.

✓ Espace personnel sécurisé
✓ Guides pour récupérer vos documents
✓ Analyse automatique de votre dossier
✓ Diagnostic personnalisé basé sur VOS documents
✓ Ces 9€ sont déduits si vous poursuivez

[🔓 VÉRIFIER MA PENSION — 9€]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📤 Partagez ce test avec vos proches
[Facebook] [WhatsApp] [Email] [Copier le lien]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2.6 Le calcul du niveau de risque

On ne donne pas de pourcentage précis qu'on ne peut pas justifier. On utilise 4 niveaux de risque basés sur des heuristiques solides.

```
fonction calculerNiveauRisque(annéeNaissance, nbEnfants, typeCarrière, statut):

    score = 0
    facteurs = []

    // Facteur 1 : enfants (le plus gros facteur pour les femmes)
    si nbEnfants >= 3:
        score += 40
        facteurs.ajouter('trimestres_enfants')
        facteurs.ajouter('majoration_enfants')
    sinon si nbEnfants >= 1:
        score += 20
        facteurs.ajouter('trimestres_enfants')

    // Facteur 2 : carrière mixte (polypensionné)
    si typeCarrière == 'mixte':
        score += 25
        facteurs.ajouter('carrière_mixte')

    // Facteur 3 : indépendant (migration RSI)
    si typeCarrière == 'indépendant':
        score += 20
        facteurs.ajouter('migration_rsi')

    // Facteur 4 : génération (les plus anciens = plus de risques)
    si annéeNaissance < 1955:
        score += 15
        facteurs.ajouter('génération_ancienne')
    sinon si annéeNaissance < 1965:
        score += 10

    // Facteur 5 : fonctionnaire (bonifications complexes)
    si typeCarrière == 'fonctionnaire':
        score += 10
        facteurs.ajouter('bonifications_fp')

    // Facteur 6 : agriculteur (revalorisation Chassaigne)
    si typeCarrière == 'agriculteur':
        score += 15
        facteurs.ajouter('revalorisation_agricole')

    // Convertir en niveau
    si score >= 50: retourner { niveau: 'TRÈS ÉLEVÉ', facteurs }
    si score >= 30: retourner { niveau: 'ÉLEVÉ', facteurs }
    si score >= 15: retourner { niveau: 'MODÉRÉ', facteurs }
    retourner { niveau: 'FAIBLE', facteurs }
```

### 2.7 Les facteurs de risque — textes personnalisés

Pour chaque facteur détecté, un texte d'explication dans le résultat :

| Facteur | Texte |
|---------|-------|
| `trimestres_enfants` | "Vous avez [N] enfants. Les trimestres maternité et éducation (jusqu'à [N×8] trimestres) sont absents du relevé de carrière officiel. C'est l'anomalie la plus fréquente." |
| `majoration_enfants` | "Avec 3 enfants ou plus, votre pension de base ET votre complémentaire doivent être majorées de 10%. Cette majoration n'est pas toujours appliquée automatiquement." |
| `carrière_mixte` | "Vous avez travaillé dans plusieurs régimes. La coordination entre régimes est une source fréquente d'erreurs." |
| `migration_rsi` | "En tant qu'ancien indépendant, votre dossier a été transféré du RSI vers le régime général en 2020. Cette migration a généré de nombreuses erreurs." |
| `génération_ancienne` | "Les carrières antérieures à l'informatisation (avant ~1985) sont souvent mal enregistrées." |
| `bonifications_fp` | "Les bonifications de la fonction publique (enfants, services outre-mer, catégorie active) sont fréquemment mal comptabilisées." |
| `revalorisation_agricole` | "Les petites pensions agricoles ont été revalorisées récemment (loi Chassaigne). Beaucoup de retraités agricoles n'ont pas encore bénéficié de cette revalorisation." |

### 2.8 L'outil viral — le partage

Le résultat du flash inclut un bouton de partage. Le message partagé :

**Facebook / WhatsApp :**
"J'ai testé la pension de retraite de [mes parents / ma mère / mon père] avec RÉCUPÉO. Résultat : risque [ÉLEVÉ] d'erreur. 1 pension sur 7 contient une erreur selon la Cour des Comptes. Testez la vôtre gratuitement → recupeo.fr/retraitia/test"

**Le lien partagé** pointe vers la page /retraitia/test avec un paramètre de tracking (utm_source=share&utm_medium=facebook).

### 2.9 Distribution estimée des niveaux de risque

| Niveau | % estimé | Signification |
|--------|----------|---------------|
| TRÈS ÉLEVÉ | ~25% | 3+ enfants + carrière mixte ou ancienne |
| ÉLEVÉ | ~40% | Au moins 2 facteurs de risque |
| MODÉRÉ | ~25% | 1 facteur de risque |
| FAIBLE | ~10% | Homme, < 2 enfants, carrière simple privé, génération récente |

Même le niveau FAIBLE mène au CTA : "Même avec un risque faible, la vérification est recommandée. 1 pension sur 7 contient une erreur, tous profils confondus."

---

## 3. Le diagnostic serré (post-9€, post-upload)

### 3.1 Objectif

Convertir un client ayant payé 9€ en client payant 49€. Le client a uploadé ses documents, rempli le formulaire. L'analyse a tourné. On lui montre assez pour qu'il comprenne la valeur, pas assez pour qu'il agisse seul.

### 3.2 Conditions de déclenchement

Le diagnostic serré se génère automatiquement quand :
- ✅ Au moins RIS uploadé et extrait
- ✅ Au moins 1 document de comparaison (notification ou titre de pension)
- ✅ Formulaire complémentaire complété (les 3 blocs)

Si seul le RIS est uploadé (pas de notification) → diagnostic partiel :
"Nous avons analysé votre carrière. Pour comparer avec votre pension réellement versée, uploadez votre notification de pension."

### 3.3 Ce qu'on MONTRE (gratuit, inclus dans les 9€)

| Élément | Exemple | Pourquoi on le montre |
|---------|---------|----------------------|
| Nombre total d'anomalies | "7 anomalies détectées" | Quantifie le problème |
| Nombre de niveaux concernés | "sur 5 niveaux" | Montre l'ampleur |
| Score global | "BRONZE" | Visuel, mémorable |
| Types d'anomalies (nommés sans détails) | "Trimestres manquants", "Majoration enfants", "Points complémentaires"... | Donne envie de savoir le détail |
| Fourchette d'impact mensuel | "entre 150 et 400€/mois" | Chiffre le manque à gagner |
| Impact cumulé passé (fourchette) | "entre 14 400 et 38 400€ perdus depuis 2018" | Crée l'urgence |
| Impact cumulé futur (fourchette) | "entre 45 000 et 120 000€ sur le reste de votre retraite" | Projette dans l'avenir |
| Précision de l'audit | "75% — uploadez votre relevé Agirc-Arrco pour améliorer" | Incite à uploader plus |

### 3.4 Ce qu'on NE MONTRE PAS (réservé au payant)

| Élément caché | Pourquoi on le cache |
|---------------|---------------------|
| Détail de chaque anomalie | C'est la valeur principale du rapport |
| Montant précis par anomalie | Le client ne peut pas agir sans savoir combien |
| Quelle année, quel trimestre, quel point | Le détail actionnable |
| Messages pré-rédigés | C'est l'outil d'action |
| Guide d'action par anomalie | C'est le mode d'emploi |
| Recalcul complet (SAM, taux, proratisation) | C'est la preuve technique |
| Simulation scénarios (pré-retraités) | C'est le conseil à haute valeur |

### 3.5 Le wording exact du diagnostic serré

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 VOTRE DIAGNOSTIC RETRAITIA

Précision de l'audit : ████████░░ 75%
Basé sur 3 documents analysés + votre formulaire

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 7 anomalies détectées sur 5 niveaux

📊 Score de fiabilité de votre dossier : BRONZE
   Votre pension nécessite une vérification approfondie.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 IMPACT ESTIMÉ

   Manque à gagner mensuel :
   entre 150€ et 400€/mois

   Déjà perdu depuis votre départ (2018) :
   entre 14 400€ et 38 400€

   Manque à gagner futur si rien ne change :
   entre 45 000€ et 120 000€

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 ANOMALIES DÉTECTÉES

   Retraite de base
   • Trimestres potentiellement manquants
   • Majoration enfants à vérifier

   Retraite complémentaire
   • Points Agirc-Arrco à vérifier

   Droits sociaux
   • Éligibilité à une aide non réclamée

   Prélèvements sociaux
   • Taux de CSG à vérifier

   → Montants exacts et détails réservés au rapport complet

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[🔓 OBTENIR MON RAPPORT COMPLET — 40€]
   (9€ déjà déduits de votre Pack Dossier)

   Ce que vous débloquez :
   ✓ Montant exact de chaque anomalie
   ✓ Recalcul détaillé de votre pension
   ✓ Messages prêts à envoyer à chaque organisme
   ✓ Guide d'action étape par étape
   ✓ Suivi complet de vos démarches
   ✓ 1er envoi recommandé inclus si nécessaire

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3.6 Variantes par parcours

**Pré-retraité :**
- Pas de "manque à gagner mensuel" (pas encore de pension)
- À la place : "Impact sur votre future pension : entre -80 et -200€/mois"
- Ajout : "Rachat de trimestres potentiellement rentable" + "Date de départ à optimiser"
- CTA : "OBTENIR MON RAPPORT — 30€" (39€ - 9€)

**Réversion :**
- Ton sobre, pas de compteur de pertes agressif
- "Vous avez potentiellement droit à une pension de réversion"
- "Estimation : entre 500 et 900€/mois"
- "[N] régimes identifiés → [N] demandes à effectuer"
- CTA : "OBTENIR MON RAPPORT — 40€"

### 3.7 Le seuil gratuit (< 30€/mois)

Si l'impact total de toutes les anomalies (erreurs + oublis, hors opportunités cross-sell) est estimé < 30€/mois :

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ BONNE NOUVELLE

Votre pension semble globalement correcte.

Nous avons détecté [N] point(s) mineur(s) avec un
impact estimé à moins de 30€/mois.

Voici le détail gratuitement :

[Rapport complet affiché — pas de paywall]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Nous avons aussi détecté des opportunités :

• Exonération de taxe foncière potentielle
  → [Vérifier avec MATAXE]

• Crédit d'impôt emploi à domicile
  → [Vérifier avec MONIMPOT]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Le rapport est offert. Les 9€ ne sont PAS remboursés (le client a payé pour le service de collecte + les guides). Le cross-sell reste actif.

---

## 4. Email Brevo — Résultat du flash

### Email envoyé immédiatement après le flash

**Objet :** "Votre résultat RÉCUPÉO : risque [NIVEAU] sur votre pension"

**Contenu :**
```
Bonjour [Prénom si connu],

Voici votre résultat de test pension RÉCUPÉO :

Profil : [année naissance] · [N] enfants · Carrière [type]
Risque : [NIVEAU]

[Récap des facteurs de risque — mêmes textes que sur la page]

Pour 9€, vérifiez votre pension en détail :
→ [LIEN CTA]

Ces 9€ sont déduits si vous poursuivez l'analyse.

L'équipe RÉCUPÉO

---
📤 Partagez ce test avec vos proches :
→ recupeo.fr/retraitia/test
```

### Séquence de relance si pas de paiement

| Délai | Objet email | Angle |
|-------|-------------|-------|
| J+1 | "Votre pension contient peut-être une erreur — votre test est en attente" | Rappel du résultat |
| J+3 | "1 pension sur 7 est mal calculée. Vérifiez la vôtre pour 9€" | Argument d'autorité (Cour des Comptes) |
| J+7 | "Chaque mois qui passe, c'est de l'argent perdu" | Urgence (hémorragie mensuelle) |
| J+14 | "Un proche peut vérifier pour vous — transmettez-lui ce lien" | Angle "enfant aidant" |

Après J+14 : arrêt des relances flash. Le lead reste dans la base pour des campagnes futures.

---

## 5. Email Brevo — Diagnostic serré (post-upload)

### Email envoyé quand le diagnostic est prêt

**Objet :** "Votre diagnostic RETRAITIA : [N] anomalies détectées"

**Contenu :**
```
Bonjour [Prénom],

Votre diagnostic RETRAITIA est prêt.

━━━━━━━━━━━━━━━━━━━━
🔴 [N] anomalies détectées
💰 Impact estimé : entre [min] et [max]€/mois
📊 Score : [BRONZE/ARGENT/OR/PLATINE]
━━━━━━━━━━━━━━━━━━━━

Connectez-vous pour voir le détail :
→ [LIEN ESPACE CLIENT]

Pour 40€ (9€ déjà déduits), débloquez votre rapport 
complet avec les montants exacts et les messages 
prêts à envoyer à chaque organisme.

L'équipe RÉCUPÉO
```

---

## 6. Mise à jour dynamique du diagnostic

### Quand le client uploade un nouveau document

Si le client uploade un document optionnel après avoir vu le diagnostic serré :
1. L'extraction tourne automatiquement
2. L'analyse se relance
3. Le diagnostic se met à jour
4. La précision monte
5. De nouvelles anomalies peuvent apparaître
6. Le client est notifié : "Votre diagnostic a été mis à jour — [N] anomalies (était [N-1])"

### Quand le client modifie le formulaire

Si le client corrige une réponse du formulaire (ex : il avait oublié un enfant) :
1. L'analyse se relance
2. Le diagnostic se met à jour
3. Notification au client

### Impact sur la conversion

Chaque mise à jour qui AUGMENTE le nombre d'anomalies ou l'impact est un levier de conversion supplémentaire. Le client voit le diagnostic empirer (en fait s'affiner) → il est encore plus motivé à payer.

---

## 7. Données techniques

### Collection flash dans Payload

```typescript
interface RetraitiaFlash {
  email: string
  statut: 'retraite' | 'preretraite' | 'reversion' | 'proche'
  anneeNaissance: number
  nbEnfants: number
  typeCarriere: string
  niveauRisque: 'FAIBLE' | 'MODERE' | 'ELEVE' | 'TRES_ELEVE'
  scoreRisque: number
  facteurs: string[]
  aPayé9: boolean
  dateFlash: Date
  sourceUtm?: { source: string, medium: string, campaign: string }
}
```

### Routes API

```
POST /api/retraitia/flash
  Input: { statut, anneeNaissance, nbEnfants, typeCarriere, email }
  → Calcul du score de risque
  → Sauvegarde du flash
  → Envoi email Brevo
  Output: { niveauRisque, facteurs[], texteResultat }

GET /api/retraitia/diagnostic-serre/:dossierId
  → Récupère le diagnostic (anomalies scorées)
  → Filtre : types d'anomalies, fourchettes, score global
  → Ne renvoie PAS les détails (montants exacts, messages)
  Output: {
    nbAnomalies: number,
    niveauxConcernés: number[],
    scoreGlobal: string,
    impactMensuel: { min, max },
    impactCumuléPassé: { min, max },
    impactCumuléFutur: { min, max },
    typesAnomalies: string[],  // labels sans détails
    précisionAudit: number,
    seuilGratuit: boolean
  }
```

### Tracking analytics (GA4)

| Événement | Quand | Données |
|-----------|-------|---------|
| `retraitia_flash_start` | Le visiteur commence le flash | statut |
| `retraitia_flash_complete` | Les 4 questions répondues | profil complet |
| `retraitia_flash_email` | Email saisi | niveauRisque |
| `retraitia_flash_share` | Le résultat est partagé | canal (fb/wa/email) |
| `retraitia_flash_to_9` | Clic sur CTA 9€ | niveauRisque, facteurs |
| `retraitia_9_paid` | Paiement 9€ confirmé | — |
| `retraitia_diagnostic_shown` | Diagnostic serré affiché | nbAnomalies, scoreGlobal, impact |
| `retraitia_diagnostic_to_49` | Clic sur CTA 49€ | nbAnomalies, impact |
| `retraitia_49_paid` | Paiement 49€ confirmé | — |
| `retraitia_seuil_gratuit` | Diagnostic offert (< 30€/mois) | impact |

---

## 8. Métriques

### Flash

| Métrique | Cible |
|----------|-------|
| Taux complétion flash (4 questions répondues) | > 80% |
| Taux saisie email | > 60% |
| Taux partage du résultat | > 10% |
| Distribution risque ÉLEVÉ ou TRÈS ÉLEVÉ | ~65% |
| Taux conversion flash → 9€ (immédiat) | > 8% |
| Taux conversion flash → 9€ (avec relances J+14) | > 15% |

### Diagnostic serré

| Métrique | Cible |
|----------|-------|
| Taux affichage diagnostic (doc minimum uploadé) | > 75% des payants 9€ |
| Nb moyen d'anomalies affichées | > 3 |
| Taux conversion diagnostic → 49€ | > 40% |
| Taux seuil gratuit (rapport offert) | ~10% |
| Taux upload document supplémentaire après diagnostic | > 20% |

