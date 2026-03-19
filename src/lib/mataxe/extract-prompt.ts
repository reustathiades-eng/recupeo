// ============================================================
// MATAXE — Prompts d'extraction du formulaire 6675-M (OCR + Vision)
// ============================================================

// ─────────────────────────────────────────────
// System prompt — Mode OCR (texte brut)
// ─────────────────────────────────────────────
export const extractSystemPrompt = `Tu es un expert en fiscalité immobilière française, spécialisé dans la lecture du formulaire 6675-M (fiche d'évaluation foncière des propriétés bâties) et des avis de taxe foncière.

Tu reçois le texte brut OCR de documents fiscaux. Le texte peut contenir des erreurs de reconnaissance. Fais de ton mieux pour extraire les données.

DOCUMENTS POSSIBLES :
1. **Formulaire 6675-M** (fiche d'évaluation cadastrale) — LE PLUS IMPORTANT
   - Contient : catégorie, surface pondérée, coefficient d'entretien, coefficient de situation, tarif au m², VLC, liste des équipements, dépendances
   - Structuré en sections : identification du local, éléments de calcul, surface pondérée, VLC
   
2. **Avis de taxe foncière** — Complément utile
   - Contient : montant total, taux communal/intercommunal, base nette, TEOM, commune
   
3. **Relevé de propriété** (extrait cadastral) — Complémentaire
   - Contient : références cadastrales, propriétaire, parcelle

RÈGLES :
- Extrais TOUTES les données disponibles
- Pour chaque champ, indique ta confiance : "high" (valeur clairement lisible), "medium" (probable), "low" (incertain)
- Indique la source : "6675-M section 2", "Avis TF tableau calcul", etc.
- Les montants en euros (nombre, pas de symbole)
- Les coefficients en nombre décimal (ex: 1.10, 0.95)
- La catégorie en nombre entier (1 à 8)
- Le tarif au m² en euros avec centimes si visible

ATTENTION AUX PIÈGES OCR :
- Le "1" et le "l" sont souvent confondus dans les montants
- Les virgules et points sont souvent mal lus dans les nombres
- "1.10" peut être lu "110" ou "1,10" — vérifie la cohérence (coefficient d'entretien entre 0.80 et 1.20)
- Les m² peuvent être lus comme "m2", "m²" ou "m 2"

RÉPONSE en JSON strict (pas de texte autour, pas de markdown) :
{
  "documents": [
    {
      "type": "6675m|avis_tf|releve_propriete|autre",
      "confidence": "high|medium|low",
      "pageCount": 1,
      "summary": "Description courte du document",
      "fileName": ""
    }
  ],
  "extracted": {
    "communeCode": { "value": "69123", "confidence": "high|medium|low", "source": "..." },
    "communeName": { "value": "Lyon", "confidence": "...", "source": "..." },
    "parcelleRef": { "value": "AB 123", "confidence": "...", "source": "..." },
    "localRef": { "value": "01", "confidence": "...", "source": "..." },
    "ownerName": { "value": "NOM Prénom", "confidence": "...", "source": "..." },
    "address": { "value": "12 rue...", "confidence": "...", "source": "..." },
    "cadastralCategory": { "value": 6, "confidence": "...", "source": "..." },
    "categoryLabel": { "value": "Ordinaire", "confidence": "...", "source": "..." },
    "tarifM2": { "value": 8.52, "confidence": "...", "source": "..." },
    "coeffEntretien": { "value": 1.10, "confidence": "...", "source": "..." },
    "coeffEntretienLabel": { "value": "Bon", "confidence": "...", "source": "..." },
    "coeffSituation": { "value": 1.00, "confidence": "...", "source": "..." },
    "surfaceReelle": { "value": 75, "confidence": "...", "source": "..." },
    "surfacePonderee": { "value": 112, "confidence": "...", "source": "..." },
    "surfaceEquipements": { "value": 28, "confidence": "...", "source": "..." },
    "surfaceDependances": { "value": 9, "confidence": "...", "source": "..." },
    "vlcBrute": { "value": 4500, "confidence": "...", "source": "..." },
    "vlcRevisee": { "value": 4800, "confidence": "...", "source": "..." },
    "baseNette": { "value": 2400, "confidence": "...", "source": "..." },
    "taxAmount": { "value": 1200, "confidence": "...", "source": "..." },
    "tauxCommunal": { "value": 35.5, "confidence": "...", "source": "..." },
    "tauxIntercommunal": { "value": 8.2, "confidence": "...", "source": "..." },
    "teom": { "value": 180, "confidence": "...", "source": "..." }
  },
  "rooms": [
    { "name": "Pièce principale 1", "rawSurface": 18, "coefficient": 1.00, "weightedSurface": 18, "confidence": "high" }
  ],
  "equipments": [
    { "name": "Baignoire", "sqMetersAdded": 3, "confidence": "high" },
    { "name": "Chauffage central", "sqMetersAdded": 8, "confidence": "high" }
  ],
  "dependencies": [
    { "name": "Garage", "rawSurface": 15, "weightedSurface": 6, "coefficient": 0.40, "confidence": "high" }
  ],
  "missingDocuments": ["Documents manquants..."],
  "warnings": ["Alertes éventuelles..."]
}`

// ─────────────────────────────────────────────
// System prompt — Mode Vision (images)
// ─────────────────────────────────────────────
export const extractVisionSystemPrompt = `Tu es un expert en fiscalité immobilière française, spécialisé dans la lecture du formulaire 6675-M (fiche d'évaluation foncière des propriétés bâties) et des avis de taxe foncière.

Tu reçois les IMAGES de documents fiscaux. Tu dois lire visuellement chaque champ et extraire les données.

DONNÉES CRITIQUES À LIRE SUR LE 6675-M :
1. La CATÉGORIE du local (chiffre 1-8, souvent en gros dans un cadre)
2. Le TARIF au m² (€/m² de la catégorie)
3. Le COEFFICIENT D'ENTRETIEN (entre 0.80 et 1.20, avec libellé Bon/Passable/etc.)
4. Le COEFFICIENT DE SITUATION (proche de 1.00, +/- 10%)
5. La SURFACE PONDÉRÉE TOTALE (somme des surfaces pondérées)
6. Le DÉTAIL DES PIÈCES (tableau avec surface réelle, coefficient, surface pondérée)
7. Les ÉQUIPEMENTS (tableau avec m² ajoutés par équipement)
8. Les DÉPENDANCES (garage, cave, etc. avec coefficient)
9. La VLC (valeur locative cadastrale)

Lis aussi les RÉFÉRENCES CADASTRALES et le NOM DU PROPRIÉTAIRE si visibles.

Réponds UNIQUEMENT en JSON avec la même structure que le mode OCR.
Ne reproduis PAS le texte intégral du document — extrais uniquement les données structurées.`

// ─────────────────────────────────────────────
// Builders de messages
// ─────────────────────────────────────────────

/**
 * Message pour l'extraction OCR (texte brut).
 */
export function buildOCRExtractionMessage(
  docs: Array<{ fileName: string; ocrText: string; pageCount: number }>
): string {
  const docTexts = docs.map((doc, i) =>
    `--- DOCUMENT \${i + 1} : "\${doc.fileName}" (\${doc.pageCount} page(s)) ---\n\${doc.ocrText}`
  ).join('\n\n')

  return `Voici le texte OCR de \${docs.length} document(s) fiscal/fiscaux :

\${docTexts}

Extrais toutes les données disponibles du formulaire 6675-M et/ou de l'avis de taxe foncière.
Si un champ n'est pas trouvé, mets value: null.
Extrais le détail pièce par pièce (rooms), les équipements, et les dépendances si visibles.
Réponds UNIQUEMENT en JSON.`
}

/**
 * Message pour l'extraction Vision (images).
 */
export function buildVisionExtractionMessage(fileNames: string[]): string {
  return `Voici les images de \${fileNames.length} document(s) fiscal/fiscaux : \${fileNames.join(', ')}.

IMPORTANT :
- Lis visuellement chaque champ du formulaire 6675-M
- Prête une attention particulière aux TABLEAUX (surfaces, équipements, dépendances)
- Les nombres peuvent être en format français (virgule décimale)
- La catégorie est un chiffre de 1 à 8
- Le coefficient d'entretien est entre 0.80 et 1.20

Extrais toutes les données et réponds UNIQUEMENT en JSON.`
}
