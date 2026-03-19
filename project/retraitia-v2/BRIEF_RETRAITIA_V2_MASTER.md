# BRIEF_RETRAITIA_V2_MASTER — Vision globale RETRAITIA V2

**Statut :** ✅ Validé
**Date :** 2026-03-18
**Version :** 2.0

---

## 1. Résumé exécutif

RETRAITIA n'est pas un simple vérificateur de pension. C'est un **audit financier complet du retraité** qui couvre 6 niveaux de vérification, guide le client de bout en bout, et ne laisse rien passer.

**Slogan interne :** "On ne laisse rien passer."

### Le marché
- 17,2 millions de retraités en France (INSEE 2023)
- ~800 000 nouveaux retraités/an
- 1 pension sur 7 contient une erreur financière (Cour des Comptes 2022)
- 10,5% des nouvelles pensions liquidées par la CNAV contenaient des erreurs en 2024
- 75% des erreurs sont en défaveur des retraités
- Impact financier estimé : 900 millions d'euros sur la durée de vie des retraités
- Perte moyenne : 37€/mois par retraité lésé
- 9 RIS sur 10 ont au moins 5 erreurs (Sapiendo/Océa Concept)
- Concurrence IA : NULLE. Cabinets traditionnels : 500-2 500€.

### Ce qui différencie la V2 de la V1
| Aspect | V1 (4 281 lignes) | V2 |
|--------|-------------------|-----|
| Parcours | 1 (retraité privé) | 3 (retraité tous régimes + pré-retraité + réversion) |
| Niveaux d'audit | Pension de base | 6 niveaux (base, complémentaire, réversion, aides, fiscal, CSG) |
| Régimes | Principalement CNAV | Tous : privé, public, indépendants, agricoles, libéraux (10 sections) |
| Espace client | Aucun | 2 phases (collecte + suivi démarches) |
| Collecte docs | Upload RIS seul | 8 documents guidés pas à pas |
| Actions | Courriers LRAR | Messages en ligne d'abord, LRAR en dernier recours |
| Escalade | Basique | 5 temps structurés (message → LRAR → CRA → médiateur → tribunal) |
| Pricing | Plat | 2 paliers (9€ + 49€) avec déduction |
| Couple | Non | Oui (2 dossiers liés, 79€) |

---

## 2. Cible client

### Persona primaire : l'enfant aidant (40-55 ans)
- Digital native, à l'aise avec le web
- Inquiet pour ses parents, veut vérifier leur pension
- Tape "erreur pension retraite" sur Google → trouve RÉCUPÉO
- Peut gérer FranceConnect, les uploads, les messageries d'organismes
- **C'est LUI le vrai utilisateur de l'interface**

### Persona secondaire : le retraité (65-80 ans)
- Moins à l'aise avec le numérique mais motivé par l'enjeu financier
- A besoin de guides très clairs avec screenshots
- Souvent accompagné par un enfant → bouton "Un proche peut m'aider"

### Persona pré-retraité (55-64 ans)
- Proactif, prépare son départ
- Plus à l'aise que le retraité, moins pressé
- Veut vérifier sa carrière AVANT la liquidation

### Persona réversion : veuf/veuve
- Souvent perdu administrativement après le décès du conjoint
- Ne sait pas qu'il/elle a droit à une réversion, ou ne sait pas la demander
- L'enfant est souvent l'initiateur de la démarche

### Angle marketing
- Pour les enfants : "Vos parents touchent-ils la pension qu'ils méritent ?"
- Pour les retraités : "1 pension sur 7 contient une erreur — source : Cour des Comptes"
- Pour les pré-retraités : "Corrigez AVANT votre départ — c'est gratuit et simple"
- Pour la réversion : "Votre conjoint vous a peut-être laissé des droits que vous ne réclamez pas"

---

## 3. Les 3 parcours

### Parcours 1 — Retraité actuel (tous régimes)
- **Ce qu'on vérifie :** pension versée vs pension due, sur les 6 niveaux
- **Documents clés :** RIS + notification de pension + relevé Agirc-Arrco + relevé mensualités
- **Action :** réclamation par messagerie en ligne (CARSAT, Agirc-Arrco, MSA, CNRACL, SRE, CIPAV...) puis LRAR si nécessaire
- **Prix :** 9€ (dossier) + 49€ (action) ou 79€ (couple)

### Parcours 2 — Pré-retraité (dans les 5 prochaines années)
- **Ce qu'on vérifie :** carrière enregistrée vs carrière réelle
- **Documents clés :** RIS + EIG (Estimation Indicative Globale, dès 55 ans)
- **Action :** demande de régularisation (plus simple qu'une réclamation)
- **Spécificités :** rachat de trimestres, optimisation date de départ, cumul emploi-retraite
- **Urgence :** "Corrigez maintenant, c'est gratuit. Après le départ, ce sera une réclamation"
- **Prix :** 9€ (dossier) + 39€ (action)

### Parcours 3 — Réversion (conjoint décédé)
- **Ce qu'on vérifie :** éligibilité, montant théorique, cumul avec pension propre
- **Documents clés :** RIS du défunt (si disponible), avis d'imposition du survivant
- **Action :** demande unique de réversion en ligne (info-retraite.fr) + messages aux caisses complémentaires
- **Spécificités :** réversion CNAV (54%, sous conditions de ressources) + réversion Agirc-Arrco (60%, sans conditions) + réversion fonctionnaires (50%, sans conditions)
- **Prix :** 9€ (dossier) + 49€ (action)

### Question filtre à l'entrée
"Quelle est votre situation ?"
1. Je suis déjà à la retraite
2. Je prépare ma retraite (dans les 5 prochaines années)
3. Mon conjoint est décédé — je veux vérifier mes droits à réversion
4. Je fais cette démarche pour un proche

→ Route vers le bon parcours dès le premier clic.

---

## 4. Les 6 niveaux d'audit

### Niveau 1 — Retraite de base (CNAV/CARSAT/SRE/CNRACL/MSA/SSI/CNAVPL)

**Trimestres à vérifier :**
- Cotisés : chaque année de travail correctement reportée
- Assimilés : chômage indemnisé (1 trim/50j), maladie (+60j = 1 trim), maternité, invalidité, AT
- AVPF : assurance vieillesse parent au foyer (parent ayant cessé de travailler — droit méconnu)
- Service militaire : 1 trimestre/90 jours, souvent oublié
- Enfants : 8 trim/enfant pour les mères (4 maternité + 4 éducation) — ABSENTS DU RIS
- Chômage non indemnisé : 6 trim max (1ère période), 4 si déjà indemnisé avant
- Apprentissage : avant 2014, souvent mal reporté
- Jobs d'été / stages rémunérés : fréquemment oubliés
- Périodes à l'étranger : UE/EEE/Suisse + pays avec accord bilatéral

**Calcul pension (régime général privé) :**
- SAM = 25 meilleures années revalorisées, plafonnées au PASS
- Taux = 50% si taux plein, sinon 50% - (0,625% × trimestres manquants), min 37,5%
- Pension annuelle = SAM × Taux × (Trimestres validés / Trimestres requis)

**Calcul pension (fonctionnaires) :**
- Basé sur traitement indiciaire des 6 derniers mois (pas de SAM)
- Taux plein = 75% du traitement indiciaire brut
- Décote/surcote similaire mais modalités différentes

**Majorations à vérifier :**
- +10% pour 3+ enfants élevés (base CNAV)
- Surcote : +1,25%/trimestre au-delà du taux plein après âge légal
- Minimum contributif : 903,94€/mois si carrière complète + faibles salaires

### Niveau 2 — Retraite complémentaire (Agirc-Arrco / RAFP / Ircantec)
- Points acquis par année : vérifier que chaque année a généré des points
- Points gratuits : chômage indemnisé, maladie, maternité, invalidité
- Majoration enfants Agirc-Arrco : +10% pour 3+ enfants OU +5% par enfant à charge
- Coefficient de solidarité (malus 10% temporaire depuis 2019)
- Fusion Agirc-Arrco 2019 : erreurs de conversion des anciens points Agirc
- GMP (Garantie Minimale de Points) pour les cadres avant 2019
- RAFP : retraite additionnelle des fonctionnaires (points)
- Ircantec : complémentaire des non-titulaires de la fonction publique

### Niveau 3 — Pension de réversion (PARCOURS DÉDIÉ)
- Réversion base CNAV : 54% de la pension du défunt, sous conditions de ressources (~24 000€/an seul)
- Réversion Agirc-Arrco : 60% des points du défunt, SANS condition de ressources
- Réversion fonctionnaires : 50% de la pension, sans condition de ressources
- Cumul avec pension propre : autorisé sous conditions
- Beaucoup de veufs/veuves ne la demandent pas ou ne savent pas qu'ils y ont droit
- Demande unique de réversion possible sur info-retraite.fr

### Niveau 4 — Aides non réclamées
- ASPA (ex-minimum vieillesse) : ~1 012€/mois (seul), ~1 571€ (couple)
- CSS (Complémentaire Santé Solidaire) : mutuelle gratuite ou 1€/jour
- APL/ALS pour retraités locataires
- Exonération taxe foncière (+75 ans sous conditions) → cross-sell MATAXE
- MaPrimeAdapt' (+70 ans, adaptation logement)

### Niveau 5 — Optimisation fiscale
- Abattement 10% pensions
- Demi-part supplémentaire : ancien combattant +75 ans, invalidité +80%, parent isolé
- Crédit d'impôt emploi à domicile 50%
- → cross-sell MONIMPOT

### Niveau 6 — CSG/CRDS (prélèvements sociaux)
- Taux CSG : 0%, 3,8%, 6,6% ou 8,3% selon RFR
- Beaucoup de retraités paient un taux trop élevé après une variation ponctuelle du RFR
- Vérifiable avec l'avis d'imposition + l'attestation de paiement

---

## 5. Modèle de monétisation

### Funnel complet

```
LANDING PAGE
"1 pension sur 7 contient une erreur"
    │
    ▼
QUESTION FILTRE (gratuit)
"Êtes-vous à la retraite / Pré-retraité / Réversion / Pour un proche ?"
    │
    ▼
MINI-DIAGNOSTIC FLASH (gratuit, 4 questions)
Statut + Année de naissance + Nb d'enfants + Type de carrière
+ EMAIL OBLIGATOIRE (pour recevoir le résultat)
→ "Votre profil présente un risque élevé d'erreurs"
    │
    ▼
PAYWALL #1 — 9€ PACK DOSSIER
Accès espace client + guides + checklist + upload + suivi + diagnostic serré
"Ces 9€ sont déduits si vous poursuivez l'analyse"
    │
    ▼
COLLECTE DOCUMENTS (dans l'espace client)
Guides pas-à-pas + upload + checks interactifs + relances
    │
    ▼
DIAGNOSTIC SERRÉ (inclus dans les 9€)
Nb anomalies + score + fourchette floue + types SANS détails
    │
    ▼
PAYWALL #2 — 49€ PACK ACTION (40€ vu les 9€ déjà payés)
Rapport complet + messages + LRAR + suivi démarches
    │
    ▼
SUIVI DES DÉMARCHES + ESCALADE
Checks par anomalie, relances, LRAR (14,90€), CRA, médiateur, tribunal (29€)
    │
    ▼
CROSS-SELL
MATAXE, MONIMPOT, MESDROITS
```

### Grille de prix

| Offre | Prix | Contenu |
|-------|------|---------|
| Mini-diagnostic flash | Gratuit | 4 questions + email → score de risque |
| Pack Dossier | 9€ | Espace client + guides + checklist + upload + suivi + diagnostic serré. Déduits du Pack Action. |
| Pack Action Solo | 49€ (40€ si déjà payé 9€) | Rapport détaillé 6 niveaux + messages personnalisés par anomalie + 1er LRAR si nécessaire + suivi démarches |
| Pack Action Couple | 79€ (70€ si déjà payé 9€) | 2 rapports + 2 jeux de messages + 2 LRAR. Un espace client avec onglet par personne |
| Pack Pré-retraité | 39€ (30€ si déjà payé 9€) | Vérification carrière + messages régularisation + LRAR + conseil rachat trimestres |
| Courrier supplémentaire | 14,90€ | LRAR de relance, pièces jointes, CRA, médiateur — prix fixe |
| Pack Tribunal | 29€ | Dossier pré-rempli + export ZIP (coffre-fort juridique) |
| Seuil gratuit | 0€ | Si impact estimé < 30€/mois : Pack Action offert. Les 9€ ne sont PAS remboursés mais déduits. |

### Projection économique
- Panier moyen estimé : 9€ + 49€ + ~2×14,90€ d'escalades = ~88€/client solo
- Couple : 9€ + 79€ + escalades = ~118€/couple
- ~800 000 nouveaux retraités/an → si on capte 0,1% = 800 clients/an = ~70 000€/an
- Si on capte 1% = 8 000 clients/an = ~700 000€/an

---

## 6. Accès aux services — FranceConnect = clé unique

### FranceConnect ouvre TOUT

| Site | Documents (tous PDF) | Messagerie |
|------|---------------------|------------|
| info-retraite.fr | RIS inter-régimes, EIG (≥55 ans), attestations paiement | Correction carrière (≥55 ans), déclaration enfants, demande réversion |
| lassuranceretraite.fr | Notification pension, relevé mensualités, attestation fiscale | Messagerie CARSAT, réclamation, saisine CRA en ligne |
| agirc-arrco.fr | Relevé de points | Messagerie conseiller, réclamation |
| impots.gouv.fr | Avis d'imposition | Messagerie |
| msa.fr | RIS agricole, notification | Messagerie MSA |
| ensap.gouv.fr | Titre de pension FPE | Messagerie SRE |
| cnracl.retraites.fr | Notification CNRACL, attestations | Messagerie CNRACL |

### Diagnostic d'accès (phase 0)
"Avez-vous un compte sur l'un de ces services : Ameli, impots.gouv.fr, La Poste ?"
- **Si oui** → guide direct vers les documents via FranceConnect
- **Si non** → guide création compte Ameli (le plus simple : numéro sécu + email + SMS)

### Info-retraite.fr : couverture
- Couvre **35 régimes sur 42** (suffisant pour 95%+ de la cible)
- Les 7 manquants sont ultra-spécifiques (CRPCEN, CAVIMAC, ENIM, CANSSM, RATP, SNCF, Banque de France)
- Si régime non couvert détecté → message : "Votre régime spécial nécessite une vérification directe auprès de [caisse]" + guide dédié

### Lacunes connues du RIS
- Trimestres enfants : ABSENTS du RIS
- Distinction cotisés vs validés : ABSENTE depuis 2025
- → C'est notre valeur ajoutée. Argument marketing : "Votre RIS ne dit pas tout."

### Bouton "Un proche peut m'aider"
On demande explicitement "C'est pour vous ou pour un proche ?"
- Si "pour un proche" → le client saisit l'email du proche
- Le proche reçoit : guide complet + lien vers le dossier + possibilité d'uploader au nom du parent
- En pratique, dans la majorité des cas, c'est l'enfant qui fait tout avec les identifiants du parent

### Bouton "Envoyer ce guide à un proche"
Sur chaque guide de récupération de document :
- Le retraité entre l'email de son enfant
- L'enfant reçoit le guide + accès au dossier
- Le dossier avance

---

## 7. Documents à collecter

| # | Document | Source | Importance | Parcours |
|---|----------|--------|------------|----------|
| 1 | RIS (Relevé Individuel de Situation) | info-retraite.fr | CRITIQUE | Tous |
| 2 | Notification de pension / titre de pension | lassuranceretraite.fr / ensap.gouv.fr / cnracl | CRITIQUE | Retraités |
| 3 | Relevé de points Agirc-Arrco | agirc-arrco.fr | HAUTE | Retraités + pré-retraités privé |
| 4 | Relevé de mensualités | lassuranceretraite.fr | HAUTE | Retraités |
| 5 | Attestation fiscale de pension | info-retraite.fr | MOYENNE | Retraités |
| 6 | Avis d'imposition | impots.gouv.fr | MOYENNE | Tous (cross-sell + CSG + aides) |
| 7 | Paiements Agirc-Arrco | agirc-arrco.fr | HAUTE | Retraités privé |
| 8 | EIG (≥55 ans, pré-retraités) | info-retraite.fr | HAUTE | Pré-retraités |

### Analyse progressive
On ne bloque PAS en attendant tous les documents. Minimum requis pour l'analyse :
- **RIS + notification + Agirc-Arrco** → audit complet base + complémentaire
- Chaque document ajouté affine le diagnostic
- Barre de progression : "Précision de l'audit : X%"

### Si un document est introuvable
Pour chaque document, message pré-rédigé à copier-coller dans la messagerie de l'organisme :
"Bonjour, je souhaite obtenir [document] par voie électronique. N° SS : [pré-rempli]."

---

## 8. Régimes couverts

### Tableau synthétique

| Régime | Population retraitée | Caisse base | Complémentaire | Portail |
|--------|---------------------|------------|----------------|---------|
| Privé (salariés) | ~14,7M (CNAV) | CNAV/CARSAT | Agirc-Arrco | lassuranceretraite.fr + agirc-arrco.fr |
| FP État | ~2M (SRE) | SRE | RAFP | ensap.gouv.fr |
| FP Territoriale/Hospitalière | ~1M (CNRACL) | CNRACL | RAFP + Ircantec | cnracl.retraites.fr |
| Indépendants (ex-RSI) | Intégrés CNAV depuis 2020 | SSI → CNAV | RCI (points convertis) | lassuranceretraite.fr |
| Agricoles | ~2,3M (MSA) | MSA | MSA complémentaire | msa.fr |
| Professions libérales | ~480K (CNAVPL) | CNAVPL (10 sections) | Variable par section | info-retraite.fr |
| Avocats | ~65K (CNBF) | CNBF | CNBF complémentaire | info-retraite.fr |

### Les 10 sections CNAVPL (toutes couvertes en V2)

| Section | Profession | Part des effectifs |
|---------|-----------|-------------------|
| CIPAV | Architectes, ingénieurs, consultants... | ~40% |
| CARMF | Médecins | ~22% |
| CARPIMKO | Infirmiers, kinés, orthophonistes... | ~20% |
| CARCDSF | Dentistes, sages-femmes | ~5% |
| CAVP | Pharmaciens | ~4% |
| CAVEC | Experts-comptables | ~3% |
| CPRN | Notaires | ~2% |
| CAVOM | Officiers ministériels (huissiers...) | ~1% |
| CARPV | Vétérinaires | ~1% |
| CAVAMAC | Agents généraux d'assurance | ~2% |

### Régimes spéciaux (NON couverts par le moteur de calcul)
SNCF, RATP, EDF/GDF (CNIEG), ENIM (marins), CANSSM (mines), CRPCEN (clercs notaires), CAVIMAC (cultes), FSPOEIE (ouvriers État), Banque de France.
→ Si détectés dans le formulaire : "Votre régime spécial nécessite une vérification directe auprès de [caisse]" + guide adapté.
→ Le RIS d'info-retraite.fr intègre quand même les données de 35 régimes sur 42.

---

## 9. Actions — Stratégie en 2 temps

### Temps 1 — Message en ligne (inclus dans le pack)
Pour chaque anomalie → message pré-rédigé pour le bon canal :
- Correction carrière → "Corriger ma carrière" sur info-retraite.fr (≥55 ans) OU messagerie CARSAT
- Erreur de calcul → messagerie CARSAT (réclamation)
- Points complémentaires → messagerie Agirc-Arrco
- Réversion non demandée → demande unique en ligne info-retraite.fr
- MSA → messagerie MSA
- Fonctionnaires État → messagerie SRE / ensap.gouv.fr
- Fonctionnaires territoriaux/hospitaliers → messagerie CNRACL
- Libéraux → messagerie CIPAV / CNAVPL / section concernée

**Le client copie-colle. Zéro rédaction.**

### Temps 2 — LRAR (14,90€ si pas de réponse)
- Envoi via API au nom du client (il reste l'expéditeur et signataire)
- Courrier initial SANS pièces jointes (on demande à la caisse de vérifier ses propres fichiers)
- Si justificatifs demandés → le client uploade → LRAR complémentaire 14,90€

### Escalade (5 temps)
1. Message en ligne → attente 2 mois
2. LRAR formelle → attente 2 mois
3. Saisine CRA (en ligne ou LRAR) → attente 2 mois
4. Médiateur → attente 3 mois
5. Tribunal judiciaire (Pack Tribunal 29€)

---

## 10. Diagnostic gratuit et serré

### Mini-diagnostic flash (avant inscription)
- 4 questions : statut (retraité/pré-retraité/réversion/proche) + année de naissance + nb enfants + type de carrière
- Email OBLIGATOIRE (pour recevoir le résultat + relances)
- Résultat : "Votre profil présente un risque élevé d'erreurs. Les retraités nés en [année] avec [N] enfants et une carrière [type] ont statistiquement [X]% de chances d'avoir une anomalie."
- Outil viral : page autonome /retraitia/test partageable sur Facebook

### Diagnostic serré (inclus dans les 9€, après upload)
On montre :
- Nombre d'anomalies détectées (ex : "7 anomalies sur 4 niveaux")
- Score de fiabilité (Bronze/Argent/Or/Platine inversé)
- Fourchette d'impact mensuel FLOUE ("entre 150 et 400€/mois")
- Impact cumulé en fourchette ("entre 45 000 et 120 000€")
- Types d'anomalies SANS DÉTAILS ni montants ("Trimestres manquants détectés", "Majoration enfants potentiellement non appliquée")

On NE montre PAS :
- Le détail de chaque anomalie
- Les montants précis
- Les messages pré-rédigés
- Le rapport PDF

---

## 11. Espace client — 2 phases

### Phase 1 — Collecte (après paiement 9€)
- Checklist interactive des documents avec guides pas-à-pas (screenshots)
- Upload par document
- Checks interactifs ("j'ai envoyé le message à la CARSAT", "j'ai reçu la réponse")
- Barre de progression "Précision de l'audit : X%"
- Formulaire complémentaire (5-7 questions que le RIS ne contient pas)
- Diagnostic serré quand documents suffisants
- Bouton "Un proche peut m'aider"
- 1 envoi LRAR inclus si le client est totalement bloqué pour obtenir un document

### Phase 2 — Suivi des démarches (après paiement 49€)
- Timeline par anomalie avec étapes verrouillées
- Checks interactifs pour chaque étape :
  - ☑️ Message envoyé → démarre compteur 2 mois
  - ☑️ Réponse reçue → corrigée / refus / justificatifs demandés
  - ☑️ Pas de réponse après 2 mois → propose escalade
- Compteurs de délais avec relances automatiques
- Déblocage d'escalade (LRAR 14,90€, CRA, médiateur, tribunal 29€)
- Gestion couple : 2 dossiers liés par coupleId, sélecteur "Dossier de [Prénom 1] / Dossier de [Prénom 2]"
- Export ZIP pour tribunal (tous les documents + rapport + courriers + preuves d'envoi + timeline)
- Cross-sell dynamique (MATAXE, MONIMPOT, MESDROITS)

---

## 12. Emails/SMS Brevo

### Séquences

| Événement | Timing | Canal |
|-----------|--------|-------|
| Non-payants post-flash | J+1, J+3, J+7, J+14 | Email |
| Relances collecte documents | J+1, J+7, J+30, J+60 | Email + SMS |
| "Un proche peut m'aider" | Immédiat | Email au proche |
| Suivi délais organismes | J+30, J+55, J+60 après envoi message | Email + SMS |
| Anomalie corrigée | Immédiat | Email |
| Refus / escalade | Immédiat | Email |
| Cross-sell post-résolution | J+7 après dernière anomalie corrigée | Email |

### SMS
Pour les rappels courts de délais : "Avez-vous reçu la réponse de la CARSAT ? Connectez-vous sur recupeo.fr pour mettre à jour votre dossier."

---

## 13. Cadre juridique

### Art. L.377-1 CSS — ce qu'on ne fait PAS
"Tout intermédiaire qui propose ses services, moyennant une rémunération convenue à l'avance pour effectuer les démarches, est passible d'amende et/ou d'emprisonnement."

### Ce qu'on est
Un **outil d'aide à l'analyse** + **assistant administratif automatisé**. Pas un mandataire, pas un avocat, pas un conseil juridique.

### Ce que le client fait
- Il uploade ses documents
- Il copie-colle les messages qu'on lui prépare
- Il clique "Valider et envoyer" (il est le signataire)
- Il coche les checks de suivi

### Mentions CGU obligatoires
"RÉCUPÉO est un service d'aide à l'analyse et à la rédaction de courriers. RÉCUPÉO n'est ni avocat, ni mandataire, ni conseil juridique. Les courriers sont envoyés au nom et pour le compte de l'utilisateur, qui en reste seul expéditeur et signataire. L'analyse fournie est indicative et ne constitue pas un avis juridique."

### RGPD
- Données sensibles : pension, carrière, situation familiale, santé (invalidité)
- Durée de conservation : 3 ans après dernière activité, puis anonymisation
- Droit à l'oubli : suppression sur demande
- Hébergement : VPS OVH France

---

## 14. Urgence — 3 angles

1. **L'hémorragie mensuelle** : "Chaque mois sans correction = X€ perdus. Depuis votre départ, vous avez perdu Y€."
   - Compteur visuel : "Depuis votre départ en retraite le [date], vous avez potentiellement perdu entre X€ et Y€"
2. **Pré-retraités** : "Corrigez AVANT votre départ — c'est gratuit. Après, c'est une réclamation."
3. **Revalorisation annuelle** : "Base fausse → chaque revalorisation s'applique sur un montant trop bas. L'écart se creuse chaque année."

---

## 15. Cross-sell

RETRAITIA est la porte d'entrée qui alimente les autres briques :

| Brique | Déclencheur | Offre |
|--------|-------------|-------|
| MATAXE | Retraité +75 ans propriétaire sous conditions de revenus | Exonération taxe foncière |
| MONIMPOT | Demi-part non utilisée, crédit d'impôt emploi à domicile | Optimisation fiscale |
| MESDROITS (future) | ASPA, CSS, APL détectés comme non réclamés | Aide aux droits sociaux |
| MABANQUE | Retraité avec relevé bancaire | Frais bancaires excessifs |

---

## 16. SEO — 4 pages

| URL | H1 | Cible |
|-----|-----|-------|
| /retraitia | Vérifiez votre pension de retraite | Page chapeau, aiguillage 3 parcours |
| /retraitia/verifier-ma-pension | 1 pension sur 7 contient une erreur — vérifiez la vôtre | Retraités actuels |
| /retraitia/preparer-mon-depart | Préparez votre retraite sans erreur | Pré-retraités |
| /retraitia/pension-de-reversion | Pension de réversion : vérifiez vos droits | Réversion |

Chaque page a son propre flash adapté, son propre argumentaire, et ses propres mots-clés SEO.

---

## 17. Architecture technique

### Stack
Next.js 15.5 (App Router), Payload CMS 3.79, MongoDB 7.0, Tailwind CSS 3.4, PM2, Nginx, Claude API (Vision + extraction + rapport), pdfkit, Tesseract OCR (fallback), Brevo (email + SMS), GA4, Stripe.

### Approche
- **Reconstruction** en s'inspirant de la V1 (types solides avec 32 régimes)
- Architecture multi-régimes dès le départ
- Claude Vision pour l'extraction de tous les documents (flexible)
- Tesseract en fallback pour les PDFs numériques propres

### Collections Payload
- `retraitia-clients` : profil client + email + parcours + statut paiement + coupleId
- `retraitia-dossiers` : documents uploadés + extraction + formulaire complémentaire
- `retraitia-diagnostics` : anomalies détectées + scoring + impact
- `retraitia-messages` : messages pré-rédigés par anomalie + statut envoi
- `retraitia-suivi` : timeline par anomalie + checks + dates + escalade

### Routes API principales
- `POST /api/retraitia/flash` : mini-diagnostic (4 questions + email)
- `POST /api/retraitia/extract` : OCR/Vision d'un document uploadé
- `POST /api/retraitia/diagnostic` : analyse croisée RIS + notification + formulaire
- `POST /api/retraitia/report` : génération rapport PDF payant
- `POST /api/retraitia/messages` : génération messages pré-rédigés par anomalie
- `POST /api/retraitia/lrar` : envoi LRAR via API

### Intégrations
- **Stripe** : 9€ Pack Dossier → upgrade 49€ avec déduction automatique (coupon lié à l'email)
- **Brevo** : séquences email + SMS
- **API LRAR** : Maileva ou AR24 (expéditeur = le client)
- **Claude Vision** : extraction de tous les documents
- **pdfkit** : génération du rapport PDF

---

## 18. Données de référence à compiler

À rechercher et intégrer dans `constants.ts` :
- Coefficients de revalorisation des salaires (1950-2026)
- PASS annuel historique (1950-2026)
- Trimestres requis par génération (table post-réforme 2023)
- Valeur du point Agirc-Arrco historique
- Valeur du point CNAVPL par section
- Barème décote/surcote par régime
- Seuils ASPA/CSS
- Barèmes CSG (4 taux selon RFR)
- Adresses CARSAT par département
- Adresses/contacts des 10 sections CNAVPL + CNBF
- Minimum contributif et minimum garanti (fonctionnaires)
- Barème traitement indiciaire de la fonction publique

---

## 19. KPIs et métriques

| Métrique | Objectif |
|----------|----------|
| Taux conversion flash → 9€ | > 15% |
| Taux conversion 9€ → 49€ | > 40% |
| Nb docs uploadés / dossier | > 4 |
| Nb anomalies détectées / dossier | > 3 |
| Taux correction confirmée | > 50% |
| Panier moyen | > 70€ |
| NPS | > 50 |
| Temps moyen collecte docs | < 14 jours |

---

## 20. Index des briefs

| # | Fichier | Contenu |
|---|---------|---------|
| 1 | **BRIEF_RETRAITIA_V2_MASTER.md** | Ce document |
| 2 | BRIEF_PARCOURS_RETRAITE.md | Funnel retraité actuel (6 niveaux, tous régimes) |
| 3 | BRIEF_PARCOURS_PRERETRAITE.md | Funnel pré-retraité (EIG, rachat trimestres, optimisation) |
| 4 | BRIEF_PARCOURS_REVERSION.md | Funnel réversion (éligibilité, demande, cumul) |
| 5 | BRIEF_ONBOARDING_ACCES.md | FranceConnect, guides création compte, guide par organisme |
| 6 | BRIEF_COLLECTE_DOCUMENTS.md | Documents, guides, messages, checklist, relances |
| 7 | BRIEF_EXTRACTION_PARSING.md | OCR/Vision par type de document, schémas de données |
| 8 | BRIEF_MOTEUR_CALCUL.md | Règles de calcul tous régimes + tables de constantes |
| 9 | BRIEF_ANOMALY_DETECTION.md | Catalogue anomalies, scoring, calcul d'impact |
| 10 | BRIEF_DIAGNOSTIC_GRATUIT.md | Flash + diagnostic serré + conversion paywall |
| 11 | BRIEF_RAPPORT_PDF.md | Structure rapport payant, pdfkit |
| 12 | BRIEF_MESSAGES_ACTIONS.md | Templates messages par organisme et par action |
| 13 | BRIEF_ESPACE_CLIENT_SUIVI.md | UX espace client, checks, timeline, couple |
| 14 | BRIEF_EMAILS_RELANCES.md | Séquences Brevo email + SMS |
| 15 | BRIEF_REGIMES_SPECIFIQUES.md | Spécificités par régime |
| 16 | BRIEF_DONNEES_REFERENCE.md | Tables de constantes |
| 17 | TODO_RETRAITIA.md | Backlog priorisé |
| 18 | SESSIONS_RETRAITIA.md | Journal des sessions |
