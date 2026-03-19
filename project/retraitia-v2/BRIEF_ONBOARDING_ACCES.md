# BRIEF_ONBOARDING_ACCES — Accès FranceConnect et guides par organisme

**Statut :** ✅ Validé
**Date :** 2026-03-18
**Dépendances :** MASTER (#1), PARCOURS_RETRAITE (#2), COLLECTE_DOCUMENTS (#6)

---

## 1. Vue d'ensemble

Ce brief couvre tout ce qui se passe entre **"j'ai payé 9€"** et **"je peux uploader mon premier document"**. C'est le pont critique entre le paiement et la collecte. Si ça coince ici, on perd le client.

**Le problème :** 32% des +65 ans ne sont pas à l'aise avec l'Internet administratif. Même les 68% restants galèrent souvent avec FranceConnect, les mots de passe oubliés, les interfaces changeantes des sites.

**Notre solution :** un diagnostic d'accès qui identifie les blocages AVANT de demander des documents, des guides textuels pas-à-pas pour chaque situation, et un bouton "Un proche peut m'aider" omniprésent.

**Rappel :** celui qui ne peut pas du tout accéder au numérique ne nous trouvera pas. Mais celui qui nous trouve et qui galère, on doit le guider sans le perdre.

---

## 2. Le diagnostic d'accès — Phase 0 du tableau de mission

### Objectif
Vérifier que le client peut se connecter aux sites des organismes de retraite AVANT de lui demander de récupérer des documents. C'est la première étape de l'espace client après le paiement des 9€.

### Ce que le client voit

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📡 PREMIÈRE ÉTAPE : VOS ACCÈS

Tous les documents dont nous avons besoin sont accessibles
en ligne via FranceConnect. C'est un système sécurisé qui
vous permet de vous connecter à tous les sites officiels
avec un seul compte.

Avez-vous un compte sur l'un de ces services ?

  ○ Ameli.fr (Assurance Maladie)
  ○ Impots.gouv.fr
  ○ La Poste (Identité Numérique)
  ○ MSA (Mutualité Sociale Agricole)
  ○ France Identité (application mobile)
  ○ Aucun de ces services

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Arbre de décision

```
Le client a un compte ?
│
├── ✅ OUI (Ameli, impots.gouv, La Poste, MSA ou France Identité)
│   │
│   ├── "Connaissez-vous votre mot de passe ?"
│   │   ├── ✅ OUI → FranceConnect ✅, passer aux documents
│   │   └── ❌ NON → Guide "Retrouver son mot de passe [service]"
│   │
│   └── Après récupération mot de passe → FranceConnect ✅
│
└── ❌ AUCUN compte
    │
    ├── "Êtes-vous avec votre parent en ce moment ?"
    │   ├── ✅ OUI → Guide en temps réel (version accompagnée)
    │   └── ❌ NON → Envoyer le guide par email au parent
    │
    ├── Guide création compte Ameli (recommandé)
    ├── Guide création compte impots.gouv (alternative)
    ├── Guide Identité Numérique La Poste (si les 2 premiers échouent)
    └── France Services (dernier recours, accompagnement physique)
```

---

## 3. FranceConnect — Ce que c'est, comment ça marche

### Explication pour le client

"FranceConnect est un service de l'État qui vous permet de vous connecter à tous les sites administratifs avec un seul compte. Si vous avez un compte Ameli, impots.gouv, La Poste, MSA ou France Identité, vous avez déjà FranceConnect — sans rien créer de plus.

Quand un site vous propose 'Se connecter avec FranceConnect', cliquez dessus, choisissez votre service (par exemple Ameli), entrez vos identifiants habituels, et c'est fait."

### Les 5 fournisseurs d'identité FranceConnect

| Fournisseur | Prérequis | Difficulté | Recommandé pour |
|-------------|-----------|------------|-----------------|
| Ameli | Numéro de sécu + email + téléphone | ★☆☆ Facile | Tout le monde (le plus simple) |
| Impots.gouv | Numéro fiscal + revenu de référence + email | ★★☆ Moyen | Ceux qui ont leur avis d'imposition sous la main |
| La Poste (Identité Numérique) | Smartphone OU passage en bureau de poste + pièce d'identité | ★★★ Plus complexe | Ceux pour qui Ameli et impots.gouv échouent |
| MSA | Numéro MSA + email | ★☆☆ Facile | Agriculteurs (qui ont déjà un compte MSA) |
| France Identité | Smartphone + carte d'identité nouvelle génération | ★★☆ Moyen | Ceux qui ont un smartphone récent et une CNI post-2021 |

### Notre recommandation : Ameli en premier

Ameli est le plus simple parce que :
- Presque tout le monde a une carte Vitale (donc un numéro de sécu)
- La création de compte ne demande que 3 informations : numéro de sécu, email, téléphone
- Pas besoin de document fiscal
- Le processus est rapide (5 minutes)

---

## 4. Guide de création de compte Ameli

### Version "accompagnée" (le proche est avec le parent)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 CRÉER UN COMPTE AMELI — Guide pas-à-pas

Vous êtes avec votre parent ? Parfait, suivez ces étapes
ensemble. Comptez environ 5 minutes.

Ce dont vous avez besoin :
✓ Le numéro de sécurité sociale (sur la carte Vitale)
✓ Une adresse email (celle du parent ou la vôtre)
✓ Un téléphone mobile (pour recevoir le code SMS)

─── ÉTAPE 1 ──────────────────────────────────

Ouvrez votre navigateur et allez sur :
👉 ameli.fr

─── ÉTAPE 2 ──────────────────────────────────

Cliquez sur « MON COMPTE AMELI » en haut à droite
de la page.

─── ÉTAPE 3 ──────────────────────────────────

Cliquez sur « Créer mon compte »
(lien sous le formulaire de connexion)

─── ÉTAPE 4 ──────────────────────────────────

Renseignez :
• Le numéro de sécurité sociale (13 chiffres + clé)
  → Il se trouve sur la carte Vitale
• La date de naissance
• Le code postal

─── ÉTAPE 5 ──────────────────────────────────

Un code de vérification est envoyé par SMS
au numéro de téléphone connu par l'Assurance Maladie.

⚠️ Si le numéro n'est plus le bon :
   Vous devrez passer par un conseiller Ameli (appeler
   le 3646 ou aller en agence CPAM) pour mettre à jour
   votre numéro de téléphone.

─── ÉTAPE 6 ──────────────────────────────────

Saisissez le code reçu par SMS.
Choisissez un mot de passe.

NOTEZ LE MOT DE PASSE sur un papier et gardez-le
dans un endroit sûr.

─── TERMINÉ ──────────────────────────────────

✅ Le compte Ameli est créé.
Ce compte débloque FranceConnect sur tous les sites
de retraite.

[☑️ C'est fait, mon compte Ameli est créé]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Version "à distance" (le proche n'est pas avec le parent)

Le même guide, mais envoyé par email au parent avec un ton adapté :

Objet : "Comment créer votre compte en 5 minutes — guide RÉCUPÉO"

"Bonjour [Prénom du parent],

Votre enfant [Prénom du proche] utilise le service RÉCUPÉO pour vérifier votre pension de retraite. Pour avancer, nous avons besoin que vous créiez un compte Ameli (si vous n'en avez pas déjà un).

C'est simple et ça prend 5 minutes. Voici comment faire...

[Même guide que ci-dessus, avec un ton plus doux]

Si vous avez besoin d'aide, appelez [Prénom du proche] au [numéro si fourni] ou répondez à cet email.

L'équipe RÉCUPÉO"

---

## 5. Guide de création de compte impots.gouv

### Quand le recommander
- Si le client a déjà son avis d'imposition sous la main (numéro fiscal visible)
- Si la création Ameli échoue (numéro de téléphone pas à jour à la CPAM)

### Guide

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💼 CRÉER UN COMPTE IMPOTS.GOUV — Guide pas-à-pas

Ce dont vous avez besoin :
✓ Votre numéro fiscal (13 chiffres)
  → Sur votre dernier avis d'imposition, en haut à gauche
✓ Votre revenu fiscal de référence
  → Sur votre dernier avis d'imposition, page 2
✓ Une adresse email

─── ÉTAPE 1 ──────────────────────────────────

Allez sur : 👉 impots.gouv.fr

─── ÉTAPE 2 ──────────────────────────────────

Cliquez sur « Votre espace particulier » en haut à droite

─── ÉTAPE 3 ──────────────────────────────────

Cliquez sur « Créer mon espace » ou « Première connexion »

─── ÉTAPE 4 ──────────────────────────────────

Renseignez :
• Votre numéro fiscal (13 chiffres)
• Votre date de naissance
• Votre revenu fiscal de référence (sur le dernier avis)

─── ÉTAPE 5 ──────────────────────────────────

Choisissez un mot de passe.
Un email de confirmation est envoyé.
Cliquez sur le lien dans l'email pour activer le compte.

NOTEZ LE MOT DE PASSE sur un papier.

─── TERMINÉ ──────────────────────────────────

✅ Le compte impots.gouv est créé.
Ce compte débloque FranceConnect sur tous les sites.

[☑️ C'est fait, mon compte impots.gouv est créé]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Guide "Retrouver son mot de passe impots.gouv"

Beaucoup de retraités ONT un compte impots.gouv (créé par un enfant, un comptable, ou lors de la première déclaration en ligne) mais ne connaissent plus le mot de passe.

```
Vous avez déjà un compte mais vous avez oublié
votre mot de passe ?

1. Allez sur impots.gouv.fr → « Votre espace particulier »
2. Cliquez sur « Mot de passe oublié »
3. Entrez votre numéro fiscal
4. Un lien de réinitialisation est envoyé à l'email
   associé au compte

⚠️ Si vous n'avez plus accès à cet email :
   Appelez le 0 809 401 401 (service des impôts)
   pour mettre à jour votre email.
```

---

## 6. Guide Identité Numérique La Poste

### Quand le recommander
Seulement si Ameli ET impots.gouv échouent. C'est plus robuste (FranceConnect+) mais plus complexe.

### Deux méthodes

**Méthode A — Avec smartphone :**
1. Télécharger l'application "L'Identité Numérique" (App Store / Google Play)
2. Scanner sa pièce d'identité avec l'app
3. Faire une vidéo de vérification d'identité
4. Attendre la validation (24-48h)

**Méthode B — En bureau de poste :**
1. Se rendre dans un bureau de poste avec pièce d'identité
2. Un conseiller crée l'Identité Numérique sur place
3. Actif immédiatement

"Si les méthodes précédentes n'ont pas fonctionné, rendez-vous dans votre bureau de poste le plus proche avec votre pièce d'identité. Un conseiller vous aidera à créer votre Identité Numérique en quelques minutes."

---

## 7. France Services — Dernier recours (accompagnement physique)

### Quand le recommander
Si le client ne peut créer aucun compte en ligne et n'a pas de proche pour l'aider.

### Ce que le client voit

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏢 FRANCE SERVICES — Un conseiller vous aide sur place

Il existe 2 800 espaces France Services en France,
à moins de 30 minutes de chez vous. Un conseiller
peut vous aider à créer vos comptes en ligne
gratuitement.

Votre code postal : [____]

→ [🔍 Trouver l'espace France Services le plus proche]

Ce qu'il faut apporter :
✓ Votre pièce d'identité (carte d'identité ou passeport)
✓ Votre carte Vitale
✓ Votre dernier avis d'imposition (si vous l'avez)
✓ Votre téléphone mobile
✓ Une adresse email (ou celle de votre enfant)

Le conseiller vous aidera à :
• Créer un compte Ameli ou impots.gouv
• Ce compte vous donnera accès à tous les sites de retraite
  via FranceConnect

C'est gratuit et sans rendez-vous dans la plupart
des espaces.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Recherche du France Services le plus proche
On utilise le code postal du client (collecté lors de l'inscription ou dans le formulaire) pour afficher l'adresse, le téléphone et les horaires du France Services le plus proche. Source : annuaire officiel france-services.gouv.fr.

---

## 8. Guide de connexion par organisme

Une fois FranceConnect acquis, le client doit naviguer sur chaque site pour récupérer ses documents. Chaque site a sa propre ergonomie. On guide le chemin exact pour chaque document sur chaque site.

### 8.1 info-retraite.fr

**Connexion :**
```
1. Allez sur info-retraite.fr
2. Cliquez sur « J'accède à mon compte retraite »
3. Cliquez sur « S'identifier avec FranceConnect »
4. Choisissez votre service (Ameli, impots.gouv...)
5. Entrez vos identifiants habituels
6. Vous êtes connecté à votre espace info-retraite
```

**Récupérer le RIS :**
```
→ « Ma carrière » dans le menu
→ « Mon relevé de carrière » ou « Consulter mon relevé »
→ Bouton « Télécharger » ou « Enregistrer en PDF »
→ Le fichier PDF se télécharge sur votre ordinateur
```

**Récupérer l'EIG (≥55 ans) :**
```
→ « Ma future retraite » dans le menu
→ « Mon estimation retraite » ou « Mon estimation indicative globale »
→ Télécharger le PDF
```

**Récupérer l'attestation de paiement :**
```
→ « Ma retraite » dans le menu
→ « Mes attestations » ou « Mon attestation de paiement »
→ Télécharger le PDF
```

**Corriger sa carrière (≥55 ans) :**
```
→ « Ma carrière » dans le menu
→ « Corriger ma carrière » ou « Signaler une anomalie »
→ Suivre les instructions pour signaler l'erreur
```

**Déclarer ses enfants :**
```
→ « Ma carrière » dans le menu
→ « Mes enfants » ou « Déclarer mes enfants »
→ Renseigner les dates de naissance
```

**Demander la réversion :**
```
→ « Mes démarches » dans le menu
→ « Demander ma réversion » ou « Demande unique de réversion »
→ Remplir le formulaire en ligne
```

### 8.2 lassuranceretraite.fr

**Connexion :**
```
1. Allez sur lassuranceretraite.fr
2. Cliquez sur « Mon espace personnel » ou « Me connecter »
3. Cliquez sur « FranceConnect »
4. Choisissez votre service, entrez vos identifiants
```

**Récupérer la notification de pension :**
```
→ « Mes documents » ou « Mon courrier » dans le menu
→ Cherchez « Notification de retraite » ou « Titre de pension »
→ Télécharger le PDF

⚠️ Si le document n'apparaît pas :
   → « Ma messagerie » → Nouveau message
   → Objet : « Demande de duplicata de notification de pension »
   → [📋 Copier le message pré-rédigé]
```

**Récupérer le relevé de mensualités :**
```
→ « Mes paiements » dans le menu
→ « Demander un relevé de paiements »
→ Choisir la période (12 derniers mois recommandé)
→ Télécharger le PDF
```

**Récupérer l'attestation fiscale :**
```
→ « Mes documents » ou « Mes attestations »
→ « Attestation fiscale »
→ Télécharger le PDF
```

**Messagerie CARSAT (pour réclamation ou demande) :**
```
→ « Ma messagerie » dans le menu
→ « Écrire un nouveau message »
→ Choisir le sujet (ex : « Réclamation », « Carrière »)
→ Coller le message pré-rédigé par RÉCUPÉO
→ Joindre les pièces si nécessaire
→ Envoyer
```

### 8.3 agirc-arrco.fr

**Connexion :**
```
1. Allez sur agirc-arrco.fr
2. Cliquez sur « Mon espace personnel »
3. Cliquez sur « Se connecter avec FranceConnect »
4. Choisissez votre service, entrez vos identifiants
```

**Récupérer le relevé de points :**
```
→ « Ma situation » ou « Consulter ma situation »
→ « Mon relevé de points »
→ Télécharger le PDF
```

**Récupérer les paiements :**
```
→ « Mes paiements » ou « Mon historique de paiements »
→ Choisir la période
→ Télécharger
```

**Messagerie Agirc-Arrco :**
```
→ « Contacter un conseiller » ou « Ma messagerie »
→ Choisir le sujet
→ Coller le message pré-rédigé
→ Envoyer
```

### 8.4 impots.gouv.fr

**Connexion :**
```
1. Allez sur impots.gouv.fr
2. Cliquez sur « Votre espace particulier »
3. Cliquez sur « Se connecter avec FranceConnect »
4. Choisissez votre service, entrez vos identifiants
```

**Récupérer l'avis d'imposition :**
```
→ « Documents » dans le menu
→ Année la plus récente
→ « Avis d'imposition sur les revenus [année] »
→ Télécharger le PDF
```

### 8.5 ensap.gouv.fr (fonctionnaires d'État)

**Connexion :**
```
1. Allez sur ensap.gouv.fr
2. Cliquez sur « Se connecter avec FranceConnect »
3. Choisissez votre service, entrez vos identifiants
```

**Récupérer le titre de pension :**
```
→ « Mon dossier » dans le menu
→ « Mon titre de pension » ou « Ma pension »
→ Télécharger le PDF
```

**Récupérer l'attestation de paiement :**
```
→ « Mes paiements » ou « Mon dernier bulletin de pension »
→ Télécharger le PDF
```

**Messagerie SRE :**
```
→ « Contacter le SRE » ou « Ma messagerie »
→ Coller le message pré-rédigé
→ Envoyer
```

### 8.6 cnracl.retraites.fr (fonctionnaires territoriaux/hospitaliers)

**Connexion :**
```
1. Allez sur cnracl.retraites.fr
   (ou ma-retraite-publique.fr selon le portail)
2. Cliquez sur « Mon espace personnel »
3. Cliquez sur « FranceConnect »
4. Choisissez votre service, entrez vos identifiants
```

**Récupérer le décompte de pension :**
```
→ « Ma retraite » → « Ma pension »
→ « Mon décompte définitif de pension »
→ Télécharger le PDF
```

**Messagerie CNRACL :**
```
→ « Contact » ou « Nous écrire »
→ Coller le message pré-rédigé
→ Envoyer
```

### 8.7 msa.fr (agriculteurs)

**Connexion :**
```
1. Allez sur msa.fr
2. Cliquez sur « Mon espace privé »
3. Cliquez sur « FranceConnect »
4. Choisissez votre service, entrez vos identifiants
```

**Récupérer les documents retraite :**
```
→ « Ma retraite » dans le menu
→ « Mes documents » ou « Ma notification de pension »
→ Télécharger les PDF
```

**Messagerie MSA :**
```
→ « Nous contacter » ou « Ma messagerie »
→ Coller le message pré-rédigé
→ Envoyer
```

---

## 9. Le bouton "Un proche peut m'aider"

### Philosophie

Ce bouton est OMNIPRÉSENT dans l'espace client. Il apparaît :
- En haut du tableau de mission (permanent)
- Sur chaque guide de document (contextuel)
- Sur le diagnostic d'accès FranceConnect (si blocage)
- Dans chaque email de relance

### Mécanique complète

**Étape 1 — Le client clique "Un proche peut m'aider"**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👨‍👩‍👧 UN PROCHE PEUT VOUS AIDER

Indiquez l'adresse email de la personne qui vous aide
(enfant, petit-enfant, ami...). Cette personne recevra :
• Le guide complet pour récupérer vos documents
• Un accès à votre dossier RÉCUPÉO
• La possibilité d'uploader des documents pour vous

Email du proche : [________________________]
Prénom du proche : [______________________]

[📩 Envoyer l'invitation]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Étape 2 — Le proche reçoit un email**

Objet : "[Prénom du parent] a besoin de votre aide pour vérifier sa pension"

"Bonjour [Prénom du proche],

[Prénom du parent] utilise le service RÉCUPÉO pour vérifier sa pension de retraite et a besoin de votre aide.

Voici ce que vous pouvez faire :

1. Accéder au dossier de [Prénom du parent]
   → [Lien sécurisé vers le dossier — magic link]

2. Consulter le tableau de mission
   → Vous verrez les documents à récupérer et les étapes restantes

3. Récupérer les documents en ligne
   → Les guides pas-à-pas vous expliquent où trouver chaque document
   → Vous aurez besoin des identifiants FranceConnect de [Prénom du parent]

4. Uploader les documents
   → Directement dans l'espace client

Comptez environ 30 minutes pour récupérer les 3 documents essentiels.

[🔗 Accéder au dossier de Prénom]

L'équipe RÉCUPÉO"

**Étape 3 — Le proche accède au dossier**

Le proche arrive sur le dossier du parent avec un accès "aidant" :
- Il voit le tableau de mission complet
- Il peut uploader des documents
- Il peut remplir le formulaire complémentaire (avec les réponses du parent)
- Il peut voir le diagnostic serré
- Il NE PEUT PAS modifier les informations personnelles du parent (nom, email, N° SS)
- Il PEUT payer le pack action (49€) depuis son propre moyen de paiement

### Le proche peut payer

Le paiement peut être fait par le proche (enfant). Techniquement :
- Le Stripe Checkout est lié au dossier du parent (pas à l'email du payeur)
- Le paiement est associé au dossier, pas à l'email
- La facture peut être au nom du parent ou du proche (on laisse le choix)
- Le proche paie, le dossier du parent se débloque

### Gestion multi-dossiers

Un même email (celui de l'enfant aidant) peut être lié à plusieurs dossiers :
- Son propre dossier (s'il est lui-même pré-retraité)
- Le dossier de sa mère
- Le dossier de son père (pack couple)

L'enfant voit un sélecteur de dossiers dans son espace :
```
Vos dossiers RÉCUPÉO :
• 👤 Votre dossier (pré-retraité) — 2/8 ✅
• 👩 Dossier de Marie Dupont (retraité) — 5/14 ✅
• 👨 Dossier de Jean Dupont (retraité) — 3/14 ✅
```

---

## 10. Les guides — Format et maintenance

### Format des guides

On utilise des **guides textuels avec des repères visuels** plutôt que des screenshots figés. Raisons :
- Les interfaces des sites administratifs changent régulièrement
- Les screenshots deviennent obsolètes en quelques mois
- Les repères textuels ("cliquez sur le bouton bleu en haut à droite intitulé...") sont plus durables
- On peut mettre à jour un texte en 5 minutes, refaire des screenshots prend des heures

### Structure type d'un guide

```
📄 [NOM DU DOCUMENT]

C'est quoi ?
→ [1 phrase d'explication]

Où le trouver ?
→ [Nom du site]

Ce dont vous avez besoin :
✓ Votre accès FranceConnect (Ameli, impots.gouv, etc.)

ÉTAPE 1 — Se connecter
→ Allez sur [adresse du site]
→ Cliquez sur [nom du bouton/lien — entre guillemets]
→ Choisissez FranceConnect → votre service → identifiants

ÉTAPE 2 — Trouver le document
→ Dans le menu, cliquez sur « [nom du menu] »
→ Puis sur « [nom de la rubrique] »

ÉTAPE 3 — Télécharger
→ Cliquez sur « Télécharger » ou « Enregistrer en PDF »
→ Le fichier se télécharge sur votre ordinateur

ÉTAPE 4 — Uploader sur RÉCUPÉO
→ Revenez sur votre espace RÉCUPÉO
→ Cliquez sur « Uploader » à côté de [nom du document]
→ Sélectionnez le fichier PDF téléchargé
→ C'est fait ✅

⚠️ Vous ne trouvez pas ce document ?
→ [📋 Message pré-rédigé à copier-coller]
→ [⏭️ Passer au document suivant]
```

### Maintenance des guides

Les guides doivent être vérifiés régulièrement (tous les 3-6 mois) car les interfaces des sites changent. On prévoit :
- Un champ `lastVerified` dans la base pour chaque guide
- Une alerte si un guide n'a pas été vérifié depuis > 6 mois
- La possibilité de signaler un guide obsolète (bouton "Ce guide ne correspond pas à ce que je vois")

---

## 11. Gestion des erreurs et blocages

### Les blocages les plus fréquents et les solutions

| Blocage | Fréquence | Solution |
|---------|-----------|---------|
| "Je ne connais pas mon mot de passe Ameli" | Très fréquent | Guide "Mot de passe oublié" → réinitialisation par SMS |
| "Le numéro de téléphone chez Ameli n'est plus le bon" | Fréquent | Appeler le 3646 pour mettre à jour, ou passer par impots.gouv à la place |
| "Je ne trouve pas mon numéro fiscal" | Fréquent | "Il est sur votre avis d'imposition, en haut à gauche, 13 chiffres commençant par 0, 1, 2 ou 3" |
| "Je ne trouve pas le bouton FranceConnect sur le site" | Fréquent | "Cherchez le bouton rectangulaire bleu marqué 'S'identifier avec FranceConnect' — il est généralement en haut ou au centre de la page de connexion" |
| "FranceConnect me dit 'erreur technique'" | Occasionnel | "Attendez quelques minutes et réessayez. Si le problème persiste, essayez avec un autre navigateur ou à un autre moment" |
| "Je ne trouve pas le document sur le site" | Fréquent | Message pré-rédigé pour la messagerie de l'organisme |
| "Le site me demande de créer un compte (pas FranceConnect)" | Occasionnel | "Cherchez le lien 'FranceConnect' — il est parfois en dessous du formulaire de connexion classique" |
| "Je n'ai pas d'email" | Rare (80+) | "Demandez à un proche de vous créer une adresse email, ou rendez-vous dans un espace France Services" |

### Bouton "Je suis bloqué(e)"

Sur chaque étape, un lien discret : "Je suis bloqué(e) → Décrivez votre problème"
- Le client décrit son blocage en texte libre
- L'information est stockée dans le dossier
- On peut analyser les blocages les plus fréquents pour améliorer les guides
- En V2 avancée : réponse automatique par Claude basée sur le blocage décrit

---

## 12. Séquence de relances onboarding

Si le client a payé 9€ mais ne progresse pas sur l'accès FranceConnect :

| Délai | Canal | Contenu |
|-------|-------|---------|
| J+1 | Email | "Votre espace est prêt. Voici le guide pour vous connecter à FranceConnect." |
| J+3 | Email + SMS | "Besoin d'aide pour vous connecter ? Voici le guide pas-à-pas" |
| J+7 | Email | "Un proche peut vous aider — transmettez-lui ce guide [bouton 'Envoyer à un proche']" |
| J+14 | Email | "Toujours bloqué(e) ? Le France Services le plus proche de chez vous est à [adresse]. Un conseiller peut vous aider gratuitement." |
| J+30 | Email | Dernier rappel sobre. "Votre dossier RÉCUPÉO est en attente. Pour toute question, répondez à cet email." |

Après J+30, on arrête les relances onboarding. Le dossier reste ouvert, le client peut revenir quand il veut.

---

## 13. Données techniques

### Structure du guide dans la base

```
retraitia-guides {
  id: string
  organisme: enum    // info-retraite, lassuranceretraite, agirc-arrco, impots, ensap, cnracl, msa
  document: enum     // ris, notification, releve_points, eig, mensualites, etc.
  action: enum       // telecharger, messagerie, correction_carriere, demande_reversion
  contenu: {
    titre: string
    description: string    // "C'est quoi ?"
    prerequis: string[]    // "Ce dont vous avez besoin"
    etapes: [{
      numero: number
      instruction: string
      aide?: string        // info-bulle d'aide si blocage
    }]
    siIntrouvable: {
      messagePreRedige: string
      organisme: string
      canal: string
    }
  }
  lastVerified: date       // dernière vérification du guide
  version: number
}
```

### Collection accès aidant

```
retraitia-aidants {
  dossierId: ref → retraitia-dossiers
  emailAidant: string
  prenomAidant: string
  inviteLe: date
  premierAccesLe?: date
  droits: ['voir', 'uploader', 'formulaire', 'payer']  // pas 'modifier_profil'
  magicLinkToken: string
  tokenExpiry: date
}
```

### Routes API

```
POST /api/retraitia/invite-aidant    → envoie l'email d'invitation au proche
GET  /api/retraitia/aidant/:token    → accès magic link du proche au dossier
POST /api/retraitia/guide-email      → envoie le guide FranceConnect par email au parent
GET  /api/retraitia/france-services  → recherche du France Services le plus proche (code postal)
POST /api/retraitia/blocage          → signalement de blocage par le client
```

---

## 14. Métriques onboarding

| Métrique | Cible |
|----------|-------|
| Taux complétion FranceConnect (accès validé) | > 85% |
| Délai moyen accès → premier upload | < 48h |
| Taux utilisation "Un proche peut m'aider" | ~30% |
| Taux blocage FranceConnect | < 15% |
| Taux abandon post-9€ (jamais accédé à FranceConnect) | < 10% |
| Taux utilisation France Services | < 5% |
| Guide le plus consulté | RIS sur info-retraite.fr |
| Blocage le plus fréquent | Mot de passe oublié |

