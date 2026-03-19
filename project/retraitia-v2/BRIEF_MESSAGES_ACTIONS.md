# BRIEF_MESSAGES_ACTIONS — Templates de messages par organisme et par action

**Statut :** ✅ Validé
**Date :** 2026-03-18
**Dépendances :** ANOMALY_DETECTION (#9), RAPPORT_PDF (#11), ESPACE_CLIENT_SUIVI (#13)

---

## 1. Vue d'ensemble

Ce brief contient **tous les templates de messages pré-rédigés** que le client copie-colle dans les messageries des organismes. C'est la boîte à outils qui fait que le client n'a RIEN à rédiger.

**Approche :** des templates génériques par TYPE D'ACTION, avec des variables qui s'adaptent à l'anomalie, l'organisme, et le client. ~20 templates de base couvrent les 41 anomalies × 6 organismes.

**2 tons distincts :**
- **Message en ligne** (messagerie de l'espace perso) : poli, factuel, concis, conversationnel
- **LRAR** (courrier recommandé) : formel, juridique, avec références légales

**Variables pré-remplies :** le client n'a qu'à copier-coller. Toutes les données sont injectées automatiquement à partir du formulaire et de l'extraction des documents.

---

## 2. Variables disponibles

| Variable | Source | Exemple |
|----------|--------|---------|
| `{nom}` | Formulaire | DUPONT |
| `{prenom}` | Formulaire | Marie |
| `{nir}` | Formulaire / extraction | 2 55 05 69 123 456 78 |
| `{dateNaissance}` | Formulaire | 15/05/1955 |
| `{adresse}` | Formulaire | 12 rue des Lilas, 69003 Lyon |
| `{dateDepart}` | Extraction notification | 01/03/2018 |
| `{montantNotification}` | Extraction notification | 825€ |
| `{montantRecalcule}` | Moteur de calcul | 966€ |
| `{ecart}` | Calcul | 141€/mois |
| `{anomalie_annees}` | Détection | 2008-2009 |
| `{anomalie_detail}` | Détection | trimestres de chômage indemnisé |
| `{anomalie_trimestres}` | Détection | 4 trimestres |
| `{nbEnfants}` | Formulaire | 3 |
| `{serviceMilitaire_debut}` | Formulaire | 11/1978 |
| `{serviceMilitaire_fin}` | Formulaire | 10/1979 |
| `{serviceMilitaire_duree}` | Formulaire | 12 mois |
| `{organisme_nom}` | Routage | CARSAT Rhône-Alpes |
| `{organisme_adresse}` | DONNEES_REFERENCE | 35 rue Maurice Flandin, 69436 Lyon Cedex 03 |
| `{date_premier_message}` | Suivi | 18/03/2026 |
| `{date_jour}` | Système | 18/03/2026 |
| `{defunt_nom}` | Formulaire réversion | DUPONT Jean |
| `{defunt_nir}` | Formulaire réversion | 1 50 08 69 456 789 12 |
| `{defunt_dateDeces}` | Formulaire réversion | 15/06/2024 |
| `{dateMariage}` | Formulaire réversion | 22/09/1980 |

---

## 3. Catégories de templates

| # | Catégorie | Nb templates | Étapes |
|---|-----------|-------------|--------|
| A | Correction de carrière | 3 | Message + relance + LRAR |
| B | Réclamation pension (montant incorrect) | 3 | Message + relance + LRAR |
| C | Majoration enfants | 3 | Message + relance + LRAR |
| D | Points complémentaires | 3 | Message + relance + LRAR |
| E | Saisine CRA | 1 | LRAR uniquement |
| F | Saisine médiateur | 1 | LRAR uniquement |
| G | Demande de réversion | 4 | CNAV + Agirc-Arrco + FP + CNAVPL |
| H | Demande de document | 3 | Notification + relevé points + autre |
| I | Demande devis rachat trimestres | 1 | Message en ligne |
| J | CSG incorrecte | 2 | Message + LRAR |
| **Total** | | **~24 templates** | |

---

## 4. Catégorie A — Correction de carrière

### A1 — Message en ligne : signalement d'anomalie de carrière

**Utilisé pour :** trimestres cotisés manquants, service militaire, chômage, maladie, apprentissage, périodes à l'étranger, jobs d'été.

**Canal :** info-retraite.fr → "Corriger ma carrière" (≥55 ans) OU messagerie lassuranceretraite.fr (<55 ans ou complément)

**Adapté à :** CARSAT, MSA, SRE, CNRACL (en changeant l'en-tête et le canal)

```
Objet : Demande de correction de carrière — Anomalie(s) détectée(s)

Bonjour,

Suite à l'analyse détaillée de mon relevé de carrière, je constate
les anomalies suivantes :

{bloc_anomalies}

Je vous remercie de bien vouloir procéder à la vérification de ces
éléments dans vos fichiers et, le cas échéant, à la correction de
mon relevé de carrière.

Si des justificatifs sont nécessaires, je vous prie de me le faire
savoir et je vous les transmettrai dans les meilleurs délais.

Numéro de sécurité sociale : {nir}
Nom : {nom}
Prénom : {prenom}
Date de naissance : {dateNaissance}

Cordialement,
{prenom} {nom}
```

**Le `{bloc_anomalies}` est généré dynamiquement selon les anomalies détectées :**

Pour N1_TRIM_MILITAIRE :
```
— Service militaire non reporté
  Mon service militaire effectué du {serviceMilitaire_debut} au
  {serviceMilitaire_fin} ({serviceMilitaire_duree}) ne figure pas
  sur mon relevé de carrière. Il devrait donner droit à
  {anomalie_trimestres} trimestre(s) assimilé(s).
```

Pour N1_TRIM_CHOMAGE :
```
— Trimestres de chômage indemnisé non reportés
  Mes périodes de chômage indemnisé en {anomalie_annees} ne figurent
  pas sur mon relevé. J'étais inscrit(e) à Pôle Emploi (France Travail)
  et je percevais l'allocation d'aide au retour à l'emploi (ARE).
```

Pour N1_TRIM_MALADIE :
```
— Trimestres maladie/maternité non reportés
  Ma période d'arrêt maladie / de congé maternité en {anomalie_annees}
  ne figure pas sur mon relevé de carrière.
```

Pour N1_TRIM_APPRENTISSAGE :
```
— Apprentissage mal reporté
  Ma période d'apprentissage en {anomalie_annees} semble mal reportée
  sur mon relevé de carrière ({anomalie_trimestres} trimestre(s)
  au lieu de 4 attendus).
```

Pour N1_TRIM_ETRANGER :
```
— Périodes de travail à l'étranger non comptabilisées
  J'ai travaillé en {anomalie_pays} du {anomalie_debut} au
  {anomalie_fin}. Ces périodes devraient être prises en compte
  au titre de l'accord bilatéral / du règlement européen.
```

Pour N1_JOBS_ETE :
```
— Emplois de jeunesse non reportés
  J'ai exercé des emplois (jobs d'été / stages rémunérés) en
  {anomalie_annees} qui ne figurent pas sur mon relevé de carrière.
```

**Regroupement :** si un client a 3 anomalies de carrière, les 3 blocs sont regroupés dans un seul message (pas 3 messages séparés). Un seul envoi, toutes les anomalies listées.

### A2 — Relance : pas de réponse après 2 mois

**Canal :** même canal que A1

```
Objet : Relance — Demande de correction de carrière du {date_premier_message}

Bonjour,

Je me permets de vous relancer concernant ma demande de correction
de carrière envoyée le {date_premier_message}.

Je n'ai pas reçu de réponse à ce jour. Je vous rappelle les
anomalies signalées :

{bloc_anomalies_résumé}

Je vous remercie de bien vouloir traiter cette demande dans les
meilleurs délais.

Numéro de sécurité sociale : {nir}

Cordialement,
{prenom} {nom}
```

### A3 — LRAR : contestation formelle (si pas de réponse ou refus)

**Canal :** courrier recommandé avec AR (envoi via API)

```
                                        {prenom} {nom}
                                        {adresse}

                                        {organisme_nom}
                                        {organisme_adresse}

                                        {ville}, le {date_jour}

Objet : Demande de rectification de carrière
        N° SS : {nir}

        Lettre recommandée avec accusé de réception

Madame, Monsieur,

Par un message en ligne en date du {date_premier_message}, j'ai
signalé des anomalies sur mon relevé de carrière. À ce jour, je
n'ai reçu aucune réponse satisfaisante.

Conformément aux articles L. 351-2 et R. 351-9 du Code de la
Sécurité sociale, je vous demande de procéder à la vérification
et à la rectification des éléments suivants :

{bloc_anomalies}

Je vous demande de bien vouloir traiter cette demande dans un
délai de deux mois à compter de la réception de la présente,
conformément à l'article R. 142-1 du Code de la Sécurité sociale.

À défaut de réponse dans ce délai, je me réserve le droit de
saisir la Commission de Recours Amiable (CRA) de votre organisme.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes
salutations distinguées.

{prenom} {nom}

Pièces jointes : aucune
(Je vous demande de vérifier dans vos propres fichiers —
SNGI, RNCPS, données France Travail, fichiers inter-régimes)
```

**Note :** le premier courrier LRAR ne contient PAS de pièces jointes. On demande à la caisse de vérifier dans ses propres systèmes. Si elle demande des justificatifs → LRAR complémentaire (14,90€) avec les pièces uploadées par le client.

---

## 5. Catégorie B — Réclamation pension (montant incorrect)

### B1 — Message en ligne : réclamation sur le montant

**Canal :** messagerie lassuranceretraite.fr → "Réclamation"

```
Objet : Réclamation — Montant de pension incorrect

Bonjour,

Suite à l'analyse de ma notification de pension, je constate un
écart entre le montant qui m'a été attribué et le montant auquel
je devrais avoir droit.

Montant sur ma notification : {montantNotification}€/mois
Montant que je calcule : {montantRecalcule}€/mois
Écart : {ecart}€/mois

Les points suivants semblent incorrects :

{bloc_anomalies}

Je vous remercie de bien vouloir vérifier le calcul de ma pension
et de me communiquer le détail des éléments retenus.

Numéro de sécurité sociale : {nir}
Date d'effet de la pension : {dateDepart}

Cordialement,
{prenom} {nom}
```

### B2 — Relance

Même structure que A2, adaptée à la réclamation pension.

### B3 — LRAR de contestation

Même structure que A3, avec les références juridiques :
```
Conformément à l'article L. 355-2 du Code de la Sécurité sociale,
je conteste le montant de ma pension de retraite telle que notifiée
le {dateNotification}.
```

---

## 6. Catégorie C — Majoration enfants

### C1 — Message en ligne : demande de majoration

**Canal :** messagerie lassuranceretraite.fr

```
Objet : Demande d'application de la majoration pour enfants

Bonjour,

J'ai élevé {nbEnfants} enfants pendant au moins 9 ans avant
leur 16ème anniversaire. Conformément à l'article L. 351-12 du
Code de la Sécurité sociale, ma pension de retraite devrait
bénéficier d'une majoration de 10%.

Cette majoration ne semble pas appliquée sur ma pension actuelle.

Je vous remercie de bien vouloir vérifier et appliquer cette
majoration. Vous trouverez ci-joint une copie de mon livret
de famille.

Numéro de sécurité sociale : {nir}

Cordialement,
{prenom} {nom}

Pièce jointe : livret de famille (copie)
```

**Adaptation Agirc-Arrco :** même message, adapté :
```
Objet : Demande d'application de la majoration enfants Agirc-Arrco

Bonjour,

J'ai élevé {nbEnfants} enfants. Conformément aux dispositions
de l'accord national interprofessionnel, ma retraite complémentaire
devrait bénéficier d'une majoration de 10% pour 3 enfants élevés.

Je vous remercie de bien vouloir vérifier et appliquer cette
majoration sur mes paiements.

Numéro de sécurité sociale : {nir}

Cordialement,
{prenom} {nom}
```

### C2 — Relance + C3 — LRAR
Mêmes structures que A2 et A3, adaptées à la majoration enfants.

---

## 7. Catégorie D — Points complémentaires

### D1 — Message en ligne : vérification des points

**Canal :** messagerie agirc-arrco.fr

```
Objet : Vérification de mon relevé de points

Bonjour,

Suite à l'analyse de mon relevé de points, je constate des
anomalies sur les périodes suivantes :

{bloc_anomalies_points}

Je vous remercie de bien vouloir vérifier ces éléments et
procéder aux corrections nécessaires.

Numéro de sécurité sociale : {nir}

Cordialement,
{prenom} {nom}
```

**Le `{bloc_anomalies_points}` selon le type :**

Pour N2_POINTS_MANQUANTS :
```
— Année {annee} : aucun point acquis alors que j'étais salarié(e)
  chez {employeur} et que des cotisations ont été prélevées.
```

Pour N2_POINTS_GRATUITS :
```
— Année {annee} : pas de points gratuits attribués pour ma période
  de {type} (chômage indemnisé / maladie longue / maternité).
```

Pour N2_MALUS_NON_LEVE :
```
— Coefficient de solidarité : ce malus temporaire de 10% a été
  appliqué à compter du {dateDepart}. Plus de 3 ans se sont
  écoulés / j'ai atteint 67 ans. Le malus devrait être levé.
```

Pour N2_GMP :
```
— Années {annees} : j'étais cadre et mon salaire était inférieur
  au plafond de la Sécurité sociale. La Garantie Minimale de Points
  (GMP) devrait m'avoir été attribuée.
```

### D2 — Relance + D3 — LRAR
Mêmes structures, adressées à Agirc-Arrco (siège : 16-18 rue Jules César, 75592 Paris Cedex 12).

---

## 8. Catégorie E — Saisine CRA

**LRAR uniquement.** La CRA (Commission de Recours Amiable) est saisie après un refus explicite ou un silence de plus de 2 mois après la LRAR.

**Note :** pour la CARSAT, la CRA peut aussi être saisie en ligne via lassuranceretraite.fr → "Transmettre mon formulaire" → "Saisir la CRA".

```
                                        {prenom} {nom}
                                        {adresse}

                                        Commission de Recours Amiable
                                        {organisme_nom}
                                        {organisme_adresse}

                                        {ville}, le {date_jour}

Objet : Saisine de la Commission de Recours Amiable
        N° SS : {nir}
        
        Lettre recommandée avec accusé de réception

Madame, Monsieur le Président de la Commission de Recours Amiable,

Conformément aux articles R. 142-1 à R. 142-6 du Code de la
Sécurité sociale, j'ai l'honneur de saisir la Commission de
Recours Amiable de votre organisme.

Par courrier recommandé du {date_lrar}, j'ai contesté le calcul
de ma pension de retraite. {organisme_nom} a rejeté ma demande
le {date_refus} / n'a pas répondu dans le délai de deux mois.

Je conteste cette décision pour les motifs suivants :

{bloc_anomalies_détaillé}

Les pièces justificatives suivantes sont jointes au présent
recours :
{liste_pieces}

Je vous demande de bien vouloir réexaminer ma situation et
procéder à la rectification de ma pension.

Conformément à l'article R. 142-6 du Code de la Sécurité
sociale, la Commission dispose d'un délai de deux mois pour
statuer. En l'absence de décision dans ce délai, ma demande
sera considérée comme rejetée et je pourrai saisir le
tribunal judiciaire compétent.

Je vous prie d'agréer, Madame, Monsieur le Président,
l'expression de mes salutations distinguées.

{prenom} {nom}
```

---

## 9. Catégorie F — Saisine médiateur

**LRAR uniquement.** Après rejet de la CRA.

```
                                        {prenom} {nom}
                                        {adresse}

                                        Médiateur de {organisme_type}
                                        {mediateur_adresse}

                                        {ville}, le {date_jour}

Objet : Saisine du médiateur — Contestation de pension
        N° SS : {nir}
        
        Lettre recommandée avec accusé de réception

Madame, Monsieur le Médiateur,

Je me permets de vous saisir suite au rejet de mon recours
par la Commission de Recours Amiable de {organisme_nom}
en date du {date_rejet_cra}.

Résumé du litige :
{resume_litige}

Chronologie des démarches :
• {date_premier_message} : signalement par messagerie en ligne
• {date_lrar} : courrier recommandé de contestation
• {date_cra} : saisine de la CRA
• {date_rejet_cra} : rejet de la CRA

Je sollicite votre médiation afin de trouver une solution
amiable à ce litige.

{prenom} {nom}

Pièces jointes :
{liste_pieces_complète}
```

**Adresses des médiateurs :**
- Médiateur de l'Assurance Retraite : 36 rue de Valmy, 93108 Montreuil Cedex
- Médiateur Agirc-Arrco : 16-18 rue Jules César, 75592 Paris Cedex 12
- Médiateur SRE : via le Défenseur des droits
- Médiateur CNRACL : via le Défenseur des droits
- Médiateur MSA : médiateur de chaque MSA départementale
→ Adresses complètes dans DONNEES_REFERENCE (#16)

---

## 10. Catégorie G — Demandes de réversion

### G1 — Réversion base CNAV (demande unique info-retraite.fr)

**Canal principal :** demande unique en ligne sur info-retraite.fr. Message de secours si le formulaire en ligne pose problème.

```
Objet : Demande de pension de réversion

Bonjour,

Suite au décès de mon conjoint, je souhaite faire valoir mes
droits à la pension de réversion.

Informations sur le défunt :
• Nom : {defunt_nom}
• Numéro de sécurité sociale : {defunt_nir}
• Date de décès : {defunt_dateDeces}

Informations me concernant :
• Nom : {nom} {prenom}
• Numéro de sécurité sociale : {nir}
• Date de naissance : {dateNaissance}
• Date de mariage : {dateMariage}
• Situation actuelle : non remarié(e)

Je souhaite bénéficier de la réversion au titre de tous les
régimes de base auxquels mon conjoint était affilié.

Pièces jointes :
• Acte de décès
• Livret de famille
• Dernier avis d'imposition
• Relevé d'identité bancaire

Cordialement,
{prenom} {nom}
```

### G2 — Réversion Agirc-Arrco (demande séparée)

**Canal :** formulaire agirc-arrco.fr → "Signaler un décès et demander la réversion" OU messagerie.

```
Objet : Demande de pension de réversion Agirc-Arrco

Bonjour,

Suite au décès de mon conjoint {defunt_nom} le {defunt_dateDeces},
je souhaite faire valoir mes droits à la pension de réversion
au titre du régime Agirc-Arrco.

Numéro de sécurité sociale du défunt : {defunt_nir}
Mon numéro de sécurité sociale : {nir}
Date de mariage : {dateMariage}
Situation actuelle : non remarié(e)

Pièces jointes :
• Acte de décès
• Livret de famille
• RIB

Cordialement,
{prenom} {nom}
```

### G3 — Réversion fonctionnaires (SRE ou CNRACL)

**Canal :** messagerie ensap.gouv.fr (SRE) ou cnracl.retraites.fr (CNRACL)

```
Objet : Demande de pension de réversion — Fonction publique

Bonjour,

Suite au décès de mon conjoint {defunt_nom}, fonctionnaire
{defunt_statut}, le {defunt_dateDeces}, je souhaite faire
valoir mes droits à la pension de réversion.

Numéro de sécurité sociale du défunt : {defunt_nir}
Date de mariage : {dateMariage}
Enfant(s) issu(s) du mariage : {nbEnfantsCommuns}

Je vous prie de bien vouloir m'indiquer la marche à suivre
et les pièces justificatives nécessaires.

Numéro de sécurité sociale : {nir}

Cordialement,
{prenom} {nom}
```

### G4 — Réversion CNAVPL / sections

Même structure que G1, adressée à la CNAVPL ou à la section concernée.

---

## 11. Catégorie H — Demande de document introuvable

### H1 — Demande de notification de pension

Déjà détaillé dans COLLECTE_DOCUMENTS (#6). Template :

```
Objet : Demande de duplicata de notification de pension

Bonjour,

Je souhaite recevoir un duplicata de ma notification
d'attribution de pension de retraite, de préférence par
voie électronique.

Numéro de sécurité sociale : {nir}
Nom : {nom} {prenom}
Date de naissance : {dateNaissance}

Cordialement,
{prenom} {nom}
```

### H2 — Demande de relevé de points Agirc-Arrco

```
Objet : Demande de relevé de points détaillé

Bonjour,

Je souhaite obtenir mon relevé de points Agirc-Arrco
détaillé par année et par employeur, de préférence par
voie électronique.

Numéro de sécurité sociale : {nir}

Cordialement,
{prenom} {nom}
```

### H3 — Demande générique de document

Template adaptable à tout organisme et tout document.

---

## 12. Catégorie I — Demande devis rachat de trimestres

**Canal :** messagerie lassuranceretraite.fr

```
Objet : Demande de devis pour rachat de trimestres

Bonjour,

Je souhaite obtenir un devis pour le rachat de trimestres
d'études supérieures (versement pour la retraite au titre
de l'article L. 351-14-1 du Code de la Sécurité sociale).

Périodes d'études concernées :
{bloc_periodes_etudes}

Je souhaite recevoir le devis pour les deux options :
• Option "taux seul" (versement pour le seul taux)
• Option "taux + durée" (versement pour le taux et la
  durée d'assurance)

Numéro de sécurité sociale : {nir}
Date de naissance : {dateNaissance}

Cordialement,
{prenom} {nom}
```

---

## 13. Catégorie J — CSG incorrecte

### J1 — Message en ligne

**Canal :** messagerie lassuranceretraite.fr

```
Objet : Taux de CSG incorrect sur ma pension

Bonjour,

Le taux de CSG appliqué sur ma pension est de {tauxApplique}%
alors que mon Revenu Fiscal de Référence ({rfr}€ pour {nbParts}
part(s)) donne droit à un taux de {tauxTheorique}%.

Je vous remercie de bien vouloir corriger le taux de CSG
appliqué sur mes paiements de pension.

Vous trouverez ci-joint une copie de mon avis d'imposition
{anneeAvis} faisant apparaître le RFR.

Numéro de sécurité sociale : {nir}

Cordialement,
{prenom} {nom}

Pièce jointe : avis d'imposition {anneeAvis}
```

### J2 — LRAR
Même contenu, format formel.

---

## 14. Adaptation par organisme

### Spécificités de chaque organisme

| Organisme | Canal | Particularités |
|-----------|-------|---------------|
| CARSAT (régime général) | Messagerie lassuranceretraite.fr | Objet structuré, N° SS en en-tête. Possibilité de joindre des pièces (PDF, JPG). |
| Agirc-Arrco | Messagerie agirc-arrco.fr ou formulaire de contact | Formulaire avec champs prédéfinis. Le message doit parfois être adapté au format du formulaire. |
| SRE (fonctionnaires État) | Messagerie ensap.gouv.fr | Référence au titre de pension. Copie possible au service RH de l'ancien employeur. |
| CNRACL (FP territoriale/hosp.) | Messagerie cnracl.retraites.fr | Référence au décompte de pension. L'employeur peut être mis en copie. |
| MSA | Messagerie msa.fr | N° MSA en plus du N° SS. Format similaire à la CARSAT. |
| CNAVPL / sections | Site de la section ou info-retraite.fr | Variable selon la section. Certaines n'ont qu'un formulaire de contact basique. |

### En-tête adapté par organisme

Pour les messages en ligne, l'en-tête change selon l'organisme :

**CARSAT :**
```
Objet : [type de demande]
Référence : N° SS {nir}
```

**Agirc-Arrco :**
```
Objet : [type de demande]
N° de sécurité sociale : {nir}
```

**SRE :**
```
Objet : [type de demande]
N° de pension : {numPension} (si connu)
N° de sécurité sociale : {nir}
```

**CNRACL :**
```
Objet : [type de demande]
N° de pension CNRACL : {numPensionCNRACL} (si connu)
N° de sécurité sociale : {nir}
```

---

## 15. L'escalade — Récapitulatif des étapes

### Chronologie complète pour une anomalie

| Étape | Canal | Template | Délai avant escalade | Coût |
|-------|-------|----------|---------------------|------|
| 1. Message initial | Messagerie en ligne | A1/B1/C1/D1 selon le type | 2 mois | Inclus (49€) |
| 2. Relance | Messagerie en ligne | A2/B2/C2/D2 | 1 mois | Inclus |
| 3. LRAR formelle | Courrier recommandé | A3/B3/C3/D3 | 2 mois | 14,90€ |
| 4. Saisine CRA | LRAR ou en ligne | E1 | 2 mois | 14,90€ |
| 5. Saisine médiateur | LRAR | F1 | 3 mois | 14,90€ |
| 6. Tribunal | — | Pack Tribunal (export ZIP) | — | 29€ |

### Règles de déblocage

- L'étape 2 se débloque si : le client a coché "pas de réponse" ou "refus" après l'étape 1
- L'étape 3 se débloque si : l'étape 2 est faite ET pas de réponse satisfaisante
- L'étape 4 se débloque si : l'étape 3 est faite ET refus ou silence
- L'étape 5 se débloque si : l'étape 4 est faite ET rejet CRA
- L'étape 6 se débloque si : l'étape 5 est faite ET échec médiation

Chaque déblocage génère automatiquement le template de la prochaine étape avec toutes les variables pré-remplies + l'historique des échanges précédents intégré.

---

## 16. LRAR complémentaire (avec pièces jointes)

Si la caisse demande des justificatifs après le premier message ou la première LRAR :

```
                                        {prenom} {nom}
                                        {adresse}

                                        {organisme_nom}
                                        {organisme_adresse}

                                        {ville}, le {date_jour}

Objet : Envoi de justificatifs — Suite à votre demande du {date_reponse}
        N° SS : {nir}
        
        Lettre recommandée avec accusé de réception

Madame, Monsieur,

Faisant suite à votre courrier / message du {date_reponse} me
demandant des justificatifs complémentaires, je vous adresse
ci-joint les pièces suivantes :

{liste_pieces_jointes}

Je vous remercie de bien vouloir procéder à la vérification
de mon dossier dans les meilleurs délais.

Cordialement,
{prenom} {nom}

Pièces jointes :
{liste_pieces_jointes_détaillée}
```

---

## 17. Données techniques

### Structure des templates dans le code

```typescript
interface MessageTemplate {
  id: string                    // ex: 'A1_CORRECTION_CARRIERE'
  catégorie: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J'
  type: 'message_en_ligne' | 'lrar'
  étape: number                 // 1 à 6
  
  // Contenu
  objet: string                 // avec variables
  corps: string                 // avec variables
  piecesJointes: string[]       // liste des PJ recommandées
  
  // Routage
  organismes: string[]          // organismes compatibles
  anomalies: string[]           // anomalies associées (IDs)
  
  // Métadonnées
  ton: 'conversationnel' | 'formel'
  referencesJuridiques: string[]  // articles de loi cités
}
```

### Fichiers à créer

```
src/lib/retraitia/messages/
  ├── templates/
  │   ├── correction-carriere.ts    // Catégorie A
  │   ├── reclamation-pension.ts    // Catégorie B
  │   ├── majoration-enfants.ts     // Catégorie C
  │   ├── points-complementaire.ts  // Catégorie D
  │   ├── cra.ts                    // Catégorie E
  │   ├── mediateur.ts              // Catégorie F
  │   ├── reversion.ts              // Catégorie G
  │   ├── demande-document.ts       // Catégorie H
  │   ├── rachat-trimestres.ts      // Catégorie I
  │   └── csg.ts                    // Catégorie J
  ├── generator.ts              // Injection des variables
  ├── router.ts                 // Anomalie → template + organisme
  └── types.ts
```

### Route API

```
POST /api/retraitia/messages/generate
  Input: { dossierId, anomalieId, étape }
  → Choisit le template selon l'anomalie, l'étape, et l'organisme
  → Injecte les variables depuis le dossier
  → Retourne le message prêt à copier
  Output: {
    objet: string,
    corps: string,
    canal: string,
    organisme: string,
    piecesJointes: string[],
    guideCanal: string   // lien vers le guide pour coller le message
  }

POST /api/retraitia/messages/generate-lrar
  Input: { dossierId, anomalieId, étape }
  → Génère le courrier LRAR formel
  → Prêt pour envoi via API Maileva/AR24
  Output: {
    courrier: string,     // texte complet
    destinataire: { nom, adresse },
    expediteur: { nom, adresse },
    piecesJointes: fileId[],
    coutEstime: number    // ~14,90€
  }
```

---

## 18. Métriques

| Métrique | Cible |
|----------|-------|
| Taux "message copié" (le client clique copier) | > 80% des anomalies traitées |
| Taux "message envoyé" (le client coche "envoyé") | > 70% |
| Nb moyen de messages générés par dossier | > 3 |
| Taux d'escalade vers LRAR | < 30% (la majorité se résout en message en ligne) |
| Taux d'escalade vers CRA | < 10% |
| Taux d'escalade vers médiateur | < 3% |
| Templates les plus utilisés | C1 (majoration enfants) estimé |

