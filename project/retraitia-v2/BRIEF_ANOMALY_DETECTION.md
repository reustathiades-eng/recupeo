# BRIEF_ANOMALY_DETECTION — Catalogue des anomalies, scoring et détection

**Statut :** ✅ Validé
**Date :** 2026-03-18
**Dépendances :** MOTEUR_CALCUL (#8), DIAGNOSTIC_GRATUIT (#10), MESSAGES_ACTIONS (#12)

---

## 1. Vue d'ensemble

Ce brief est le **catalogue exhaustif de toutes les anomalies détectables** par RETRAITIA, avec pour chacune : la logique de détection, le calcul d'impact, le niveau de confiance, et l'organisme concerné.

**Rôle dans la chaîne :**
- MOTEUR_CALCUL (#8) → recalcule la pension
- **Ce brief** → compare, catégorise, score, chiffre les écarts
- DIAGNOSTIC_GRATUIT (#10) → décide quoi montrer/cacher
- MESSAGES_ACTIONS (#12) → génère le message pour chaque anomalie

**Philosophie :** on ne laisse rien passer. On signale dès que l'impact est > 0€. Mais on préfère les faux négatifs (rater une anomalie) aux faux positifs (en inventer une). On ne signale que ce qu'on peut justifier.

---

## 2. Structure d'une anomalie

Chaque anomalie est définie par :

```typescript
interface AnomalieDefinition {
  id: string                    // ex: 'N1_TRIM_MILITAIRE'
  niveau: 1 | 2 | 3 | 4 | 5 | 6
  catégorie: 'erreur' | 'oubli' | 'opportunité'  
  label: string                 // titre court pour le client
  description: string           // explication détaillée
  
  // Détection
  conditionsDetection: string   // quand est-ce qu'on la signale
  donnéesNécessaires: string[]  // quels documents / champs formulaire
  régimesConcernés: string[]    // quels régimes sont touchés
  
  // Impact
  calculImpact: string          // formule de calcul
  impactTypique: { min: number, max: number }  // fourchette €/mois
  
  // Confiance
  confiance: 'CERTAIN' | 'HAUTE_CONFIANCE' | 'ESTIMATION'
  conditionsConfiance: string   // quand est-on CERTAIN vs ESTIMATION
  
  // Action
  organisme: string
  facilitéCorrection: 'simple' | 'moyen' | 'complexe'
  délaiEstimé: string           // ex: '2-4 mois'
  
  // Fréquence
  fréquenceEstimée: 'très_fréquent' | 'fréquent' | 'occasionnel' | 'rare'
  
  // Prescription
  prescription?: string         // ex: '2 mois pour contestation fonctionnaires'
}
```

---

## 3. Catalogue — Niveau 1 : Retraite de base

### N1_TRIM_COTISES_MANQUANTS — Trimestres cotisés manquants

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Erreur |
| **Label** | "Trimestres de travail non reportés" |
| **Description** | "Des périodes de travail qui apparaissent dans votre mémoire ou vos bulletins de paie ne figurent pas sur votre relevé de carrière." |
| **Détection** | Trous dans le RIS (années sans trimestres alors que le client déclare avoir travaillé), ou nombre de trimestres sur une année < attendu |
| **Données nécessaires** | RIS + formulaire (parcours professionnel) |
| **Régimes** | Tous |
| **Calcul impact** | Selon la position : impact sur le SAM si c'est une des 25 meilleures années + impact sur le taux si ça change le nombre de trimestres total + impact sur la proratisation |
| **Impact typique** | 20-150€/mois selon le nombre de trimestres et leur position |
| **Confiance** | 🟡 ESTIMATION (on détecte un trou mais on ne peut pas être sûr que le client a bien travaillé cette année-là sans justificatif) |
| **Organisme** | CARSAT / SRE / CNRACL / MSA selon le régime |
| **Facilité** | Moyen (nécessite souvent un justificatif : bulletin de paie, attestation employeur) |
| **Délai** | 2-4 mois |
| **Fréquence** | Très fréquent |

### N1_TRIM_MILITAIRE — Service militaire non reporté

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Oubli |
| **Label** | "Service militaire non comptabilisé" |
| **Description** | "Votre service militaire de [durée] mois ne figure pas sur votre relevé de carrière. Il donne droit à [N] trimestres." |
| **Détection** | Formulaire : service militaire = oui + durée. RIS : pas de trimestres "service national" pour la période concernée. |
| **Données nécessaires** | RIS + formulaire (question service militaire) |
| **Régimes** | CNAV (le service militaire est toujours rattaché au régime général) |
| **Calcul impact** | 1 trimestre par période de 90 jours. Impact = effet sur le taux (décote réduite) + proratisation. |
| **Impact typique** | 10-80€/mois (selon que ça change le taux plein ou pas) |
| **Confiance** | 🟢 CERTAIN (le formulaire dit oui + le RIS ne montre pas les trimestres) |
| **Organisme** | CARSAT |
| **Facilité** | Simple (le livret militaire ou une attestation du ministère de la Défense suffit) |
| **Délai** | 2-3 mois |
| **Fréquence** | Fréquent (hommes nés avant 1979) |

### N1_TRIM_ENFANTS — Trimestres enfants non comptés

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Oubli |
| **Label** | "Trimestres pour enfants non comptabilisés" |
| **Description** | "Vous avez [N] enfants. Chaque enfant donne droit à 8 trimestres (4 maternité + 4 éducation pour les mères). Ces trimestres sont absents de votre RIS." |
| **Détection** | Formulaire : nb enfants > 0. RIS : pas de trimestres enfants visibles (ils sont TOUJOURS absents du RIS — c'est une lacune connue du RIS). |
| **Données nécessaires** | Formulaire (nb enfants + dates naissance) |
| **Régimes** | CNAV (+ MSA, SSI selon le régime d'affiliation au moment de la naissance) |
| **Calcul impact** | 8 trimestres × nb enfants pour les mères (4 maternité + 4 éducation). Pour les pères : 0 trimestres maternité + 4 éducation possibles (si choix déclaré). Impact sur taux plein + proratisation. |
| **Impact typique** | 0-200€/mois (énorme si ça fait basculer au taux plein) |
| **Confiance** | 🟡 ESTIMATION (les trimestres enfants ne sont pas sur le RIS, on ne peut pas vérifier s'ils ont été pris en compte dans le calcul de la notification — sauf si la notification détaille les trimestres) |
| **Conditions confiance élevée** | Si la notification détaille "trimestres maternité : 0" et que le formulaire dit 3 enfants → 🟢 CERTAIN |
| **Organisme** | CARSAT + info-retraite.fr ("Déclarer mes enfants") |
| **Facilité** | Simple (livret de famille suffit) |
| **Délai** | 2-3 mois |
| **Fréquence** | Très fréquent (surtout les femmes — c'est l'anomalie #1 en fréquence) |
| **Note** | C'est notre MEILLEUR argument marketing : "Le RIS ne montre pas vos trimestres enfants" |

### N1_TRIM_CHOMAGE — Trimestres chômage indemnisé non reportés

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Erreur |
| **Label** | "Périodes de chômage non comptabilisées" |
| **Description** | "Vos périodes de chômage indemnisé en [années] ne figurent pas sur votre relevé. Chaque période de 50 jours indemnisés donne droit à 1 trimestre." |
| **Détection** | Formulaire : périodes de chômage déclarées. RIS : pas de trimestres assimilés pour ces périodes. OU : trou dans le RIS correspondant à une période probable de chômage. |
| **Données nécessaires** | RIS + formulaire |
| **Régimes** | CNAV |
| **Calcul impact** | 1 trimestre par 50 jours de chômage indemnisé. Max 4 trim/an. |
| **Impact typique** | 15-80€/mois |
| **Confiance** | 🟡 ESTIMATION (sauf si le formulaire est très précis sur les dates) |
| **Organisme** | CARSAT |
| **Facilité** | Moyen (la CARSAT peut vérifier dans les fichiers France Travail via le RNCPS) |
| **Délai** | 2-4 mois |
| **Fréquence** | Fréquent |

### N1_TRIM_MALADIE — Trimestres maladie/maternité/invalidité non reportés

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Erreur |
| **Label** | "Périodes de maladie/maternité non comptabilisées" |
| **Détection** | Trou dans le RIS correspondant à une période d'arrêt maladie (+60 jours = 1 trimestre), maternité, ou invalidité. Croisement avec le formulaire. |
| **Régimes** | CNAV |
| **Calcul impact** | 1 trimestre par 60 jours maladie. Maternité = 1 trimestre par accouchement. |
| **Impact typique** | 10-60€/mois |
| **Confiance** | 🟡 ESTIMATION |
| **Fréquence** | Fréquent |

### N1_TRIM_AVPF — Assurance Vieillesse Parent au Foyer non attribuée

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Oubli |
| **Label** | "Trimestres de parent au foyer non attribués" |
| **Description** | "Si vous avez cessé ou réduit votre activité pour élever un enfant et que vous perceviez certaines prestations (complément familial, allocation parentale...), vous aviez droit à des trimestres gratuits (AVPF)." |
| **Détection** | Formulaire : parent au foyer ou temps partiel pendant la petite enfance + RIS : trous dans la carrière pendant ces périodes |
| **Régimes** | CNAV |
| **Impact typique** | 10-60€/mois |
| **Confiance** | 🟡 ESTIMATION (conditions complexes, on ne peut pas vérifier les prestations familiales perçues) |
| **Fréquence** | Occasionnel mais sous-détecté (droit très méconnu) |

### N1_TRIM_CHOMAGE_NON_INDEMNISE — Chômage non indemnisé

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Oubli |
| **Label** | "Trimestres chômage non indemnisé non comptés" |
| **Description** | "Les périodes de chômage non indemnisé donnent droit à des trimestres : 6 trimestres pour la 1ère période, 4 trimestres si déjà indemnisé avant." |
| **Détection** | Formulaire : périodes de chômage non indemnisé. RIS : pas de trimestres correspondants. |
| **Régimes** | CNAV |
| **Impact typique** | 10-50€/mois |
| **Confiance** | 🟡 ESTIMATION |
| **Fréquence** | Occasionnel |

### N1_TRIM_APPRENTISSAGE — Apprentissage mal reporté

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Erreur |
| **Label** | "Période d'apprentissage mal reportée" |
| **Description** | "Avant 2014, les périodes d'apprentissage étaient souvent mal reportées car les cotisations étaient calculées sur une base forfaitaire." |
| **Détection** | Formulaire : apprentissage avant 2014. RIS : trimestres insuffisants pour cette période. |
| **Régimes** | CNAV |
| **Impact typique** | 5-40€/mois |
| **Confiance** | 🟡 ESTIMATION |
| **Fréquence** | Occasionnel (apprentis avant 2014) |

### N1_TRIM_ETRANGER — Périodes à l'étranger non comptées

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Oubli |
| **Label** | "Périodes de travail à l'étranger non comptabilisées" |
| **Description** | "Vos périodes de travail dans [pays] peuvent être prises en compte pour votre retraite française (accord bilatéral ou règlement européen)." |
| **Détection** | Formulaire : périodes à l'étranger. RIS : pas de trimestres pour ces périodes. Vérification que le pays a un accord avec la France. |
| **Régimes** | CNAV |
| **Impact typique** | 10-100€/mois (selon la durée et l'impact sur le taux plein) |
| **Confiance** | 🟡 ESTIMATION (dépend du pays et de l'accord) |
| **Fréquence** | Occasionnel |
| **Note** | UE/EEE/Suisse : comptent pour le taux plein. Pays avec accord bilatéral : Maroc, Tunisie, Algérie, Canada, USA, Japon... Liste dans DONNEES_REFERENCE. |

### N1_SAM_INCORRECT — Salaire Annuel Moyen mal calculé

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Erreur |
| **Label** | "Salaire annuel moyen potentiellement incorrect" |
| **Description** | "Notre recalcul de votre SAM (basé sur vos 25 meilleures années revalorisées) donne [X]€ alors que votre notification indique [Y]€." |
| **Détection** | Écart > 1% entre le SAM recalculé et le SAM de la notification. |
| **Données nécessaires** | RIS complet (tous les salaires) + notification + tables de revalorisation |
| **Régimes** | CNAV (+ MSA salariés, SSI via Lura) |
| **Calcul impact** | Écart SAM × taux × proratisation / 12 = impact mensuel |
| **Impact typique** | 10-100€/mois |
| **Confiance** | 🔵 HAUTE CONFIANCE (si RIS complet et coefficients exacts) |
| **Organisme** | CARSAT |
| **Facilité** | Complexe (réclamation avec justification du recalcul) |
| **Fréquence** | Occasionnel |

### N1_TAUX_INCORRECT — Taux de liquidation mal calculé

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Erreur |
| **Label** | "Taux de liquidation incorrect" |
| **Description** | "Votre notification indique un taux de [X]% alors que nos calculs donnent [Y]%." |
| **Détection** | Taux notification ≠ taux recalculé (en prenant en compte les trimestres tous régimes) |
| **Données nécessaires** | Notification + RIS (trimestres tous régimes) |
| **Régimes** | CNAV, fonctionnaires |
| **Confiance** | 🟢 CERTAIN (formule déterministe) |
| **Impact typique** | 20-200€/mois (chaque point de taux = ~2% de la pension) |
| **Fréquence** | Rare mais gros impact |

### N1_SURCOTE_ABSENTE — Surcote non appliquée

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Oubli |
| **Label** | "Surcote non appliquée" |
| **Description** | "Vous avez travaillé [N] trimestres au-delà du taux plein après l'âge légal. Cela donne droit à une surcote de +[X]% sur votre pension." |
| **Détection** | RIS : trimestres validés > trimestres requis ET âge au départ > âge légal. Notification : pas de surcote mentionnée ou surcote < à ce qu'on calcule. |
| **Régimes** | CNAV, fonctionnaires |
| **Calcul impact** | +1,25% par trimestre de surcote manquant × pension de base |
| **Impact typique** | 20-150€/mois |
| **Confiance** | 🟢 CERTAIN |
| **Fréquence** | Fréquent |

### N1_DECOTE_EXCESSIVE — Décote trop élevée

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Erreur |
| **Label** | "Décote calculée sur trop de trimestres" |
| **Détection** | Décote notification > décote recalculée (le nombre de trimestres manquants retenu par la caisse est supérieur à notre calcul) |
| **Régimes** | CNAV, fonctionnaires |
| **Impact typique** | 20-200€/mois |
| **Confiance** | 🟢 CERTAIN |
| **Fréquence** | Rare |

### N1_MAJORATION_ENFANTS_ABSENTE — Majoration 10% non appliquée

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Oubli |
| **Label** | "Majoration de 10% pour 3 enfants non appliquée" |
| **Description** | "Vous avez élevé [N] enfants (≥3). Votre pension de base devrait être majorée de 10%. Cette majoration n'apparaît pas sur votre notification." |
| **Détection** | Formulaire : ≥ 3 enfants élevés 9 ans avant 16 ans. Notification : majoration enfants = non ou absente. |
| **Régimes** | CNAV, fonctionnaires (avec des règles légèrement différentes), MSA |
| **Calcul impact** | Pension base × 10% |
| **Impact typique** | 50-200€/mois |
| **Confiance** | 🟢 CERTAIN si notification dit explicitement "majoration : non". 🟡 ESTIMATION si la notification ne détaille pas (la majoration est peut-être incluse sans être mentionnée). |
| **Organisme** | CARSAT / SRE / CNRACL |
| **Facilité** | Simple (livret de famille) |
| **Fréquence** | Très fréquent |
| **Note** | C'est souvent l'anomalie au plus gros impact financier |

### N1_MINIMUM_CONTRIBUTIF — Minimum contributif non appliqué

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Oubli |
| **Label** | "Minimum contributif non appliqué" |
| **Description** | "Votre pension est inférieure au minimum contributif alors que vous avez le taux plein. Vous devriez percevoir au minimum [X]€/mois." |
| **Détection** | Taux plein atteint + pension < seuil MiCo + total pensions tous régimes < plafond MiCo |
| **Régimes** | CNAV |
| **Calcul impact** | MiCo (majoré ou simple selon trimestres cotisés) − pension actuelle |
| **Impact typique** | 30-200€/mois |
| **Confiance** | 🔵 HAUTE CONFIANCE (nécessite de connaître le total des pensions tous régimes) |
| **Fréquence** | Fréquent (petites pensions) |

### N1_PRORATISATION_INCORRECTE — Proratisation incorrecte

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Erreur |
| **Label** | "Coefficient de proratisation incorrect" |
| **Détection** | Proratisation notification ≠ proratisation recalculée |
| **Régimes** | CNAV, fonctionnaires |
| **Impact typique** | 10-100€/mois |
| **Confiance** | 🟢 CERTAIN |
| **Fréquence** | Rare |

### N1_FP_TRAITEMENT_INCORRECT — Traitement indiciaire mal retenu (fonctionnaires)

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Erreur |
| **Label** | "Traitement indiciaire de référence incorrect" |
| **Description** | "L'indice retenu pour le calcul de votre pension ne correspond pas à votre dernier échelon." |
| **Détection** | Titre de pension : indice retenu vs grille indiciaire du grade/échelon |
| **Régimes** | SRE, CNRACL |
| **Impact typique** | 30-200€/mois |
| **Confiance** | 🔵 HAUTE CONFIANCE (si on connaît le grade et l'échelon) |
| **Fréquence** | Occasionnel |

### N1_FP_BONIFICATION_MANQUANTE — Bonifications non comptées (fonctionnaires)

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Oubli |
| **Label** | "Bonifications de services non comptabilisées" |
| **Description** | "Vos bonifications (enfants, services outre-mer, catégorie active) ne semblent pas prises en compte dans le calcul." |
| **Détection** | Formulaire (enfants, outre-mer, catégorie active) vs titre de pension (bonifications = 0 ou insuffisantes) |
| **Régimes** | SRE, CNRACL |
| **Impact typique** | 20-150€/mois |
| **Confiance** | 🟡 ESTIMATION |
| **Fréquence** | Occasionnel |

### N1_FP_MINIMUM_GARANTI — Minimum garanti non appliqué (fonctionnaires)

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Oubli |
| **Label** | "Minimum garanti non appliqué" |
| **Détection** | Pension < minimum garanti pour la durée de services |
| **Régimes** | SRE, CNRACL |
| **Impact typique** | 30-150€/mois |
| **Confiance** | 🔵 HAUTE CONFIANCE |
| **Fréquence** | Occasionnel |

### N1_MSA_REVALORISATION — Revalorisation petites pensions agricoles non appliquée

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Oubli |
| **Label** | "Revalorisation des petites pensions agricoles non appliquée" |
| **Description** | "La loi Chassaigne revalorise les petites pensions agricoles. Votre pension semble ne pas en avoir bénéficié." |
| **Détection** | Pension MSA < seuil Chassaigne + carrière complète au régime agricole |
| **Régimes** | MSA exploitants |
| **Impact typique** | 50-200€/mois |
| **Confiance** | 🔵 HAUTE CONFIANCE |
| **Fréquence** | Fréquent (retraités agricoles) |

### N1_SSI_MIGRATION — Erreur de migration RSI → CNAV

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Erreur |
| **Label** | "Données de carrière perdues lors de la migration RSI" |
| **Description** | "Lors du transfert de votre dossier du RSI vers le régime général en 2020, des trimestres ou des revenus semblent avoir été perdus." |
| **Détection** | RIS : trou ou baisse brutale autour de 2019-2020 pour un ancien indépendant |
| **Régimes** | CNAV (ex-SSI) |
| **Impact typique** | 20-100€/mois |
| **Confiance** | 🟡 ESTIMATION |
| **Fréquence** | Fréquent (indépendants) |

### N1_JOBS_ETE — Jobs d'été / stages rémunérés oubliés

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Oubli |
| **Label** | "Emplois de jeunesse non reportés" |
| **Description** | "Les emplois d'été, stages rémunérés ou petits boulots avant l'informatisation (avant ~1985) sont fréquemment absents des relevés." |
| **Détection** | Formulaire : première activité déclarée plus tôt que la première année sur le RIS |
| **Régimes** | CNAV |
| **Impact typique** | 5-30€/mois (peu de trimestres, mais peut faire basculer sur le taux plein) |
| **Confiance** | 🟡 ESTIMATION |
| **Fréquence** | Occasionnel |

---

## 4. Catalogue — Niveau 2 : Retraite complémentaire

### N2_POINTS_MANQUANTS — Points Agirc-Arrco manquants

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Erreur |
| **Label** | "Points de retraite complémentaire manquants" |
| **Détection** | RIS : année cotisée au régime général. Relevé Agirc-Arrco : 0 points pour cette année. |
| **Régimes** | Agirc-Arrco |
| **Calcul impact** | Points manquants estimés × valeur du point |
| **Impact typique** | 10-80€/mois |
| **Confiance** | 🟢 CERTAIN (si RIS dit cotisé et relevé AA dit 0 points) |
| **Fréquence** | Fréquent |

### N2_POINTS_GRATUITS — Points gratuits non attribués

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Oubli |
| **Label** | "Points gratuits chômage/maladie non attribués" |
| **Description** | "Pendant vos périodes de chômage indemnisé, maladie longue, maternité ou invalidité, vous devriez avoir reçu des points gratuits Agirc-Arrco." |
| **Détection** | RIS : période assimilée (chômage, maladie...). Relevé AA : pas de points gratuits pour cette période. |
| **Régimes** | Agirc-Arrco |
| **Impact typique** | 5-50€/mois |
| **Confiance** | 🟢 CERTAIN |
| **Fréquence** | Fréquent |

### N2_MAJORATION_AA — Majoration enfants Agirc-Arrco non appliquée

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Oubli |
| **Label** | "Majoration enfants Agirc-Arrco non appliquée" |
| **Description** | "Vous avez droit à +10% sur votre complémentaire pour 3+ enfants élevés (ou +5% par enfant à charge). Cette majoration ne semble pas appliquée." |
| **Détection** | Formulaire : ≥ 3 enfants. Paiements Agirc-Arrco : pas de majoration visible. |
| **Régimes** | Agirc-Arrco |
| **Calcul impact** | Pension complémentaire × 10% |
| **Impact typique** | 30-100€/mois |
| **Confiance** | 🟡 ESTIMATION (la majoration est peut-être incluse sans être détaillée) |
| **Fréquence** | Fréquent |

### N2_MALUS_NON_LEVE — Coefficient de solidarité toujours actif après 3 ans

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Erreur |
| **Label** | "Malus Agirc-Arrco toujours actif après 3 ans" |
| **Description** | "Le malus de -10% devait être levé après 3 ans (ou à vos 67 ans). Il semble toujours appliqué sur vos paiements." |
| **Détection** | Date de départ + 3 ans < aujourd'hui OU âge > 67 ans. Paiements AA : malus toujours visible. |
| **Régimes** | Agirc-Arrco |
| **Calcul impact** | Pension complémentaire × 10% |
| **Impact typique** | 30-80€/mois |
| **Confiance** | 🟢 CERTAIN (si on a les paiements Agirc-Arrco + date de départ) |
| **Fréquence** | Occasionnel |

### N2_FUSION_2019 — Erreur de conversion Agirc → unifié

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Erreur |
| **Label** | "Erreur de conversion des points Agirc lors de la fusion 2019" |
| **Détection** | Points Agirc avant 2019 × coefficient 0,347791548 ≠ points unifiés post-2019 (écart > 1 point) |
| **Régimes** | Agirc-Arrco (cadres avant 2019) |
| **Impact typique** | 5-50€/mois |
| **Confiance** | 🔵 HAUTE CONFIANCE |
| **Fréquence** | Occasionnel |

### N2_GMP — Garantie Minimale de Points non comptée

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Oubli |
| **Label** | "Garantie Minimale de Points non attribuée" |
| **Description** | "En tant que cadre cotisant sous le plafond SS avant 2019, vous deviez recevoir un minimum de points Agirc chaque année (GMP)." |
| **Détection** | Cadre avant 2019 + salaire ≤ PASS + points Agirc < GMP de l'année |
| **Régimes** | Agirc-Arrco |
| **Impact typique** | 5-30€/mois |
| **Confiance** | 🔵 HAUTE CONFIANCE |
| **Fréquence** | Occasionnel (cadres) |

### N2_RAFP_MANQUANT — Points RAFP non comptés (fonctionnaires)

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Oubli |
| **Label** | "Points RAFP manquants" |
| **Détection** | Fonctionnaire depuis 2005 + années sans points RAFP sur le relevé |
| **Régimes** | RAFP |
| **Impact typique** | 5-30€/mois |
| **Confiance** | 🟢 CERTAIN (chaque année de service post-2005 doit générer des points) |
| **Fréquence** | Rare |

### N2_IRCANTEC_OUBLIE — Ircantec non comptabilisé (contractuels FP)

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Oubli |
| **Label** | "Points Ircantec non comptabilisés" |
| **Détection** | Formulaire : périodes de contractuel FP. RIS : pas de points Ircantec. |
| **Régimes** | Ircantec |
| **Impact typique** | 10-50€/mois |
| **Confiance** | 🟡 ESTIMATION |
| **Fréquence** | Occasionnel |

### N2_RCI_CONVERSION — Points RCI mal convertis (indépendants)

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Erreur |
| **Label** | "Points de complémentaire indépendant mal convertis" |
| **Détection** | Relevé RCI : vérification du taux de conversion des anciens points RSI |
| **Régimes** | CNAV (ex-SSI) |
| **Impact typique** | 5-40€/mois |
| **Confiance** | 🔵 HAUTE CONFIANCE |
| **Fréquence** | Occasionnel |

---

## 5. Catalogue — Niveau 3 : Réversion

### N3_REVERSION_NON_DEMANDEE — Réversion non demandée

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Oubli |
| **Label** | "Pension de réversion non demandée" |
| **Description** | "Votre conjoint est décédé et vous ne percevez pas de pension de réversion. Vous y avez probablement droit." |
| **Détection** | Formulaire : conjoint décédé = oui + réversion perçue = non ou ne sais pas |
| **Régimes** | Tous les régimes du défunt |
| **Calcul impact** | 54% (CNAV) ou 60% (AA) ou 50% (FP) de la pension du défunt |
| **Impact typique** | 300-1 200€/mois |
| **Confiance** | 🟢 CERTAIN sur le droit, 🟡 ESTIMATION sur le montant (si on n'a pas la notification du défunt) |
| **Facilité** | Simple (demande unique info-retraite.fr + demande AA séparée) |
| **Fréquence** | Fréquent (c'est le parcours réversion) |
| **Note** | C'est souvent l'anomalie au plus gros impact total |

### N3_REVERSION_COMPLEMENTAIRE_OUBLIEE — Réversion complémentaire non demandée

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Oubli |
| **Label** | "Réversion complémentaire non demandée" |
| **Description** | "Vous percevez la réversion de base mais pas la réversion Agirc-Arrco (60% des points de votre conjoint, sans condition de ressources)." |
| **Détection** | Formulaire : réversion base perçue = oui + réversion complémentaire = non |
| **Régimes** | Agirc-Arrco, RAFP, Ircantec |
| **Impact typique** | 150-500€/mois |
| **Confiance** | 🟢 CERTAIN |
| **Fréquence** | Très fréquent (beaucoup ne demandent que la base) |

### N3_REVERSION_MONTANT_INCORRECT — Montant de réversion incorrect

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Erreur |
| **Label** | "Montant de réversion à vérifier" |
| **Détection** | Réversion perçue ≠ taux × pension du défunt (si on a les données) |
| **Impact typique** | 20-100€/mois |
| **Confiance** | 🔵 HAUTE CONFIANCE (si on a la notification du défunt) |
| **Fréquence** | Occasionnel |

---

## 6. Catalogue — Niveau 4 : Aides non réclamées (opportunités)

### N4_ASPA — Éligibilité ASPA non réclamée

| Champ | Valeur |
|-------|--------|
| **Catégorie** | 💡 Opportunité |
| **Label** | "Vous êtes potentiellement éligible à l'ASPA" |
| **Description** | "L'Allocation de Solidarité aux Personnes Âgées (ex-minimum vieillesse) complète vos revenus jusqu'à ~1 012€/mois (seul) ou ~1 571€/mois (couple)." |
| **Détection** | Avis d'imposition : revenus < seuils ASPA + formulaire : ≥ 65 ans |
| **Impact typique** | 100-500€/mois |
| **Confiance** | 🟡 ESTIMATION (conditions de patrimoine non vérifiables) |
| **Fréquence** | Occasionnel |
| **Action** | → cross-sell MESDROITS |

### N4_CSS — Éligibilité CSS

| Champ | Valeur |
|-------|--------|
| **Catégorie** | 💡 Opportunité |
| **Label** | "Complémentaire Santé Solidaire potentiellement accessible" |
| **Détection** | Avis d'imposition : revenus < seuils CSS + formulaire : mutuelle coûteuse ou absente |
| **Impact typique** | 30-100€/mois d'économie mutuelle |
| **Confiance** | 🟡 ESTIMATION |
| **Action** | → cross-sell MESDROITS |

### N4_APL — Éligibilité APL/ALS

| Champ | Valeur |
|-------|--------|
| **Catégorie** | 💡 Opportunité |
| **Label** | "Aide au logement potentiellement accessible" |
| **Détection** | Formulaire : locataire + avis d'imposition : revenus modestes |
| **Impact typique** | 50-300€/mois |
| **Confiance** | 🟡 ESTIMATION |
| **Action** | → guide demande CAF |

### N4_EXONERATION_TF — Exonération taxe foncière

| Champ | Valeur |
|-------|--------|
| **Catégorie** | 💡 Opportunité |
| **Label** | "Exonération de taxe foncière potentiellement accessible" |
| **Détection** | Formulaire : propriétaire + ≥ 75 ans + avis d'imposition : revenus sous seuil |
| **Impact typique** | 300-2 000€/an |
| **Confiance** | 🟡 ESTIMATION |
| **Action** | → cross-sell MATAXE |

### N4_MAPRIME_ADAPT — Éligibilité MaPrimeAdapt'

| Champ | Valeur |
|-------|--------|
| **Catégorie** | 💡 Opportunité |
| **Label** | "Aide à l'adaptation du logement accessible" |
| **Détection** | Formulaire : ≥ 70 ans + propriétaire ou locataire |
| **Impact typique** | Aide ponctuelle 2 000-20 000€ |
| **Confiance** | 🟡 ESTIMATION |
| **Action** | → information |

---

## 7. Catalogue — Niveau 5 : Optimisation fiscale (opportunités)

### N5_DEMI_PART_ANCIEN_COMBATTANT — Demi-part non utilisée

| Champ | Valeur |
|-------|--------|
| **Catégorie** | 💡 Opportunité |
| **Label** | "Demi-part ancien combattant non utilisée" |
| **Détection** | Formulaire : ancien combattant + ≥ 75 ans. Avis d'imposition : nombre de parts ne reflète pas la demi-part. |
| **Impact typique** | 200-1 500€/an |
| **Confiance** | 🟡 ESTIMATION (l'avis ne détaille pas toujours les demi-parts) |
| **Action** | → cross-sell MONIMPOT |

### N5_DEMI_PART_INVALIDITE — Demi-part invalidité non utilisée

| Champ | Valeur |
|-------|--------|
| **Catégorie** | 💡 Opportunité |
| **Label** | "Demi-part invalidité non utilisée" |
| **Détection** | Formulaire : invalidité ≥ 80%. Avis : nombre de parts insuffisant. |
| **Impact typique** | 200-1 500€/an |
| **Action** | → cross-sell MONIMPOT |

### N5_DEMI_PART_PARENT_ISOLE — Demi-part parent isolé

| Champ | Valeur |
|-------|--------|
| **Catégorie** | 💡 Opportunité |
| **Label** | "Demi-part parent isolé potentiellement accessible" |
| **Détection** | Formulaire : veuf/veuve ayant élevé seul(e) un enfant pendant 5 ans. Avis : parts ≤ 1. |
| **Action** | → cross-sell MONIMPOT |

### N5_CREDIT_IMPOT_EMPLOI_DOMICILE — Crédit d'impôt emploi à domicile

| Champ | Valeur |
|-------|--------|
| **Catégorie** | 💡 Opportunité |
| **Label** | "Crédit d'impôt emploi à domicile à vérifier" |
| **Détection** | Formulaire : emploi à domicile = oui. Avis d'imposition : pas de crédit d'impôt visible ou montant faible. |
| **Impact typique** | 500-6 000€/an |
| **Action** | → cross-sell MONIMPOT |

---

## 8. Catalogue — Niveau 6 : CSG/CRDS

### N6_CSG_TROP_ELEVEE — Taux de CSG trop élevé

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Erreur |
| **Label** | "Taux de CSG trop élevé" |
| **Description** | "Votre taux de CSG est de [X]% alors que votre Revenu Fiscal de Référence donne droit à un taux de [Y]%." |
| **Détection** | Avis d'imposition (RFR + nb parts) → taux théorique. Relevé mensualités → taux appliqué. Écart = anomalie. |
| **Régimes** | Tous |
| **Calcul impact** | (Taux appliqué − taux théorique) / 100 × pension brute mensuelle |
| **Impact typique** | 15-80€/mois |
| **Confiance** | 🟢 CERTAIN (RFR et taux sont des chiffres exacts) |
| **Organisme** | CARSAT (c'est la caisse qui applique le taux) |
| **Facilité** | Simple (message à la CARSAT + copie de l'avis d'imposition) |
| **Fréquence** | Fréquent (après une variation ponctuelle du RFR) |

### N6_CSG_POST_VARIATION — Taux CSG pas revenu à la normale après variation ponctuelle

| Champ | Valeur |
|-------|--------|
| **Catégorie** | Erreur |
| **Label** | "Taux de CSG non rétabli après variation exceptionnelle de revenus" |
| **Description** | "Votre RFR a augmenté ponctuellement (plus-value, vente immobilière...) puis est redescendu, mais votre taux de CSG n'a pas été rétabli au taux normal." |
| **Détection** | Si on a 2 avis d'imposition (N et N-1) : RFR N-1 élevé → taux CSG monté → RFR N redescendu → taux CSG pas redescendu |
| **Impact typique** | 15-80€/mois |
| **Confiance** | 🟢 CERTAIN (si on a les 2 avis) |
| **Fréquence** | Occasionnel |

---

## 9. Anomalies spécifiques pré-retraités

### NP_RACHAT_TRIMESTRES — Rachat de trimestres rentable

| Champ | Valeur |
|-------|--------|
| **Catégorie** | 💡 Opportunité |
| **Label** | "Rachat de trimestres potentiellement rentable" |
| **Détection** | Trimestres validés < trimestres requis + années d'études supérieures ou années incomplètes + ROI < 15 ans |
| **Confiance** | 🟡 ESTIMATION (le coût exact dépend du devis de la caisse) |
| **Action** | Simulation multi-scénarios dans le rapport + message pour demander un devis |

### NP_DATE_DEPART_SUBOPTIMALE — Date de départ non optimale

| Champ | Valeur |
|-------|--------|
| **Catégorie** | 💡 Opportunité |
| **Label** | "Date de départ à optimiser" |
| **Description** | "En décalant votre départ de [N] mois, vous gagneriez [X]€/mois grâce à l'annulation de la décote / la surcote." |
| **Détection** | Simulation multi-scénarios : un scénario est significativement meilleur que l'âge de départ souhaité |
| **Confiance** | 🟡 ESTIMATION |

### NP_CUMUL_EMPLOI_RETRAITE — Nouveaux droits cumul emploi-retraite

| Champ | Valeur |
|-------|--------|
| **Catégorie** | 💡 Opportunité |
| **Label** | "Nouveaux droits via le cumul emploi-retraite" |
| **Description** | "Depuis la réforme 2023, si vous partez au taux plein et continuez à travailler, vous acquérez de nouveaux droits à une 2nde pension." |
| **Détection** | Formulaire : activité professionnelle prévue après le départ + taux plein atteint |
| **Confiance** | 🟢 CERTAIN (le droit est objectif) |

### NP_CARRIERE_LONGUE — Éligibilité départ anticipé carrière longue

| Champ | Valeur |
|-------|--------|
| **Catégorie** | 💡 Opportunité |
| **Label** | "Départ anticipé pour carrière longue potentiellement accessible" |
| **Détection** | RIS : début de carrière avant 16/18/20 ans + nb trimestres cotisés ≥ seuil |
| **Confiance** | 🔵 HAUTE CONFIANCE (vérifiable sur le RIS) |

---

## 10. Récapitulatif du catalogue

### Comptage total : 38 anomalies

| Niveau | Nb anomalies | Types |
|--------|-------------|-------|
| N1 — Base | 18 | Erreurs et oublis sur les trimestres, le SAM, le taux, les majorations, le MiCo, spécificités FP/MSA/SSI |
| N2 — Complémentaire | 9 | Points manquants, gratuits, majorations, malus, fusion, GMP, RAFP, Ircantec, RCI |
| N3 — Réversion | 3 | Non demandée, complémentaire oubliée, montant incorrect |
| N4 — Aides | 5 | ASPA, CSS, APL, exonération TF, MaPrimeAdapt' |
| N5 — Fiscal | 4 | Demi-parts, crédit d'impôt |
| N6 — CSG | 2 | Taux trop élevé, non rétabli après variation |
| Pré-retraité | 4 | Rachat, date départ, cumul emploi-retraite, carrière longue |
| **TOTAL** | **41** | |

---

## 11. Scoring et priorisation

### 11.1 Score pour le client (affichage)

Les anomalies sont triées par **impact financier mensuel décroissant**. C'est ce qui parle le plus au client.

```
1. 🔴 Réversion non demandée — ~800€/mois
2. 🔴 Majoration enfants base — ~150€/mois
3. 🔴 Majoration enfants Agirc-Arrco — ~90€/mois
4. 🔴 Trimestres service militaire — ~65€/mois
...
```

### 11.2 Score interne (priorisation technique)

Pour prioriser les anomalies dans le rapport et les actions :

```
fonction scorerAnomalie(anomalie):
    
    // Impact financier (0-50 points)
    scoreImpact = min(50, anomalie.impactMensuel.max / 10)
    
    // Confiance (0-30 points)
    si anomalie.confiance == 'CERTAIN': scoreConfiance = 30
    si anomalie.confiance == 'HAUTE_CONFIANCE': scoreConfiance = 20
    si anomalie.confiance == 'ESTIMATION': scoreConfiance = 10
    
    // Facilité de correction (0-20 points)
    si anomalie.facilité == 'simple': scoreFacilité = 20
    si anomalie.facilité == 'moyen': scoreFacilité = 10
    si anomalie.facilité == 'complexe': scoreFacilité = 5
    
    scoreTotal = scoreImpact + scoreConfiance + scoreFacilité
    
    retourner scoreTotal // max 100
```

Les anomalies avec le score le plus élevé sont présentées en premier dans le rapport et dans l'espace client.

---

## 12. Calcul de l'impact cumulé

### Impact passé (depuis le départ en retraite)

```
fonction calculerImpactPassé(anomalie, dateDépart):
    
    moisDepuisDépart = différenceMois(dateDépart, aujourd'hui)
    
    impactPassé = anomalie.impactMensuel × moisDepuisDépart
    
    retourner impactPassé
```

Affiché : "Vous avez déjà perdu environ [X]€ depuis votre départ en retraite en [année]."

### Impact futur (sur l'espérance de vie)

```
fonction calculerImpactFutur(anomalie, ageActuel, anneeNaissance):
    
    espéranceVie = getEspéranceVie(anneeNaissance, sexe) // → DONNEES_REFERENCE
    annéesRestantes = espéranceVie - ageActuel
    
    impactFutur = anomalie.impactMensuel × 12 × annéesRestantes
    
    retourner impactFutur
```

Affiché : "Si rien ne change, vous perdrez encore environ [Y]€ sur le reste de votre retraite."

### Impact total

```
impactTotal = impactPassé + impactFutur
```

Affiché : "Impact total estimé : [impactPassé]€ déjà perdus + [impactFutur]€ à venir = [impactTotal]€"

**Niveau de confiance de l'impact cumulé :** toujours 🟡 ESTIMATION (car l'espérance de vie est une moyenne et l'impact mensuel peut évoluer avec les revalorisations).

---

## 13. Le score global du dossier

### Calcul du score Bronze / Argent / Or / Platine

```
fonction calculerScoreGlobal(anomalies, précisionAudit):
    
    // Compter les anomalies par confiance (hors opportunités cross-sell)
    erreurs = anomalies.filtrer(a => a.catégorie != 'opportunité')
    
    nbCertaines = erreurs.filtrer(a => a.confiance == 'CERTAIN').length
    nbHauteConfiance = erreurs.filtrer(a => a.confiance == 'HAUTE_CONFIANCE').length
    nbEstimations = erreurs.filtrer(a => a.confiance == 'ESTIMATION').length
    
    impactMax = erreurs.somme(a => a.impactMensuel.max)
    
    // Score inversé : plus c'est bas, plus il y a de problèmes
    si (nbCertaines + nbHauteConfiance) >= 5 ou impactMax > 300:
        retourner 'BRONZE'   // "Votre dossier nécessite une vérification approfondie"
    si (nbCertaines + nbHauteConfiance) >= 3 ou impactMax > 150:
        retourner 'ARGENT'   // "Plusieurs anomalies détectées"
    si (nbCertaines + nbHauteConfiance) >= 1 ou impactMax > 50:
        retourner 'OR'       // "Quelques points à vérifier"
    retourner 'PLATINE'      // "Votre pension semble correcte"
```

### Ce que signifie chaque score

| Score | Signification | Action recommandée |
|-------|--------------|-------------------|
| BRONZE | Dossier avec anomalies significatives | Pack Action fortement recommandé |
| ARGENT | Plusieurs points à vérifier | Pack Action recommandé |
| OR | Quelques points mineurs | Pack Action utile pour optimiser |
| PLATINE | Pension apparemment correcte | Rapport offert si impact < 30€/mois |

---

## 14. Seuils de déclenchement

### Seuil de signalement
On signale TOUTE anomalie dont l'impact est > 0€/mois. "On ne laisse rien passer."

### Seuil gratuit
Si l'impact TOTAL de toutes les anomalies (erreurs + oublis, hors opportunités) < 30€/mois → rapport offert.

### Seuil de confiance minimum
On ne signale une anomalie que si :
- Confiance ≥ ESTIMATION (pas de "peut-être qu'il y a un truc")
- L'anomalie est étayée par au moins une source de données (document ou formulaire)
- La logique de détection est claire et justifiable

### Seuil d'affichage (diagnostic serré vs payant)
- **Diagnostic serré (9€)** : types d'anomalies + nombre + fourchette globale. Pas de détails, pas de montants individuels.
- **Rapport payant (49€)** : tout le détail — montant par anomalie, calcul, source, organisme, message, action.

---

## 15. Gestion des faux positifs

### Stratégie anti-faux positifs

| Principe | Application |
|----------|------------|
| Préférer les faux négatifs aux faux positifs | Si le doute est trop fort, ne pas signaler — mieux vaut rater une anomalie que d'en inventer une |
| Toujours citer la source | "Détecté à partir de votre RIS + formulaire" — le client peut vérifier |
| Utiliser les niveaux de confiance | CERTAIN = on est sûr. ESTIMATION = on recommande de vérifier. |
| Distinguer "erreur" et "à vérifier" | "Votre taux est incorrect" (CERTAIN) vs "Votre majoration enfants est à vérifier" (ESTIMATION) |
| Permettre au client de fermer une anomalie | Si le client dit "c'est normal", il peut marquer l'anomalie comme "vérifiée — pas d'erreur" |

### Sources de faux positifs et mitigations

| Source de faux positif | Mitigation |
|-----------------------|------------|
| Données mal extraites du document | Score de confiance extraction (brief #7) → si faible, on baisse la confiance de l'anomalie |
| Règle de calcul mal implémentée | Tests unitaires exhaustifs sur le moteur (brief #8) |
| Information manquante dans le formulaire | On demande la confirmation au client : "Confirmez-vous que vous avez bien 3 enfants ?" |
| Cas particulier non couvert | On signale en ESTIMATION avec un message "Cette anomalie est à confirmer auprès de votre caisse" |
| Majoration intégrée sans être détaillée | On signale en ESTIMATION : "La majoration n'apparaît pas distinctement. Elle est peut-être incluse dans le montant." |

---

## 16. Données techniques

### Définition des anomalies dans le code

```typescript
// src/lib/retraitia/anomalies/catalogue.ts

export const ANOMALY_CATALOGUE: AnomalieDefinition[] = [
  {
    id: 'N1_TRIM_MILITAIRE',
    niveau: 1,
    catégorie: 'oubli',
    label: 'Service militaire non comptabilisé',
    régimesConcernés: ['cnav'],
    donnéesNécessaires: ['ris', 'formulaire.serviceMilitaire'],
    confiance: 'CERTAIN',
    facilitéCorrection: 'simple',
    fréquenceEstimée: 'fréquent',
    // ... etc.
  },
  // ... 40 autres anomalies
]
```

### Fichiers à créer

```
src/lib/retraitia/anomalies/
  ├── catalogue.ts         // Définitions des 41 anomalies
  ├── detector.ts          // Logique de détection (appelle le moteur)
  ├── scorer.ts            // Scoring et priorisation
  ├── impact.ts            // Calcul d'impact (mensuel, passé, futur)
  ├── score-global.ts      // Score Bronze/Argent/Or/Platine
  └── types.ts             // Types TypeScript
```

### Route API

```
POST /api/retraitia/detect-anomalies
  Input: { dossierId }
  → Récupère les données extraites + formulaire + résultats moteur
  → Exécute le catalogue de détection
  → Score et priorise
  → Sauvegarde dans retraitia-diagnostics
  Output: {
    anomalies: Anomalie[],
    scoreGlobal: 'BRONZE' | 'ARGENT' | 'OR' | 'PLATINE',
    impactTotal: { min, max },  // €/mois
    impactCumuléPassé: number,
    impactCumuléFutur: { min, max },
    nbParNiveau: { n1, n2, n3, n4, n5, n6 },
    précisionAudit: number,     // 0-100%
    seuilGratuit: boolean       // true si impact < 30€/mois
  }
```

---

## 17. Métriques

| Métrique | Cible |
|----------|-------|
| Nb moyen d'anomalies détectées par dossier | > 3 |
| Taux de faux positifs confirmés (client dit "pas d'erreur") | < 5% |
| Anomalie la plus fréquente | N1_TRIM_ENFANTS (estimé) |
| Anomalie au plus gros impact moyen | N3_REVERSION_NON_DEMANDEE |
| Distribution des scores | ~40% Bronze, ~30% Argent, ~20% Or, ~10% Platine |
| Taux de dossiers au seuil gratuit (< 30€/mois) | ~10% |
| Impact moyen total détecté | > 100€/mois |

