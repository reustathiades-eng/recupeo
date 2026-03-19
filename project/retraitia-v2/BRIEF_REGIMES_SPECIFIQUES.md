# BRIEF_REGIMES_SPECIFIQUES — Fiches par régime

**Statut :** ✅ Validé
**Date :** 2026-03-18
**Dépendances :** MOTEUR_CALCUL (#8), COLLECTE (#6), MESSAGES (#12), DONNEES_REFERENCE (#16)

---

## 1. Vue d'ensemble

Ce brief est le **référentiel organisé par régime**. Chaque fiche est auto-suffisante : qui est concerné, quel portail, quels documents, quel calcul, quelles anomalies spécifiques, quels contacts.

### Régimes couverts par le moteur de calcul

| # | Régime | Population retraitée | Fiche |
|---|--------|---------------------|-------|
| 1 | Privé salariés (CNAV + Agirc-Arrco) | ~14,7M | §2 |
| 2 | Fonctionnaires d'État (SRE + RAFP) | ~2M | §3 |
| 3 | Fonctionnaires territoriaux/hospitaliers (CNRACL + RAFP + Ircantec) | ~1M | §4 |
| 4 | Agriculteurs salariés (MSA salariés) | Inclus dans CNAV via Lura | §5 |
| 5 | Agriculteurs exploitants (MSA exploitants) | ~1,5M | §6 |
| 6 | Indépendants (SSI/ex-RSI → CNAV + RCI) | Inclus dans CNAV depuis 2020 | §7 |
| 7 | Professions libérales (CNAVPL + 10 sections + CNBF) | ~480K | §8 |

### Régimes NON couverts par le moteur de calcul

| Régime | Caisse | Fiche |
|--------|--------|-------|
| SNCF, RATP, EDF/GDF, ENIM, CANSSM, CRPCEN, CAVIMAC, FSPOEIE, Banque de France | Chacun sa caisse | §9 |

---

## 2. Fiche — Privé salariés (CNAV/CARSAT + Agirc-Arrco)

### Qui est concerné
- Salariés du secteur privé (CDI, CDD, intérim, apprentis)
- ~14,7 millions de retraités au régime général (dont ex-indépendants et MSA salariés via Lura)
- C'est le régime de référence : 70%+ de nos clients

### Portails et accès

| Site | Accès | Ce qu'on y trouve |
|------|-------|-------------------|
| info-retraite.fr | FranceConnect | RIS, EIG, attestations, correction carrière, réversion |
| lassuranceretraite.fr | FranceConnect | Notification pension, relevé mensualités, attestation fiscale, messagerie CARSAT |
| agirc-arrco.fr | FranceConnect | Relevé de points, paiements, messagerie |

### Documents spécifiques

| Document | Source | Obligatoire |
|----------|--------|-------------|
| RIS | info-retraite.fr | ✅ |
| Notification de pension | lassuranceretraite.fr | ✅ |
| Relevé de points Agirc-Arrco | agirc-arrco.fr | ✅ |
| Relevé de mensualités | lassuranceretraite.fr | ⚪ |
| Attestation fiscale | info-retraite.fr | ⚪ |
| Paiements Agirc-Arrco | agirc-arrco.fr | ⚪ |

### Calcul — Résumé

- **Base :** SAM (25 meilleures années revalorisées plafonnées au PASS) × Taux (50% max) × Proratisation
- **Complémentaire :** Total points × Valeur du point (1,4386€ en 2025)
- **Détail complet →** MOTEUR_CALCUL (#8) sections 2 et 4

### Anomalies les plus fréquentes

| Anomalie | Fréquence | Impact typique |
|----------|-----------|---------------|
| Trimestres enfants non comptés | Très fréquent | 0-200€/mois |
| Majoration enfants base non appliquée | Très fréquent | 50-200€/mois |
| Majoration enfants Agirc-Arrco non appliquée | Fréquent | 30-100€/mois |
| Trimestres service militaire absents | Fréquent (hommes >60 ans) | 10-80€/mois |
| Points Agirc-Arrco manquants | Fréquent | 10-80€/mois |
| Points gratuits non attribués | Fréquent | 5-50€/mois |
| Surcote non appliquée | Fréquent | 20-150€/mois |
| Minimum contributif non appliqué | Fréquent (petites pensions) | 30-200€/mois |
| Malus Agirc-Arrco non levé après 3 ans | Occasionnel | 30-80€/mois |
| Fusion Agirc 2019 mal convertie | Occasionnel | 5-50€/mois |

### Contacts et escalade

| Étape | Canal | Destinataire |
|-------|-------|-------------|
| Message initial base | Messagerie lassuranceretraite.fr | CARSAT régionale |
| Message initial complémentaire | Messagerie agirc-arrco.fr | Agirc-Arrco |
| Correction carrière (≥55 ans) | info-retraite.fr → "Corriger ma carrière" | Transmis au bon régime |
| LRAR base | Courrier recommandé | CARSAT [adresse régionale → DONNEES_REFERENCE] |
| LRAR complémentaire | Courrier recommandé | Agirc-Arrco — 16-18 rue Jules César, 75592 Paris Cedex 12 |
| CRA | En ligne (lassuranceretraite.fr) ou LRAR | CRA de la CARSAT |
| Médiateur base | LRAR | Médiateur de l'Assurance Retraite — 36 rue de Valmy, 93108 Montreuil Cedex |
| Médiateur complémentaire | LRAR | Médiateur Agirc-Arrco — 16-18 rue Jules César, 75592 Paris Cedex 12 |

### Réversion

| Élément | Valeur |
|---------|--------|
| Taux base CNAV | 54% de la pension du défunt |
| Condition de ressources | OUI : ~24 232€/an (seul), ~38 771€/an (couple) |
| Condition d'âge | ≥ 55 ans |
| Remariage | Perte du droit |
| Taux Agirc-Arrco | 60% des points du défunt |
| Condition de ressources AA | NON |
| Demande | Demande unique info-retraite.fr (base) + demande séparée agirc-arrco.fr |
| Rétroactivité | 12 mois max |

---

## 3. Fiche — Fonctionnaires d'État (SRE + RAFP)

### Qui est concerné
- Fonctionnaires titulaires de l'État : ministères, administrations centrales, enseignants du public, magistrats, militaires
- ~2 millions de retraités
- Géré par le SRE (Service des Retraites de l'État)

### Portails et accès

| Site | Accès | Ce qu'on y trouve |
|------|-------|-------------------|
| info-retraite.fr | FranceConnect | RIS inter-régimes, EIG, relevé RAFP |
| ensap.gouv.fr | FranceConnect | Titre de pension, bulletin de pension mensuel, simulation, messagerie SRE |

### Documents spécifiques

| Document | Source | Obligatoire |
|----------|--------|-------------|
| RIS | info-retraite.fr | ✅ |
| Titre de pension | ensap.gouv.fr → "Mon dossier" | ✅ |
| Relevé RAFP | info-retraite.fr | ⚪ |
| Bulletin de pension mensuel | ensap.gouv.fr | ⚪ |
| Avis d'imposition | impots.gouv.fr | ⚪ |

### Calcul — Spécificités

| Élément | Régime général | Fonctionnaires État |
|---------|---------------|-------------------|
| Base de calcul | SAM (25 meilleures années) | Traitement indiciaire brut des 6 derniers mois |
| Taux plein | 50% | 75% |
| Décote par trimestre | 0,625% | 1,25% (sur le taux, soit ~0,9375% sur la pension) |
| Surcote | +1,25%/trimestre | +1,25%/trimestre |
| Minimum | Minimum contributif | Minimum garanti (table progressive) |
| Primes | Non prises en compte | Non prises en compte (mais cotisent au RAFP) |
| Complémentaire | Agirc-Arrco (points) | RAFP (points sur les primes) |

**Formule :**
```
Pension = Traitement indiciaire brut × (75% × Trimestres retenus / Trimestres requis)
+ Bonifications éventuelles
+ RAFP (Total points × Valeur point RAFP)
```

### Bonifications spécifiques

| Bonification | Condition | Impact |
|-------------|-----------|--------|
| Enfants (ancien dispositif) | Femmes, enfants nés avant 2004 | +2 trimestres/enfant |
| Services outre-mer | Affectation DOM-TOM ou étranger | +1/3 du temps (variable selon territoire) |
| Catégorie active | Policiers, douaniers, surveillants pénitentiaires, enseignants spécialisés... | Départ anticipé -5 ans + bonifications de durée |
| Campagnes militaires | Militaires ayant participé à des opérations | Variable |

### Anomalies les plus fréquentes

| Anomalie | Spécificité FP État |
|----------|-------------------|
| Traitement indiciaire mal retenu | L'indice des 6 derniers mois n'est pas le bon (changement d'échelon récent) |
| Bonifications enfants absentes | Surtout pour les départs récents post-2004 |
| Services outre-mer non bonifiés | Fréquent pour les anciens coopérants, militaires |
| NBI non prise en compte | La Nouvelle Bonification Indiciaire est parfois oubliée |
| Minimum garanti non appliqué | Fonctionnaires avec petites pensions |
| RAFP manquant | Années sans points depuis 2005 |
| Revalorisation non appliquée | Bug informatique SRE signalé en 2025 |

### Contacts et escalade

| Étape | Canal | Destinataire |
|-------|-------|-------------|
| Message initial | Messagerie ensap.gouv.fr | SRE |
| Message au service RH | Email/courrier à l'ancien employeur (ministère) | Service RH de l'administration d'origine |
| LRAR | Courrier recommandé | SRE — 10 boulevard Gaston Doumergue, 44964 Nantes Cedex 9 |
| CRA | LRAR | CRA du SRE — même adresse |
| Médiateur | Via le Défenseur des droits | defenseurdesdroits.fr |

### Réversion

| Élément | Valeur |
|---------|--------|
| Taux | 50% de la pension du défunt |
| Condition de ressources | NON |
| Condition d'âge | Pas de condition si ≥1 enfant du mariage OU mariage ≥ 4 ans |
| Remariage / PACS | Perte du droit |
| Rétroactivité | Pas de limite |
| Demande | Messagerie ensap.gouv.fr ou service RH de l'ancien employeur |

---

## 4. Fiche — Fonctionnaires territoriaux/hospitaliers (CNRACL + RAFP + Ircantec)

### Qui est concerné
- Fonctionnaires titulaires des collectivités territoriales (communes, départements, régions, intercommunalités) et des hôpitaux publics
- ~1 million de retraités CNRACL
- Pompiers, agents administratifs territoriaux, personnels hospitaliers (aides-soignants, infirmiers titulaires...)

### Portails et accès

| Site | Accès | Ce qu'on y trouve |
|------|-------|-------------------|
| info-retraite.fr | FranceConnect | RIS, EIG, relevé RAFP |
| cnracl.retraites.fr (Ma retraite publique) | FranceConnect | Décompte de pension, attestations, messagerie CNRACL |

### Documents spécifiques

| Document | Source | Obligatoire |
|----------|--------|-------------|
| RIS | info-retraite.fr | ✅ |
| Décompte définitif de pension CNRACL | cnracl.retraites.fr | ✅ |
| Relevé RAFP | info-retraite.fr | ⚪ |
| Relevé Ircantec (si périodes contractuelles) | info-retraite.fr | ⚪ selon profil |
| Avis d'imposition | impots.gouv.fr | ⚪ |

### Calcul — Spécificités

Identique au SRE (section 3) : traitement indiciaire, 75%, bonifications, minimum garanti. Mêmes formules.

**Différence principale :** les catégories actives sont différentes :

| Catégorie active SRE | Catégorie active CNRACL |
|----------------------|------------------------|
| Policiers, douaniers, surveillants pénitentiaires | Pompiers, policiers municipaux, aides-soignants hospitaliers |
| Enseignants spécialisés | Agents d'entretien travaux insalubres |
| Militaires | Éboueurs, égoutiers |

### Contractuels — Ircantec

Les agents NON titulaires (contractuels) de la fonction publique ne cotisent PAS à la CNRACL mais au régime général (CNAV) + Ircantec (complémentaire).

**Attention :** un fonctionnaire peut avoir été contractuel avant d'être titularisé. Il a donc des droits CNAV + Ircantec pour la période contractuelle ET des droits CNRACL + RAFP pour la période titulaire. C'est un polypensionné complexe.

### Anomalies les plus fréquentes

Mêmes que le SRE (section 3) + :

| Anomalie | Spécificité CNRACL |
|----------|-------------------|
| Périodes contractuelles non comptées à l'Ircantec | Fréquent si titularisation tardive |
| Bonification travail insalubre/dangereux absente | Pompiers, éboueurs, agents hospitaliers |
| Revalorisation non appliquée | Bug informatique signalé en 2025 |

### Contacts et escalade

| Étape | Canal | Destinataire |
|-------|-------|-------------|
| Message initial | Messagerie cnracl.retraites.fr | CNRACL |
| Message employeur | Courrier/email à la collectivité ou l'hôpital | Service RH de l'ancien employeur |
| LRAR | Courrier recommandé | CNRACL — Rue du Vergne, 33059 Bordeaux Cedex |
| CRA | LRAR | CRA de la CNRACL — même adresse |
| Médiateur | Via le Défenseur des droits | defenseurdesdroits.fr |

### Réversion

Identique au SRE : 50%, pas de condition de ressources, pas de condition d'âge si enfant ou mariage ≥ 4 ans, perte si remariage ou PACS. Rétroactivité sans limite.

---

## 5. Fiche — Agriculteurs salariés (MSA salariés)

### Qui est concerné
- Salariés d'exploitations agricoles, de coopératives, d'organismes agricoles
- Intégrés dans la Lura depuis 2017 : calcul unifié avec le régime général

### Portails et accès

| Site | Accès | Ce qu'on y trouve |
|------|-------|-------------------|
| info-retraite.fr | FranceConnect | RIS, EIG |
| msa.fr | FranceConnect | Espace personnel, documents, messagerie |
| lassuranceretraite.fr | FranceConnect | Notification (si Lura → calcul unifié CNAV) |

### Calcul — Spécificités

Depuis la Lura (2017, pour les nés ≥ 1953) : **identique au régime général**. Les périodes MSA salariés sont fusionnées avec les périodes CNAV pour le calcul du SAM et de la proratisation.

Pour les nés avant 1953 (pas de Lura) : calcul séparé MSA salariés, mêmes formules que CNAV mais proratisation sur les trimestres MSA uniquement.

### Anomalies spécifiques

| Anomalie | Détail |
|----------|--------|
| Périodes MSA non intégrées dans la Lura | Vérifier que les salaires MSA sont bien dans le SAM unifié |
| Trimestres d'aide familial non comptés | Les périodes d'aide familial (avant installation) sont souvent oubliées |

### Contacts

| Étape | Canal | Destinataire |
|-------|-------|-------------|
| Message initial | Messagerie msa.fr | MSA départementale |
| LRAR | Courrier recommandé | MSA [adresse départementale → DONNEES_REFERENCE] |

### Réversion

Identique au régime général : 54%, condition de ressources, ≥ 55 ans, perte si remariage, rétroactivité 12 mois.

---

## 6. Fiche — Agriculteurs exploitants (MSA exploitants)

### Qui est concerné
- Chefs d'exploitation agricole, conjoints collaborateurs, aides familiaux
- ~1,5 million de retraités
- Pensions notoirement basses — c'est le régime avec les pensions les plus faibles de France

### Portails et accès

| Site | Accès | Ce qu'on y trouve |
|------|-------|-------------------|
| info-retraite.fr | FranceConnect | RIS |
| msa.fr | FranceConnect | Notification MSA, relevé complémentaire, messagerie |

### Documents spécifiques

| Document | Source | Obligatoire |
|----------|--------|-------------|
| RIS | info-retraite.fr | ✅ |
| Notification de pension MSA | msa.fr | ✅ |
| Relevé complémentaire MSA | msa.fr | ✅ |
| Avis d'imposition | impots.gouv.fr | ⚪ |

### Calcul — Spécificités

**Fondamentalement différent du régime général.** Combinaison de 2 composantes :

**1. Retraite forfaitaire :**
```
Forfait = Montant forfaitaire annuel × (Trimestres exploitant / Trimestres requis)
```
Le montant forfaitaire annuel → DONNEES_REFERENCE

**2. Retraite proportionnelle (par points) :**
```
Proportionnelle = Points retraite proportionnelle × Valeur du point MSA exploitant
```
La valeur du point MSA exploitant → DONNEES_REFERENCE

**3. Revalorisation petites pensions (loi Chassaigne) :**
Depuis 2021 (progressif), les pensions agricoles des exploitants ayant une carrière complète sont revalorisées pour atteindre un minimum (~85% du SMIC). C'est LA source d'anomalie principale pour ce régime.

**4. Complément Différentiel de Points (CDP) :**
Dispositif complémentaire pour les retraités agricoles les plus modestes.

### Anomalies les plus fréquentes

| Anomalie | Fréquence | Impact |
|----------|-----------|--------|
| Revalorisation Chassaigne non appliquée | Très fréquent | 50-200€/mois |
| Points proportionnels manquants | Fréquent | 10-60€/mois |
| Périodes d'aide familial oubliées | Fréquent | 10-40€/mois |
| CDP non attribué | Occasionnel | 20-100€/mois |
| Conjoint collaborateur non comptabilisé | Occasionnel | 20-80€/mois |

### Contacts

| Étape | Canal | Destinataire |
|-------|-------|-------------|
| Message initial | Messagerie msa.fr | MSA départementale |
| LRAR | Courrier recommandé | MSA [adresse départementale] |
| CRA | LRAR | CRA de la MSA départementale |
| Médiateur | LRAR | Médiateur MSA départemental |

### Réversion

Identique au régime général : 54%, condition de ressources, ≥ 55 ans.

---

## 7. Fiche — Indépendants (SSI/ex-RSI → CNAV + RCI)

### Qui est concerné
- Artisans, commerçants, micro-entrepreneurs (hors professions libérales)
- Intégrés au régime général (CNAV) depuis le 1er janvier 2020
- L'ex-RSI (Régime Social des Indépendants) a été supprimé

### Portails et accès

| Site | Accès | Ce qu'on y trouve |
|------|-------|-------------------|
| info-retraite.fr | FranceConnect | RIS |
| lassuranceretraite.fr | FranceConnect | Notification, mensualités, messagerie CARSAT |

### Documents spécifiques

| Document | Source | Obligatoire |
|----------|--------|-------------|
| RIS | info-retraite.fr | ✅ |
| Notification de pension | lassuranceretraite.fr | ✅ |
| Relevé RCI (complémentaire indépendants) | lassuranceretraite.fr | ✅ |
| Avis d'imposition | impots.gouv.fr | ⚪ |

### Calcul — Spécificités

**Base :** identique au régime général (SAM, taux, proratisation). Les périodes ex-RSI sont intégrées dans le calcul CNAV.

**Complémentaire RCI :** régime par points, en extinction progressive. Les points acquis avant 2020 sont convertis en euros.
```
Pension RCI = Points RCI × Valeur du point RCI
```
Valeur du point RCI → DONNEES_REFERENCE

### Anomalies les plus fréquentes

| Anomalie | Détail |
|----------|--------|
| Données perdues lors de la migration RSI → CNAV (2020) | Trous dans le RIS autour de 2019-2020 |
| Points RCI mal convertis | Taux de conversion incorrect |
| Cotisations minimales non validantes | L'indépendant a cotisé au minimum mais n'a pas validé 4 trimestres certaines années |
| Conjoint collaborateur oublié | Droits spécifiques méconnus |
| Minimum contributif non appliqué | Fréquent (beaucoup d'indépendants ont des revenus irréguliers) |

### Contacts

Mêmes que le régime général : messagerie lassuranceretraite.fr → CARSAT régionale.

### Réversion

Identique au régime général.

---

## 8. Fiche — Professions libérales (CNAVPL + sections + CNBF)

### Qui est concerné
- Professions libérales réglementées : médecins, architectes, infirmiers, avocats, notaires, pharmaciens, experts-comptables, vétérinaires...
- ~480 570 retraités CNAVPL + ~65 000 CNBF (avocats)
- 10 sections CNAVPL + CNBF = 11 caisses complémentaires différentes

### Portails et accès

| Site | Accès | Ce qu'on y trouve |
|------|-------|-------------------|
| info-retraite.fr | FranceConnect | RIS (base CNAVPL incluse), EIG |
| Site de la section | Variable | Relevé complémentaire, messagerie |
| cnavpl.fr | Informations générales | Pas d'espace personnel client |

### Documents spécifiques

| Document | Source | Obligatoire |
|----------|--------|-------------|
| RIS | info-retraite.fr | ✅ |
| Notification de pension CNAVPL | info-retraite.fr ou section | ✅ |
| Relevé complémentaire de la section | Site de la section | ✅ |
| Avis d'imposition | impots.gouv.fr | ⚪ |

### Calcul — Base CNAVPL (commune à toutes les sections)

Régime par points, identique pour tous les libéraux (hors avocats CNBF) :

```
Pension base = Total points CNAVPL × Valeur de service du point
```

- Cotisations sur 2 tranches (T1 ≤ 85% PASS, T2 entre 85% et 500% PASS)
- Décote si trimestres insuffisants (tous régimes confondus)
- Surcote possible
- Majoration enfants : +10% pour 3+ enfants (depuis la réforme 2023)
- Valeur du point CNAVPL → DONNEES_REFERENCE

### Calcul — Complémentaires par section

| Section | Professions | Spécificités calcul |
|---------|-----------|-------------------|
| **CIPAV** | Architectes, ingénieurs, consultants, psychologues... | 8 classes de cotisation, régime par points. La CIPAV a été épinglée par la Cour des Comptes pour gestion défaillante → vivier d'erreurs. |
| **CARMF** | Médecins | ASV (Avantage Social Vieillesse) financé par la CPAM pour les conventionnés secteur 1 + régime complémentaire. Points ASV très valorisés. |
| **CARPIMKO** | Infirmiers, kinés, orthophonistes, pédicures, orthoptistes | 3 tranches de cotisation. Âge de départ parmi les plus bas des libéraux. |
| **CARCDSF** | Chirurgiens-dentistes, sages-femmes | Régime par points standard. |
| **CAVP** | Pharmaciens | Particularité : régime mixte répartition + capitalisation. Part en capitalisation = rente viagère. |
| **CNBF** | Avocats | Régime AUTONOME (pas CNAVPL). Base + complémentaire gérées par la CNBF. Règles propres. |
| **CAVEC** | Experts-comptables, commissaires aux comptes | 6 classes de cotisation. |
| **CPRN** | Notaires | 2 régimes complémentaires (C et T). Pensions élevées. |
| **CAVOM** | Officiers ministériels (huissiers, greffiers) | Régime par points. |
| **CARPV** | Vétérinaires | Régime par points. Petite section. |
| **CAVAMAC** | Agents généraux d'assurance | Régime par points. |

### Formule générique complémentaire section

```
Pension complémentaire = Points section × Valeur de service du point section
```

Valeurs des points par section → DONNEES_REFERENCE

### Anomalies les plus fréquentes

| Anomalie | Détail |
|----------|--------|
| Points base CNAVPL manquants | Années sans points alors que le libéral cotisait |
| Points complémentaire section manquants | Idem pour la complémentaire |
| CIPAV : erreurs de gestion | La Cour des Comptes a documenté de nombreuses erreurs (mauvaise affiliation, points non crédités) |
| Majoration enfants non appliquée (base) | Nouveau droit depuis 2023, pas toujours appliqué |
| Micro-entrepreneurs mal affiliés | Depuis 2018, certains libéraux non réglementés vont au régime général au lieu de la CIPAV — confusion |
| Avocats CNBF : confusion avec CNAVPL | Certains avocats pensent être à la CNAVPL alors qu'ils sont à la CNBF |

### Contacts

| Section | Contact | Adresse LRAR |
|---------|---------|-------------|
| CNAVPL (base) | info-retraite.fr | CNAVPL — 102 rue de Miromesnil, 75008 Paris |
| CIPAV | cipav-retraite.fr | CIPAV — 9 rue de Vienne, 75403 Paris Cedex 08 |
| CARMF | carmf.fr | CARMF — 46 rue Saint-Ferdinand, 75017 Paris |
| CARPIMKO | carpimko.com | CARPIMKO — 6 place Charles de Gaulle, 78882 St-Quentin-en-Yvelines Cedex |
| CARCDSF | carcdsf.fr | CARCDSF — 50 avenue Hoche, 75381 Paris Cedex 08 |
| CAVP | cavp.fr | CAVP — 21 rue Leblanc, 75015 Paris |
| CNBF | cnbf.fr | CNBF — 11 boulevard de Sébastopol, 75001 Paris |
| CAVEC | cavec.fr | CAVEC — 36-40 rue de Seine, 75006 Paris |
| CPRN | cprn.fr | CPRN — 43 avenue Hoche, 75008 Paris |
| CAVOM | cavom.fr | CAVOM — 8 rue Henner, 75009 Paris |
| CARPV | carpv.fr | CARPV — 41 rue de Villiers, 92200 Neuilly-sur-Seine |
| CAVAMAC | cavamac.fr | CAVAMAC — 35 rue de la Bienfaisance, 75008 Paris |

### Réversion CNAVPL

| Élément | Valeur |
|---------|--------|
| Taux base | 54% (identique au régime général) |
| Taux complémentaire | Variable par section (souvent 60%) |
| Condition de ressources base | OUI (mêmes seuils que CNAV) |
| Condition de ressources complémentaire | Variable par section |
| Demande | Demande unique info-retraite.fr (base) + demande à la section (complémentaire) |

### Réversion CNBF (avocats)

Régime autonome avec ses propres règles de réversion. Demande auprès de la CNBF directement.

---

## 9. Régimes spéciaux — NON COUVERTS par le moteur de calcul

### Pourquoi non couverts
- Très faible nombre de retraités par régime (quelques milliers à quelques dizaines de milliers)
- Règles de calcul totalement spécifiques à chaque régime
- Pas sur info-retraite.fr pour certains (les 7 manquants sur 42)
- Le ROI du développement n'est pas justifié en V2

### Ce qu'on fait si on détecte un régime spécial

Le formulaire ou le RIS peut révéler un régime spécial. Dans ce cas :

**Message au client :**
```
Votre relevé de carrière indique que vous avez cotisé au
régime [nom du régime spécial].

Ce régime a des règles de calcul spécifiques que notre
moteur ne couvre pas encore. Nous avons cependant analysé
vos droits dans les autres régimes (régime général,
complémentaire, etc.).

Pour vérifier vos droits au titre de [régime spécial],
nous vous recommandons de contacter directement :

[Nom de la caisse]
[Adresse]
[Téléphone]
[Site web si disponible]
```

### Liste des régimes spéciaux

| Régime | Caisse | Contact | Note |
|--------|--------|---------|------|
| SNCF | CPRPSNCF | retraitesncf.fr | Fermé aux nouveaux entrants depuis 09/2023 |
| RATP | CRP RATP | ratp.fr | Fermé aux nouveaux entrants depuis 09/2023 |
| EDF/GDF/Engie | CNIEG | cnieg.fr | Fermé aux nouveaux entrants depuis 09/2023 |
| Marins (ENIM) | ENIM | enim.eu | |
| Mines (CANSSM) | CANSSM | retraitedesmines.fr | En extinction |
| Clercs de notaire (CRPCEN) | CRPCEN | crpcen.fr | Fermé aux nouveaux entrants depuis 09/2023 |
| Cultes (CAVIMAC) | CAVIMAC | cavimac.fr | Très petit |
| Ouvriers de l'État (FSPOEIE) | FSPOEIE | retraitesdeletat.gouv.fr | |
| Banque de France | Caisse de réserve BdF | banque-france.fr | Fermé aux nouveaux entrants depuis 09/2023 |
| CESE | Caisse CESE | — | Fermé depuis 09/2023 |

**Note réforme 2023 :** 5 régimes spéciaux (RATP, CNIEG, Banque de France, CRPCEN, CESE) ont été fermés aux nouveaux entrants à compter du 1er septembre 2023. Les affiliés avant cette date conservent leurs droits au régime spécial. Les nouveaux salariés cotisent au régime général.

→ On peut avoir des polypensionnés avec une partie en régime spécial (ancienneté) et une partie en régime général (post-2023). On vérifie la partie régime général, on renvoie vers la caisse spéciale pour le reste.

---

## 10. Polypensionnés — Combinaisons fréquentes

### Les combinaisons les plus courantes

| Combinaison | Fréquence | Ce qu'on vérifie |
|-------------|-----------|-----------------|
| Privé + Privé (changement d'employeur) | Très fréquent | Un seul calcul CNAV, pas de complexité |
| Privé + Indépendant | Fréquent | Lura (calcul unifié). Vérifier la migration RSI. |
| Privé + Fonctionnaire | Fréquent | 2 calculs séparés (CNAV + SRE/CNRACL). Vérifier les trimestres tous régimes pour le taux. |
| Privé + Agriculteur salarié | Fréquent | Lura (calcul unifié MSA salariés + CNAV). |
| Fonctionnaire + Contractuel FP | Fréquent | CNRACL/SRE pour la partie titulaire + CNAV + Ircantec pour la partie contractuelle. |
| Privé + Libéral | Occasionnel | CNAV + CNAVPL + section. 3 pensions séparées. |
| Privé + Agriculteur exploitant | Occasionnel | CNAV + MSA exploitant. 2 calculs séparés (pas de Lura pour les exploitants). |
| Triple+ régimes | Rare | Cas par cas. On vérifie chaque régime séparément. |

### Le point clé pour tous les polypensionnés

Le **taux de liquidation** utilise les trimestres **TOUS RÉGIMES** confondus. Chaque régime applique ensuite sa propre proratisation (trimestres dans CE régime / trimestres requis).

→ L'erreur la plus fréquente : un régime ne prend pas en compte les trimestres de l'autre régime pour calculer le taux. Résultat : décote trop élevée.

---

## 11. Données techniques

### Fichier de configuration par régime

```typescript
// src/lib/retraitia/regimes/config.ts

export const REGIMES_CONFIG: Record<string, RegimeConfig> = {
  cnav: {
    label: 'Régime général (CNAV/CARSAT)',
    type: 'base',
    calcul: 'sam',
    portail: 'lassuranceretraite.fr',
    messagerie: true,
    documentsObligatoires: ['ris', 'notification_carsat'],
    complementaire: 'agirc_arrco',
    reversionTaux: 0.54,
    reversionConditionRessources: true,
  },
  sre: {
    label: 'Fonction publique d\'État (SRE)',
    type: 'base',
    calcul: 'traitement_indiciaire',
    portail: 'ensap.gouv.fr',
    messagerie: true,
    documentsObligatoires: ['ris', 'titre_pension_sre'],
    complementaire: 'rafp',
    reversionTaux: 0.50,
    reversionConditionRessources: false,
  },
  cnracl: {
    label: 'Fonction publique territoriale/hospitalière (CNRACL)',
    type: 'base',
    calcul: 'traitement_indiciaire',
    portail: 'cnracl.retraites.fr',
    messagerie: true,
    documentsObligatoires: ['ris', 'decompte_cnracl'],
    complementaire: 'rafp',
    reversionTaux: 0.50,
    reversionConditionRessources: false,
  },
  msa_salarie: {
    label: 'Agriculteur salarié (MSA)',
    type: 'base',
    calcul: 'sam', // Lura avec CNAV
    portail: 'msa.fr',
    messagerie: true,
    documentsObligatoires: ['ris', 'notification_msa'],
    lura: true,
  },
  msa_exploitant: {
    label: 'Agriculteur exploitant (MSA)',
    type: 'base',
    calcul: 'forfaitaire_proportionnelle',
    portail: 'msa.fr',
    messagerie: true,
    documentsObligatoires: ['ris', 'notification_msa', 'releve_complementaire_msa'],
    lura: false,
  },
  ssi: {
    label: 'Indépendant (ex-RSI → CNAV)',
    type: 'base',
    calcul: 'sam', // intégré CNAV depuis 2020
    portail: 'lassuranceretraite.fr',
    messagerie: true,
    documentsObligatoires: ['ris', 'notification_carsat'],
    complementaire: 'rci',
    lura: true,
  },
  cnavpl: {
    label: 'Profession libérale (CNAVPL)',
    type: 'base',
    calcul: 'points_cnavpl',
    portail: 'info-retraite.fr',
    documentsObligatoires: ['ris', 'notification_cnavpl'],
    complementaire: 'section', // variable par section
  },
  cnbf: {
    label: 'Avocat (CNBF)',
    type: 'base_complementaire', // autonome
    calcul: 'cnbf',
    portail: 'cnbf.fr',
    documentsObligatoires: ['ris', 'notification_cnbf'],
  },
  // Complémentaires
  agirc_arrco: { type: 'complementaire', calcul: 'points', portail: 'agirc-arrco.fr' },
  rafp: { type: 'complementaire', calcul: 'points', portail: 'info-retraite.fr' },
  ircantec: { type: 'complementaire', calcul: 'points', portail: 'info-retraite.fr' },
  rci: { type: 'complementaire', calcul: 'points', portail: 'lassuranceretraite.fr' },
}
```

---

## 12. Métriques par régime

| Métrique | Cible |
|----------|-------|
| Distribution des clients par régime | ~65% privé, ~15% FP, ~10% agricole, ~5% indépendant, ~3% libéral, ~2% autre |
| Taux d'anomalie par régime | À mesurer (hypothèse : indépendants et agriculteurs > privé) |
| Anomalie la plus fréquente par régime | À mesurer |
| Régime avec le plus gros impact moyen | MSA exploitants (estimé, petites pensions + Chassaigne) |

