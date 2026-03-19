# BRIEF_RAPPORT_PDF — Structure du rapport payant

**Statut :** ✅ Validé
**Date :** 2026-03-18
**Dépendances :** ANOMALY_DETECTION (#9), MOTEUR_CALCUL (#8), MESSAGES_ACTIONS (#12)

---

## 1. Vue d'ensemble

Le rapport PDF est le **livrable tangible** du Pack Action (49€). C'est ce que le client paie pour obtenir. Il doit être impressionnant, clair, actionnable, et justifier chaque euro.

**Double format :**
- **PDF** (pdfkit) : version imprimable/archivable, téléchargeable depuis l'espace client
- **Version en ligne** : même contenu dans l'espace client, avec liens cliquables et boutons "copier le message"

**Régénération automatique :** si le client uploade un nouveau document après le paiement, l'analyse se met à jour et le rapport est régénéré. Le client télécharge toujours la dernière version.

**Taille estimée :** 10-15 pages selon le nombre d'anomalies et la longueur de carrière.

---

## 2. Structure du rapport — 10 sections

| # | Section | Pages | Contenu |
|---|---------|-------|---------|
| 1 | Page de couverture | 1 | Logo, nom client, date, score global |
| 2 | Résumé exécutif | 1 | Chiffres clés, impact, recommandation |
| 3 | Frise chronologique de carrière | 1-2 | Tableau coloré année par année |
| 4 | Tableau des anomalies | 1-2 | Chaque anomalie détaillée et chiffrée |
| 5 | Recalcul détaillé de la pension | 1-2 | Notre calcul vs notification, étape par étape |
| 6 | Guide d'action par anomalie | 2-4 | Quoi faire, à qui écrire, résumé du message |
| 7 | Simulations (pré-retraités) | 1-2 | Multi-scénarios, rachat de trimestres |
| 8 | Opportunités détectées | 1 | Cross-sell MATAXE, MONIMPOT, MESDROITS |
| 9 | Baromètre de fiabilité | 0.5 | Méthodologie, sources, limites |
| 10 | Mentions légales | 0.5 | Cadre juridique RÉCUPÉO |

---

## 3. Section 1 — Page de couverture

```
┌─────────────────────────────────────────────┐
│                                             │
│            [LOGO RÉCUPÉO]                   │
│                                             │
│     RAPPORT D'AUDIT RETRAITE                │
│     ─────────────────────────               │
│                                             │
│     Préparé pour :                          │
│     [Prénom Nom]                            │
│     Né(e) le [date de naissance]            │
│                                             │
│     Date du rapport : [date]                │
│     Référence : [numéro dossier]            │
│                                             │
│     ┌─────────────────────────────┐         │
│     │  Score de fiabilité         │         │
│     │                             │         │
│     │       🔴 BRONZE             │         │
│     │                             │         │
│     │  7 anomalies détectées      │         │
│     │  Impact : ~250€/mois        │         │
│     └─────────────────────────────┘         │
│                                             │
│     Précision de l'audit : 85%              │
│     Documents analysés : 5                  │
│                                             │
│                                             │
│     recupeo.fr/retraitia                    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 4. Section 2 — Résumé exécutif

1 page synthétique avec tous les chiffres clés. Le client (ou son enfant) doit comprendre la situation en 30 secondes.

```
RÉSUMÉ DE VOTRE AUDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Profil
• Née en 1955 · 3 enfants · Carrière mixte privé + fonctionnaire
• Départ en retraite : 01/03/2018
• Régimes : CNAV + CNRACL + Agirc-Arrco + RAFP

Résultats de l'audit
• Score de fiabilité : BRONZE
• Anomalies détectées : 7 (sur 5 niveaux)
  - 3 anomalies CERTAINES (vérifiées)
  - 2 anomalies HAUTE CONFIANCE (calculées)
  - 2 anomalies ESTIMÉES (à confirmer)

Impact financier
• Manque à gagner mensuel estimé : ~250€/mois
  dont ~180€ certains ou haute confiance
• Déjà perdu depuis le départ (2018) : ~21 000€
• Manque à gagner futur (espérance de vie) : ~60 000€
• Impact total estimé : ~81 000€

Recommandation
→ 5 démarches à effectuer auprès de 3 organismes
→ Toutes les démarches commencent par un message en ligne
→ Aucun courrier recommandé nécessaire en première étape
→ Délai estimé de résolution : 2 à 6 mois

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 5. Section 3 — Frise chronologique de carrière

### Format : tableau coloré (pdfkit)

Un tableau avec une ligne par année de carrière. Les colonnes : année, régime, trimestres, salaire/revenu, anomalie détectée.

Les couleurs signalent les anomalies :
- ⬜ Blanc : année sans anomalie
- 🟡 Jaune : anomalie ESTIMATION (à vérifier)
- 🔴 Rouge : anomalie CERTAINE ou HAUTE CONFIANCE

```
VOTRE CARRIÈRE — FRISE CHRONOLOGIQUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Année │ Régime     │ Trim. │ Salaire    │ Anomalie
──────┼────────────┼───────┼────────────┼──────────────────────
1975  │ CNAV       │ 4     │ 8 200€     │
1976  │ CNAV       │ 4     │ 9 100€     │
1977  │ CNAV       │ 4     │ 10 500€    │
1978  │ —          │ 0     │ —          │ 🔴 Service militaire
      │            │       │            │   non reporté (4 trim.)
1979  │ CNAV       │ 2     │ 4 200€     │
1980  │ CNAV       │ 4     │ 12 000€    │
...   │            │       │            │
1995  │ CNRACL     │ 4     │ —          │ (fonction publique)
1996  │ CNRACL     │ 4     │ —          │
...   │            │       │            │
2008  │ CNRACL     │ 2     │ —          │ 🟡 Trimestres chômage
      │            │       │            │   non reportés ?
2009  │ CNRACL     │ 4     │ —          │
...   │            │       │            │
2017  │ CNRACL     │ 4     │ —          │ Dernier emploi

──────┴────────────┴───────┴────────────┴──────────────────────
Total               168 trim.             3 périodes signalées

+ Trimestres enfants (hors RIS) :
  3 enfants × 8 = 24 trimestres potentiels
  (non visibles sur le relevé — à vérifier)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Implémentation pdfkit

```typescript
function renderFriseCarriere(doc: PDFKit.PDFDocument, carriere: CarriereLigne[], anomalies: Anomalie[]) {
  // En-tête du tableau
  const headers = ['Année', 'Régime', 'Trim.', 'Salaire', 'Anomalie']
  const colWidths = [50, 80, 40, 70, 250]
  
  // Couleurs
  const COLORS = {
    normal: '#FFFFFF',
    estimation: '#FFF3CD',  // jaune pâle
    certain: '#F8D7DA',     // rouge pâle
    header: '#E8F0FE',      // bleu pâle
  }
  
  for (const ligne of carriere) {
    const anomalie = anomalies.find(a => a.annee === ligne.annee)
    const bgColor = anomalie
      ? (anomalie.confiance === 'ESTIMATION' ? COLORS.estimation : COLORS.certain)
      : COLORS.normal
    
    // Dessiner la ligne avec la couleur de fond
    doc.rect(x, y, totalWidth, rowHeight).fill(bgColor)
    // Écrire les colonnes
    doc.text(ligne.annee, ...)
    doc.text(ligne.regime, ...)
    doc.text(ligne.trimestres, ...)
    doc.text(fmt(ligne.salaire), ...)
    if (anomalie) doc.text(anomalie.label, ...)
  }
}
```

### Pagination

Si la carrière fait plus de 35 années (> 1 page), on pagine automatiquement avec l'en-tête du tableau répété sur chaque page.

---

## 6. Section 4 — Tableau des anomalies

Chaque anomalie détectée, détaillée et chiffrée. Triées par impact décroissant.

```
ANOMALIES DÉTECTÉES — DÉTAIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#1 │ MAJORATION ENFANTS NON APPLIQUÉE
   │ Niveau 1 — Retraite de base
   │ Confiance : 🟢 VÉRIFIÉ
   ├──────────────────────────────────────────
   │ Vous avez élevé 3 enfants. Votre pension de
   │ base devrait être majorée de 10%.
   │
   │ Cette majoration n'apparaît pas sur votre
   │ notification de pension.
   │
   │ Impact mensuel : +147€/mois
   │ Déjà perdu depuis 2018 : ~12 348€
   │ Impact futur estimé : ~35 280€
   │
   │ Organisme : CARSAT Rhône-Alpes
   │ Action : Message via lassuranceretraite.fr
   │ Délai estimé : 2-3 mois

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#2 │ MAJORATION ENFANTS AGIRC-ARRCO NON APPLIQUÉE
   │ Niveau 2 — Retraite complémentaire
   │ Confiance : 🟡 ESTIMÉ
   ├──────────────────────────────────────────
   │ Avec 3 enfants élevés, votre retraite
   │ complémentaire devrait être majorée de 10%.
   │ Cette majoration ne semble pas appliquée
   │ sur vos paiements.
   │
   │ Impact mensuel : ~42€/mois (estimation)
   │
   │ Organisme : Agirc-Arrco
   │ Action : Message via agirc-arrco.fr

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#3 │ SERVICE MILITAIRE NON COMPTABILISÉ
   │ Niveau 1 — Retraite de base
   │ Confiance : 🟢 VÉRIFIÉ
   ├──────────────────────────────────────────
   │ Votre service militaire de 12 mois
   │ (11/1978 — 10/1979) donne droit à
   │ 4 trimestres qui ne figurent pas sur
   │ votre relevé de carrière.
   │
   │ Impact mensuel : +38€/mois
   │
   │ Organisme : CARSAT Rhône-Alpes
   │ Action : Message via info-retraite.fr
   │          (Corriger ma carrière)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[... anomalies #4 à #7 ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RÉCAPITULATIF
─────────────────────────────────────────────
Anomalies certaines (🟢)    : 3  │ ~213€/mois
Anomalies haute confiance   : 2  │  ~52€/mois
Anomalies estimées (🟡)     : 2  │  ~35€/mois
─────────────────────────────────────────────
TOTAL                       : 7  │ ~300€/mois
                                 │ ~25 200€ déjà perdus
                                 │ ~72 000€ manque à gagner futur

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Badge de confiance

Chaque anomalie affiche son badge :
- 🟢 VÉRIFIÉ — "Ce résultat est certain à 100%"
- 🔵 CALCULÉ — "Ce résultat est calculé avec une marge inférieure à 1%"
- 🟡 ESTIMÉ — "Ce résultat est une estimation à confirmer"

---

## 7. Section 5 — Recalcul détaillé de la pension

Transparence totale : on montre notre calcul étape par étape et on le compare avec la notification.

### Pour le régime général (CNAV)

```
RECALCUL DE VOTRE PENSION — RÉGIME GÉNÉRAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                        Notification    Recalcul      Écart
                        (CARSAT)        (RÉCUPÉO)
────────────────────────────────────────────────────────────
SAM                     21 800€         22 450€       +650€
Taux de liquidation     50%             50%           =
Proratisation           152/167         156/167       +4 trim
Pension annuelle brute  9 903€          10 541€       +638€
Pension mensuelle brute 825€            878€          +53€
Majoration enfants 10%  NON APPLIQUÉE   +88€/mois     +88€
Minimum contributif     Non applicable  Non applicable  =
────────────────────────────────────────────────────────────
PENSION MENSUELLE       825€            966€          +141€

🟢 Trimestres : 4 trimestres de service militaire
   ajoutés à notre recalcul → impact sur la proratisation

🟢 Majoration enfants : vous avez 3 enfants élevés,
   la majoration de 10% devrait s'appliquer

🔵 SAM : notre recalcul donne 22 450€ vs 21 800€
   dans la notification (écart de 3%). Vérification
   recommandée auprès de la CARSAT.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Pour les fonctionnaires (SRE/CNRACL)

```
RECALCUL DE VOTRE PENSION — CNRACL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                        Titre pension   Recalcul      Écart
                        (CNRACL)        (RÉCUPÉO)
────────────────────────────────────────────────────────────
Indice majoré           512             512           =
Traitement indiciaire   2 432€/mois     2 432€/mois   =
Trimestres services     88              88            =
Bonifications           0               4 (enfants)   +4
Trimestres retenus      88/167          92/167        +4
Taux de liquidation     39,52%          41,32%        +1,8%
────────────────────────────────────────────────────────────
PENSION MENSUELLE       961€            1 005€        +44€
```

### Pour la complémentaire (Agirc-Arrco)

```
VÉRIFICATION COMPLÉMENTAIRE AGIRC-ARRCO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total des points :      4 856 points
Valeur de service :     1,4386€/point
Pension annuelle :      6 988€
Pension mensuelle :     582€

Majoration enfants :    🔴 Non appliquée → +58€/mois potentiel
Points gratuits :       ✅ Présents pour les périodes d'arrêt
Malus solidarité :      ✅ Non applicable (départ avec surcote)
Fusion Agirc 2019 :     ✅ Conversion correcte
GMP :                   Non applicable (non cadre)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 8. Section 6 — Guide d'action par anomalie

Pour chaque anomalie, un guide concis avec l'action à effectuer. Le message complet est dans l'espace client (copiable), le PDF donne le résumé.

```
GUIDE D'ACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANOMALIE #1 — Majoration enfants base
──────────────────────────────────────

Quoi :   Demander l'application de la majoration 10%
À qui :  CARSAT Rhône-Alpes
Canal :  Messagerie lassuranceretraite.fr
Pièce :  Livret de famille (copie)
Délai :  Réponse sous 2 mois

Résumé du message à envoyer :
"Demande d'application de la majoration de 10% pour
3 enfants élevés. Le livret de famille est joint."
→ Texte complet dans votre espace client RÉCUPÉO

Si pas de réponse sous 2 mois :
→ Relance en ligne (message de relance disponible
  dans votre espace client)
→ Si toujours pas de réponse : LRAR de contestation
  (disponible dans votre espace client — 14,90€)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANOMALIE #2 — Majoration enfants Agirc-Arrco
──────────────────────────────────────

Quoi :   Demander l'application de la majoration 10%
À qui :  Agirc-Arrco
Canal :  Messagerie agirc-arrco.fr
Pièce :  Livret de famille (copie)
Délai :  Réponse sous 2 mois

→ Texte complet dans votre espace client RÉCUPÉO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANOMALIE #3 — Service militaire
──────────────────────────────────────

Quoi :   Signaler le service militaire non reporté
À qui :  CARSAT via info-retraite.fr
Canal :  "Corriger ma carrière" sur info-retraite.fr
Pièce :  Livret militaire ou attestation (si disponible)
         Sinon : la CARSAT peut vérifier dans ses fichiers
Délai :  Réponse sous 2-3 mois

→ Texte complet dans votre espace client RÉCUPÉO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[... guides #4 à #7 ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ORDRE RECOMMANDÉ DES DÉMARCHES
──────────────────────────────

Nous vous recommandons de commencer par les anomalies
au plus gros impact. Toutes les démarches sont
indépendantes, vous pouvez les faire en parallèle.

1. Majoration enfants CARSAT (#1) — +147€/mois
2. Majoration enfants Agirc-Arrco (#2) — +42€/mois
3. Service militaire (#3) — +38€/mois
4. [etc.]

Tous les messages et guides détaillés sont disponibles
dans votre espace client : recupeo.fr/mon-espace

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 9. Section 7 — Simulations (pré-retraités uniquement)

Cette section n'apparaît QUE dans le rapport pré-retraité.

### Tableau multi-scénarios

```
VOS SCÉNARIOS DE DÉPART
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

           │ 62 ans  │ 63 ans  │ 64 ans  │ 65 ans  │ 67 ans
           │ (2027)  │ (2028)  │ (2029)  │ (2030)  │ (2032)
───────────┼─────────┼─────────┼─────────┼─────────┼────────
Trimestres │ 164/172 │ 168/172 │ 172/172 │ 176/172 │ 184/172
Taux       │ 45,0%   │ 47,5%   │ 50,0%   │ 50,0%   │ 50,0%
Décote     │ -5,0%   │ -2,5%   │ 0%      │ 0%      │ 0%
Surcote    │ —       │ —       │ —       │ +5,0%   │ +15,0%
Base       │ 1 180€  │ 1 310€  │ 1 450€  │ 1 522€  │ 1 667€
Complémen. │ 420€    │ 440€    │ 460€    │ 475€    │ 510€
TOTAL      │ 1 600€  │ 1 750€  │ 1 910€  │ 1 997€  │ 2 177€
───────────┼─────────┼─────────┼─────────┼─────────┼────────
Écart      │ réf.    │ +150€   │ +310€   │ +397€   │ +577€
vs 62 ans  │         │ /mois   │ /mois   │ /mois   │ /mois

➤ Recommandation : un départ à 64 ans vous donne le taux
  plein sans décote. Chaque année supplémentaire ajoute
  ~1,25% de surcote soit ~90€/mois.

⚠️ Estimation basée sur l'hypothèse que vous continuez
   à cotiser dans les mêmes conditions.
```

### Analyse rachat de trimestres

```
RACHAT DE TRIMESTRES — ANALYSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Situation : il vous manque 8 trimestres pour le taux plein
Années d'études déclarées : 3 ans → max 12 trimestres rachetables

Scénario A — Racheter 4 trimestres (option taux seul)
  Coût estimé : ~12 800€
  Gain mensuel : +35€/mois
  Retour sur investissement : 30 ans ❌ Non rentable

Scénario B — Racheter 8 trimestres (option taux seul)
  Coût estimé : ~25 600€
  Gain mensuel : +310€/mois (suppression de la décote)
  Retour sur investissement : 7 ans ✅ Rentable dès 71 ans

Scénario C — Racheter 4 trimestres + travailler 1 an de plus
  Coût : ~12 800€ + 1 an de salaire
  Gain : +365€/mois (taux plein + surcote)
  ✅✅ Meilleur scénario

⚠️ Le coût exact dépend de votre âge et de vos revenus.
   Demandez un devis via la messagerie CARSAT.
   → Message pré-rédigé dans votre espace client

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 10. Section 8 — Opportunités détectées (cross-sell)

Les anomalies de niveaux 4 et 5 sont présentées comme des "opportunités" complémentaires, pas comme des erreurs de pension.

```
OPPORTUNITÉS COMPLÉMENTAIRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Au-delà de votre pension, nous avons détecté des
opportunités d'économies ou de droits non réclamés.

────────────────────────────────────────────────

💡 EXONÉRATION DE TAXE FONCIÈRE
   Vous êtes propriétaire et avez plus de 75 ans.
   Vos revenus semblent compatibles avec l'exonération.
   Impact potentiel : jusqu'à 1 200€/an

   → Vérifiez avec MATAXE (brique RÉCUPÉO)
     recupeo.fr/mataxe

────────────────────────────────────────────────

💡 CRÉDIT D'IMPÔT EMPLOI À DOMICILE
   Vous déclarez un emploi à domicile. Le crédit
   d'impôt de 50% est-il correctement appliqué ?
   Impact potentiel : jusqu'à 3 000€/an

   → Vérifiez avec MONIMPOT (brique RÉCUPÉO)
     recupeo.fr/monimpot

────────────────────────────────────────────────

💡 COMPLÉMENTAIRE SANTÉ SOLIDAIRE
   Vos revenus pourraient vous donner accès à une
   mutuelle gratuite ou à 1€/jour.
   Économie potentielle : ~50€/mois

   → Renseignez-vous sur ameli.fr ou auprès
     de votre CPAM

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 11. Section 9 — Baromètre de fiabilité

Transparence totale sur notre méthodologie.

```
BAROMÈTRE DE FIABILITÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Précision de l'audit : 85%

Documents analysés :
  ✅ Relevé de carrière (RIS) — info-retraite.fr
  ✅ Notification de pension — lassuranceretraite.fr
  ✅ Relevé Agirc-Arrco — agirc-arrco.fr
  ✅ Avis d'imposition — impots.gouv.fr
  ⬜ Relevé de mensualités — non fourni

Données complémentaires :
  ✅ Formulaire complété (16 questions)

Sources de calcul :
  • Coefficients de revalorisation des salaires :
    arrêté ministériel en vigueur
  • PASS historique : données officielles Sécurité sociale
  • Barème Agirc-Arrco : valeur du point 2025 (1,4386€)
  • Trimestres requis : barème post-réforme 2023
    (avec suspension LFSS 2026)

Limites de l'analyse :
  • Les trimestres enfants ne sont pas vérifiables
    sur le RIS — notre détection est basée sur votre
    déclaration dans le formulaire
  • La distinction cotisés/validés n'est plus disponible
    sur le RIS depuis 2025
  • Le montant exact du minimum contributif nécessite
    de connaître le total des pensions tous régimes

Les résultats marqués 🟢 VÉRIFIÉ sont fiables à 100%.
Les résultats marqués 🔵 CALCULÉ ont une marge < 1%.
Les résultats marqués 🟡 ESTIMÉ sont indicatifs et
doivent être confirmés auprès de votre caisse.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 12. Section 10 — Mentions légales

```
MENTIONS LÉGALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RÉCUPÉO est un service d'aide à l'analyse et à la
rédaction de courriers.

RÉCUPÉO n'est ni avocat, ni mandataire, ni conseil
juridique.

Les courriers générés par RÉCUPÉO sont envoyés au nom
et pour le compte de l'utilisateur, qui en reste seul
expéditeur et signataire.

L'analyse fournie est indicative et ne constitue pas
un avis juridique. Les résultats sont basés sur les
documents fournis par l'utilisateur et les barèmes
officiels en vigueur à la date du rapport.

RÉCUPÉO ne peut être tenu responsable des décisions
prises sur la base de ce rapport.

En cas de doute, nous recommandons de consulter un
professionnel qualifié (avocat, expert retraite) ou
de contacter directement votre caisse de retraite.

RÉCUPÉO — recupeo.fr
[Adresse]
[SIRET]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 13. Variantes par parcours

### Rapport retraité actuel (standard)
Toutes les 10 sections. Section 7 (simulations) absente.

### Rapport pré-retraité
- Section 3 (frise) : même format, anomalies = erreurs de carrière
- Section 4 (anomalies) : pas de "déjà perdu" mais "impact sur votre future pension"
- Section 5 (recalcul) : estimation de pension à la place de "notification vs recalcul"
- Section 6 (guide d'action) : messages de régularisation (pas de réclamation)
- **Section 7 (simulations) : AJOUTÉE** — multi-scénarios + rachat de trimestres + retraite progressive + cumul emploi-retraite
- Section 8 (opportunités) : anticipation post-départ (CSG future, aides futures)

### Rapport réversion
- Section 3 (frise) : absente (pas de carrière à montrer)
- Section 4 (anomalies) : centré sur les réversions non demandées / incorrectes
- Section 5 (recalcul) : estimation de la réversion par régime, avec éligibilité détaillée
- Section 6 (guide d'action) : demandes de réversion par régime, pièces justificatives
- Section 7 (simulations) : absente
- Section 8 (opportunités) : ASPA post-réversion, optimisation fiscale post-veuvage

### Rapport couple
2 rapports séparés générés (un par personne). Même structure que le rapport individuel. Le PDF couple = les 2 rapports concaténés avec un sommaire commun.

---

## 14. En-tête et pied de page

### En-tête (toutes les pages sauf couverture)

```
[LOGO RÉCUPÉO petit]    Rapport d'audit retraite — [Prénom Nom]    [date]
─────────────────────────────────────────────────────────────────────────
```

### Pied de page (toutes les pages)

```
─────────────────────────────────────────────────────────────────────────
RÉCUPÉO — recupeo.fr/retraitia              Réf. [numéro]    Page X/Y
```

---

## 15. Palette de couleurs et typographie

### Couleurs RÉCUPÉO

```typescript
const COLORS = {
  primary: '#1E40AF',       // Bleu RÉCUPÉO
  secondary: '#059669',     // Vert succès
  danger: '#DC2626',        // Rouge anomalie certaine
  warning: '#D97706',       // Orange anomalie estimée
  info: '#2563EB',          // Bleu info (haute confiance)
  text: '#1F2937',          // Texte principal
  textLight: '#6B7280',     // Texte secondaire
  background: '#F9FAFB',    // Fond sections
  border: '#E5E7EB',        // Bordures
  headerBg: '#E8F0FE',      // Fond en-têtes tableaux
  anomalyCertain: '#FEE2E2', // Fond anomalie certaine
  anomalyEstimation: '#FEF3C7', // Fond anomalie estimation
}
```

### Typographie

```typescript
const FONTS = {
  title: { font: 'Helvetica-Bold', size: 18 },
  subtitle: { font: 'Helvetica-Bold', size: 14 },
  sectionTitle: { font: 'Helvetica-Bold', size: 12 },
  body: { font: 'Helvetica', size: 10 },
  small: { font: 'Helvetica', size: 8 },
  tableHeader: { font: 'Helvetica-Bold', size: 9 },
  tableBody: { font: 'Helvetica', size: 9 },
  badge: { font: 'Helvetica-Bold', size: 8 },
}
```

---

## 16. Données techniques

### Fichiers à créer

```
src/lib/retraitia/pdf/
  ├── generator.ts           // Orchestrateur de génération
  ├── sections/
  │   ├── couverture.ts
  │   ├── resume.ts
  │   ├── frise-carriere.ts
  │   ├── anomalies.ts
  │   ├── recalcul.ts
  │   ├── guide-action.ts
  │   ├── simulations.ts     // pré-retraités uniquement
  │   ├── opportunites.ts
  │   ├── barometre.ts
  │   └── mentions.ts
  ├── components/
  │   ├── header-footer.ts   // en-tête + pied de page
  │   ├── table.ts           // composant tableau réutilisable
  │   ├── badge.ts           // badges confiance (🟢🔵🟡)
  │   └── colors.ts          // palette RÉCUPÉO
  └── types.ts
```

### Route API

```
POST /api/retraitia/generate-pdf
  Input: { dossierId }
  → Récupère le diagnostic, les anomalies, le recalcul, le formulaire
  → Choisit la variante (retraité / pré-retraité / réversion)
  → Génère le PDF via pdfkit
  → Sauvegarde dans uploads
  → Retourne le lien de téléchargement
  Output: { pdfUrl, nbPages, dateGénération }

GET /api/retraitia/download-pdf/:dossierId
  → Vérifie l'accès (client ou aidant)
  → Stream le PDF
```

### Régénération

```typescript
// Déclenché automatiquement quand :
// - Un nouveau document est uploadé et extrait
// - Le formulaire est modifié
// - L'analyse est relancée

async function regenerateReport(dossierId: string) {
  const diagnostic = await runDiagnostic(dossierId)
  const pdf = await generatePDF(dossierId, diagnostic)
  await saveReport(dossierId, pdf)
  await notifyClient(dossierId, 'Votre rapport a été mis à jour')
}
```

---

## 17. Métriques

| Métrique | Cible |
|----------|-------|
| Temps de génération PDF | < 5 secondes |
| Taille moyenne du PDF | < 2 Mo |
| Nb pages moyen | 10-15 |
| Taux de téléchargement (client paie et télécharge le PDF) | > 80% |
| Taux de régénération (nouveau doc uploadé après paiement) | ~20% |
| Taux de clic cross-sell dans le rapport | > 10% |

