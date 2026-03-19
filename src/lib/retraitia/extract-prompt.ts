// ============================================================
// RETRAITIA — Prompts d'extraction documentaire (OCR + Vision)
// ============================================================

// ─────────────────────────────────────────────
// System prompt — Mode OCR (texte brut)
// ─────────────────────────────────────────────
export const extractSystemPrompt = `Tu es un expert en extraction de données de documents de retraite français.
Tu reçois le texte brut OCR de documents de retraite (RIS, EIG, relevé Agirc-Arrco, notification CNAV, bulletins de salaire, livret militaire).

Le texte OCR peut contenir des erreurs de reconnaissance. Fais de ton mieux pour extraire les données.

RÈGLES :
- Extrais TOUTES les données disponibles
- Pour chaque champ, indique ta confiance : "high" (valeur claire), "medium" (probable), "low" (incertain)
- Indique la source : "RIS page 1", "EIG section 2", etc.
- Les dates doivent être au format YYYY-MM-DD
- Les montants en euros (nombre, pas de symbole)
- Les régimes doivent correspondre aux codes : cnav, agirc_arrco, sre, cnracl, ircantec, rafp, ssi, msa_salarie, msa_exploitant, cnavpl, cipav, carmf, carpimko, carcdsf, cavp, cnbf, crn, cavec, cavom, carpv, cprn, cnieg, crpcen, ratp, sncf, enim, canssm, fspoeie, banque_france

DONNÉES PERSONNELLES :
- Extrais le nom, prénom, adresse, NIR et CARSAT dans le champ clientInfo
- Ces données servent à préremplir les courriers de réclamation
- Dans le reste de la réponse (extracted, yearDetails), tu peux les mentionner normalement
- Le NIR est un numéro à 13 chiffres + 2 chiffres clé (format: X XX XX XX XXX XXX XX)

RÉPONSE en JSON strict :
{
  "documents": [
    {
      "type": "ris|eig|agirc_arrco|notification|bulletin_salaire|attestation_pe|livret_militaire|autre",
      "confidence": "high|medium|low",
      "pageCount": 1,
      "summary": "Description courte du document",
      "fileName": ""
    }
  ],
  "extracted": {
    "birthDate": { "value": "YYYY-MM-DD", "confidence": "high|medium|low", "source": "..." },
    "sex": { "value": "M|F", "confidence": "...", "source": "..." },
    "regimes": { "value": ["cnav", "agirc_arrco"], "confidence": "...", "source": "..." },
    "totalTrimesters": { "value": 0, "confidence": "...", "source": "..." },
    "cotisedTrimesters": { "value": 0, "confidence": "...", "source": "..." },
    "careerStartYear": { "value": 0, "confidence": "...", "source": "..." },
    "careerStartAge": { "value": 0, "confidence": "...", "source": "..." },
    "militaryService": { "value": true|false|null, "confidence": "...", "source": "..." },
    "militaryDuration": { "value": 0, "confidence": "...", "source": "..." },
    "basePension": { "value": 0, "confidence": "...", "source": "..." },
    "complementaryPension": { "value": 0, "confidence": "...", "source": "..." },
    "retirementDate": { "value": "YYYY-MM-DD", "confidence": "...", "source": "..." },
    "hasChildrenBonus": { "value": true|false|null, "confidence": "...", "source": "..." },
    "hasDecote": { "value": true|false|null, "confidence": "...", "source": "..." },
    "tauxLiquidation": { "value": 50, "confidence": "...", "source": "..." },
    "totalPointsAgircArrco": { "value": 0, "confidence": "...", "source": "..." }
  },
  "yearDetails": [
    { "year": 2000, "regime": "CNAV", "trimestresCotises": 4, "trimestresAssimiles": 0, "trimestresValides": 4, "salaireBrut": 25000 }
  ],
  "careerGaps": [
    { "startYear": 2005, "endYear": 2006, "type": "gap|low_salary|missing_trimester", "comment": "Aucun trimestre validé" }
  ],
  "missingDocuments": ["Documents manquants..."],
  "clientInfo": {
    "lastName": "NOM extrait ou null",
    "firstName": "PRENOM extrait ou null",
    "fullName": "NOM PRENOM complet",
    "address": "Adresse postale complete ou null",
    "city": "Ville ou null",
    "postalCode": "Code postal ou null",
    "nir": "Numero de Securite Sociale (13 chiffres + cle) ou null",
    "carsat": "Nom de la CARSAT de rattachement ou null",
    "phone": "Telephone ou null"
  },
  "warnings": ["Alertes eventuelles..."]
}`

// ─────────────────────────────────────────────
// System prompt — Mode Vision (images)
// ─────────────────────────────────────────────
export const extractVisionSystemPrompt = `Tu es un expert en extraction de données de documents de retraite français.
Tu reçois les IMAGES de documents de retraite (RIS, EIG, relevé Agirc-Arrco, notification CNAV, etc.).

RÈGLES CRITIQUES :
1. Extrais les données personnelles dans le champ clientInfo (nom, prénom, adresse, NIR, CARSAT)
2. Extrais les données structurées (trimestres, montants, dates, régimes)
3. Le détail année par année du RIS est TRÈS PRÉCIEUX — extrais-le si visible
4. Identifie les trous de carrière (années sans trimestres)

Réponds UNIQUEMENT en JSON avec la même structure que le mode OCR.`

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
    `--- DOCUMENT ${i + 1} : "${doc.fileName}" (${doc.pageCount} page(s)) ---\n${doc.ocrText}`
  ).join('\n\n')

  return `Voici le texte OCR de ${docs.length} document(s) de retraite :

${docTexts}

Extrais toutes les données disponibles. Si un champ n'est pas trouvé, mets value: null.
Pour le détail année par année (yearDetails), extrais chaque ligne du relevé de carrière si visible.
Identifie les trous de carrière (careerGaps).
Réponds UNIQUEMENT en JSON.`
}

/**
 * Message pour l'extraction Vision (images).
 */
export function buildVisionExtractionMessage(fileNames: string[]): string {
  return `Voici les images de ${fileNames.length} document(s) de retraite : ${fileNames.join(', ')}.

IMPORTANT : ANONYMISE les données personnelles (noms, NIR, adresses) dans ta réponse.

Extrais toutes les données :
- Type de chaque document
- Données de carrière (trimestres, régimes, salaires)
- Pension (montants, taux, décote, majorations)
- Détail année par année si c'est un RIS
- Trous de carrière détectés

Réponds UNIQUEMENT en JSON.`
}
