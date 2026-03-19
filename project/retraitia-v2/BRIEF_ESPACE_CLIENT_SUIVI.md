# BRIEF_ESPACE_CLIENT_SUIVI — Architecture UX de l'espace client

**Statut :** ✅ Validé
**Date :** 2026-03-18
**Dépendances :** PARCOURS_RETRAITE (#2), ONBOARDING (#5), COLLECTE (#6), MESSAGES (#12)

---

## 1. Vue d'ensemble

Ce brief est le **plan d'architecte de l'interface** de l'espace client RETRAITIA. Il décrit la navigation, les composants réutilisables, les états et transitions, la gestion couple, l'export tribunal, le cross-sell, les notifications, et le responsive.

**Intégration :** RETRAITIA s'intègre dans le /mon-espace existant de RÉCUPÉO. Le client a un seul compte, et chaque brique (MATAXE, MONIMPOT, RETRAITIA) est une section. S'il a payé pour plusieurs briques, il voit tout dans le même espace.

**Principe UX :** une seule page principale (tableau de bord) qui s'enrichit au fil du parcours. Pas de rupture entre les phases. La collecte reste visible (compressée) quand les démarches commencent.

---

## 2. Navigation — Architecture des pages

```
/mon-espace/
  ├── /                          → Dashboard global RÉCUPÉO (toutes les briques)
  ├── /retraitia/                → Tableau de bord RETRAITIA (la page principale)
  ├── /retraitia/documents       → Checklist documents + upload
  ├── /retraitia/informations    → Formulaire complémentaire (modifiable)
  ├── /retraitia/diagnostic      → Diagnostic serré (pré-49€) OU rapport interactif (post-49€)
  ├── /retraitia/demarches       → Vue d'ensemble des démarches (post-49€)
  ├── /retraitia/demarches/:id   → Détail + timeline d'une anomalie
  ├── /retraitia/rapport         → PDF téléchargeable (post-49€)
  ├── /retraitia/tribunal        → Export ZIP (post-29€ Pack Tribunal)
  ├── /retraitia/parametres      → Profil, email, proche aidant
  ├── /mataxe/                   → (si le client a aussi MATAXE)
  ├── /monimpot/                 → (si le client a aussi MONIMPOT)
  └── /parametres                → Compte global (email, mot de passe, RGPD)
```

### Navigation principale dans /retraitia/

```
┌─────────────────────────────────────────────────────┐
│ RÉCUPÉO   Mon espace ▼    [👨‍👩‍👧 Proche]  [🔔 2]  [⚙️] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  RETRAITIA   [Tableau de bord] [Documents]          │
│              [Informations] [Diagnostic]            │
│              [Démarches] [Rapport]                  │
│                                                     │
│  ─── Sélecteur couple (si applicable) ───           │
│  [👩 Marie Dupont ▼] | [👨 Jean Dupont]             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Les onglets "Démarches" et "Rapport" sont grisés / verrouillés tant que le Pack Action (49€) n'est pas payé.

---

## 3. Le tableau de bord — La page principale

### 3.1 Structure : une page qui s'enrichit

Le tableau de bord est la page d'accueil de l'espace RETRAITIA. Il montre TOUT d'un coup : ce qui est fait, ce qui reste à faire, l'objectif. Il évolue au fil du parcours sans rupture.

**Avant le diagnostic (collecte en cours) :**
```
┌─────────────────────────────────────────────────────┐
│  VOTRE DOSSIER RETRAITIA — Marie Dupont             │
│  Née en 1955 · 3 enfants · Carrière mixte           │
│                                                     │
│  Progression : ██████░░░░ 8/14 ✅                    │
│  Objectif : tout passer au vert ✅                   │
│                                                     │
│  ┌── ACCÈS ──────────────────────────────────┐      │
│  │ ✅ FranceConnect · Connecté via Ameli      │      │
│  └────────────────────────────────────────────┘      │
│                                                     │
│  ┌── DOCUMENTS ──────────────────────────────┐      │
│  │ ✅ RIS · 42 années · 168 trim.            │      │
│  │ ✅ Notification · 825€/mois               │      │
│  │ 🔴 Relevé Agirc-Arrco                     │      │
│  │ ⚪ Relevé mensualités                     │      │
│  │ ⚪ Avis d'imposition                      │      │
│  └────────────────────────────────────────────┘      │
│                                                     │
│  ┌── INFORMATIONS ───────────────────────────┐      │
│  │ ✅ Situation familiale                     │      │
│  │ ✅ Parcours professionnel                  │      │
│  │ ✅ Droits complémentaires                  │      │
│  └────────────────────────────────────────────┘      │
│                                                     │
│  ┌── DIAGNOSTIC ─────────────────────────────┐      │
│  │ ⬛ En attente du relevé Agirc-Arrco        │      │
│  │    (ou lancez l'analyse avec les docs       │      │
│  │     disponibles)                            │      │
│  └────────────────────────────────────────────┘      │
│                                                     │
│  [👨‍👩‍👧 Un proche peut m'aider]                        │
└─────────────────────────────────────────────────────┘
```

**Après le diagnostic serré (conversion vers 49€) :**
La section DIAGNOSTIC se remplit avec le résultat + le CTA 49€.

**Après paiement des 49€ (suivi des démarches) :**
Les sections collecte se compressent (un résumé), et la section DÉMARCHES apparaît :

```
┌─────────────────────────────────────────────────────┐
│  VOTRE DOSSIER RETRAITIA — Marie Dupont             │
│                                                     │
│  ┌── COLLECTE ─────── tout ✅ ── [voir détail ▼] ─┐ │
│  │ 5 documents · 16 questions · Audit 85%          │ │
│  └─────────────────────────────────────────────────┘ │
│                                                     │
│  ┌── VOS DÉMARCHES ─────────────────────────────┐   │
│  │                                               │   │
│  │ Progression : ██░░░░░░░░ 1/7 anomalies ✅     │   │
│  │                                               │   │
│  │ 🔴 #1 Majoration enfants base    +147€/mois  │   │
│  │    → CARSAT · Message à envoyer               │   │
│  │                                               │   │
│  │ 🟡 #2 Majoration enfants AA       +42€/mois  │   │
│  │    → Agirc-Arrco · En attente (J+15)          │   │
│  │                                               │   │
│  │ ✅ #3 Service militaire            +38€/mois  │   │
│  │    → Corrigé le 15/05                         │   │
│  │                                               │   │
│  │ 🔴 #4 Points Agirc-Arrco 2003     +28€/mois  │   │
│  │    → Agirc-Arrco · Message à envoyer          │   │
│  │                                               │   │
│  │ 🟡 #5 Taux CSG                     +35€/mois │   │
│  │    → Besoin avis d'imposition [⬆️ Uploader]    │   │
│  │                                               │   │
│  │ 💡 #6 Exonération taxe foncière   ~800€/an   │   │
│  │    → [Vérifier avec MATAXE]                   │   │
│  │                                               │   │
│  │ 💡 #7 Crédit d'impôt             ~1 200€/an  │   │
│  │    → [Vérifier avec MONIMPOT]                 │   │
│  │                                               │   │
│  └───────────────────────────────────────────────┘   │
│                                                     │
│  [📄 Télécharger le rapport PDF]                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3.2 La barre de progression

Toujours visible en haut. Évolue au fil du parcours.

**Phase collecte :** "8/14 ✅" (accès + docs + formulaire)
**Phase démarches :** "1/7 anomalies résolues ✅"

La barre est un composant ProgressBar réutilisable :
```typescript
<ProgressBar 
  current={8} 
  total={14} 
  label="Progression" 
  sublabel="Objectif : tout passer au vert ✅"
/>
```

---

## 4. Composants réutilisables

### 4.1 StatusCard — Carte d'item avec état

Le composant principal du tableau de mission. Utilisé pour chaque document, chaque bloc du formulaire, chaque anomalie.

```typescript
interface StatusCardProps {
  état: '🔴' | '🟡' | '✅' | '⚪' | '⬛'
  titre: string
  sousTitre?: string           // ex: "42 années · 168 trim."
  tempsEstimé?: string         // ex: "⏱ 5 min"
  obligatoire: boolean
  actions: Action[]            // boutons : Guide, Uploader, Copier, etc.
  onClick?: () => void         // navigation vers le détail
}
```

**Rendu visuel par état :**

| État | Couleur fond | Icône | Comportement |
|------|-------------|-------|-------------|
| 🔴 À faire | Rouge pâle `#FEF2F2` | Cercle rouge | Actions visibles (Guide, Uploader) |
| 🟡 En attente | Jaune pâle `#FFFBEB` | Horloge orange | Compteur de délai, check "réponse reçue" |
| ✅ Fait | Vert pâle `#F0FDF4` | Check vert | Résumé des données, bouton "voir détail" |
| ⚪ Optionnel | Gris pâle `#F9FAFB` | Cercle vide gris | Actions discrètes |
| ⬛ Verrouillé | Gris moyen `#F3F4F6` | Cadenas | Aucune action, texte "Se débloque quand..." |

### 4.2 CheckInteractif — Le check que le client coche

Le composant clé de l'interaction. Quand le client coche, ça déclenche une logique côté serveur.

```typescript
interface CheckInteractifProps {
  label: string                // "J'ai envoyé le message"
  checked: boolean
  onCheck: () => Promise<void> // appel API côté serveur
  conséquence?: string         // "→ Compteur de 2 mois lancé"
  confirmationRequise?: boolean // demander confirmation avant de cocher
}
```

**Exemples de checks et leurs conséquences :**

| Check | Ce qui se passe côté serveur |
|-------|------------------------------|
| "J'ai accès à FranceConnect" | Débloque la section Documents |
| "J'ai envoyé le message à la CARSAT" | Démarre compteur 2 mois, programme relance J+60 |
| "J'ai reçu une réponse" | Affiche les options : corrigé / refus / justificatifs demandés |
| "Anomalie corrigée" | Passe l'anomalie en ✅, calcule le gain confirmé |
| "La CARSAT refuse" | Débloque l'étape suivante (LRAR) |
| "Pas de réponse après 2 mois" | Débloque l'escalade |

**Confirmation :** pour les checks irréversibles (anomalie corrigée, refus), on demande confirmation : "Confirmez-vous que la CARSAT a corrigé cette anomalie ?"

### 4.3 TimelineAnomalie — Frise d'escalade

Le composant qui affiche les étapes d'escalade pour une anomalie.

```typescript
interface TimelineAnomalieProps {
  anomalieId: string
  étapes: [{
    numero: number
    label: string            // "Message envoyé", "Réponse CARSAT", "LRAR"...
    état: '🔴' | '🟡' | '✅' | '⬛'
    date?: Date
    détail?: string
    actions?: Action[]
  }]
}
```

**Rendu visuel :**
```
  ✅ ── 🟡 ── ⬛ ── ⬛ ── ⬛ ── ⬛
  │      │     │     │     │     │
  Msg   Rép.  LRAR  CRA  Méd.  Trib.
  18/03  ⏱28j
```

La timeline est verticale sur mobile, horizontale sur desktop.

### 4.4 CompteurDelai — Compte à rebours

Affiche le temps restant avant une échéance (relance, expiration de délai).

```typescript
interface CompteurDelaiProps {
  dateEcheance: Date
  label: string              // "Relance prévue dans"
  urgence: 'normal' | 'bientot' | 'dépassé'
}
```

**Rendu :**
- Normal (> 15 jours) : "Relance prévue dans 28 jours" (texte gris)
- Bientôt (< 15 jours) : "Relance dans 5 jours" (texte orange)
- Dépassé : "Délai dépassé — action recommandée" (texte rouge)

### 4.5 MessageCopiable — Bloc message avec bouton Copier

```typescript
interface MessageCopiableProps {
  objet: string
  corps: string
  canal: string              // "Messagerie lassuranceretraite.fr"
  guideUrl: string           // lien vers le guide "où coller ce message"
  onCopied: () => void       // tracking + mise à jour check
}
```

**Rendu :**
```
┌─────────────────────────────────────────────┐
│ 📋 Message prêt à envoyer                   │
│                                             │
│ Canal : Messagerie lassuranceretraite.fr     │
│ Objet : Demande de majoration pour enfants   │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Bonjour,                                │ │
│ │                                         │ │
│ │ J'ai élevé 3 enfants pendant au moins   │ │
│ │ 9 ans avant leur 16ème anniversaire...  │ │
│ │ [texte complet]                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [📋 Copier le message] [📖 Où coller ?]     │
│                                             │
│ ☐ J'ai envoyé le message                   │
└─────────────────────────────────────────────┘
```

### 4.6 BadgeConfiance — Niveau de confiance

```typescript
interface BadgeConfianceProps {
  niveau: 'CERTAIN' | 'HAUTE_CONFIANCE' | 'ESTIMATION'
}
```

**Rendu :**
- 🟢 VÉRIFIÉ (vert, fond vert pâle)
- 🔵 CALCULÉ (bleu, fond bleu pâle)
- 🟡 ESTIMÉ (jaune, fond jaune pâle)

---

## 5. Page Documents (/retraitia/documents)

Vue détaillée de la checklist documents. Chaque document est une StatusCard expandable.

```
┌─────────────────────────────────────────────────────┐
│  📄 VOS DOCUMENTS                                    │
│                                                     │
│  Minimum requis : 3 documents                       │
│  Uploadés : 2/3 obligatoires + 1 optionnel          │
│                                                     │
│  ┌── OBLIGATOIRES ──────────────────────────────┐   │
│  │                                               │   │
│  │ ✅ Relevé de carrière (RIS)       [▼ Détail]  │   │
│  │    Uploadé le 18/03 · 42 années · 168 trim.   │   │
│  │    Confiance extraction : 95%                 │   │
│  │                                               │   │
│  │ ✅ Notification de pension        [▼ Détail]  │   │
│  │    Uploadée le 18/03 · 825€/mois              │   │
│  │                                               │   │
│  │ 🔴 Relevé Agirc-Arrco                        │   │
│  │    [📖 Guide] [⬆️ Uploader] [❓ Introuvable]  │   │
│  │                                               │   │
│  └───────────────────────────────────────────────┘   │
│                                                     │
│  ┌── OPTIONNELS (améliorent la précision) ──────┐   │
│  │                                               │   │
│  │ ✅ Avis d'imposition              [▼ Détail]  │   │
│  │    RFR : 18 500€ · 1,5 parts                  │   │
│  │                                               │   │
│  │ ⚪ Relevé de mensualités                      │   │
│  │    [📖 Guide] [⬆️ Uploader]                    │   │
│  │                                               │   │
│  │ ⚪ Attestation fiscale                        │   │
│  │    [📖 Guide] [⬆️ Uploader]                    │   │
│  │                                               │   │
│  │ ⚪ Paiements Agirc-Arrco                      │   │
│  │    [📖 Guide] [⬆️ Uploader]                    │   │
│  │                                               │   │
│  └───────────────────────────────────────────────┘   │
│                                                     │
│  🔍 Précision de l'audit : ████████░░ 80%           │
│     Uploadez le relevé Agirc-Arrco (+12%)           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Détail expandé d'un document uploadé

Quand le client clique "Détail" :
```
┌─────────────────────────────────────────────────────┐
│ ✅ Relevé de carrière (RIS)                          │
│                                                     │
│ Uploadé le 18/03/2026 · PDF numérique · 8 pages     │
│ Extraction : regex (0 appel API) · Confiance : 95%   │
│                                                     │
│ Résumé :                                            │
│ • Période : 1975 — 2017                              │
│ • Années de carrière : 42                            │
│ • Trimestres validés : 168                           │
│ • Régimes : CNAV (1975-1994), CNRACL (1995-2017)    │
│ • Salaire max : 28 450€ (1992)                       │
│                                                     │
│ [👁️ Voir le document] [🔄 Remplacer]                 │
│                                                     │
│ [▲ Réduire]                                          │
└─────────────────────────────────────────────────────┘
```

---

## 6. Page Informations (/retraitia/informations)

Le formulaire complémentaire. Modifiable à tout moment (si le client se rend compte qu'il a oublié un enfant, par exemple).

```
┌─────────────────────────────────────────────────────┐
│  📝 VOS INFORMATIONS                                 │
│                                                     │
│  Ces informations complètent ce que vos documents    │
│  ne disent pas. Vous pouvez les modifier à tout      │
│  moment — votre diagnostic sera mis à jour.          │
│                                                     │
│  ┌── Situation familiale ─── ✅ Complété ────────┐  │
│  │ 3 enfants · Conjoint vivant · Non ancien comb. │  │
│  │ [✏️ Modifier]                                   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                     │
│  ┌── Parcours professionnel ─── ✅ Complété ─────┐  │
│  │ Service militaire 12 mois · Chômage 2008 ·     │  │
│  │ Pas de périodes à l'étranger                    │  │
│  │ [✏️ Modifier]                                   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                     │
│  ┌── Droits complémentaires ─── ✅ Complété ─────┐  │
│  │ Pension déclarée : 825€ base + 450€ compl.      │  │
│  │ Propriétaire · Emploi à domicile · Mutuelle 65€ │  │
│  │ [✏️ Modifier]                                   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                     │
│  ⚠️ Si vous modifiez vos informations, votre        │
│  diagnostic sera automatiquement mis à jour.         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 7. Page Démarches (/retraitia/demarches) — Post-49€

### 7.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────┐
│  📋 VOS DÉMARCHES                                    │
│                                                     │
│  Progression : ██████░░░░ 2/5 résolues ✅            │
│  Gain confirmé : 38€/mois (service militaire)        │
│  Gain en attente : ~189€/mois                        │
│                                                     │
│  Trier par : [Impact ▼] [Statut] [Organisme]        │
│                                                     │
│  ┌── ANOMALIES À TRAITER ────────────────────────┐  │
│  │                                                │  │
│  │ 🔴 Majoration enfants base         +147€/mois │  │
│  │    CARSAT · Message à envoyer                  │  │
│  │    [Traiter →]                                 │  │
│  │                                                │  │
│  │ 🔴 Points Agirc-Arrco 2003          +28€/mois │  │
│  │    Agirc-Arrco · Message à envoyer             │  │
│  │    [Traiter →]                                 │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                     │
│  ┌── EN ATTENTE DE RÉPONSE ──────────────────────┐  │
│  │                                                │  │
│  │ 🟡 Majoration enfants AA            +42€/mois │  │
│  │    Agirc-Arrco · Envoyé le 18/03 · ⏱ 43 jours │  │
│  │    [Voir détail →]                             │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                     │
│  ┌── RÉSOLUES ───────────────────────────────────┐  │
│  │                                                │  │
│  │ ✅ Service militaire                 +38€/mois │  │
│  │    Corrigé le 15/05/2026                       │  │
│  │                                                │  │
│  │ ✅ Taux CSG                          +35€/mois │  │
│  │    Corrigé le 22/05/2026                       │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                     │
│  ┌── OPPORTUNITÉS ───────────────────────────────┐  │
│  │                                                │  │
│  │ 💡 Exonération taxe foncière        ~800€/an  │  │
│  │    [Vérifier avec MATAXE →]                    │  │
│  │                                                │  │
│  │ 💡 Crédit d'impôt emploi domicile  ~1 200€/an │  │
│  │    [Vérifier avec MONIMPOT →]                  │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 7.2 Détail d'une anomalie (/retraitia/demarches/:id)

```
┌─────────────────────────────────────────────────────┐
│  ← Retour aux démarches                             │
│                                                     │
│  🔴 ANOMALIE #1 — Majoration enfants base           │
│  Niveau 1 · Retraite de base · 🟢 VÉRIFIÉ           │
│                                                     │
│  Impact : +147€/mois · +1 764€/an                   │
│  Déjà perdu depuis 2018 : ~12 348€                   │
│  Organisme : CARSAT Rhône-Alpes                      │
│                                                     │
│  ════════════════════════════════════════════════════ │
│                                                     │
│  TIMELINE                                            │
│                                                     │
│  🔴 ── ⬛ ── ⬛ ── ⬛ ── ⬛ ── ⬛                     │
│  │      │     │     │     │     │                    │
│  Msg   Rép.  LRAR  CRA  Méd.  Trib.                 │
│                                                     │
│  ════════════════════════════════════════════════════ │
│                                                     │
│  ÉTAPE 1 — Envoyer le message              🔴       │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ 📋 Message prêt à envoyer                   │    │
│  │                                             │    │
│  │ Canal : Messagerie lassuranceretraite.fr     │    │
│  │ Objet : Demande d'application de la          │    │
│  │         majoration pour enfants              │    │
│  │                                             │    │
│  │ [texte complet du message]                  │    │
│  │                                             │    │
│  │ [📋 Copier] [📖 Où envoyer ce message ?]    │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  Pièce à joindre : livret de famille (copie)         │
│                                                     │
│  ☐ J'ai envoyé le message                           │
│                                                     │
│  ──────────────────────────────────────────────────  │
│                                                     │
│  ÉTAPE 2 — Réponse de la CARSAT            ⬛       │
│  Se débloque quand l'étape 1 est complétée           │
│  Délai légal : 2 mois                               │
│                                                     │
│  ──────────────────────────────────────────────────  │
│                                                     │
│  ÉTAPE 3 — LRAR de contestation            ⬛       │
│  Se débloque si pas de réponse ou refus              │
│  Coût : 14,90€                                      │
│                                                     │
│  ──────────────────────────────────────────────────  │
│                                                     │
│  ÉTAPE 4 — Saisine CRA                    ⬛       │
│  ÉTAPE 5 — Médiateur                      ⬛       │
│  ÉTAPE 6 — Tribunal                       ⬛       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 7.3 Quand le client coche un check — transitions d'état

```
Client coche "J'ai envoyé le message"
    │
    ├── Confirmation : "Confirmez-vous avoir envoyé le message ?"
    │
    ├── SI confirmé :
    │   ├── Étape 1 → ✅ (date enregistrée)
    │   ├── Étape 2 → 🟡 (débloquée, compteur 2 mois lancé)
    │   ├── Relance email programmée à J+60
    │   ├── Notification in-app : "Message envoyé ✅ — réponse attendue sous 2 mois"
    │   └── Progression tableau de bord mise à jour
    │
    └── API call : POST /api/retraitia/check
        { dossierId, anomalieId, étape: 1, action: 'done' }
```

```
Client coche "J'ai reçu une réponse"
    │
    ├── Options affichées :
    │   ○ ✅ Anomalie corrigée
    │   ○ ❌ La caisse refuse
    │   ○ 📎 Ils demandent des justificatifs
    │   ○ 🔇 Pas de réponse (rappel)
    │
    ├── SI "Anomalie corrigée" :
    │   ├── Anomalie → ✅
    │   ├── Gain confirmé enregistré
    │   ├── Email : "Bonne nouvelle ! Gain de +147€/mois confirmé"
    │   └── Progression mise à jour
    │
    ├── SI "La caisse refuse" :
    │   ├── Étape 2 → ❌
    │   ├── Étape 3 (LRAR) → 🔴 (débloquée)
    │   ├── Message LRAR généré automatiquement
    │   └── Notification : "La caisse a refusé. Voici la suite."
    │
    ├── SI "Justificatifs demandés" :
    │   ├── Upload de pièces jointes débloqué
    │   ├── LRAR complémentaire préparée
    │   └── Notification : "Uploadez vos justificatifs"
    │
    └── SI "Pas de réponse" :
        ├── Relance proposée (message de relance pré-rédigé)
        └── SI déjà relancé → escalade LRAR débloquée
```

---

## 8. Gestion couple — Pack 79€

### 8.1 Sélecteur de dossier

Quand le client a un Pack Couple, un sélecteur apparaît en haut de l'espace :

```
┌─────────────────────────────────────────────────────┐
│  PACK COUPLE                                         │
│  [👩 Marie Dupont · 5/14 ✅] | [👨 Jean Dupont · 3/14 ✅] │
└─────────────────────────────────────────────────────┘
```

Le clic bascule entre les deux dossiers. Chaque dossier est totalement indépendant.

### 8.2 Vue résumé couple (sur le tableau de bord global)

Avant de basculer dans un dossier, le client voit un résumé des deux :

```
┌─────────────────────────────────────────────────────┐
│  VOS DOSSIERS RETRAITIA — Pack Couple                │
│                                                     │
│  ┌── 👩 Marie Dupont ──────────────────────────┐    │
│  │ Progression : ██████████ 14/14 ✅             │    │
│  │ Diagnostic : 7 anomalies · BRONZE             │    │
│  │ Démarches : 2/7 résolues                      │    │
│  │ [Ouvrir le dossier →]                         │    │
│  └────────────────────────────────────────────────┘    │
│                                                     │
│  ┌── 👨 Jean Dupont ──────────────────────────┐    │
│  │ Progression : ████████░░ 10/14 ✅             │    │
│  │ Diagnostic : en attente de 2 documents        │    │
│  │ [Ouvrir le dossier →]                         │    │
│  └────────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 8.3 Technique

Deux dossiers dans `retraitia-dossiers`, liés par un champ `coupleId`. Un seul paiement Stripe couvre les deux dossiers. Le sélecteur bascule le `dossierId` actif dans le state de l'application.

---

## 9. Export ZIP — Pack Tribunal (29€)

### 9.1 Quand c'est disponible

Le bouton "Exporter pour le tribunal" apparaît quand au moins une anomalie a atteint l'étape 5 (médiateur) ou 6 (tribunal) — c'est-à-dire que toutes les voies amiables ont échoué.

### 9.2 Contenu du ZIP

```
DOSSIER_RETRAITIA_{nom}_{date}.zip
│
├── 01_RAPPORT/
│   └── rapport_audit_retraitia.pdf        // Le rapport complet
│
├── 02_DOCUMENTS_CLIENT/
│   ├── RIS.pdf                             // Relevé de carrière
│   ├── notification_pension.pdf            // Notification
│   ├── releve_agirc_arrco.pdf             // Relevé points
│   ├── avis_imposition.pdf                // Avis
│   └── [autres documents uploadés]
│
├── 03_COURRIERS_ENVOYES/
│   ├── message_carsat_2026-03-18.txt      // 1er message (texte)
│   ├── relance_carsat_2026-05-18.txt      // Relance
│   ├── lrar_contestation_2026-07-18.pdf   // LRAR + AR
│   ├── saisine_cra_2026-09-18.pdf         // CRA
│   └── saisine_mediateur_2026-12-18.pdf   // Médiateur
│
├── 04_PREUVES_ENVOI/
│   ├── ar_lrar_2026-07-18.pdf             // Accusé de réception
│   ├── ar_cra_2026-09-18.pdf
│   └── ar_mediateur_2026-12-18.pdf
│
├── 05_REPONSES_RECUES/
│   └── [documents uploadés par le client : réponses des organismes]
│
├── 06_CHRONOLOGIE/
│   └── chronologie_dossier.pdf            // Timeline complète
│
└── README.txt
    "Ce dossier contient l'ensemble des pièces relatives
     à la contestation de la pension de retraite de {nom}.
     Préparé par RÉCUPÉO — recupeo.fr"
```

### 9.3 La chronologie (document généré)

Un PDF récapitulatif chronologique :

```
CHRONOLOGIE DU DOSSIER — {nom}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

18/03/2026  Diagnostic RÉCUPÉO : 7 anomalies détectées
            Impact estimé : ~300€/mois
            
18/03/2026  Message envoyé à la CARSAT Rhône-Alpes
            Objet : demande de majoration enfants
            Canal : messagerie lassuranceretraite.fr
            
18/05/2026  Relance envoyée (pas de réponse sous 2 mois)

18/07/2026  LRAR de contestation envoyée
            AR reçu le 22/07/2026

15/08/2026  Réponse CARSAT : rejet de la demande
            Motif invoqué : [motif]

18/09/2026  Saisine CRA envoyée par LRAR
            AR reçu le 22/09/2026

18/11/2026  Décision CRA : rejet

18/12/2026  Saisine du médiateur

18/03/2027  Médiation échouée

→ Le présent dossier est constitué pour saisine du
  tribunal judiciaire compétent.
```

---

## 10. Notifications

### 10.1 Notifications in-app

Badge sur l'icône cloche dans le header + bannière contextuelle sur le tableau de bord.

```typescript
interface Notification {
  id: string
  type: 'info' | 'action' | 'success' | 'warning'
  titre: string
  message: string
  lien?: string            // lien vers la page concernée
  lu: boolean
  date: Date
}
```

**Types de notifications :**

| Événement | Type | Message |
|-----------|------|---------|
| Document extrait | info | "Votre RIS a été analysé — 42 années détectées" |
| Diagnostic prêt | action | "Votre diagnostic est prêt — 7 anomalies détectées" |
| Diagnostic mis à jour | info | "Nouveau document analysé — diagnostic mis à jour" |
| Compteur 5 jours | warning | "Le délai de réponse de la CARSAT expire dans 5 jours" |
| Compteur dépassé | action | "Pas de réponse de la CARSAT — voici comment relancer" |
| Anomalie corrigée | success | "Bonne nouvelle ! Gain de +38€/mois confirmé" |
| Rapport régénéré | info | "Votre rapport a été mis à jour" |
| Proche aidant connecté | info | "[Prénom] a accédé à votre dossier" |

### 10.2 Bannière contextuelle

Sur le tableau de bord, une bannière en haut pour l'action la plus urgente :

```
┌─────────────────────────────────────────────────────┐
│ ⚠️ Le délai de réponse de la CARSAT expire dans     │
│ 5 jours. Si vous n'avez pas de réponse, une relance │
│ est recommandée. [Voir la démarche →]                │
└─────────────────────────────────────────────────────┘
```

---

## 11. Cross-sell dans l'espace client

### 11.1 Positionnement

Le cross-sell apparaît à 3 endroits :
1. **Dans la liste des démarches** : les anomalies N4/N5 sont des 💡 opportunités avec lien vers la brique concernée
2. **Après une anomalie corrigée** : "Maintenant que votre pension est corrigée, vérifiez aussi votre taxe foncière"
3. **En bas du tableau de bord** : encadré discret "Autres vérifications RÉCUPÉO"

### 11.2 Encadré cross-sell

```
┌─────────────────────────────────────────────────────┐
│  💡 AUTRES VÉRIFICATIONS RÉCUPÉO                     │
│                                                     │
│  Votre audit a aussi détecté des opportunités        │
│  sur d'autres domaines :                             │
│                                                     │
│  🏠 Taxe foncière — Exonération possible            │
│     Impact potentiel : ~800€/an                      │
│     [Vérifier avec MATAXE →]                         │
│                                                     │
│  💶 Impôts — Crédit d'impôt non optimisé            │
│     Impact potentiel : ~1 200€/an                    │
│     [Vérifier avec MONIMPOT →]                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 12. Responsive — Mobile et desktop

### 12.1 Desktop (> 1024px)

- Layout 2 colonnes : navigation latérale + contenu principal
- Tableaux complets, timelines horizontales
- Upload drag & drop

### 12.2 Tablette (768-1024px)

- Layout 1 colonne, navigation en haut (tabs)
- Tableaux scrollables horizontalement
- Upload par bouton

### 12.3 Mobile (< 768px)

- Layout 1 colonne, navigation en hamburger menu
- StatusCards empilées verticalement
- Timelines verticales
- Boutons pleine largeur
- Checks interactifs facilement cochables au doigt
- Le message copiable a un bouton "Copier" bien gros

**Priorités mobile :**
1. Le tableau de bord (vue d'ensemble)
2. Les checks interactifs (cocher "j'ai envoyé")
3. Le message copiable (copier-coller sur mobile)
4. Les notifications

**Moins prioritaire sur mobile :**
1. L'upload (mieux sur desktop, mais on le permet)
2. Le rapport PDF (téléchargeable mais lecture sur desktop)
3. L'export ZIP

---

## 13. Données techniques

### Pages Next.js (App Router)

```
src/app/mon-espace/retraitia/
  ├── page.tsx                    // Tableau de bord
  ├── layout.tsx                  // Layout avec navigation RETRAITIA
  ├── documents/
  │   └── page.tsx                // Checklist documents
  ├── informations/
  │   └── page.tsx                // Formulaire complémentaire
  ├── diagnostic/
  │   └── page.tsx                // Diagnostic serré ou rapport interactif
  ├── demarches/
  │   ├── page.tsx                // Vue d'ensemble démarches
  │   └── [id]/
  │       └── page.tsx            // Détail d'une anomalie + timeline
  ├── rapport/
  │   └── page.tsx                // Téléchargement PDF
  ├── tribunal/
  │   └── page.tsx                // Export ZIP
  └── parametres/
      └── page.tsx                // Profil, email, proche aidant
```

### Composants React

```
src/components/retraitia/
  ├── StatusCard.tsx
  ├── ProgressBar.tsx
  ├── CheckInteractif.tsx
  ├── TimelineAnomalie.tsx
  ├── CompteurDelai.tsx
  ├── MessageCopiable.tsx
  ├── BadgeConfiance.tsx
  ├── SelecteurCouple.tsx
  ├── NotificationBanner.tsx
  ├── CrossSellCard.tsx
  ├── DocumentUploader.tsx
  ├── DiagnosticSerre.tsx
  ├── DemarcheCard.tsx
  └── ExportZip.tsx
```

### Routes API spécifiques espace client

```
GET  /api/retraitia/dashboard/:dossierId     → état complet du tableau de bord
POST /api/retraitia/check                     → mise à jour check interactif
GET  /api/retraitia/notifications/:clientId   → notifications in-app
POST /api/retraitia/notifications/read        → marquer comme lue
GET  /api/retraitia/couple/:coupleId          → résumé des 2 dossiers
POST /api/retraitia/export-zip/:dossierId     → génération export tribunal
```

---

## 14. Métriques espace client

| Métrique | Cible |
|----------|-------|
| Temps moyen sur le tableau de bord | > 3 min |
| Taux de retour (revient dans les 7 jours) | > 60% |
| Nb moyen de checks cochés / dossier | > 5 |
| Taux de complétion collecte (tous docs ✅) | > 70% |
| Taux de clic cross-sell | > 10% |
| Taux utilisation mobile vs desktop | ~30% mobile / ~70% desktop |
| Taux export ZIP (tribunal) | < 3% (c'est rare et c'est bien) |
| Taux satisfaction UX (NPS) | > 50 |

