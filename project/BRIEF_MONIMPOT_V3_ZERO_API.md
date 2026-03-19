# Résumé V3 — Zéro API
# Brief complet dans le projet Claude Desktop (BRIEF_MONIMPOT_V3_ZERO_API.md)
#
# CORRECTION : pas 35 regex, mais 15 + 1 générique + 78 mappings
#
# Architecture :
#   15 regex spécifiques (champs fixes : année, n° fiscal, situation, impôt...)
#   1 regex GÉNÉRIQUE : \(CODE\) + montant € — capture TOUTES les cases
#   78 codes fiscaux mappés (1AJ→salaires, 7UF→dons, 6NS→PER...)
#   + codes inconnus → autresCases (extensible)
#
# Gain : 65s → <1s, 0.06€ → 0€/client
# 3 nouveaux fichiers, 3 routes modifiées, 0 cassure
# Dire "MONIMPOT V3 — Zéro API" pour démarrer
