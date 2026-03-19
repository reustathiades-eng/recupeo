# 🔒 RÉCUPÉO — Stratégie d'Anonymisation (toutes briques)

**Dernière mise à jour** : 2026-03-15

---

## Principe

Toutes les données personnelles (PII) sont **anonymisées AVANT** envoi à l'API Claude, puis **désanonymisées** au retour. L'IA ne voit JAMAIS les données réelles.

```
[Formulaire] → [Validation] → [Calculs JS] → [ANONYMISATION] → [Claude API]
                                                                       ↓
[Réponse client] ← [Sauvegarde DB réelle] ← [DÉSANONYMISATION] ← [Réponse IA]
```

## Architecture (2 fichiers clés)

### `src/lib/anonymizer.ts` — Module central (toutes briques)
- Classe `AnonymizationSession` : register → anonymize → deanonymize
- Supporte : email, nom, prénom, adresse, téléphone, n° sécu, IBAN, n° fiscal, noms propres custom
- Remplacement par tokens : `jean.dupont@gmail.com` → `[EMAIL_1]`
- Mapping stocké en mémoire côté serveur (jamais envoyé à l'API)
- Tri par longueur décroissante (évite les remplacements partiels)

### `src/lib/<brique>/anonymize.ts` — Spécifique par brique
Chaque brique a son propre fichier qui identifie quelles données du formulaire sont des PII.

## Catégories de PII par brique

| Catégorie | Token | MACAUTION | RETRAITIA | MAPAIE | MONLOYER |
|-----------|-------|-----------|-----------|--------|----------|
| email | [EMAIL_N] | ✅ | ✅ | ✅ | ✅ |
| nom | [NOM_N] | — | ✅ | ✅ | — |
| prenom | [PRENOM_N] | — | ✅ | ✅ | — |
| adresse | [ADRESSE_N] | — | — | — | ✅ |
| telephone | [TELEPHONE_N] | ✅* | ✅ | ✅ | — |
| date_naissance | [DATE_NAISSANCE_N] | — | ✅ | ✅ | — |
| num_secu | [NUM_SECU_N] | — | ✅ | ✅ | — |
| iban | [IBAN_N] | — | — | ✅ | — |
| num_fiscal | [NUM_FISCAL_N] | — | — | — | — |
| nom_bailleur | [NOM_BAILLEUR_N] | ✅** | — | — | ✅** |
| nom_agence | [NOM_AGENCE_N] | ✅** | — | — | ✅** |
| nom_employeur | [NOM_EMPLOYEUR_N] | — | — | ✅ | — |
| adresse_logement | [ADRESSE_LOGEMENT_N] | — | — | — | ✅ |
| num_contrat | [NUM_CONTRAT_N] | — | — | ✅ | — |

- `✅*` = détecté dans champ libre (otherDeduction)
- `✅**` = prévu pour Phase 2 (upload documents, OCR)

## Ce qui N'est PAS anonymisé (nécessaire pour les calculs)

- Montants (loyer, dépôt, retenues) → chiffres, pas de PII
- Dates (entrée, sortie) → nécessaires pour les calculs de délais et vétusté
- Types/enums (type location, motifs de retenue) → pas de PII
- Résultats de calculs (pénalités, vétusté) → dérivés, pas de PII

## Implémentation pour une nouvelle brique

1. Créer `src/lib/<brique>/anonymize.ts`
2. Importer `AnonymizationSession` depuis `@/lib/anonymizer`
3. Identifier les champs PII du formulaire de la brique
4. Créer une fonction `create<Brique>Anonymizer(data)` qui :
   - Crée une session
   - Register chaque champ PII
   - Retourne la session
5. Dans la route API :
   - Appeler `create<Brique>Anonymizer(data)`
   - `anonymizer.anonymize(message)` AVANT envoi à Claude
   - `anonymizer.deanonymize(response)` APRÈS retour de Claude

## Tests

```bash
# Test basique : vérifier qu'aucun email n'apparaît dans les logs Claude
pm2 logs recupeo --lines 50 | grep -i "@"

# Vérifier le nombre de PII anonymisées dans les logs
pm2 logs recupeo --lines 50 | grep "Anonymisation"
```
