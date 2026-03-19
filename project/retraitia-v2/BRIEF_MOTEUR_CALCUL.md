# BRIEF_MOTEUR_CALCUL — Règles de calcul tous régimes

**Statut :** ✅ Validé
**Date :** 2026-03-18
**Dépendances :** EXTRACTION_PARSING (#7), DONNEES_REFERENCE (#16), ANOMALY_DETECTION (#9)

---

## 1. Vue d'ensemble

Ce brief contient **toutes les formules de calcul de pension** pour tous les régimes couverts par RETRAITIA. C'est le cerveau mathématique du produit. Si le moteur se trompe, tout le diagnostic est faux.

**Ce brief contient :** les formules, la logique, les conditions, le pseudo-code.
**Ce brief ne contient PAS :** les tables de données brutes (coefficients, PASS, barèmes) → voir DONNEES_REFERENCE (#16).

### Principe fondamental : on ne donne que des chiffres dont on est certain

Si on ne peut pas calculer avec certitude, on le dit. On ne met pas un chiffre faux. On met soit un chiffre exact, soit une fourchette avec explication, soit "données insuffisantes".

### Les 3 niveaux de confiance

| Niveau | Label | Marge | Quand |
|--------|-------|-------|-------|
| 🟢 CERTAIN | "Vérifié" | 0% — exact | Éléments binaires ou entiers : nb trimestres, majoration oui/non, taux CSG |
| 🔵 HAUTE CONFIANCE | "Calculé" | < 1% (~quelques €/mois) | Recalcul complet avec données complètes : SAM, pension théorique, points × valeur |
| 🟡 ESTIMATION | "Estimé" | Fourchette indiquée | Données incomplètes : impact d'anomalies, rachat de trimestres, éligibilité aides |

**Règle d'or :** chaque chiffre affiché au client est accompagné de son niveau de confiance. Le client sait toujours sur quoi on est sûr et sur quoi on estime.

---

## 2. Régime général privé — CNAV/CARSAT

C'est le régime principal : ~14,7 millions de retraités, 70%+ de nos clients.

### 2.1 La formule de base

```
Pension annuelle brute = SAM × Taux × Coefficient de proratisation
Pension mensuelle brute = Pension annuelle brute / 12
```

Puis :
```
Si majoration enfants applicable → Pension × 1,10
Si minimum contributif applicable → max(Pension, minimum contributif)
```

### 2.2 Le SAM (Salaire Annuel Moyen)

**Définition :** moyenne des 25 meilleures années de salaire, revalorisées et plafonnées.

**Pseudo-code :**
```
fonction calculerSAM(carriere[], anneeNaissance):
    // 1. Nombre d'années à retenir
    nbAnnees = getNbAnneesSAM(anneeNaissance)
    // → 25 pour les générations nées à partir de 1948
    // → progressif pour les générations antérieures (10 à 24)
    // → Table dans DONNEES_REFERENCE
    
    // 2. Pour chaque année de carrière au régime général
    salairesRevalorisés = []
    pour chaque année dans carriere:
        si année.regime == 'cnav' ou 'ssi' ou 'msa_salarie':
            // Plafonner au PASS de l'année
            salairePlafonné = min(année.salaire, PASS[année.annee])
            
            // Revaloriser au coefficient de l'année
            salaireRevalorisé = salairePlafonné × COEFF_REVALORISATION[année.annee]
            
            salairesRevalorisés.ajouter(salaireRevalorisé)
    
    // 3. Trier par ordre décroissant et garder les N meilleures
    salairesRevalorisés.trierDécroissant()
    meilleures = salairesRevalorisés.prendre(nbAnnees)
    
    // 4. Calculer la moyenne
    SAM = somme(meilleures) / nbAnnees
    
    retourner SAM
```

**Sources de données :**
- `PASS[année]` : Plafond Annuel de la Sécurité Sociale → DONNEES_REFERENCE
- `COEFF_REVALORISATION[année]` : Coefficient de revalorisation des salaires → DONNEES_REFERENCE
- `getNbAnneesSAM(annéeNaissance)` : Table → DONNEES_REFERENCE

**Niveau de confiance :**
- 🔵 HAUTE CONFIANCE si on a le RIS complet (tous les salaires de toutes les années)
- 🟡 ESTIMATION si des années manquent sur le RIS (on calcule avec ce qu'on a, on indique la marge)

**Points d'attention :**
- Les salaires sont plafonnés au PASS DE L'ANNÉE DE PERCEPTION (pas du PASS actuel)
- Les coefficients de revalorisation sont publiés chaque année par arrêté ministériel
- Pour les polypensionnés en Lura (CNAV + MSA salariés + SSI), les salaires des 3 régimes sont mutualisés pour le SAM → la caisse fait déjà ce calcul, nous on vérifie

### 2.3 Le Taux de liquidation

**Taux plein = 50%**

**Décote (si pas assez de trimestres) :**
```
fonction calculerTaux(trimestresValidésTousRégimes, trimestresRequis, 
                      anneeNaissance, ageAuDépart):
    
    si trimestresValidésTousRégimes >= trimestresRequis:
        // Taux plein atteint par la durée
        taux = 50%
    sinon:
        // Calcul des trimestres manquants
        trimManquantsDurée = trimestresRequis - trimestresValidésTousRégimes
        
        // Trimestres manquants pour atteindre l'âge d'annulation de la décote (67 ans)
        ageAnnulationDecote = getAgeAnnulationDecote(anneeNaissance) // 67 ans pour nés ≥ 1955
        trimManquantsAge = (ageAnnulationDecote - ageAuDépart) × 4 // converti en trimestres
        
        // On retient le plus favorable (le moins de trimestres manquants)
        trimManquants = min(trimManquantsDurée, trimManquantsAge)
        trimManquants = max(0, trimManquants) // pas négatif
        trimManquants = min(20, trimManquants) // plafonné à 20 trimestres
        
        // Taux de décote par trimestre manquant
        tauxDecoteParTrimestre = getTauxDecoteParTrimestre(anneeNaissance)
        // → 0,625% pour les générations nées à partir de 1953
        // → progressif pour les générations antérieures → DONNEES_REFERENCE
        
        taux = 50% - (trimManquants × tauxDecoteParTrimestre)
        taux = max(37.5%, taux) // taux minimum
    
    retourner taux
```

**Surcote (si trimestres au-delà du taux plein APRÈS l'âge légal) :**
```
fonction calculerSurcote(trimestresValidésTousRégimes, trimestresRequis,
                         ageAuDépart, ageLégal):
    
    si ageAuDépart <= ageLégal:
        retourner 0% // pas de surcote avant l'âge légal
    
    si trimestresValidésTousRégimes <= trimestresRequis:
        retourner 0% // pas de surcote si pas au taux plein
    
    // Trimestres effectués après l'âge légal ET au-delà du taux plein
    trimAprèsAgeLégal = (ageAuDépart - ageLégal) × 4
    trimAuDelàTauxPlein = trimestresValidésTousRégimes - trimestresRequis
    
    trimSurcote = min(trimAprèsAgeLégal, trimAuDelàTauxPlein)
    
    surcote = trimSurcote × 1.25% // +1,25% par trimestre
    
    retourner surcote
```

**Niveau de confiance :**
- 🟢 CERTAIN : le taux est déterministe si on connaît les trimestres et l'âge au départ

### 2.4 Le Coefficient de proratisation

```
fonction calculerProratisation(trimestresValidésRégimeGénéral, trimestresRequis):
    
    // Trimestres retenus = validés au régime général uniquement
    // (pas tous régimes — c'est la proratisation d'un seul régime)
    
    coefficient = min(trimestresValidésRégimeGénéral, trimestresRequis) / trimestresRequis
    coefficient = min(1.0, coefficient) // plafonné à 1
    
    retourner coefficient
```

**Point d'attention :**
- La proratisation utilise les trimestres du RÉGIME GÉNÉRAL uniquement
- Le taux de liquidation utilise les trimestres TOUS RÉGIMES
- C'est une source fréquente de confusion et d'erreur

**Niveau de confiance :**
- 🟢 CERTAIN : si on connaît les trimestres au régime général (via le RIS)

### 2.5 La majoration pour enfants

```
fonction calculerMajorationEnfants(nbEnfantsÉlevés, pensionBrute):
    
    si nbEnfantsÉlevés >= 3:
        // +10% sur la pension de base
        // Condition : avoir élevé l'enfant pendant au moins 9 ans avant ses 16 ans
        majoration = pensionBrute × 10%
        retourner majoration
    
    retourner 0
```

**Niveau de confiance :**
- 🟢 CERTAIN : binaire (3+ enfants oui/non). L'info vient du formulaire (absente du RIS).

### 2.6 Le minimum contributif

```
fonction vérifierMinimumContributif(pensionBrute, trimestresValidésRG, 
                                     trimestresRequis, trimCotisésRG,
                                     totalPensionsTousRégimes):
    
    // Condition 1 : avoir le taux plein (50%)
    si taux < 50%:
        retourner { applicable: false }
    
    // Condition 2 : total des pensions (tous régimes) < plafond
    plafondMiCo = PLAFOND_MICO // → DONNEES_REFERENCE (1 367,51€/mois en 2024)
    si totalPensionsTousRégimes >= plafondMiCo:
        retourner { applicable: false }
    
    // Calcul du minimum contributif
    // MiCo simple (si peu de trimestres cotisés)
    miCoSimple = MICO_SIMPLE × (trimestresValidésRG / trimestresRequis)
    // → DONNEES_REFERENCE : 747,57€/mois en 2024
    
    // MiCo majoré (si ≥ 120 trimestres cotisés tous régimes)
    si trimCotisésRG >= 120:
        miCoMajoré = MICO_MAJORE × (trimestresValidésRG / trimestresRequis)
        // → DONNEES_REFERENCE : 903,94€/mois en 2024
    sinon:
        miCoMajoré = miCoSimple
    
    minimumContributif = max(miCoSimple, miCoMajoré)
    
    si pensionBrute < minimumContributif:
        retourner {
            applicable: true,
            montantMiCo: minimumContributif,
            complément: minimumContributif - pensionBrute
        }
    
    retourner { applicable: false }
```

**Point d'attention :**
- Le MiCo est proratisé si la carrière au régime général est incomplète
- Le plafond s'applique sur TOUTES les pensions de retraite (base + complémentaire + tous régimes)
- La distinction cotisés vs validés est absente du RIS depuis 2025 → on la demande dans le formulaire ou on estime

**Niveau de confiance :**
- 🟢 CERTAIN sur l'applicabilité si on a le taux + le total des pensions
- 🔵 HAUTE CONFIANCE sur le montant (dépend de la proratisation exacte)

### 2.7 Âge légal et trimestres requis

```
fonction getAgeLégal(anneeNaissance):
    // Table post-réforme 2023 + suspension LFSS 2026
    // → DONNEES_REFERENCE pour la table complète
    
    // Exemples :
    // Né en 1960 → 62 ans
    // Né en 1961 (sept-déc) → 62 ans et 3 mois
    // Né en 1962 → 62 ans et 6 mois
    // Né en 1963 (jan-mar) → 62 ans et 9 mois  ← GELÉ par LFSS 2026
    // Né en 1963 (avr-déc) → 62 ans et 9 mois  ← GELÉ
    // Né en 1964 → 62 ans et 9 mois             ← GELÉ
    // Né entre 01/1965 et 03/1965 → 62 ans et 9 mois ← GELÉ
    // Né après 03/1965 → en attente de nouveaux textes législatifs

fonction getTrimestresRequis(anneeNaissance):
    // Exemples :
    // Né en 1960 → 167
    // Né en 1961 (jan-août) → 168
    // Né en 1961 (sept-déc) → 169
    // Né en 1962 → 169
    // Né en 1963 (jan-mar) → 170  ← GELÉ par LFSS 2026
    // Né entre 01/1963 et 03/1965 → 170  ← GELÉ
    // Né après 03/1965 → en attente
```

**Suspension de la réforme 2023 (LFSS 2026) :**
La loi de financement de la Sécurité sociale pour 2026 gèle la montée en charge de la réforme à compter du 1er septembre 2026 :
- Âge légal gelé à 62 ans et 9 mois
- Durée d'assurance gelée à 170 trimestres
- Pour toutes les personnes nées entre le 1er janvier 1963 et le 31 mars 1965
- Pour les départs à compter du 1er septembre 2026
- Pour les personnes nées après le 31 mars 1965 : incertitude, en attente de nouveaux textes

**Notre approche :** on utilise les barèmes gelés pour les générations concernées. Pour les nés après 03/1965, on utilise la dernière valeur connue (170 trim, 62 ans 9 mois) avec un avertissement : "Barème susceptible d'évoluer — textes législatifs en attente."

---

## 3. Fonctionnaires — SRE / CNRACL

### 3.1 La formule de base

Fondamentalement différente du privé : pas de SAM, pas de 25 meilleures années.

```
Pension mensuelle brute = Traitement indiciaire brut × Taux × Proratisation / 12
```

Où :
- **Traitement indiciaire brut** = valeur du point d'indice × indice majoré détenu les 6 derniers mois
- **Taux** = jusqu'à 75% (pas 50% comme le privé)
- **Proratisation** = trimestres de services et bonifications / trimestres requis

### 3.2 Le traitement indiciaire brut

```
fonction calculerTraitementIndiciaire(indiceMajoré):
    
    valeurPointIndice = VALEUR_POINT_INDICE // → DONNEES_REFERENCE
    // Valeur du point d'indice FP au 01/01/2026 : à vérifier
    
    traitementAnnuel = indiceMajoré × valeurPointIndice
    traitementMensuel = traitementAnnuel / 12
    
    retourner traitementMensuel
```

**Condition des 6 derniers mois :**
L'indice retenu est celui détenu pendant au moins 6 mois avant la cessation de services. Si le fonctionnaire a changé d'échelon dans les 6 derniers mois, on retient l'indice précédent (sauf exceptions).

**Ce qu'on extrait du titre de pension :** l'indice brut retenu et le traitement correspondant. On vérifie que le traitement correspond bien à l'indice × valeur du point.

### 3.3 Le taux de liquidation

```
fonction calculerTauxFP(trimestresServices, bonifications, trimestresRequis):
    
    trimestresRetenus = trimestresServices + bonifications
    
    // Taux = 75% × (trimestres retenus / trimestres requis)
    // Plafonné à 75%
    taux = 75% × min(trimestresRetenus, trimestresRequis) / trimestresRequis
    
    retourner taux // max 75%
```

**Décote fonctionnaires :**
```
fonction calculerDecoteFP(trimestresValidésTousRégimes, trimestresRequis,
                          ageAuDépart, ageLimiteDécote):
    
    // Mêmes principes que le privé mais :
    // - Le taux de décote est de 1,25% par trimestre manquant (pas 0,625%)
    // - MAIS la décote s'applique sur le taux de liquidation (75%), pas sur 50%
    // - En pratique : 1,25% × 75% = 0,9375% de la pension par trimestre manquant
    
    trimManquantsDurée = trimestresRequis - trimestresValidésTousRégimes
    trimManquantsAge = (ageLimiteDécote - ageAuDépart) × 4
    trimManquants = min(trimManquantsDurée, trimManquantsAge)
    trimManquants = max(0, min(20, trimManquants)) // 0 à 20
    
    décote = trimManquants × 1.25% // sur le taux, pas sur la pension
    
    retourner décote
```

**Surcote fonctionnaires :**
Même logique que le privé : +1,25% par trimestre supplémentaire après l'âge légal et le taux plein.

### 3.4 Les bonifications

Spécifiques aux fonctionnaires :
```
fonction calculerBonifications(enfants, serviceOutreMer, catégorieActive):
    
    bonifications = 0
    
    // Bonification pour enfants (femmes fonctionnaires, sous conditions)
    // 2 trimestres par enfant né avant 2004 (ancien dispositif)
    // Conditions complexes — voir DONNEES_REFERENCE pour la table
    
    // Bonification services outre-mer
    // 1/3 du temps passé outre-mer (dépend du territoire)
    si serviceOutreMer:
        bonifications += serviceOutreMer.trimestres × coefficientOM
    
    // Bonification catégorie active
    // Dépend du corps — pompiers, policiers, etc.
    si catégorieActive:
        bonifications += catégorieActive.bonificationTrimestres
    
    retourner bonifications
```

### 3.5 Le minimum garanti

L'équivalent du minimum contributif pour les fonctionnaires, mais avec des règles différentes :

```
fonction vérifierMinimumGaranti(pensionBrute, annéesDService):
    
    // Formule progressive selon la durée de services
    // → Table complète dans DONNEES_REFERENCE
    
    // Principe : 
    // - Pour les 15 premières années : taux progressif
    // - Au-delà de 15 ans : augmentation par année supplémentaire
    // - Après 40 ans : plafond
    
    minimumGaranti = calculerMinGaranti(annéesDService) // table
    
    si pensionBrute < minimumGaranti:
        retourner {
            applicable: true,
            montant: minimumGaranti,
            complément: minimumGaranti - pensionBrute
        }
    
    retourner { applicable: false }
```

### 3.6 Différences SRE vs CNRACL

| Aspect | SRE (État) | CNRACL (Territorial/Hospitalier) |
|--------|-----------|----------------------------------|
| Employeur | Ministères, administrations centrales | Collectivités, hôpitaux |
| Portail | ensap.gouv.fr | cnracl.retraites.fr |
| Calcul | Identique | Identique |
| Complémentaire | RAFP | RAFP + Ircantec (si contractuel) |
| Catégories actives | Policiers, douaniers, surveillants pénitentiaires... | Pompiers, aides-soignants, éboueurs... |
| Bonifications spécifiques | Services outre-mer, professeurs... | Travail insalubre, dangereux... |

Les formules sont identiques. Ce qui change : les bonifications spécifiques et les contacts.

---

## 4. Retraite complémentaire — Agirc-Arrco

### 4.1 La formule

```
Pension annuelle = Total points × Valeur de service du point
Pension mensuelle = Pension annuelle / 12
```

**Valeur de service du point :**
- 2025 : 1,4386€ (gelée jusqu'à fin octobre 2026)
- Historique → DONNEES_REFERENCE

### 4.2 Vérification des points

```
fonction vérifierPointsAgircArrco(relevéPoints[], carrièreRIS[]):
    
    anomalies = []
    
    pour chaque année dans carrièreRIS:
        si année.regime == 'cnav' et année.trimestres > 0:
            // Cette année devrait avoir des points Agirc-Arrco
            pointsAnnée = relevéPoints.trouver(année.annee)
            
            si pointsAnnée == null ou pointsAnnée.total == 0:
                anomalies.ajouter({
                    type: 'points_manquants',
                    annee: année.annee,
                    description: 'Année cotisée au RG sans points Agirc-Arrco'
                })
    
    // Vérifier les points gratuits (chômage, maladie, maternité)
    pour chaque année dans carrièreRIS:
        si année.type == 'chômage' ou 'maladie' ou 'maternité':
            pointsGratuits = relevéPoints.trouver(année.annee)?.pointsGratuits
            si pointsGratuits == null ou pointsGratuits == 0:
                anomalies.ajouter({
                    type: 'points_gratuits_manquants',
                    annee: année.annee,
                    description: 'Période indemnisée sans points gratuits'
                })
    
    retourner anomalies
```

### 4.3 Majorations Agirc-Arrco

```
fonction calculerMajorationAgircArrco(nbEnfantsÉlevés, nbEnfantsÀCharge,
                                       pensionBrute):
    
    // Option A : +10% pour 3+ enfants élevés (pendant 9 ans avant 16 ans)
    majorationA = 0
    si nbEnfantsÉlevés >= 3:
        majorationA = pensionBrute × 10%
        // Plafonnée à un montant annuel (→ DONNEES_REFERENCE)
    
    // Option B : +5% par enfant à charge au moment de la liquidation
    majorationB = nbEnfantsÀCharge × pensionBrute × 5%
    
    // On applique la plus favorable (non cumulables)
    majoration = max(majorationA, majorationB)
    
    retourner majoration
```

### 4.4 Coefficient de solidarité (malus)

```
fonction calculerMalus(dateDepart, trimestresValidés, trimestresRequis,
                       ageAuDépart, ageLégal):
    
    // Depuis 2019 : malus de -10% pendant 3 ans
    // Condition : départ dès le taux plein, sans trimestre supplémentaire
    
    si dateDepart < 2019-01-01:
        retourner { malusActif: false }
    
    si trimestresValidés == trimestresRequis et ageAuDépart == ageLégal:
        // Départ pile au taux plein sans surcote → malus applicable
        malusActif = true
        dateFinMalus = dateDepart + 3 ans
        
        // Exceptions : exonération si retraité exonéré de CSG ou taux réduit
        si tauxCSG <= 3.8%:
            malusActif = false
        
        retourner { malusActif, dateFinMalus, montantMalus: pension × 10% }
    
    si trimestresValidés >= trimestresRequis + 4:
        // A travaillé 1 an de plus → pas de malus
        retourner { malusActif: false }
    
    // Cas intermédiaire : malus partiel ou nul selon les trimestres supplémentaires
    // Détail → DONNEES_REFERENCE
```

**Vérification importante :** si le retraité a dépassé les 3 ans de malus, vérifier que le malus a bien été levé sur les paiements. C'est une anomalie fréquente.

### 4.5 Fusion Agirc-Arrco 2019

```
fonction vérifierFusion2019(relevéPoints[]):
    
    // Avant 2019 : Arrco (tous salariés) + Agirc (cadres uniquement)
    // En 2019 : fusion → tous les points convertis en points unifiés
    // Coefficient de conversion Agirc → unifié : 0,347791548
    
    pointsAvant2019 = relevéPoints.filtrer(p => p.annee < 2019)
    
    pour chaque année dans pointsAvant2019:
        si année.pointsAgirc > 0:
            // Vérifier la conversion
            pointsConvertis = année.pointsAgirc × 0.347791548
            // Comparer avec les points unifiés post-2019
            // Si écart > 1 point → signaler anomalie potentielle
    
    retourner anomalies
```

### 4.6 GMP (Garantie Minimale de Points)

```
fonction vérifierGMP(relevéPoints[], carrière[]):
    
    // La GMP s'appliquait aux cadres cotisant sur la tranche 1 uniquement
    // (salaire < PASS) avant 2019
    // Garantissait un minimum de points Agirc par an
    
    pour chaque année dans carrière:
        si année.annee < 2019 et année.statut == 'cadre':
            si année.salaire <= PASS[année.annee]:
                pointsAgirc = relevéPoints.trouver(année.annee)?.pointsAgirc
                pointsGMPMinimum = GMP_PAR_ANNEE[année.annee] // → DONNEES_REFERENCE
                
                si pointsAgirc < pointsGMPMinimum:
                    anomalies.ajouter({
                        type: 'gmp_manquante',
                        annee: année.annee,
                        pointsManquants: pointsGMPMinimum - pointsAgirc
                    })
```

---

## 5. RAFP (Retraite Additionnelle de la Fonction Publique)

### Formule

```
Pension RAFP = Total points RAFP × Valeur de service du point RAFP
```

- Régime par points, obligatoire pour tous les fonctionnaires depuis 2005
- Cotisations assises sur les primes et indemnités (dans la limite de 20% du traitement brut)
- Versé en rente si > 5 125 points (au 01/01/2024), sinon en capital

**Valeur du point RAFP** → DONNEES_REFERENCE

**Vérification :**
- Compter que chaque année de service depuis 2005 a généré des points
- Si années sans points → anomalie

---

## 6. Ircantec (contractuels de la fonction publique)

### Formule

```
Pension Ircantec = Total points × Valeur de service du point Ircantec
```

- Pour les agents non titulaires de la fonction publique
- 2 tranches de cotisation
- Valeur du point → DONNEES_REFERENCE

---

## 7. MSA (agriculteurs)

### 7.1 MSA salariés

Même calcul que le régime général (CNAV). Depuis la Lura (2017), les périodes MSA salariés sont fusionnées avec les périodes CNAV pour le calcul.

### 7.2 MSA exploitants

Calcul différent : combinaison d'une retraite forfaitaire + une retraite proportionnelle (par points).

```
fonction calculerPensionMSAExploitant(trimestresExploitant, pointsRetraiteProportionnelle,
                                       trimestresRequis):
    
    // 1. Retraite forfaitaire
    montantForfaitaire = FORFAIT_ANNUEL_MSA × min(trimestresExploitant, trimestresRequis) / trimestresRequis
    // → DONNEES_REFERENCE pour le forfait annuel
    
    // 2. Retraite proportionnelle (par points)
    montantProportionnel = pointsRetraiteProportionnelle × VALEUR_POINT_MSA_EXPLOIT
    // → DONNEES_REFERENCE pour la valeur du point
    
    // 3. Pension totale
    pension = montantForfaitaire + montantProportionnel
    
    // 4. Vérification revalorisation petites pensions agricoles (loi Chassaigne)
    si pension < seuilChassaigne:
        pension = max(pension, MONTANT_CHASSAIGNE) // → DONNEES_REFERENCE
    
    retourner pension / 12 // mensuel
```

**Point crucial :** la revalorisation des petites pensions agricoles (loi Chassaigne, progressive depuis 2021). Beaucoup de retraités agricoles n'ont pas eu la revalorisation correctement appliquée. C'est une anomalie fréquente et facile à détecter.

---

## 8. SSI — Indépendants (ex-RSI)

### 8.1 Retraite de base

Depuis 2020, intégrée au régime général → mêmes formules que CNAV (section 2).

**Point d'attention migration RSI → SSI → CNAV :**
- Les données de carrière ont été transférées entre systèmes
- Des trimestres ont pu "tomber" pendant la migration
- Vérifier la continuité de la carrière autour de 2020

### 8.2 RCI (Retraite Complémentaire des Indépendants)

```
fonction calculerRCI(pointsRCI):
    
    // Régime par points, en extinction progressive
    // Les points acquis avant 2020 sont convertis en euros
    pension = pointsRCI × VALEUR_POINT_RCI // → DONNEES_REFERENCE
    
    retourner pension / 12
```

---

## 9. CNAVPL — Professions libérales

### 9.1 Retraite de base CNAVPL

Régime par points commun à tous les libéraux (hors avocats CNBF).

```
fonction calculerBaseCNAVPL(totalPoints, trimestresValidésTousRégimes,
                             trimestresRequis, ageAuDépart):
    
    // Valeur de service du point CNAVPL
    valeurPoint = VALEUR_POINT_CNAVPL // → DONNEES_REFERENCE
    
    pensionAnnuelle = totalPoints × valeurPoint
    
    // Décote si pas assez de trimestres (tous régimes confondus)
    // Même logique que le régime général
    si trimestresValidésTousRégimes < trimestresRequis:
        coeffDecote = calculerCoeffDecoteCNAVPL(trimestresManquants)
        pensionAnnuelle = pensionAnnuelle × coeffDecote
    
    retourner pensionAnnuelle / 12
```

### 9.2 Complémentaires par section

Chaque section a sa propre complémentaire par points avec ses propres paramètres :

| Section | Particularité du calcul |
|---------|------------------------|
| CIPAV | Points complémentaires, 8 classes de cotisation |
| CARMF (médecins) | ASV (Avantage Social Vieillesse) + complémentaire |
| CARPIMKO (paramédicaux) | 3 tranches de cotisation |
| CARCDSF (dentistes/SF) | Régime par points standard |
| CAVP (pharmaciens) | Régime par capitalisation + répartition |
| CNBF (avocats) | Régime autonome complet (base + complémentaire) |
| CAVEC (experts-comptables) | 6 classes de cotisation |
| CPRN (notaires) | 2 régimes complémentaires (C + T) |
| CAVOM (officiers ministériels) | Points |
| CARPV (vétérinaires) | Points |

**Formule générique pour les complémentaires par section :**
```
Pension complémentaire section = Points section × Valeur point section
```

Les valeurs de points par section → DONNEES_REFERENCE

**Niveau de confiance :**
- 🔵 HAUTE CONFIANCE si on a le relevé de la section avec le total des points
- 🟡 ESTIMATION si on n'a que le RIS (qui ne détaille pas les points complémentaires par section)

---

## 10. Calcul de la réversion

### 10.1 Réversion régime général (CNAV/MSA/SSI)

```
fonction calculerRéversionBase(pensionDéfunt, ressourcesSurvivant, 
                                situationFamiliale):
    
    tauxRéversion = 54%
    réversionBrute = pensionDéfunt × tauxRéversion
    
    // Condition de ressources
    plafondRessources = getPlafondRessourcesRéversion(situationFamiliale)
    // → DONNEES_REFERENCE
    // Seul : ~24 232€/an (2024)
    // En couple (si remarié) : ~38 771€/an
    
    si ressourcesSurvivant > plafondRessources:
        retourner { éligible: false, motif: 'Ressources au-dessus du plafond' }
    
    // Écrêtement si la réversion + ressources > plafond
    si (ressourcesSurvivant + réversionBrute × 12) > plafondRessources × 12:
        réversionÉcrêtée = (plafondRessources - ressourcesSurvivant / 12)
        réversionBrute = max(0, réversionÉcrêtée)
    
    retourner { éligible: true, montantMensuel: réversionBrute }
```

### 10.2 Réversion Agirc-Arrco

```
fonction calculerRéversionAgircArrco(pointsDéfunt):
    
    tauxRéversion = 60%
    réversionAnnuelle = pointsDéfunt × tauxRéversion × VALEUR_POINT_AGIRC_ARRCO
    
    // PAS de condition de ressources
    // PAS d'écrêtement
    
    retourner { éligible: true, montantMensuel: réversionAnnuelle / 12 }
```

### 10.3 Réversion fonctionnaires (SRE/CNRACL)

```
fonction calculerRéversionFP(pensionDéfunt):
    
    tauxRéversion = 50%
    réversion = pensionDéfunt × tauxRéversion
    
    // PAS de condition de ressources
    // PAS de condition d'âge si enfant du mariage ou mariage ≥ 4 ans
    
    retourner { éligible: true, montantMensuel: réversion }
```

### 10.4 Estimation sans notification du défunt

Si on n'a pas la notification de pension du défunt :

```
fonction estimerRéversion(régimesDéfunt, infoFormulaire):
    
    // On estime la pension du défunt à partir de :
    // - Les données du formulaire (montant approximatif si connu)
    // - Les statistiques par régime (pension moyenne)
    
    si infoFormulaire.pensionDéfuntConnue:
        // Le survivant connaît le montant approximatif
        retourner estimationBaséeSurMontantConnu(...)
    sinon:
        // On utilise les moyennes statistiques
        // Pension moyenne régime général : ~1 272€/mois (2024)
        // On donne une FOURCHETTE large
        retourner {
            niveau: 'ESTIMATION',
            fourchette: { min: xxx, max: xxx },
            message: 'Estimation basée sur les moyennes. Le montant exact sera calculé par la caisse.'
        }
```

**Niveau de confiance :**
- 🔵 HAUTE CONFIANCE si on a la notification du défunt (montant exact)
- 🟡 ESTIMATION si on n'a que le formulaire (montant approximatif)
- 🟡 ESTIMATION large si on n'a rien (moyennes statistiques)

---

## 11. Calcul de la CSG

### 11.1 Détermination du taux

```
fonction déterminerTauxCSG(rfr, nbParts):
    
    // Le taux de CSG dépend du RFR de N-2 et du nombre de parts
    // 4 taux possibles
    
    seuils = getSeuilsCSG(nbParts) // → DONNEES_REFERENCE
    // Seuils 2024 pour 1 part :
    // Exonération : RFR ≤ 12 230€
    // Taux réduit 3,8% : RFR ≤ 15 988€
    // Taux médian 6,6% : RFR ≤ 24 813€
    // Taux normal 8,3% : RFR > 24 813€
    
    // Les seuils sont majorés de ~53% par demi-part supplémentaire
    
    si rfr <= seuils.exoneration:
        retourner { taux: 0, label: 'Exonéré' }
    si rfr <= seuils.réduit:
        retourner { taux: 3.8, label: 'Taux réduit' }
    si rfr <= seuils.médian:
        retourner { taux: 6.6, label: 'Taux médian' }
    retourner { taux: 8.3, label: 'Taux normal' }
```

### 11.2 Vérification du taux appliqué

```
fonction vérifierCSG(tauxAppliqué, rfr, nbParts):
    
    tauxThéorique = déterminerTauxCSG(rfr, nbParts)
    
    si tauxAppliqué != tauxThéorique.taux:
        retourner {
            anomalie: true,
            tauxAppliqué: tauxAppliqué,
            tauxThéorique: tauxThéorique.taux,
            impact: (tauxAppliqué - tauxThéorique.taux) / 100 × pensionBrute,
            description: 'Taux CSG trop élevé — vous payez [X]€/mois de trop'
        }
    
    retourner { anomalie: false }
```

**Point clé :** le taux de CSG peut rester "haut" après une variation ponctuelle du RFR (vente immobilière, plus-value). Il devrait revenir au taux normal l'année suivante si le RFR redescend. C'est une anomalie fréquente et facile à détecter.

**Niveau de confiance :**
- 🟢 CERTAIN si on a l'avis d'imposition (RFR exact) + l'attestation de paiement (taux appliqué)

---

## 12. Simulations multi-scénarios (pré-retraités)

### 12.1 Simulation de départ à différents âges

```
fonction simulerScénarios(carrière, formulaire, régime):
    
    scénarios = []
    
    // Pour chaque âge de départ possible (de ageLégal à 67)
    pour age de ageLégal à 67 par pas de 1 an:
        
        // Projeter les trimestres et salaires jusqu'à l'âge de départ
        carrièreProjetée = projeterCarrière(carrière, formulaire.salaireActuel, age)
        
        // Calculer la pension à cet âge
        trimTotaux = compterTrimestres(carrièreProjetée)
        sam = calculerSAM(carrièreProjetée, formulaire.anneeNaissance)
        taux = calculerTaux(trimTotaux, trimestresRequis, formulaire.anneeNaissance, age)
        surcote = calculerSurcote(trimTotaux, trimestresRequis, age, ageLégal)
        prorat = calculerProratisation(trimRégime, trimestresRequis)
        
        pensionBase = sam × (taux + surcote) × prorat / 12
        
        // Complémentaire projetée
        pointsProjetés = projeterPoints(carrière, formulaire.salaireActuel, age)
        pensionCompl = pointsProjetés × valeurPoint / 12
        
        scénarios.ajouter({
            age: age,
            annee: formulaire.anneeNaissance + age,
            trimestres: trimTotaux,
            taux: taux,
            surcote: surcote,
            décote: taux < 50% ? 50% - taux : 0,
            pensionBase: pensionBase,
            pensionComplémentaire: pensionCompl,
            pensionTotale: pensionBase + pensionCompl,
            niveauConfiance: 'ESTIMATION'
        })
    
    retourner scénarios
```

**Niveau de confiance :**
- 🟡 ESTIMATION : les projections dépendent de l'hypothèse que le client continue à cotiser au même rythme. On l'indique clairement : "Estimation basée sur l'hypothèse que vous continuez à travailler dans les mêmes conditions."

### 12.2 Simulation rachat de trimestres

```
fonction simulerRachat(trimestresManquants, annéesÉtudes, ageActuel,
                        salaireActuel, anneeNaissance):
    
    // Maximum rachetable : 12 trimestres
    maxRachetable = min(12, annéesÉtudes × 4, trimestresManquants)
    
    scénarios = []
    
    pour nbTrimestres dans [4, 8, maxRachetable]:
        pour option dans ['taux', 'taux_durée']:
            
            // Coût du rachat (barème officiel, dépend de l'âge et du revenu)
            coût = calculerCoûtRachat(nbTrimestres, option, ageActuel, salaireActuel)
            // → Barème dans DONNEES_REFERENCE
            
            // Gain mensuel sur la pension
            gainMensuel = calculerGainRachat(nbTrimestres, option, sam, trimestresRequis)
            
            // Temps de retour
            tempsRetourMois = coût / gainMensuel
            tempsRetourAns = tempsRetourMois / 12
            
            // Rentabilité (basée sur espérance de vie résiduelle)
            espéranceVie = getEspéranceVie(anneeNaissance) // → DONNEES_REFERENCE
            ansDRetraite = espéranceVie - ageDépart
            rentable = tempsRetourAns < ansDRetraite
            
            scénarios.ajouter({
                nbTrimestres, option, coût, gainMensuel,
                tempsRetourAns, rentable,
                niveauConfiance: 'ESTIMATION'
            })
    
    retourner scénarios
```

---

## 13. Polypensionnés — Vérification multi-régimes

### 13.1 Principe

Pour les polypensionnés, on vérifie **chaque régime séparément** avec ses propres règles.

```
fonction vérifierPolypensionné(carrière, documents, formulaire):
    
    // Identifier les régimes
    régimes = identifierRégimes(carrière)
    
    résultats = []
    
    pour chaque régime dans régimes:
        si régime est dans ['cnav', 'msa_salarie', 'ssi']:
            // Régimes alignés → la Lura fusionne le calcul
            // On vérifie le calcul unifié (une seule notification)
            résultat = vérifierRégimeGénéral(carrière, documents.notification)
            
        si régime == 'sre' ou 'cnracl':
            résultat = vérifierFonctionnaire(carrière, documents.titrePension)
            
        si régime == 'msa_exploitant':
            résultat = vérifierMSAExploitant(carrière, documents.notificationMSA)
            
        si régime == 'cnavpl':
            résultat = vérifierCNAVPL(carrière, documents.relevéSection)
        
        résultats.ajouter(résultat)
    
    // Vérifications transversales
    // Le taux de liquidation utilise les trimestres TOUS RÉGIMES
    trimTotaux = sommerTrimestres(résultats)
    vérifierCohérenceTrimestres(trimTotaux, résultats)
    
    retourner résultats
```

### 13.2 Points d'attention spécifiques aux polypensionnés

| Problème | Détection |
|----------|-----------|
| Trimestres comptés en double | Somme des trimestres par régime > trimestres tous régimes |
| Trimestres tombés lors d'un changement de régime | Gap dans le RIS autour de l'année de transition |
| SAM calculé sans les salaires d'un régime aligné (Lura mal appliquée) | SAM notification < SAM recalculé avec tous les salaires alignés |
| Proratisation incorrecte dans un régime | Coefficient trop bas par rapport aux trimestres validés dans ce régime |

---

## 14. La vérification complète — Assembler le puzzle

### 14.1 Le processus complet pour un retraité du privé

```
fonction vérificationComplète(ris, notification, relevéAA, formulaire, 
                               avisImposition, mensualités):
    
    résultat = {
        niveaux: {},
        anomalies: [],
        confiance: {}
    }
    
    // ── NIVEAU 1 — Retraite de base ──
    
    // Recalculer le SAM
    samRecalculé = calculerSAM(ris.carrière, formulaire.annéeNaissance)
    samNotification = notification.sam
    résultat.confiance.sam = ris.complet ? 'HAUTE_CONFIANCE' : 'ESTIMATION'
    
    si écart(samRecalculé, samNotification) > 1%:
        résultat.anomalies.ajouter({
            niveau: 1, type: 'sam_incorrect',
            samRecalculé, samNotification,
            confiance: résultat.confiance.sam
        })
    
    // Vérifier les trimestres
    trimRIS = ris.totalTrimestres
    trimNotification = notification.trimestresRetenus
    résultat.confiance.trimestres = 'CERTAIN'
    
    si trimRIS != trimNotification:
        résultat.anomalies.ajouter({
            niveau: 1, type: 'trimestres_écart',
            confiance: 'CERTAIN'
        })
    
    // Vérifier trimestres manquants (formulaire vs RIS)
    trimService = formulaire.serviceMilitaire ? Math.ceil(formulaire.duréeMois / 3) : 0
    trimEnfants = formulaire.nbEnfants × 8 // pour les mères
    // ... etc. pour chaque type de trimestre du formulaire
    
    // Vérifier le taux
    tauxRecalculé = calculerTaux(...)
    tauxNotification = notification.taux
    résultat.confiance.taux = 'CERTAIN'
    
    si tauxRecalculé != tauxNotification:
        résultat.anomalies.ajouter({...})
    
    // Vérifier majoration enfants
    si formulaire.nbEnfants >= 3 et !notification.majorationEnfants:
        résultat.anomalies.ajouter({
            niveau: 1, type: 'majoration_enfants_absente',
            confiance: 'CERTAIN',
            impact: notification.montantBrut × 10%
        })
    
    // Vérifier minimum contributif
    miCo = vérifierMinimumContributif(...)
    si miCo.applicable et !notification.minimumContributif:
        résultat.anomalies.ajouter({...})
    
    // Recalculer la pension totale
    pensionRecalculée = samRecalculé × tauxRecalculé × proratisation / 12
    pensionNotification = notification.montantBrut
    
    si écart(pensionRecalculée, pensionNotification) > 1%:
        résultat.anomalies.ajouter({
            niveau: 1, type: 'pension_base_écart',
            recalculé: pensionRecalculée,
            notification: pensionNotification,
            écart: pensionNotification - pensionRecalculée,
            confiance: résultat.confiance.sam
        })
    
    // ── NIVEAU 2 — Complémentaire ──
    
    si relevéAA:
        anomaliesAA = vérifierPointsAgircArrco(relevéAA, ris.carrière)
        résultat.anomalies.concaténer(anomaliesAA)
        
        // Vérifier majoration enfants Agirc-Arrco
        // Vérifier coefficient de solidarité
        // Vérifier fusion 2019 si applicable
        // Vérifier GMP si cadre avant 2019
    
    // ── NIVEAU 3 — Réversion ──
    
    si formulaire.conjointDécédé et !formulaire.réversionPerçue:
        résultat.anomalies.ajouter({
            niveau: 3, type: 'réversion_non_demandée',
            confiance: 'CERTAIN'
        })
    
    // ── NIVEAU 4 — Aides ──
    
    si avisImposition:
        vérifierÉligibilitéASPA(avisImposition, formulaire)
        vérifierÉligibilitéCSS(avisImposition, formulaire)
        // Cross-sell MATAXE si propriétaire +75 ans
    
    // ── NIVEAU 5 — Fiscal ──
    
    si avisImposition:
        vérifierDemiPart(avisImposition, formulaire)
        vérifierCréditImpôtEmploiDomicile(formulaire)
        // Cross-sell MONIMPOT
    
    // ── NIVEAU 6 — CSG ──
    
    si avisImposition et mensualités:
        vérifierCSG(mensualités.tauxCSG, avisImposition.rfr, avisImposition.nbParts)
    
    retourner résultat
```

---

## 15. Gestion de la confiance dans le rapport

### Affichage pour le client

Chaque anomalie dans le rapport est accompagnée d'un badge de confiance :

```
🟢 VÉRIFIÉ    Trimestres service militaire : 4 trimestres manquants
              Source : votre formulaire + votre RIS
              → Confiance maximale

🔵 CALCULÉ    Votre SAM recalculé : 22 450€ vs notification : 21 800€
              Écart : 650€/an soit ~27€/mois sur votre pension
              Source : RIS complet + coefficients officiels
              → Haute confiance (< 1% de marge)

🟡 ESTIMÉ     Impact total des anomalies : entre 85 et 130€/mois
              Estimation basée sur les documents disponibles
              → Fourchette indicative
```

### Agrégation pour le score global

Le score global (Bronze/Argent/Or/Platine) prend en compte :
- Le nombre d'anomalies par niveau de confiance
- L'impact financier cumulé
- La précision de l'audit (% de documents uploadés)

```
fonction calculerScoreGlobal(anomalies, précision):
    
    nbCertaines = anomalies.filtrer(a => a.confiance == 'CERTAIN').length
    nbHauteConfiance = anomalies.filtrer(a => a.confiance == 'HAUTE_CONFIANCE').length
    nbEstimations = anomalies.filtrer(a => a.confiance == 'ESTIMATION').length
    
    impactTotal = sommerImpacts(anomalies)
    
    si nbCertaines + nbHauteConfiance >= 5 et impactTotal.max > 200:
        retourner 'BRONZE' // dossier avec beaucoup de problèmes
    si nbCertaines + nbHauteConfiance >= 3 et impactTotal.max > 100:
        retourner 'ARGENT'
    si nbCertaines + nbHauteConfiance >= 1:
        retourner 'OR'
    retourner 'PLATINE' // très peu ou pas d'anomalies
```

---

## 16. Données techniques

### Structure du moteur

```
src/lib/retraitia/calcul/
  ├── moteur.ts              // Orchestrateur principal (vérificationComplète)
  ├── regimes/
  │   ├── regime-general.ts  // SAM, taux, proratisation, majorations, MiCo
  │   ├── fonctionnaires.ts  // Traitement indiciaire, bonifications, min garanti
  │   ├── agirc-arrco.ts     // Points, majorations, malus, GMP, fusion 2019
  │   ├── rafp.ts            // Points RAFP
  │   ├── ircantec.ts        // Points Ircantec
  │   ├── msa-exploitant.ts  // Forfaitaire + proportionnelle
  │   ├── cnavpl.ts          // Base CNAVPL + complémentaires par section
  │   └── reversion.ts       // Calcul réversion tous régimes
  ├── simulation/
  │   ├── scenarios.ts       // Multi-scénarios départ pré-retraité
  │   ├── rachat.ts          // Simulation rachat trimestres
  │   └── progressive.ts     // Simulation retraite progressive
  ├── verification/
  │   ├── csg.ts             // Vérification taux CSG
  │   ├── polypensionnes.ts  // Vérification multi-régimes
  │   └── trimestres.ts      // Vérification trimestres (formulaire vs RIS)
  ├── confiance.ts           // Calcul des niveaux de confiance
  ├── score.ts               // Score global (Bronze/Argent/Or/Platine)
  └── types.ts               // Types partagés
```

### Interface du moteur

```typescript
interface MoteurResult {
  niveaux: {
    base: NiveauResult
    complementaire: NiveauResult
    reversion: NiveauResult
    aides: NiveauResult
    fiscal: NiveauResult
    csg: NiveauResult
  }
  anomalies: Anomalie[]
  scoreGlobal: 'PLATINE' | 'OR' | 'ARGENT' | 'BRONZE'
  impactTotal: { min: number, max: number }  // €/mois
  impactCumulé: { min: number, max: number } // € total
  précisionAudit: number  // 0-100%
}

interface Anomalie {
  id: string
  niveau: 1 | 2 | 3 | 4 | 5 | 6
  type: string
  label: string
  description: string
  confiance: 'CERTAIN' | 'HAUTE_CONFIANCE' | 'ESTIMATION'
  impact: {
    mensuel: number | { min: number, max: number }
    annuel: number | { min: number, max: number }
  }
  organisme: string
  régime: string
  source: string  // quel document ou formulaire a permis la détection
}
```

---

## 17. Métriques du moteur

| Métrique | Cible |
|----------|-------|
| Temps de calcul complet | < 2 secondes |
| Taux d'anomalies CERTAIN correctes | > 99% |
| Taux d'anomalies HAUTE_CONFIANCE correctes | > 95% |
| Écart moyen pension recalculée vs notification (si données complètes) | < 1% |
| Taux de faux positifs (anomalie signalée alors qu'il n'y en a pas) | < 5% |
| Taux de faux négatifs (anomalie réelle non détectée) | < 10% |
| Couverture des régimes | 100% des régimes listés |

