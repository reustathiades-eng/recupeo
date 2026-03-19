# BRIEF_EXTRACTION_PARSING — Stratégie OCR/Vision par type de document

**Statut :** ✅ Validé
**Date :** 2026-03-18
**Dépendances :** COLLECTE_DOCUMENTS (#6), MOTEUR_CALCUL (#8)

---

## 1. Vue d'ensemble

Ce brief décrit COMMENT on transforme un document brut (PDF numérique, PDF scanné, photo) en données structurées exploitables par le moteur de calcul.

**Pattern RÉCUPÉO (identique à MONIMPOT) :**
1. Extraction texte d'abord (pdf-parse / Tesseract) → gratuit
2. Parsing structuré/regex si le texte est exploitable → gratuit
3. Claude API texte si le regex est insuffisant → peu coûteux
4. Claude Vision si le texte est illisible → dernier recours, plus coûteux
5. Anonymisation avant tout appel Claude

**Objectif :** extraire les données avec le minimum de coût API tout en garantissant la fiabilité. On surveille le budget lors des tests et de la mise en place.

---

## 2. Architecture d'extraction — Pipeline

### Flux décisionnel pour chaque document

```
Document uploadé
    │
    ├─ Format ?
    │   ├── PDF → pdf-parse : extraction texte brut
    │   │         │
    │   │         ├── Texte exploitable ? (> 50 caractères lisibles)
    │   │         │   │
    │   │         │   ├── OUI → Regex/parsing structuré
    │   │         │   │         │
    │   │         │   │         ├── Parsing suffisant ? (score ≥ 70%)
    │   │         │   │         │   ├── OUI → ✅ Données extraites (0 appel API)
    │   │         │   │         │   └── NON → Anonymiser → Claude API texte
    │   │         │   │         │              │
    │   │         │   │         │              ├── JSON valide + cohérent ?
    │   │         │   │         │              │   ├── OUI → ✅ Données extraites
    │   │         │   │         │              │   └── NON → Retry 1x → si échec → Vision
    │   │         │   │         │
    │   │         │   └── NON (texte = images dans le PDF)
    │   │         │       → Conversion en images (page par page)
    │   │         │       → Anonymiser → Claude Vision
    │   │         │
    │   │         └── Texte vide ou < 50 chars
    │   │             → PDF scanné → conversion images → Claude Vision
    │   │
    │   └── JPG/PNG → Anonymiser → Claude Vision directement
    │
    └── Résultat extraction
        │
        ├── Validation de cohérence (checks automatiques)
        │   ├── OK → ✅ extractedData sauvegardé + score confiance
        │   └── KO → Retry avec prompt renforcé (1x max)
        │            └── Si encore KO → extraction partielle + signalement
        │
        └── Confirmation client (résumé affiché)
```

### Résumé du coût par chemin

| Chemin | Coût API | Quand |
|--------|----------|-------|
| Regex/parsing seul | 0$ | PDF numérique bien structuré (RIS, avis d'impôt) |
| Claude API texte | ~0.005$/doc | Texte lisible mais regex insuffisant |
| Claude Vision | ~0.01-0.03$/page | PDF scanné ou photo |
| Retry Claude texte | +0.005$ | JSON invalide ou incohérent |
| Retry Claude Vision | +0.01-0.03$/page | Idem Vision |

**Budget estimé par dossier complet (7 documents) :**
- Meilleur cas (tout en PDF numérique) : ~0.02$ (2-3 appels texte, le reste en regex)
- Cas moyen (mix PDF + quelques scans) : ~0.10$
- Pire cas (tout en photos) : ~0.50$
- **Budget moyen cible : < 0.15$ par dossier** → absorbable dans la marge des 49€

---

## 3. Étape 1 — Extraction texte (gratuit)

### Pour les PDF numériques

**Librairie : pdf-parse (déjà utilisé dans MONIMPOT)**

```typescript
import pdfParse from 'pdf-parse'

async function extractTextFromPDF(buffer: Buffer): Promise<{
  text: string
  pages: number
  isDigital: boolean  // true si texte sélectionnable
}> {
  const result = await pdfParse(buffer)
  const isDigital = result.text.trim().length > 50
  return {
    text: result.text,
    pages: result.numpages,
    isDigital
  }
}
```

**Détection PDF numérique vs scanné :**
- Si `text.trim().length > 50` → PDF numérique, texte exploitable
- Si `text.trim().length ≤ 50` → PDF scanné (images), fallback Vision
- Seuil conservateur : 50 caractères minimum pour considérer le texte exploitable

### Pour les photos (JPG/PNG)

Pas d'extraction texte directe → Claude Vision directement.

### Pour les PDF scannés détectés

Conversion en images (page par page) avec `pdf-to-img` ou `sharp` :
```typescript
// Chaque page du PDF → image PNG/JPG
// Envoyée à Claude Vision
```

---

## 4. Étape 2 — Parsing structuré / Regex (gratuit)

### Quand l'utiliser

Quand le texte brut est extrait d'un PDF numérique. Avant tout appel Claude. C'est le chemin le moins cher.

### Principe

Chaque type de document a un parseur regex dédié qui cherche les données clés dans le texte brut. Inspiré du `regex-extractor.ts` de MONIMPOT (15 regex + 80 mappings + normalisation OCR).

### Score de suffisance

Comme MONIMPOT : on calcule un score basé sur le nombre de champs extraits vs attendus. Si le score ≥ 70% → extraction suffisante, pas besoin de Claude. Si < 70% → fallback Claude API texte.

```typescript
function isParsingExtractionSufficient(result: ParsingResult): boolean {
  return result.fieldsFound / result.fieldsTotal >= 0.70
    && result.criticalFieldsFound  // les champs obligatoires sont tous présents
}
```

### Parseurs par type de document

#### 4.1 Parseur RIS (Relevé Individuel de Situation)

Le RIS d'info-retraite.fr est le document le plus standardisé. Format bien connu.

**Champs à extraire :**
```
- Identité : nom, prénom, N° SS, date de naissance
- Tableau carrière : [{année, régime, trimestres, revenu}]
- Récap trimestres : total par régime + total général
- Régimes affiliés
```

**Regex clés :**
```typescript
const REGEX_RIS = {
  nir: /N[°o]\s*(?:de\s*)?[Ss]écurité\s*[Ss]ociale\s*[:.]?\s*(\d[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{3}[\s.]?\d{3}[\s.]?\d{2})/i,
  dateNaissance: /[Nn]é[e]?\s*le\s*(\d{2}\/\d{2}\/\d{4})/,
  nom: /[Nn]om\s*[:.]?\s*([A-ZÉÈÊËÀÂÔÎÏÙÛÇ][A-ZÉÈÊËÀÂÔÎÏÙÛÇa-zéèêëàâôîïùûç\s-]+)/,

  // Ligne carrière : année | régime | trimestres | revenu
  ligneCarriere: /(\d{4})\s+([A-Za-zÀ-ÿ\s\-/]+?)\s+(\d{1,4})\s+([\d\s]+(?:[.,]\d{2})?)\s*€?/gm,

  // Total trimestres
  totalTrimestres: /[Tt]otal\s*(?:des\s*)?[Tt]rimestres\s*[:.]?\s*(\d{1,3})/i,
}
```

**Normalisation OCR (identique au pattern MONIMPOT) :**
```typescript
function normalizeRISText(text: string): string {
  let t = text.normalize('NFC')
  // Corrections Tesseract courantes pour les termes retraite
  t = t.replace(/[Tt]rim[e.]stres?/gi, 'Trimestres')
  t = t.replace(/R[eé]gime\s*g[eé]n[eé]ral/gi, 'Régime général')
  t = t.replace(/S[eé]curit[eé]\s*[Ss]ociale/gi, 'Sécurité Sociale')
  // Montants : "28.000" → "28 000"
  t = t.replace(/(\d)\.(\d{3})\b/g, '$1 $2')
  return t
}
```

#### 4.2 Parseur Notification de pension (CARSAT)

**Champs clés :**
```typescript
const REGEX_NOTIFICATION = {
  montantBrut: /[Mm]ontant\s*(?:brut|mensuel|de\s*la\s*pension)\s*[:.]?\s*([\d\s]+[.,]\d{2})\s*€/i,
  sam: /[Ss]alaire\s*[Aa]nnuel\s*[Mm]oyen\s*[:.]?\s*([\d\s]+[.,]\d{2})\s*€/i,
  taux: /[Tt]aux\s*(?:de\s*liquidation)?\s*[:.]?\s*(\d{2}[.,]\d{1,4})\s*%/i,
  trimestresRetenus: /[Tt]rimestres\s*(?:retenus|validés|pris\s*en\s*compte)\s*[:.]?\s*(\d{1,3})/i,
  trimestresRequis: /[Tt]rimestres\s*(?:requis|nécessaires|exigés)\s*[:.]?\s*(\d{1,3})/i,
  majorationEnfants: /[Mm]ajoration\s*(?:pour\s*)?(?:enfants?|3\s*enfants)\s*[:.]?\s*([\d,]+\s*%|oui|non)/i,
  surcote: /[Ss]urcote\s*[:.]?\s*([\d,]+\s*%)/i,
  decote: /[Dd]écote\s*[:.]?\s*([\d,]+\s*%)/i,
  minimumContributif: /[Mm]inimum\s*[Cc]ontributif/i,
  dateEffet: /[Dd]ate\s*d'effet\s*[:.]?\s*(\d{2}\/\d{2}\/\d{4})/i,
}
```

#### 4.3 Parseur Agirc-Arrco (relevé de points)

**Champs clés :**
```typescript
const REGEX_AGIRC_ARRCO = {
  // Ligne : année | employeur | points Arrco | points Agirc
  lignePoints: /(\d{4})\s+(.+?)\s+(\d+[.,]?\d*)\s*(?:(\d+[.,]?\d*))?\s*$/gm,
  totalPoints: /[Tt]otal\s*(?:des\s*)?[Pp]oints\s*[:.]?\s*([\d\s]+[.,]?\d*)/i,
  pointsGratuits: /[Pp]oints\s*(?:gratuits|chômage|maladie|maternité)/i,
}
```

#### 4.4 Parseur Avis d'imposition

**Déjà implémenté dans MONIMPOT** (`regex-extractor.ts`, 80+ mappings). On réutilise le même parseur pour RETRAITIA. Champs critiques pour RETRAITIA :
- RFR (Revenu Fiscal de Référence)
- Nombre de parts
- Montant de l'impôt
- Situation familiale

#### 4.5 Parseurs simplifiés pour les autres documents

Pour les relevés de mensualités, attestations fiscales, paiements Agirc-Arrco :
```typescript
// Pattern générique : chercher des montants en euros + des dates
const REGEX_GENERIQUE = {
  montantEuro: /([\d\s]+[.,]\d{2})\s*€/g,
  date: /(\d{2}\/\d{2}\/\d{4})/g,
  pourcentage: /(\d{1,2}[.,]\d{1,4})\s*%/g,
}
```

Ces documents sont plus simples et les regex suffisent souvent.

#### 4.6 Parseur titre de pension (fonctionnaires SRE/CNRACL)

**Champs clés :**
```typescript
const REGEX_TITRE_PENSION_FP = {
  montantBrut: /[Mm]ontant\s*(?:brut|mensuel|de\s*la\s*pension)\s*[:.]?\s*([\d\s]+[.,]\d{2})\s*€/i,
  indiceBrut: /[Ii]ndice\s*(?:brut|nouveau\s*majoré)?\s*[:.]?\s*(\d{3,4})/i,
  traitementIndiciaire: /[Tt]raitement\s*(?:indiciaire|soumis\s*à\s*retenue)\s*[:.]?\s*([\d\s]+[.,]\d{2})\s*€/i,
  trimestresServices: /[Tt]rimestres?\s*(?:de\s*)?[Ss]ervices?\s*[:.]?\s*(\d{1,3})/i,
  bonifications: /[Bb]onifications?\s*[:.]?\s*(\d{1,2})\s*trimestres?/i,
  tauxLiquidation: /[Tt]aux\s*(?:de\s*liquidation)?\s*[:.]?\s*(\d{2}[.,]\d{1,4})\s*%/i,
  minimumGaranti: /[Mm]inimum\s*[Gg]aranti/i,
  dateEffet: /[Dd]ate\s*d'effet\s*[:.]?\s*(\d{2}\/\d{2}\/\d{4})/i,
}
```

---

## 5. Étape 3 — Claude API texte (fallback regex)

### Quand l'utiliser
Le texte brut est lisible mais le parsing regex est insuffisant (score < 70% ou champs critiques manquants).

### Architecture

```typescript
async function extractWithClaudeText(
  documentType: DocumentType,
  rawText: string,
  anonymizer: AnonymizationSession
): Promise<ExtractedData> {
  // 1. Anonymiser
  const safeText = anonymizer.anonymize(rawText)
  
  // 2. Choisir le prompt selon le type de document
  const systemPrompt = EXTRACTION_PROMPTS[documentType].system
  const userMessage = EXTRACTION_PROMPTS[documentType].buildUserMessage(safeText)
  
  // 3. Appeler Claude API (texte, pas Vision)
  const response = await callClaude({
    system: systemPrompt,
    userMessage,
    maxTokens: 4096,
    temperature: 0,  // déterministe pour l'extraction
  })
  
  // 4. Parser le JSON
  let jsonStr = response.trim()
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }
  const data = JSON.parse(jsonStr)
  
  // 5. Désanonymiser
  return anonymizer.deanonymize(data)
}
```

### Prompts d'extraction — un par type de document

Chaque prompt est très directif : format JSON exact attendu, champs obligatoires, types de données, exemples.

#### Prompt RIS

```
SYSTEM:
Tu es un extracteur de données spécialisé dans les Relevés Individuels
de Situation (RIS) de retraite français. Tu extrais les données exactes
du texte fourni et tu les renvoies en JSON strict.

RÈGLES :
- Renvoie UNIQUEMENT du JSON, aucun texte avant ou après
- Ne déduis RIEN : si une donnée n'est pas dans le texte, mets null
- Les montants sont en euros, avec 2 décimales
- Les trimestres sont des entiers (max 4 par an)
- Respecte exactement le schéma JSON ci-dessous

SCHÉMA JSON ATTENDU :
{
  "identite": {
    "nom": string | null,
    "prenom": string | null,
    "nir": "[ANONYMISÉ]",
    "dateNaissance": "JJ/MM/AAAA" | null
  },
  "carriere": [
    {
      "annee": number,
      "regime": string,
      "employeur": string | null,
      "trimestres": number,
      "revenu": number | null
    }
  ],
  "recapTrimestres": {
    "parRegime": [{ "regime": string, "total": number }],
    "totalGeneral": number
  },
  "regimesAffilies": [string]
}

USER:
Voici le texte brut extrait du RIS :

[texte anonymisé]

Extrais toutes les données selon le schéma JSON ci-dessus.
```

#### Prompt Notification de pension

```
SYSTEM:
Tu es un extracteur de données spécialisé dans les notifications
de pension de retraite françaises (CARSAT / régime général).
Extrais les données exactes. JSON strict uniquement.

SCHÉMA JSON ATTENDU :
{
  "montantBrut": number,
  "sam": number | null,
  "tauxLiquidation": number,
  "trimestresRetenus": number,
  "trimestresRequis": number,
  "proratisation": number | null,
  "majorations": {
    "enfants": boolean,
    "enfantsPourcentage": number | null,
    "surcote": { "trimestres": number, "pourcentage": number } | null,
    "decote": { "trimestres": number, "pourcentage": number } | null
  },
  "minimumContributif": boolean,
  "dateEffet": "JJ/MM/AAAA" | null,
  "montantNet": number | null
}
```

#### Prompt Agirc-Arrco

```
SYSTEM:
Tu es un extracteur de données spécialisé dans les relevés
de points Agirc-Arrco. Extrais le tableau de points année
par année. JSON strict uniquement.

SCHÉMA JSON ATTENDU :
{
  "pointsParAnnee": [
    {
      "annee": number,
      "employeur": string | null,
      "pointsArrco": number,
      "pointsAgirc": number | null,
      "pointsGratuits": number | null,
      "typeGratuit": string | null
    }
  ],
  "totalPoints": number,
  "gmpAppliquee": boolean,
  "fusionAgirc2019": boolean
}
```

#### Prompt titre de pension fonctionnaires (SRE/CNRACL)

```
SYSTEM:
Tu es un extracteur de données spécialisé dans les titres
de pension de la fonction publique française (SRE ou CNRACL).
Le calcul est basé sur le traitement indiciaire, pas le SAM.
JSON strict uniquement.

SCHÉMA JSON ATTENDU :
{
  "montantBrut": number,
  "indiceBrut": number | null,
  "traitementIndiciaire": number | null,
  "trimestresServices": number,
  "bonifications": number | null,
  "trimestresRequis": number,
  "tauxLiquidation": number,
  "decote": { "trimestres": number, "pourcentage": number } | null,
  "surcote": { "trimestres": number, "pourcentage": number } | null,
  "majorationEnfants": boolean,
  "minimumGaranti": boolean,
  "dateEffet": "JJ/MM/AAAA" | null,
  "montantNet": number | null
}
```

#### Prompts pour les documents simples

Les relevés de mensualités, attestations fiscales, paiements Agirc-Arrco, EIG, RAFP ont des prompts plus courts car les données sont simples (tableau de montants mensuels, un chiffre annuel, etc.).

---

## 6. Étape 4 — Claude Vision (dernier recours)

### Quand l'utiliser
- PDF scanné (texte non sélectionnable)
- Photos JPG/PNG
- Après échec de l'extraction texte

### Architecture

```typescript
async function extractWithVision(
  documentType: DocumentType,
  images: Base64Image[],     // une image par page
  anonymizer: AnonymizationSession
): Promise<ExtractedData> {
  // 1. Préparer les images (resize si > 2048px pour réduire les coûts)
  const resizedImages = await Promise.all(
    images.map(img => resizeIfNeeded(img, 2048))
  )
  
  // 2. Choisir le prompt Vision
  const systemPrompt = VISION_PROMPTS[documentType].system
  
  // 3. Appeler Claude Vision
  // Regrouper les pages : max 5 images par appel pour optimiser
  const batches = chunkArray(resizedImages, 5)
  let allData: any[] = []
  
  for (const batch of batches) {
    const response = await callClaudeVision({
      system: systemPrompt,
      images: batch,
      maxTokens: 4096,
      temperature: 0,
    })
    allData.push(JSON.parse(cleanJSON(response)))
  }
  
  // 4. Fusionner les résultats (si multi-batch)
  const merged = mergeExtractionBatches(allData, documentType)
  
  // 5. Désanonymiser (N° SS et noms détectés dans l'image)
  return anonymizer.deanonymize(merged)
}
```

### Optimisation des coûts Vision

| Technique | Économie |
|-----------|----------|
| Resize images à 2048px max | ~30% (moins de tokens image) |
| Regrouper les pages (5 par appel) | ~40% (moins d'appels) |
| Ne pas utiliser Vision pour les PDF numériques | ~60% des documents |
| Cache : ne pas ré-extraire un document déjà extrait | Variable |

### Prompts Vision

Les prompts Vision sont identiques aux prompts texte (même schéma JSON attendu) mais avec un préambule adapté :

```
SYSTEM:
Tu es un extracteur de données spécialisé. On te montre
des images d'un [type de document]. Extrais les données
visibles et renvoie-les en JSON strict.

ATTENTION :
- L'image peut être une photo de mauvaise qualité
- Certains caractères peuvent être flous ou partiellement visibles
- Si un champ n'est pas lisible, mets null (ne devine pas)
- Les tableaux peuvent être mal alignés sur les photos

[Même schéma JSON que le prompt texte]
```

---

## 7. Anonymisation — Avant tout appel Claude

### Principe (identique à MONIMPOT)

On sépare les données sensibles AVANT d'envoyer quoi que ce soit à Claude. On réinjecte après.

### Données sensibles à anonymiser

| Donnée | Traitement |
|--------|-----------|
| N° de Sécurité Sociale | Remplacé par `[NIR_ANONYMISE]` |
| Nom, prénom | Remplacé par `[NOM_ANONYMISE]`, `[PRENOM_ANONYMISE]` |
| Adresse postale | Remplacé par `[ADRESSE_ANONYMISE]` |
| Nom d'employeur | Conservé (nécessaire pour identifier les périodes, pas une donnée sensible du client) |
| Montants, dates, trimestres | Conservés (nécessaires pour les calculs) |

### Implémentation

```typescript
import { AnonymizationSession } from '@/lib/anonymizer'

function createRetraitiaAnonymizer(clientData: {
  nom?: string
  prenom?: string
  nir?: string
  adresse?: string
}): AnonymizationSession {
  const session = new AnonymizationSession()
  
  if (clientData.nir) session.register('nir', clientData.nir)
  if (clientData.nom) session.register('nom', clientData.nom)
  if (clientData.prenom) session.register('prenom', clientData.prenom)
  if (clientData.adresse) session.register('adresse', clientData.adresse)
  
  return session
}
```

### Pour le texte brut (avant regex ou Claude texte)

```typescript
const anonymizer = createRetraitiaAnonymizer(clientData)
const safeText = anonymizer.anonymize(rawText)
// → Le N° SS, nom, prénom, adresse sont remplacés par des placeholders
// → Les montants et dates sont préservés
```

### Pour les images (Claude Vision)

On ne peut pas anonymiser une image. Deux approches :
1. **Acceptable** : on envoie l'image telle quelle à Claude Vision. Les données sensibles sont dans l'image mais Claude ne les stocke pas (API stateless). Le risque est minimal.
2. **Renforcé (futur)** : OCR l'image avec Tesseract d'abord, anonymiser le texte, envoyer le texte anonymisé à Claude texte au lieu de l'image.

**Pour V2 : approche 1** (acceptable). On prévoit l'approche 2 si les exigences RGPD se renforcent.

---

## 8. Validation post-extraction

### Checks de cohérence automatiques

Après chaque extraction, on vérifie les données avant de les accepter.

#### Checks génériques (tous documents)

```typescript
function validateGeneric(data: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Montants réalistes
  if (data.montantBrut && (data.montantBrut < 50 || data.montantBrut > 10000)) {
    errors.push('Montant de pension hors fourchette réaliste')
  }
  
  // Dates cohérentes
  if (data.dateEffet) {
    const date = parseDate(data.dateEffet)
    if (date < new Date('1990-01-01') || date > new Date()) {
      errors.push('Date d\'effet hors fourchette')
    }
  }
  
  return { valid: errors.length === 0, errors, warnings }
}
```

#### Checks spécifiques RIS

```typescript
function validateRIS(data: RISExtracted): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Trimestres par année ≤ 4
  for (const ligne of data.carriere) {
    if (ligne.trimestres > 4) {
      errors.push(`Année ${ligne.annee} : ${ligne.trimestres} trimestres (max 4)`)
    }
    if (ligne.trimestres < 0) {
      errors.push(`Année ${ligne.annee} : trimestres négatifs`)
    }
  }
  
  // Total trimestres = somme des lignes
  const somme = data.carriere.reduce((s, l) => s + l.trimestres, 0)
  if (data.recapTrimestres.totalGeneral && 
      Math.abs(somme - data.recapTrimestres.totalGeneral) > 2) {
    warnings.push(`Total trimestres (${somme}) ≠ récap (${data.recapTrimestres.totalGeneral})`)
  }
  
  // Années dans l'ordre
  const annees = data.carriere.map(l => l.annee)
  const sorted = [...annees].sort((a, b) => a - b)
  if (JSON.stringify(annees) !== JSON.stringify(sorted)) {
    warnings.push('Années pas dans l\'ordre chronologique')
  }
  
  // Pas de gap de plus de 5 ans sans explication
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i-1] > 5) {
      warnings.push(`Gap de ${sorted[i] - sorted[i-1]} ans entre ${sorted[i-1]} et ${sorted[i]}`)
    }
  }
  
  // Salaires réalistes (si présents)
  for (const ligne of data.carriere) {
    if (ligne.revenu !== null && ligne.revenu !== undefined) {
      if (ligne.revenu > 0 && ligne.revenu < 500) {
        warnings.push(`Année ${ligne.annee} : salaire très faible (${ligne.revenu}€)`)
      }
      if (ligne.revenu > 100000) {
        warnings.push(`Année ${ligne.annee} : salaire très élevé (${ligne.revenu}€)`)
      }
    }
  }
  
  return { valid: errors.length === 0, errors, warnings }
}
```

#### Checks spécifiques notification de pension

```typescript
function validateNotification(data: NotificationExtracted): ValidationResult {
  const errors: string[] = []
  
  // Taux entre 37.5% et 50% (avec surcote, peut dépasser 50%)
  if (data.tauxLiquidation < 25 || data.tauxLiquidation > 75) {
    errors.push(`Taux de liquidation hors fourchette : ${data.tauxLiquidation}%`)
  }
  
  // Trimestres retenus ≤ trimestres requis × 1.3 (surcote max raisonnable)
  if (data.trimestresRetenus > data.trimestresRequis * 1.3) {
    errors.push('Trimestres retenus anormalement élevés vs requis')
  }
  
  // Montant brut cohérent avec SAM × taux × proratisation
  if (data.sam && data.tauxLiquidation && data.trimestresRetenus && data.trimestresRequis) {
    const pensionTheorique = (data.sam * data.tauxLiquidation / 100 * 
      Math.min(data.trimestresRetenus, data.trimestresRequis) / data.trimestresRequis) / 12
    const ecart = Math.abs(data.montantBrut - pensionTheorique) / pensionTheorique
    if (ecart > 0.20) {
      errors.push(`Montant brut (${data.montantBrut}€) incohérent avec le calcul théorique (${Math.round(pensionTheorique)}€)`)
    }
  }
  
  return { valid: errors.length === 0, errors }
}
```

#### Checks spécifiques Agirc-Arrco

```typescript
function validateAgircArrco(data: AgircArrcoExtracted): ValidationResult {
  const errors: string[] = []
  
  // Points par année réalistes (typiquement 10-500 points/an)
  for (const ligne of data.pointsParAnnee) {
    const totalPoints = (ligne.pointsArrco || 0) + (ligne.pointsAgirc || 0)
    if (totalPoints > 1000) {
      errors.push(`Année ${ligne.annee} : ${totalPoints} points (anormalement élevé)`)
    }
  }
  
  // Total = somme
  const somme = data.pointsParAnnee.reduce((s, l) => 
    s + (l.pointsArrco || 0) + (l.pointsAgirc || 0) + (l.pointsGratuits || 0), 0)
  if (data.totalPoints && Math.abs(somme - data.totalPoints) / data.totalPoints > 0.05) {
    errors.push(`Total points (${data.totalPoints}) ≠ somme (${Math.round(somme)})`)
  }
  
  return { valid: errors.length === 0, errors }
}
```

### En cas d'échec de validation

1. **Erreurs** → retry avec prompt renforcé (1x max) incluant les erreurs détectées :
   "L'extraction précédente contenait des erreurs : [liste]. Réextrais en corrigeant."
2. **Après retry** → si encore des erreurs → extraction partielle : on garde les champs valides, on marque les invalides comme null, et on informe le client
3. **Warnings** → on les stocke, on les utilise dans le score de confiance, mais on ne bloque pas

---

## 9. Score de confiance

### Calcul

```typescript
function computeConfidenceScore(
  source: 'regex' | 'claude_text' | 'claude_vision',
  documentFormat: 'pdf_digital' | 'pdf_scan' | 'photo',
  validation: ValidationResult,
  fieldsRatio: number  // champs remplis / champs attendus
): number {
  let score = 0
  
  // Base selon la source
  switch (source) {
    case 'regex': score = 90; break
    case 'claude_text': score = 85; break
    case 'claude_vision': score = 75; break
  }
  
  // Bonus/malus format
  switch (documentFormat) {
    case 'pdf_digital': score += 5; break
    case 'pdf_scan': score -= 5; break
    case 'photo': score -= 15; break
  }
  
  // Bonus/malus validation
  if (validation.errors.length > 0) score -= 20
  if (validation.warnings.length > 0) score -= 5 * validation.warnings.length
  if (validation.errors.length === 0 && validation.warnings.length === 0) score += 5
  
  // Ratio de champs remplis
  score = score * fieldsRatio
  
  return Math.max(0, Math.min(100, Math.round(score)))
}
```

### Utilisation du score

| Score | Label | Impact |
|-------|-------|--------|
| 90-100 | Excellent | Données fiables, calcul complet |
| 70-89 | Bon | Données probablement fiables, avertissements éventuels |
| 50-69 | Moyen | Données partielles, certains calculs impossibles |
| < 50 | Faible | Données insuffisantes, demander un meilleur document |

Le score de confiance de chaque document alimente le score global du diagnostic (le baromètre Bronze/Argent/Or/Platine).

---

## 10. Gestion des erreurs et retry

### Stratégie de retry

| Tentative | Action | Coût |
|-----------|--------|------|
| 1ère | Extraction avec prompt standard | Coût normal |
| 2ème | Prompt renforcé avec erreurs de la 1ère tentative | +1 appel |
| 3ème (texte → Vision) | Si texte illisible, bascule en Vision | +coût Vision |
| Après 3 tentatives | Extraction partielle + alerte client | 0 |

### Message au client en cas d'extraction partielle

```
⚠️ Extraction partielle

Nous avons pu lire la plupart de votre document, mais certaines
informations n'ont pas pu être extraites automatiquement :

• [Liste des champs manquants]

Vous pouvez :
→ Réuploader une version plus lisible du document
→ Compléter manuellement les informations manquantes
→ Continuer avec les données disponibles (analyse moins précise)

[🔄 Réuploader] [✏️ Compléter manuellement] [▶️ Continuer]
```

### Logs et monitoring

Chaque extraction est loguée :
```typescript
{
  dossierId: string,
  documentType: string,
  documentFormat: 'pdf_digital' | 'pdf_scan' | 'photo',
  pipeline: ['regex' | 'claude_text' | 'claude_vision'][],  // chemin emprunté
  tentatives: number,
  dureeMs: number,
  coutEstime: number,       // en $ (basé sur les tokens)
  scoreConfiance: number,
  erreurs: string[],
  warnings: string[],
  fieldsFound: number,
  fieldsTotal: number,
  timestamp: date
}
```

On agrège ces logs pour surveiller :
- Coût moyen par document et par dossier
- Taux d'échec par type de document
- Distribution des chemins (regex vs Claude texte vs Vision)
- Score de confiance moyen

---

## 11. Données techniques

### Fichiers à créer

```
src/lib/retraitia/extraction/
  ├── pipeline.ts            // Orchestrateur du pipeline d'extraction
  ├── text-extractor.ts      // pdf-parse + détection PDF numérique vs scan
  ├── image-converter.ts     // PDF scanné → images, resize, assemblage
  ├── parsers/
  │   ├── ris-parser.ts      // Regex spécifiques RIS
  │   ├── notification-parser.ts  // Regex notification CARSAT
  │   ├── titre-pension-fp-parser.ts  // Regex titre SRE/CNRACL
  │   ├── agirc-arrco-parser.ts   // Regex relevé de points
  │   ├── mensualites-parser.ts   // Regex relevé mensualités
  │   ├── avis-imposition-parser.ts  // Réutilise le parser MONIMPOT
  │   ├── eig-parser.ts      // Regex EIG
  │   └── generic-parser.ts  // Fallback regex générique
  ├── prompts/
  │   ├── ris-prompt.ts
  │   ├── notification-prompt.ts
  │   ├── titre-pension-fp-prompt.ts
  │   ├── agirc-arrco-prompt.ts
  │   ├── eig-prompt.ts
  │   └── generic-prompt.ts
  ├── validators/
  │   ├── ris-validator.ts
  │   ├── notification-validator.ts
  │   ├── agirc-arrco-validator.ts
  │   └── generic-validator.ts
  ├── anonymizer.ts          // Anonymisation N° SS, nom, adresse
  ├── confidence.ts          // Calcul du score de confiance
  └── types.ts               // Types extraits par document
```

### Route API

```
POST /api/retraitia/extract
  Body: { dossierId, documentType, fileId }
  
  → Pipeline :
  1. Récupère le fichier (uploads)
  2. Détecte le format (PDF num / scan / photo)
  3. Extraction texte si possible
  4. Parsing regex
  5. Si insuffisant : anonymise → Claude texte
  6. Si illisible : Claude Vision
  7. Validation de cohérence
  8. Score de confiance
  9. Sauvegarde extractedData dans le document
  10. Retourne le résumé au client
  
  Response: {
    success: boolean,
    extractedData: object,
    summary: string,         // résumé lisible pour le client
    confidence: number,      // 0-100
    method: 'regex' | 'claude_text' | 'claude_vision',
    warnings: string[],
    errors: string[],        // si extraction partielle
    cost: number             // coût estimé en $
  }
```

---

## 12. Métriques extraction

| Métrique | Cible |
|----------|-------|
| Taux extraction regex seul (0 API) | > 40% des documents |
| Taux extraction Claude texte | ~35% |
| Taux extraction Claude Vision | < 25% |
| Coût moyen par dossier | < 0.15$ |
| Score confiance moyen | > 80 |
| Taux extraction partielle | < 5% |
| Taux échec total (aucune extraction) | < 1% |
| Temps moyen extraction par document | < 10s |
| Taux retry | < 15% |

