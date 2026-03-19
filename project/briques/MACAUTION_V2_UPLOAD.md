# Référence : le brief MACAUTION V2 (Upload → Extraction → Validation)
# Le document complet est dans le projet Claude Desktop.
# Sauvegardé le 2026-03-15.
# 
# Résumé : Refonte du parcours utilisateur MACAUTION.
# - V1 (actuel) : formulaire manuel 12 champs
# - V2 (cible) : upload documents → extraction IA Claude Vision → validation express → analyse
#
# Fichiers à créer :
# - src/components/macaution/MacautionUpload.tsx
# - src/components/macaution/MacautionExtraction.tsx
# - src/components/macaution/MacautionValidation.tsx
# - src/app/api/macaution/extract/route.ts
# - src/lib/macaution/extract-prompt.ts
# - src/lib/macaution/extract-types.ts
# - Modifier: src/lib/anthropic.ts (ajouter callClaudeVision)
# - Modifier: src/app/macaution/page.tsx (nouveau flow)
