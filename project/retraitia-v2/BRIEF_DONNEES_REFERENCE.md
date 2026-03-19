# BRIEF_DONNEES_REFERENCE — Tables de constantes

**Statut :** ✅ Validé
**Date :** 2026-03-18
**Dépendances :** MOTEUR_CALCUL (#8), ANOMALY_DETECTION (#9)

---

## 1. Vue d'ensemble

Ce brief contient la **structure et les valeurs récentes** de toutes les tables de constantes nécessaires au moteur de calcul. Pour chaque table : la structure, les 10 dernières années, et la source officielle pour compiler l'historique complet au dev.

**Principe :** au dev, chaque table sera un fichier JSON dans `src/lib/retraitia/data/`. Le brief donne la structure et la source, pas le tableur complet.

**Mise à jour :** les tables sont mises à jour 1 fois par an (en janvier après la revalorisation annuelle). Un script de vérification alerte si les données sont obsolètes.

---

## 2. Coefficients de revalorisation des salaires

### Structure

```typescript
// src/lib/retraitia/data/coefficients-revalorisation.json
// Clé = année de perception du salaire
// Valeur = coefficient pour ramener le salaire en euros actuels
{
  "1950": 345.27,
  "1951": 302.81,
  ...
  "2025": 1.000,
  "2026": 1.000
}
```

### 10 dernières années

| Année | Coefficient |
|-------|------------|
| 2016 | 1,0080 |
| 2017 | 1,0000 |
| 2018 | 1,0000 |
| 2019 | 1,0000 |
| 2020 | 1,0000 |
| 2021 | 1,0000 |
| 2022 | 1,0000 |
| 2023 | 1,0000 |
| 2024 | 1,0000 |
| 2025 | 1,0000 |

**Note :** les coefficients récents sont proches de 1 car la revalorisation est faible. Les coefficients anciens sont très élevés (>100 pour les années 1950).

### Source officielle
- **Arrêté ministériel annuel** fixant les coefficients de revalorisation
- Publication au Journal Officiel chaque année (en général octobre-décembre)
- Consultable sur : legislation.cnav.fr → Coefficients de revalorisation
- Historique complet : circulaires CNAV annuelles

### Compilation au dev
Compiler les coefficients de 1930 à 2026 (97 valeurs) depuis les circulaires CNAV. Vérifier chaque année avec au moins 2 sources croisées.

---

## 3. PASS annuel (Plafond Annuel de la Sécurité Sociale)

### Structure

```typescript
// src/lib/retraitia/data/pass.json
{
  "1950": 780,       // en anciens francs, converti en euros
  ...
  "2024": 46368,
  "2025": 47100,
  "2026": 48060
}
```

### 10 dernières années

| Année | PASS annuel | PASS mensuel |
|-------|-----------|-------------|
| 2016 | 38 616€ | 3 218€ |
| 2017 | 39 228€ | 3 269€ |
| 2018 | 39 732€ | 3 311€ |
| 2019 | 40 524€ | 3 377€ |
| 2020 | 41 136€ | 3 428€ |
| 2021 | 41 136€ | 3 428€ |
| 2022 | 41 136€ | 3 428€ |
| 2023 | 43 992€ | 3 666€ |
| 2024 | 46 368€ | 3 864€ |
| 2025 | 47 100€ | 3 925€ |
| 2026 | 48 060€ | 4 005€ |

### Source officielle
- Arrêté ministériel annuel (publication en décembre pour l'année suivante)
- urssaf.fr → Plafond de la Sécurité sociale
- Historique complet : legislation.cnav.fr

---

## 4. Trimestres requis par génération

### Structure

```typescript
// src/lib/retraitia/data/trimestres-requis.json
// Post-réforme 2023 + suspension LFSS 2026
{
  "1955": 166,
  "1956": 166,
  "1957": 166,
  "1958": 167,
  "1959": 167,
  "1960": 167,
  "1961-S1": 168,     // janv-août 1961
  "1961-S2": 169,     // sept-déc 1961
  "1962": 169,
  "1963-T1": 170,     // janv-mars 1963 → GELÉ LFSS 2026
  "1963-S2": 170,     // avr-déc 1963 → GELÉ
  "1964": 170,        // GELÉ
  "1965-T1": 170,     // janv-mars 1965 → GELÉ
  "1965-post-mars": null  // EN ATTENTE de nouveaux textes
}
```

### Table complète (post-réforme 2023 + LFSS 2026)

| Génération | Trimestres requis | Note |
|------------|------------------|------|
| 1955-1957 | 166 | |
| 1958-1960 | 167 | |
| 01/1961 — 08/1961 | 168 | |
| 09/1961 — 12/1961 | 169 | Réforme 2023 |
| 1962 | 169 | Réforme 2023 |
| 01/1963 — 03/1963 | 170 | GELÉ par LFSS 2026 |
| 04/1963 — 12/1963 | 170 | GELÉ |
| 1964 | 170 | GELÉ |
| 01/1965 — 03/1965 | 170 | GELÉ |
| Après 03/1965 | **En attente** | Textes législatifs à venir |

### Source officielle
- Article L. 161-17-3 du Code de la Sécurité sociale (modifié par réforme 2023)
- LFSS 2026 (suspension de la montée en charge)
- info-retraite.fr → "Âge de départ et durée d'assurance"

---

## 5. Âge légal par génération

### Table complète

| Génération | Âge légal | Note |
|------------|----------|------|
| 1955-1960 | 62 ans | |
| 09/1961 — 12/1961 | 62 ans et 3 mois | Réforme 2023 |
| 1962 | 62 ans et 6 mois | Réforme 2023 |
| 01/1963 — 03/1963 | 62 ans et 9 mois | GELÉ par LFSS 2026 |
| 04/1963 — 12/1963 | 62 ans et 9 mois | GELÉ |
| 1964 | 62 ans et 9 mois | GELÉ |
| 01/1965 — 03/1965 | 62 ans et 9 mois | GELÉ |
| Après 03/1965 | **En attente** | |

### Âge d'annulation de la décote (taux plein automatique)

| Génération | Âge annulation décote |
|------------|---------------------|
| 1955 et après | 67 ans |

### Source officielle
- Article L. 161-17-2 du CSS
- LFSS 2026

---

## 6. Nombre d'années pour le SAM

### Table

| Génération | Nb meilleures années |
|------------|---------------------|
| 1934 | 10 |
| 1935 | 11 |
| 1936 | 12 |
| ... (+1 par an) | ... |
| 1947 | 24 |
| 1948 et après | 25 |

### Source officielle
- Article R. 351-29 du CSS
- legislation.cnav.fr

---

## 7. Valeur du point Agirc-Arrco

### Structure

```typescript
// src/lib/retraitia/data/valeur-point-agirc-arrco.json
// Valeur de SERVICE du point (pour calculer la pension)
{
  "2019": 1.2588,   // 1ère année post-fusion
  "2020": 1.2714,
  "2021": 1.2841,
  "2022": 1.2841,
  "2023": 1.3498,
  "2024": 1.4159,
  "2025": 1.4386,
  "2026": 1.4386    // gelée jusqu'à fin oct 2026
}
```

### Historique pré-fusion (pour conversion)

Avant 2019, 2 régimes séparés :
- **Arrco** (tous salariés) : valeur du point Arrco
- **Agirc** (cadres) : valeur du point Agirc

Coefficient de conversion Agirc → unifié : **0,347791548**

| Année | Point Arrco | Point Agirc |
|-------|-----------|-----------|
| 2018 | 1,2513€ | 0,4352€ |
| 2017 | 1,2513€ | 0,4352€ |
| 2016 | 1,2513€ | 0,4352€ |
| 2015 | 1,2513€ | 0,4352€ |

### Prix d'ACHAT du point (pour vérifier les points acquis par an)

| Année | Prix d'achat Agirc-Arrco |
|-------|------------------------|
| 2025 | 19,6321€ |
| 2024 | 19,6321€ |
| 2023 | 18,7669€ |
| 2022 | 17,4316€ |
| 2021 | 17,3982€ |

**Formule de vérification :** `Points acquis = Cotisation retraite / Prix d'achat`

### Source officielle
- agirc-arrco.fr → "Valeurs des paramètres de fonctionnement"
- Accords nationaux interprofessionnels (ANI)

---

## 8. Valeurs des points — Autres régimes

### RAFP (Retraite Additionnelle de la Fonction Publique)

| Année | Valeur de service | Valeur d'acquisition |
|-------|------------------|---------------------|
| 2025 | 0,05170€ | 1,4468€ |
| 2024 | 0,05170€ | 1,4044€ |
| 2023 | 0,04986€ | 1,3466€ |

Seuil rente vs capital : 5 125 points (2024)

**Source :** rafp.fr → Paramètres du régime

### Ircantec

| Année | Valeur de service (1ère tranche) | Valeur de service (2ème tranche) |
|-------|-------------------------------|-------------------------------|
| 2025 | 0,51647€ | 0,51647€ |
| 2024 | 0,51647€ | 0,51647€ |

**Source :** ircantec.retraites.fr → Paramètres

### RCI (Complémentaire Indépendants)

| Année | Valeur de service |
|-------|------------------|
| 2025 | ~1,221€ |
| 2024 | ~1,208€ |

**Source :** lassuranceretraite.fr → Régime complémentaire des indépendants

### CNAVPL (base)

| Année | Valeur de service |
|-------|------------------|
| 2025 | 0,6076€ |
| 2024 | 0,6076€ |

**Source :** cnavpl.fr → Valeur du point

### Points complémentaires par section CNAVPL

| Section | Valeur du point complémentaire (2025) |
|---------|-------------------------------------|
| CIPAV | 2,63€ |
| CARMF (complémentaire) | 15,55€ |
| CARMF (ASV) | 13,00€ |
| CARPIMKO | 20,33€ |
| CARCDSF | 17,50€ |
| CAVP (répartition) | 0,6076€ |
| CAVEC | ~3,80€ |
| CPRN (C) | ~11,00€ |
| CPRN (T) | ~0,80€ |
| CAVOM | ~12,00€ |
| CARPV | ~11,50€ |
| CNBF | ~3,60€ |

**Note :** ces valeurs sont indicatives et doivent être vérifiées sur le site de chaque section au moment du dev. Les valeurs changent chaque année.

**Source :** site web de chaque section (cf. REGIMES_SPECIFIQUES #15 pour les URLs)

---

## 9. Barèmes CSG

### Structure

```typescript
// src/lib/retraitia/data/baremes-csg.json
{
  "2025": {
    "exoneration": {   // taux = 0%
      "1_part": 12230,
      "1.5_parts": 15495,
      "2_parts": 18759,
      "2.5_parts": 22024,
      "3_parts": 25288,
      "demi_part_supp": 3265
    },
    "taux_reduit": {   // taux = 3,8%
      "1_part": 15988,
      "1.5_parts": 20257,
      "2_parts": 24525,
      "2.5_parts": 28794,
      "3_parts": 33062,
      "demi_part_supp": 4269
    },
    "taux_median": {   // taux = 6,6%
      "1_part": 24813,
      "1.5_parts": 31435,
      "2_parts": 38057,
      "2.5_parts": 44679,
      "3_parts": 51301,
      "demi_part_supp": 6622
    }
    // Au-dessus = taux normal 8,3%
  }
}
```

### Taux applicables sur les pensions

| Taux CSG | CRDS | CASA | Total prélèvements |
|----------|------|------|-------------------|
| 0% (exonéré) | 0% | 0% | 0% |
| 3,8% (réduit) | 0,5% | 0% | 4,3% |
| 6,6% (médian) | 0,5% | 0,3% | 7,4% |
| 8,3% (normal) | 0,5% | 0,3% | 9,1% |

### Source officielle
- Article L. 136-8 du CSS (seuils CSG)
- Mise à jour annuelle par la Direction de la Sécurité sociale
- impots.gouv.fr → Barème CSG retraites

---

## 10. Minimum contributif et minimum garanti

### Minimum contributif (régime général)

| Année | MiCo simple | MiCo majoré (≥120 trim cotisés) | Plafond total pensions |
|-------|------------|-------------------------------|----------------------|
| 2025 | 752,60€/mois | 912,04€/mois | 1 367,51€/mois |
| 2024 | 747,57€/mois | 903,94€/mois | 1 367,51€/mois |
| 2023 | 709,13€/mois | 847,57€/mois | 1 309,75€/mois |

**Source :** lassuranceretraite.fr → Montants du minimum contributif

### Minimum garanti (fonctionnaires)

Formule progressive selon la durée de services :
```
Si durée ≤ 15 ans :
  MinGaranti = (montant_indice_majoré_227 × durée_années) / 15

Si durée entre 15 et 40 ans :
  MinGaranti = montant_15_ans + (montant_par_année_supp × (durée - 15))

Si durée ≥ 40 ans :
  MinGaranti = plafond
```

| Année | Montant pour 15 ans | Par année supplémentaire (16-40 ans) | Plafond (40 ans) |
|-------|-------------------|-------------------------------------|-----------------|
| 2025 | ~1 248€/mois | ~33€/mois par an supplémentaire | ~1 473€/mois |
| 2024 | ~1 239€/mois | ~33€/mois | ~1 462€/mois |

**Source :** service-public.fr → Minimum garanti fonctionnaire

---

## 11. ASPA et CSS (seuils d'éligibilité)

### ASPA (Allocation de Solidarité aux Personnes Âgées)

| Année | Montant max (seul) | Montant max (couple) | Plafond ressources (seul) | Plafond ressources (couple) |
|-------|-------------------|---------------------|--------------------------|---------------------------|
| 2025 | 1 034,28€/mois | 1 605,73€/mois | 12 411,36€/an | 19 268,76€/an |
| 2024 | 1 012,02€/mois | 1 571,16€/mois | 12 144,24€/an | 18 853,92€/an |

### CSS (Complémentaire Santé Solidaire)

| Année | Plafond CSS gratuite (seul) | Plafond CSS 1€/jour (seul) |
|-------|---------------------------|---------------------------|
| 2025 | 10 166€/an | 13 724€/an |
| 2024 | 9 719€/an | 13 120€/an |

**Source :** ameli.fr → Complémentaire santé solidaire, service-public.fr → ASPA

---

## 12. Réversion — Seuils de ressources

### CNAV / MSA / SSI

| Année | Plafond seul | Plafond en couple |
|-------|-------------|------------------|
| 2025 | 24 588,80€/an | 39 342,08€/an |
| 2024 | 24 232,00€/an | 38 771,20€/an |

Le plafond couple = 1,6 × plafond seul.

**Source :** lassuranceretraite.fr → Pension de réversion

### Agirc-Arrco / SRE / CNRACL

Pas de condition de ressources.

---

## 13. Rachat de trimestres — Barème

### Structure du barème

Le coût du rachat dépend de 3 facteurs :
1. **L'âge du demandeur** au moment de la demande
2. **Le revenu** (moyenne des 3 derniers revenus annuels)
3. **L'option choisie** : "taux seul" (moins cher) ou "taux + durée" (plus cher)

### Barème indicatif 2024 (coût par trimestre)

| Tranche de revenu | Option taux seul | Option taux + durée |
|-------------------|-----------------|-------------------|
| ≤ 75% PASS (≤ 34 776€) | ~1 055€ | ~1 407€ |
| Entre 75% et 100% PASS | ~2 318€ | ~3 091€ |
| > 100% PASS (> 46 368€) | ~3 582€ | ~4 774€ |

**Note :** ces montants varient avec l'âge (plus cher avec l'âge). La table complète a ~30 lignes (10 tranches d'âge × 3 tranches de revenu × 2 options). À compiler au dev.

### Source officielle
- Arrêté annuel fixant le barème des versements pour la retraite (VPLR)
- lassuranceretraite.fr → Rachat de trimestres

---

## 14. Espérance de vie par génération

Pour le calcul de l'impact futur des anomalies.

| Génération | Espérance de vie à 62 ans (hommes) | Espérance de vie à 62 ans (femmes) |
|------------|----------------------------------|----------------------------------|
| 1940 | ~21 ans (83 ans) | ~26 ans (88 ans) |
| 1945 | ~22 ans (84 ans) | ~27 ans (89 ans) |
| 1950 | ~23 ans (85 ans) | ~27 ans (89 ans) |
| 1955 | ~24 ans (86 ans) | ~28 ans (90 ans) |
| 1960 | ~24 ans (86 ans) | ~28 ans (90 ans) |
| 1965 | ~25 ans (87 ans) | ~29 ans (91 ans) |

**Note :** ces valeurs sont des projections. On les utilise pour donner une estimation de l'impact futur, avec la mention "estimation basée sur l'espérance de vie moyenne".

### Source officielle
- INSEE → Tables de mortalité et projections de population
- DREES → Panorama retraités et retraites

---

## 15. Valeur du point d'indice de la fonction publique

| Date d'effet | Valeur annuelle du point | Valeur mensuelle |
|-------------|------------------------|-----------------|
| 01/07/2023 | 58,2624€ | 4,8552€ |
| 01/07/2022 | 57,0753€ | 4,7563€ |
| 02/2017 | 56,2323€ | 4,6860€ |

**Formule :** `Traitement indiciaire brut mensuel = Indice majoré × Valeur mensuelle du point`

**Exemple :** Indice majoré 512 × 4,8552€ = 2 485,86€/mois

### Source officielle
- function-publique.gouv.fr → Valeur du point d'indice
- Décret fixant la valeur du point

---

## 16. Adresses des CARSAT régionales

### Pour les LRAR

| Région | CARSAT | Adresse |
|--------|--------|---------|
| Île-de-France | CNAV IDF | 75951 Paris Cedex 19 |
| Rhône-Alpes | CARSAT RA | 35 rue Maurice Flandin, 69436 Lyon Cedex 03 |
| PACA | CARSAT SE | 35 rue George, 13386 Marseille Cedex 20 |
| Nord-Picardie | CARSAT NP | 11 allée Vauban, 59662 Villeneuve-d'Ascq Cedex |
| Normandie | CARSAT Normandie | Avenue du Grand Cours, 76028 Rouen Cedex |
| Bretagne | CARSAT Bretagne | 236 rue de Châteaugiron, 35030 Rennes Cedex 9 |
| Pays de la Loire | CARSAT PdL | 2 place de Bretagne, 44932 Nantes Cedex 9 |
| Centre-Val de Loire | CARSAT Centre | 36028 Châteauroux Cedex |
| Bourgogne-FC | CARSAT BFC | 38 rue de Cracovie, 21044 Dijon Cedex |
| Grand-Est | CARSAT NE | 81 à 85 rue de Metz, 54073 Nancy Cedex |
| Alsace-Moselle | CARSAT AM | 36 rue du Doubs, 67011 Strasbourg Cedex |
| Nouvelle-Aquitaine | CARSAT Aquitaine | 80 avenue de la Jallère, 33053 Bordeaux Cedex |
| Occitanie | CARSAT MP | 2 rue Georges Vivent, 31065 Toulouse Cedex 9 |
| Auvergne | CARSAT Auvergne | 63036 Clermont-Ferrand Cedex 9 |
| Languedoc-Roussillon | CARSAT LR | 29 cours Gambetta, 34068 Montpellier Cedex 2 |
| CGSS Guadeloupe | CGSS | 97159 Pointe-à-Pitre Cedex |
| CGSS Martinique | CGSS | 97210 Le Lamentin |
| CGSS Guyane | CGSS | 97306 Cayenne Cedex |
| CGSS Réunion | CGSS | 97488 Saint-Denis Cedex |

**Note :** les adresses exactes et codes postaux complets doivent être vérifiés au dev sur lassuranceretraite.fr → "Nous contacter".

### Adresses médiateurs

| Organisme | Adresse médiateur |
|-----------|------------------|
| Assurance Retraite | 36 rue de Valmy, 93108 Montreuil Cedex |
| Agirc-Arrco | 16-18 rue Jules César, 75592 Paris Cedex 12 |
| SRE | Défenseur des droits — Libre réponse 71120, 75342 Paris Cedex 07 |
| CNRACL | Défenseur des droits (même adresse) |
| MSA | Médiateur de chaque MSA départementale (adresse sur msa.fr) |

---

## 17. GMP (Garantie Minimale de Points) — Historique

| Année | Points GMP annuels |
|-------|-------------------|
| 2018 | 120,00 |
| 2017 | 120,00 |
| 2016 | 120,00 |
| 2015 | 120,00 |
| 2014 | 120,00 |
| 2013 | 120,00 |
| 2012 | 120,00 |

**Note :** la GMP a été supprimée en 2019 avec la fusion Agirc-Arrco. Elle ne concerne que les cadres pour les périodes antérieures à 2019.

### Source officielle
- agirc-arrco.fr → Historique GMP

---

## 18. Majoration enfants — Récapitulatif par régime

| Régime | Condition | Majoration | Plafond |
|--------|----------|-----------|---------|
| CNAV | ≥ 3 enfants élevés 9 ans avant 16 ans | +10% pension base | Non plafonné |
| Agirc-Arrco | ≥ 3 enfants élevés 9 ans avant 16 ans | +10% pension complémentaire | Plafonné (montant annuel) |
| Agirc-Arrco (alt.) | Enfants à charge au moment de la liquidation | +5% par enfant à charge | Non plafonné |
| SRE / CNRACL | ≥ 3 enfants élevés 9 ans avant 16 ans | +10% pension | Non plafonné |
| MSA | Idem CNAV | +10% | Non plafonné |
| CNAVPL | ≥ 3 enfants (depuis réforme 2023) | +10% pension base | Non plafonné |

**Note :** pour Agirc-Arrco, le client a le choix entre les 2 options (la plus favorable est retenue automatiquement, mais il faut vérifier que c'est le cas).

---

## 19. Pays avec accord bilatéral de sécurité sociale

Pour la détection des trimestres étrangers.

### UE / EEE / Suisse

Tous les pays de l'UE, de l'EEE et la Suisse : règlement européen de coordination. Les trimestres comptent pour le taux plein (pas pour le SAM).

### Pays hors UE avec accord bilatéral

| Pays | Accord | Note |
|------|--------|------|
| Algérie | Oui | |
| Maroc | Oui | Très fréquent (immigration maghrébine) |
| Tunisie | Oui | |
| Turquie | Oui | |
| Canada / Québec | Oui | Accord séparé Québec |
| États-Unis | Oui | |
| Japon | Oui | |
| Corée du Sud | Oui | |
| Inde | Oui | |
| Brésil | Oui | |
| Argentine | Oui | |
| Israël | Oui | |
| Sénégal | Oui | |
| Mali | Oui | |
| Cameroun | Oui | |
| Cap-Vert | Oui | |
| Philippines | Oui | |
| ... | | Liste complète sur cleiss.fr |

### Source officielle
- cleiss.fr → Centre des Liaisons Européennes et Internationales de Sécurité Sociale
- Liste exhaustive et textes des conventions bilatérales

---

## 20. Données techniques

### Structure des fichiers de données

```
src/lib/retraitia/data/
  ├── coefficients-revalorisation.json    // 1930-2026
  ├── pass.json                            // 1930-2026
  ├── trimestres-requis.json               // par génération
  ├── age-legal.json                       // par génération
  ├── nb-annees-sam.json                   // par génération
  ├── valeur-point-agirc-arrco.json        // historique
  ├── prix-achat-point-agirc-arrco.json    // historique
  ├── valeurs-points-autres.json           // RAFP, Ircantec, RCI, CNAVPL, sections
  ├── baremes-csg.json                     // par année et nb parts
  ├── minimum-contributif.json             // historique
  ├── minimum-garanti.json                 // historique + table progressive
  ├── aspa-css.json                        // seuils par année
  ├── reversion-seuils.json                // par année
  ├── rachat-trimestres.json               // barème complet
  ├── esperance-vie.json                   // par génération et sexe
  ├── point-indice-fp.json                 // historique
  ├── carsat-adresses.json                 // par région
  ├── mediateurs-adresses.json             // par organisme
  ├── gmp-historique.json                  // 2012-2018
  ├── majorations-enfants.json             // par régime
  ├── pays-accords.json                    // liste pays + type d'accord
  └── index.ts                             // export centralisé
```

### Script de vérification annuelle

```typescript
// src/lib/retraitia/data/check-freshness.ts

function checkDataFreshness() {
  const currentYear = new Date().getFullYear()
  
  const checks = [
    { file: 'pass.json', lastKey: currentYear.toString() },
    { file: 'baremes-csg.json', lastKey: currentYear.toString() },
    { file: 'coefficients-revalorisation.json', lastKey: currentYear.toString() },
    { file: 'valeur-point-agirc-arrco.json', lastKey: currentYear.toString() },
  ]
  
  for (const check of checks) {
    const data = loadJSON(check.file)
    if (!data[check.lastKey]) {
      alert(`⚠️ ${check.file} n'a pas de données pour ${currentYear}`)
    }
  }
}
```

**Fréquence :** exécuté au démarrage du serveur et 1 fois par jour via cron. Alerte email si données obsolètes.

