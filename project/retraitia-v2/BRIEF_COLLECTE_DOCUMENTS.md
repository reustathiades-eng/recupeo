# BRIEF_COLLECTE_DOCUMENTS — Catalogue des documents et mécanique de collecte

**Statut :** ✅ Validé
**Date :** 2026-03-18
**Dépendances :** MASTER (#1), ONBOARDING_ACCES (#5), EXTRACTION_PARSING (#7)

---

## 1. Vue d'ensemble

Ce brief est le **référentiel technique exhaustif de chaque document** qu'on collecte. Pour chaque type de document : ce que c'est, ce qu'il contient, ce qu'on en extrait, comment on le valide, et quoi faire s'il est introuvable.

**Périmètre :**
- Côté client : ce qu'il voit, ce qu'il uploade, les validations, les messages si introuvable
- Côté serveur : les données attendues, la validation de complétude, le refus si incomplet
- Le COMMENT de l'extraction (OCR, Vision, parsing) est dans BRIEF_EXTRACTION_PARSING (#7)

**Principe fondamental :** on accepte tous les formats (PDF, JPG, PNG) mais on refuse tout document incomplet. Si des informations essentielles manquent, on dit clairement au client ce qui manque et comment corriger.

---

## 2. Formats acceptés et règles d'upload

### Formats
| Format | Accepté | Note |
|--------|---------|------|
| PDF numérique | ✅ | Format idéal — extraction structurée possible |
| PDF scanné (image dans un PDF) | ✅ | Claude Vision pour l'extraction |
| JPG / JPEG | ✅ | Photo de document — Claude Vision |
| PNG | ✅ | Capture d'écran ou photo — Claude Vision |
| HEIC (iPhone) | ✅ | Converti automatiquement en JPG côté serveur |
| Autres (Word, Excel, etc.) | ❌ | "Seuls les fichiers PDF, JPG et PNG sont acceptés" |

### Limites
- Taille max par fichier : 10 Mo
- Nombre max de fichiers par upload : 20 (pour les documents multi-pages photographiés)
- Si le client uploade plusieurs photos pour un même document → on les assemble dans l'ordre en un seul PDF côté serveur

### Upload multi-pages (photos)
Un document de 5 pages photographié = 5 fichiers séparés. Le client :
1. Clique "Uploader" sur le document concerné
2. Sélectionne les 5 photos d'un coup (sélection multiple)
3. Réordonne si nécessaire (drag & drop)
4. Confirme → on assemble en un seul PDF

Message au client : "Si votre document fait plusieurs pages, sélectionnez toutes les photos d'un coup. Vous pourrez les réorganiser avant de valider."

---

## 3. Validation post-upload — Le refus intelligent

### Principe

Après chaque upload, l'extraction automatique tourne (quelques secondes). On valide que le document :
1. **Est lisible** (pas flou, pas tronqué, pas noir)
2. **Est le bon type** (un RIS et pas un bulletin de salaire)
3. **Est complet** (toutes les pages, toutes les informations essentielles présentes)

Si l'une de ces conditions n'est pas remplie → **on refuse le document avec un message clair**.

### Les 3 niveaux de refus

**Niveau 1 — Document illisible**
```
❌ Document illisible

Nous n'arrivons pas à lire ce document. Cela peut être dû à :
• Une photo floue ou trop sombre
• Un document scanné à très basse résolution
• Un fichier corrompu

💡 Conseils :
• Prenez la photo dans un endroit bien éclairé
• Posez le document à plat sur une surface claire
• Assurez-vous que tout le texte est visible et net
• Évitez les reflets et les ombres

[🔄 Réessayer l'upload]
```

**Niveau 2 — Mauvais type de document**
```
❌ Ce document ne semble pas être un [nom du document attendu]

Nous avons détecté un [type détecté — ex : "bulletin de salaire"]
alors que nous attendons un [type attendu — ex : "Relevé Individuel
de Situation (RIS)"].

💡 Le [document attendu] se trouve sur [site] :
[📖 Voir le guide pour le récupérer]

[🔄 Uploader un autre fichier]
```

**Niveau 3 — Document incomplet**
```
⚠️ Document incomplet

Nous avons bien reconnu votre [nom du document], mais il manque
des informations essentielles :

• ❌ Les pages 3 à 5 semblent manquantes
  (nous avons détecté les années 1985-2005 mais pas 2006-2023)
• ❌ Le tableau des salaires n'est pas visible

Ce dont nous avons besoin :
→ Le document complet, de la première à la dernière page
→ Toutes les années de carrière doivent être visibles

💡 Comment corriger :
• Si vous avez téléchargé le PDF en ligne : retéléchargez-le
  en vérifiant que le téléchargement est complet
• Si vous avez photographié un document papier : prenez les
  pages manquantes et ajoutez-les

[🔄 Uploader le document complet]
```

### Critères de complétude par type de document

| Document | Informations ESSENTIELLES (refus si absentes) |
|----------|----------------------------------------------|
| RIS | Au moins 1 année de carrière visible, tableau année/trimestres/régime lisible |
| Notification de pension | Montant de la pension, date d'effet, détail du calcul (SAM ou traitement, taux, trimestres) |
| Relevé Agirc-Arrco | Au moins 1 année avec des points, tableau année/points lisible |
| Relevé mensualités | Au moins 1 mois de paiement visible, montant net |
| Attestation fiscale | Montant annuel déclaré, année concernée |
| Avis d'imposition | Revenu Fiscal de Référence (RFR), nombre de parts, montant de l'impôt |
| Paiements Agirc-Arrco | Au moins 1 mois visible, montant |
| EIG | Au moins 1 scénario de départ avec montant estimé |
| Titre pension SRE/CNRACL | Montant pension, indice, trimestres, date d'effet |
| Notification MSA | Montant pension, détail calcul |
| Relevé RAFP | Nombre de points |
| Acte de décès (réversion) | Nom du défunt, date du décès, lieu |
| Livret de famille (réversion) | Noms des conjoints, date du mariage |

### Document accepté — confirmation

Quand le document passe la validation :
```
✅ Document accepté — [Nom du document]

Résumé de ce que nous avons extrait :
• Période couverte : 1985 — 2023
• Nombre d'années : 38
• Trimestres détectés : 152
• Régimes identifiés : CNAV, Agirc-Arrco

Ces informations vous semblent-elles correctes ?
  [✅ Oui, c'est correct]
  [❌ Non, il y a une erreur → nous contacter]
```

Le client confirme. S'il signale une erreur, on stocke le signalement pour analyse manuelle future (en V2 avancée).

---

## 4. Catalogue des documents — Fiches détaillées

### 4.1 Relevé Individuel de Situation (RIS)

| Champ | Valeur |
|-------|--------|
| **Nom officiel** | Relevé Individuel de Situation (RIS) |
| **Nom courant** | "Relevé de carrière", "relevé retraite" |
| **Source** | info-retraite.fr (FranceConnect) |
| **Format typique** | PDF numérique structuré |
| **Nb pages** | 3-15 pages selon la longueur de carrière |
| **Parcours** | Tous (retraité, pré-retraité, réversion si dossier du défunt) |
| **Obligatoire** | ✅ OUI — pour tous les parcours et tous les régimes |
| **Priorité** | #1 — c'est le premier document à récupérer |

**Ce qu'il contient :**
- Identité de l'assuré (nom, prénom, N° SS, date de naissance)
- Tableau année par année : régime, employeur/activité, trimestres validés, revenus/salaires
- Récapitulatif des trimestres par régime
- Régimes d'affiliation identifiés

**Ce qu'il NE contient PAS (et c'est notre valeur ajoutée) :**
- Trimestres enfants (maternité/éducation) → absents du RIS
- Distinction cotisés vs validés → absente depuis 2025
- Détail des trimestres assimilés (quel type : chômage, maladie, maternité ?)

**Données à extraire :**
```
{
  identite: { nom, prenom, nir, dateNaissance },
  carriere: [{
    annee: number,
    regime: string,
    employeur?: string,
    trimestres: number,
    revenu?: number   // salaire ou revenu d'activité
  }],
  recapTrimestres: {
    parRegime: [{ regime, total }],
    totalGeneral: number
  },
  regimesAffilies: string[]
}
```

**Validation complétude :**
- Au moins 1 ligne de carrière lisible
- Première et dernière année visibles (pas de pages manquantes au milieu)
- Tableau des trimestres lisible
- Si trous suspects (ex : gap de 10 ans) → avertissement "Votre RIS semble incomplet — vérifiez que vous avez bien téléchargé toutes les pages"

**Message si introuvable :** N/A — le RIS est toujours disponible sur info-retraite.fr dès la première connexion. Si le client ne le trouve pas, c'est un problème d'accès (→ brief ONBOARDING #5).

---

### 4.2 Notification de pension (régime général / CARSAT)

| Champ | Valeur |
|-------|--------|
| **Nom officiel** | Notification de retraite / Notification d'attribution de pension |
| **Nom courant** | "Ma notification", "le courrier de la CARSAT" |
| **Source** | lassuranceretraite.fr → "Mes documents" (FranceConnect) |
| **Format typique** | PDF numérique (départs récents) ou PDF scanné (anciens) |
| **Nb pages** | 4-8 pages |
| **Parcours** | Retraité actuel uniquement |
| **Obligatoire** | ✅ OUI pour les retraités du régime général |
| **Priorité** | #2 — c'est le document de comparaison avec notre recalcul |

**Ce qu'il contient :**
- Montant brut de la pension attribuée
- Détail du calcul : SAM (montant), taux de liquidation, nombre de trimestres retenus, proratisation
- Majorations appliquées (enfants, surcote) ou non
- Date d'effet
- Minimum contributif appliqué ou non

**Données à extraire :**
```
{
  montantBrut: number,         // pension mensuelle brute
  sam: number,                 // salaire annuel moyen
  tauxLiquidation: number,     // ex: 50%, 47.5%...
  trimestresRetenus: number,
  trimestresRequis: number,
  proratisation: number,       // ratio trimestres retenus / requis
  majorations: {
    enfants: boolean,          // +10% si 3+ enfants
    surcote: { trimestres: number, pourcentage: number } | null,
  },
  minimumContributif: boolean,
  dateEffet: date,
  montantNet?: number          // si présent
}
```

**Validation complétude :**
- Montant de la pension visible et lisible
- Détail du calcul (SAM, taux, trimestres) → au moins 2 de ces 3 éléments
- Si montant visible mais pas le détail → avertissement "Le détail du calcul n'est pas lisible. L'analyse sera moins précise."

**Message si introuvable en ligne :**
```
Objet : Demande de duplicata de notification de pension

Bonjour,

Je souhaite recevoir un duplicata de ma notification de retraite
(notification d'attribution de pension) par voie électronique.

Numéro de sécurité sociale : [N° SS pré-rempli]
Nom : [pré-rempli]
Date de naissance : [pré-rempli]

Je vous remercie par avance.

Cordialement,
[Prénom Nom]
```
Canal : messagerie lassuranceretraite.fr

---

### 4.3 Titre de pension (fonctionnaires d'État — SRE)

| Champ | Valeur |
|-------|--------|
| **Nom officiel** | Titre de pension civile ou militaire de retraite |
| **Source** | ensap.gouv.fr → "Mon dossier" (FranceConnect) |
| **Format typique** | PDF numérique |
| **Parcours** | Retraité fonctionnaire d'État |
| **Obligatoire** | ✅ OUI pour les fonctionnaires d'État |

**Ce qu'il contient :**
- Montant brut de la pension
- Traitement indiciaire brut retenu (indice)
- Nombre de trimestres de services et bonifications
- Taux de liquidation (≤ 75%)
- Décote ou surcote
- Majoration enfants
- Date d'effet

**Données à extraire :**
```
{
  montantBrut: number,
  indiceBrut: number,
  traitementIndiciaire: number,
  trimestresServices: number,
  trimestresRequis: number,
  tauxLiquidation: number,
  decote?: { trimestres: number, pourcentage: number },
  surcote?: { trimestres: number, pourcentage: number },
  majorationEnfants: boolean,
  bonifications: number,
  minimumGaranti: boolean,
  dateEffet: date
}
```

**Message si introuvable :**
```
Objet : Demande de duplicata de titre de pension

Bonjour,

Je souhaite recevoir un duplicata de mon titre de pension
par voie électronique via mon espace ENSAP.

Numéro de sécurité sociale : [pré-rempli]

Cordialement,
[Prénom Nom]
```
Canal : messagerie ensap.gouv.fr

---

### 4.4 Décompte de pension CNRACL (fonctionnaires territoriaux/hospitaliers)

| Champ | Valeur |
|-------|--------|
| **Nom officiel** | Décompte définitif de pension CNRACL |
| **Source** | cnracl.retraites.fr → "Ma pension" → "Mon décompte définitif" (FranceConnect) |
| **Format typique** | PDF numérique |
| **Parcours** | Retraité fonctionnaire territorial ou hospitalier |
| **Obligatoire** | ✅ OUI pour les fonctionnaires CNRACL |

**Ce qu'il contient :**
- Mêmes informations que le titre SRE (indice, traitement, trimestres, taux, majorations)
- Engage la CNRACL (c'est le document officiel définitif)

**Données à extraire :** identiques au titre SRE (même structure)

**Message si introuvable :**
```
Objet : Demande de duplicata de décompte de pension

Bonjour,

Je souhaite recevoir un duplicata de mon décompte définitif
de pension CNRACL par voie électronique.

Numéro de sécurité sociale : [pré-rempli]

Cordialement,
[Prénom Nom]
```
Canal : messagerie cnracl.retraites.fr

---

### 4.5 Relevé de points Agirc-Arrco

| Champ | Valeur |
|-------|--------|
| **Nom officiel** | Relevé de situation individuelle Agirc-Arrco |
| **Source** | agirc-arrco.fr → "Ma situation" → relevé de points (FranceConnect) |
| **Format typique** | PDF numérique |
| **Nb pages** | 2-10 pages selon la longueur de carrière |
| **Parcours** | Retraité et pré-retraité du privé |
| **Obligatoire** | ✅ OUI pour les salariés du privé |
| **Priorité** | #3 pour les salariés du privé |

**Ce qu'il contient :**
- Tableau année par année : employeur, points acquis, base de calcul
- Distinction points Arrco (non-cadres) et ex-Agirc (cadres, avant 2019)
- Points gratuits (chômage, maladie, maternité)
- Total des points
- GMP (Garantie Minimale de Points) si applicable

**Données à extraire :**
```
{
  pointsParAnnee: [{
    annee: number,
    employeur?: string,
    pointsArrco: number,
    pointsAgirc?: number,    // avant 2019 pour les cadres
    pointsGratuits?: number, // chômage, maladie...
    typeGratuit?: string
  }],
  totalPoints: number,
  gmpAppliquee: boolean,
  fusionAgirc2019: boolean   // si des points Agirc ont été convertis
}
```

**Validation complétude :**
- Au moins 1 année avec des points
- Total des points visible
- Si gap suspect dans les années → avertissement

**Message si introuvable :**
```
Objet : Demande de relevé de points

Bonjour,

Je souhaite obtenir mon relevé détaillé de points
Agirc-Arrco par voie électronique.

Numéro de sécurité sociale : [pré-rempli]

Cordialement,
[Prénom Nom]
```
Canal : messagerie agirc-arrco.fr

---

### 4.6 Relevé de mensualités (CARSAT)

| Champ | Valeur |
|-------|--------|
| **Nom officiel** | Relevé de paiements / Relevé de mensualités |
| **Source** | lassuranceretraite.fr → "Mes paiements" → période au choix (FranceConnect) |
| **Format typique** | PDF numérique |
| **Parcours** | Retraité actuel (régime général) |
| **Obligatoire** | ⚪ Optionnel — améliore la précision |

**Ce qu'il contient :**
- Montant net versé chaque mois
- Détail des prélèvements : CSG, CRDS, CASA
- Prélèvement à la source (PAS)
- Taux de CSG appliqué

**Données à extraire :**
```
{
  mensualites: [{
    mois: string,
    brut: number,
    csg: { taux: number, montant: number },
    crds: number,
    casa: number,
    pas: number,
    net: number
  }],
  tauxCSG: number   // taux global appliqué
}
```

**Validation complétude :**
- Au moins 1 mois de paiement visible
- Montant net lisible

**Message si introuvable :** N/A — toujours disponible en ligne sur lassuranceretraite.fr.

---

### 4.7 Attestation fiscale de pension

| Champ | Valeur |
|-------|--------|
| **Nom officiel** | Attestation fiscale / Attestation de revenus |
| **Source** | info-retraite.fr → "Mes attestations" OU lassuranceretraite.fr |
| **Format typique** | PDF numérique |
| **Parcours** | Retraité actuel |
| **Obligatoire** | ⚪ Optionnel — cross-check fiscal |

**Ce qu'il contient :**
- Montant annuel déclaré aux impôts par la caisse de retraite
- Année concernée

**Données à extraire :**
```
{
  annee: number,
  montantDeclare: number,
  caisse: string
}
```

**Validation complétude :**
- Montant et année visibles

---

### 4.8 Avis d'imposition

| Champ | Valeur |
|-------|--------|
| **Nom officiel** | Avis d'imposition sur les revenus |
| **Source** | impots.gouv.fr → "Documents" (FranceConnect) |
| **Format typique** | PDF numérique |
| **Parcours** | Tous (cross-sell + CSG + aides + réversion) |
| **Obligatoire** | ⚪ Optionnel mais fortement recommandé |

**Ce qu'il contient :**
- Revenu Fiscal de Référence (RFR)
- Nombre de parts fiscales
- Montant de l'impôt sur le revenu
- Détail des revenus déclarés (pensions, revenus fonciers, etc.)
- Situation familiale (marié, célibataire, veuf...)

**Données à extraire :**
```
{
  annee: number,
  rfr: number,                // Revenu Fiscal de Référence
  nbParts: number,
  impot: number,
  situationFamiliale: string,
  revenus: {
    pensions: number,
    salaires?: number,
    fonciers?: number,
    capitaux?: number,
    autres?: number
  }
}
```

**Ce que ça débloque dans l'analyse :**
- Niveau 4 (aides) : éligibilité ASPA, CSS, APL via les seuils de revenus
- Niveau 5 (fiscal) : détection demi-part non utilisée, crédit d'impôt → cross-sell MONIMPOT
- Niveau 6 (CSG) : vérification du taux de CSG appliqué vs le RFR
- Réversion : conditions de ressources CNAV/MSA

**Validation complétude :**
- RFR visible et lisible
- Nombre de parts visible
- Année visible

---

### 4.9 Paiements Agirc-Arrco

| Champ | Valeur |
|-------|--------|
| **Nom officiel** | Historique de paiements Agirc-Arrco |
| **Source** | agirc-arrco.fr → "Mes paiements" (FranceConnect) |
| **Format typique** | PDF numérique |
| **Parcours** | Retraité du privé |
| **Obligatoire** | ⚪ Optionnel — vérifie le montant complémentaire versé |

**Ce qu'il contient :**
- Montant complémentaire versé chaque mois
- Prélèvements sociaux
- Coefficient de solidarité (malus) si applicable

**Données à extraire :**
```
{
  paiements: [{
    mois: string,
    brut: number,
    coefficientSolidarite?: number,
    prelevements: number,
    net: number
  }],
  malusActif: boolean,
  dateFinMalus?: date
}
```

---

### 4.10 EIG — Estimation Indicative Globale (pré-retraités ≥55 ans)

| Champ | Valeur |
|-------|--------|
| **Nom officiel** | Estimation Indicative Globale (EIG) |
| **Source** | info-retraite.fr → "Ma future retraite" (FranceConnect) |
| **Format typique** | PDF numérique |
| **Parcours** | Pré-retraité (≥55 ans) |
| **Obligatoire** | ✅ OUI si ≥55 ans, non disponible avant |

**Ce qu'il contient :**
- Estimation de la pension à différents âges de départ (62, 64, 67 ans...)
- Montant base + complémentaire par scénario
- Nombre de trimestres projetés par scénario
- Taux de liquidation projeté

**Données à extraire :**
```
{
  scenarios: [{
    ageDepart: number,
    anneeDepart: number,
    trimestresProjectes: number,
    tauxLiquidation: number,
    pensionBase: number,
    pensionComplementaire: number,
    pensionTotale: number
  }]
}
```

**Validation complétude :**
- Au moins 1 scénario de départ visible avec montant

---

### 4.11 Notification MSA (agriculteurs)

| Champ | Valeur |
|-------|--------|
| **Nom officiel** | Notification d'attribution de pension MSA |
| **Source** | msa.fr → "Ma retraite" → "Mes documents" (FranceConnect) |
| **Parcours** | Retraité agriculteur (salarié ou exploitant) |
| **Obligatoire** | ✅ OUI pour les affiliés MSA |

**Ce qu'il contient :**
- Montant pension base MSA
- Montant pension complémentaire MSA
- Détail du calcul (similaire à la notification CARSAT)
- Revalorisation petites pensions agricoles si applicable

**Données à extraire :** structure similaire à la notification CARSAT, avec champs spécifiques MSA.

**Message si introuvable :**
```
Objet : Demande de duplicata de notification de pension MSA

Bonjour,

Je souhaite recevoir un duplicata de ma notification
d'attribution de pension par voie électronique.

Numéro MSA : [pré-rempli]

Cordialement,
[Prénom Nom]
```
Canal : messagerie msa.fr

---

### 4.12 Relevé RAFP (fonctionnaires)

| Champ | Valeur |
|-------|--------|
| **Nom officiel** | Relevé de droits RAFP |
| **Source** | info-retraite.fr ou rafp.fr |
| **Parcours** | Retraité et pré-retraité fonctionnaire |
| **Obligatoire** | ⚪ Optionnel — améliore la précision complémentaire |

**Ce qu'il contient :**
- Nombre de points RAFP acquis
- Valeur de service du point

**Données à extraire :**
```
{
  totalPoints: number,
  valeurPoint: number,
  montantAnnuel: number
}
```

---

### 4.13 Documents réversion (acte de décès + livret de famille)

| Document | Format | Validation |
|----------|--------|-----------|
| Acte de décès | PDF ou photo | Nom du défunt + date du décès + lieu lisibles |
| Livret de famille | PDF ou photo | Noms des conjoints + date du mariage lisibles |

Ces documents ne sont pas "extraits" par l'IA au sens technique. On vérifie simplement qu'ils sont lisibles et complets pour les joindre aux demandes de réversion.

---

## 5. Analyse progressive — Précision par palier

### Comment la précision évolue

| Documents uploadés | Précision | Niveaux activés | Ce qu'on peut faire |
|-------------------|-----------|-----------------|---------------------|
| Rien | 0% | — | Rien (flash seulement) |
| RIS seul | 40% | N1 partiel | Vérifier la carrière (trimestres, salaires) mais pas comparer avec le versé |
| RIS + notification/titre | 65% | N1 complet | Recalculer la pension et comparer avec le montant attribué |
| RIS + notification + complémentaire | 80% | N1 + N2 | Audit base + complémentaire |
| + formulaire complété | 85% | N1 + N2 + N3 partiel | + détection réversion, majorations enfants |
| + mensualités | 88% | N1 + N2 + N6 partiel | + vérification montant réellement versé + taux CSG |
| + attestation fiscale | 90% | Cross-check | Cohérence entre pension déclarée et pension versée |
| + avis d'imposition | 95% | N1-N6 complets | Tout : aides (N4), fiscal (N5), CSG (N6) |
| + paiements Agirc-Arrco | 98% | Vérification fine | Comparaison points × valeur vs versé complémentaire |
| Tous les documents | 100% | Tout | Audit exhaustif sur les 6 niveaux |

### Affichage pour le client

```
🔍 Précision de votre audit : ████████░░ 80%

Documents analysés : 3/7
✅ RIS · ✅ Notification · ✅ Agirc-Arrco

Pour améliorer la précision :
→ Uploadez votre relevé de mensualités (+8%)
→ Uploadez votre avis d'imposition (+7%)
   ↳ Permet de vérifier vos aides, votre fiscalité et votre taux de CSG
```

### Le diagnostic se relance automatiquement

Chaque nouveau document uploadé relance l'analyse :
- Nouvelles anomalies potentiellement détectées
- Précision des anomalies existantes améliorée (fourchettes resserrées)
- Le client voit le diagnostic se mettre à jour en temps réel
- Notification : "Nouveau document analysé — votre diagnostic a été mis à jour"

---

## 6. Messages pré-rédigés si document introuvable

### Principes
- Chaque message est personnalisé avec les données du client (N° SS, nom, prénom)
- Le message demande explicitement l'envoi par voie électronique
- Ton poli, professionnel, concis
- Le client copie-colle dans la messagerie de l'organisme

### Tableau récapitulatif

| Document | Organisme | Canal | Message type |
|----------|-----------|-------|-------------|
| Notification de pension | CARSAT [région] | Messagerie lassuranceretraite.fr | "Je souhaite recevoir un duplicata de ma notification de retraite par voie électronique." |
| Titre de pension SRE | SRE | Messagerie ensap.gouv.fr | "Je souhaite recevoir un duplicata de mon titre de pension." |
| Décompte CNRACL | CNRACL | Messagerie cnracl.retraites.fr | "Je souhaite recevoir un duplicata de mon décompte de pension." |
| Relevé Agirc-Arrco | Agirc-Arrco | Messagerie agirc-arrco.fr | "Je souhaite obtenir mon relevé détaillé de points." |
| Notification MSA | MSA [dept] | Messagerie msa.fr | "Je souhaite recevoir un duplicata de ma notification de pension MSA." |
| Relevé section CNAVPL | CIPAV/CARMF/etc. | Site de la section | "Je souhaite obtenir mon relevé de points complémentaire." |

Chaque message suit le même template :
```
Bonjour,

[Demande spécifique — 1 phrase]

Numéro de sécurité sociale : [pré-rempli]
Nom : [pré-rempli]
Prénom : [pré-rempli]
Date de naissance : [pré-rempli]

Je vous remercie de bien vouloir me l'adresser par voie électronique.

Cordialement,
[Prénom Nom]
```

---

## 7. Relances par document manquant

### Séquence pour chaque document obligatoire 🔴 non uploadé

| Délai après paiement 9€ | Canal | Contenu |
|--------------------------|-------|---------|
| J+1 | Email | "Votre premier document à récupérer : le RIS. Voici le guide." |
| J+3 | Email | "Avez-vous pu récupérer votre RIS ? [Guide] [Un proche peut m'aider]" |
| J+7 | Email + SMS | "Il vous reste [N] documents à récupérer. Voici où en est votre dossier." |
| J+14 | Email | "Votre dossier est en attente de [documents manquants]. Besoin d'aide ?" |
| J+30 | Email | Rappel sobre avec récap du tableau de mission |
| J+60 | Email | Dernier rappel. "Votre dossier est toujours ouvert." |

### Séquence pour un document en état 🟡 (message envoyé à un organisme)

| Délai après envoi du message | Canal | Contenu |
|------------------------------|-------|---------|
| J+14 | Email | "Avez-vous reçu une réponse de [organisme] concernant votre [document] ?" |
| J+30 | Email | "Toujours en attente ? Voici un message de relance à envoyer." + message pré-rédigé de relance |
| J+60 | Email | "Pas de réponse après 2 mois. Nous pouvons envoyer un courrier recommandé pour vous [14,90€]." |

---

## 8. Données techniques

### Collection documents dans Payload

```
retraitia-documents {
  dossierId: ref → retraitia-dossiers
  type: enum    // ris, notification_carsat, titre_sre, decompte_cnracl,
                // releve_agirc_arrco, mensualites, attestation_fiscale,
                // avis_imposition, paiements_agirc, eig, notification_msa,
                // releve_rafp, releve_rci, releve_cnavpl_section,
                // acte_deces, livret_famille
  status: enum  // todo, waiting, uploaded, validated, refused, extracted
  obligatoire: boolean
  regime: string          // régime concerné
  parcours: enum          // retraite, preretraite, reversion

  // Upload
  files: [{
    fileId: ref → uploads
    filename: string
    format: 'pdf' | 'jpg' | 'png'
    sizeMo: number
    uploadDate: date
    pageNumber?: number    // si upload multi-pages
  }]
  assembledPdfId?: ref    // PDF assemblé si multi-pages

  // Validation
  validation: {
    lisible: boolean
    bonType: boolean
    complet: boolean
    refusMotif?: string    // si refusé : explication
    infosManquantes?: string[]
  }

  // Extraction (rempli par le brief #7)
  extractedData?: object
  extractionDate?: date
  extractionConfiance: number  // 0-100

  // Client confirmation
  clientConfirmed?: boolean
  clientSignalement?: string   // si le client dit "il y a une erreur"

  // Si document introuvable
  messageEnvoye: boolean
  messageDate?: date
  messageOrganisme?: string
  relanceDate?: date
}
```

### Routes API

```
POST   /api/retraitia/documents/upload      → upload + assemblage multi-pages + extraction
POST   /api/retraitia/documents/validate     → validation complétude post-extraction
POST   /api/retraitia/documents/confirm      → le client confirme l'extraction
POST   /api/retraitia/documents/refuse       → le client signale une erreur
POST   /api/retraitia/documents/message-sent → le client a envoyé le message à l'organisme
GET    /api/retraitia/documents/:dossierId   → état de tous les documents du dossier
DELETE /api/retraitia/documents/:id          → supprimer et réuploader un document
```

---

## 9. Métriques collecte

| Métrique | Cible |
|----------|-------|
| Taux upload RIS (1er document) | > 80% des payants |
| Délai moyen 1er upload après paiement | < 48h |
| Nb moyen de documents uploadés / dossier | > 4 |
| Taux de refus pour illisibilité | < 10% |
| Taux de refus pour incomplétude | < 15% |
| Taux de réupload après refus (le client corrige) | > 70% |
| Taux de documents en état "waiting" (message envoyé) | ~20% |
| Délai moyen obtention document après message | < 30 jours |
| Taux abandon (payé 9€ mais aucun upload) | < 10% |

