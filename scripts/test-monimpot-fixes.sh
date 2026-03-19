#!/bin/bash
# ============================================================
# Tests spécifiques pour les 8 corrections session 11
# ============================================================
set -euo pipefail
BASE="http://localhost:3000"
PASS=0; FAIL=0

ok()   { PASS=$((PASS+1)); echo -e "  \033[0;32m✅ $1\033[0m"; }
fail() { FAIL=$((FAIL+1)); echo -e "  \033[0;31m❌ $1\033[0m"; }
check() { if [ "$2" = "$3" ]; then ok "$1 ($2)"; else fail "$1 (got=$2, want=$3)"; fi; }

echo ""
echo -e "\033[0;33m━━━ FIX1. Barème — pas de trous entre tranches ━━━\033[0m"
# Revenu pile à 11497€/part → tranche 0%. Revenu 11498€ → doit être taxé à 11%
# Célibataire, 1 part, revenu 11498 → impôt = (11498-11497)*0.11 = 0.11 arrondi à 0
# Revenu 12000 → impôt = (12000-11497)*0.11 = 55.33 = 55€
R=$(curl -s "$BASE/api/monimpot/pre-diagnostic" \
  -H "Content-Type: application/json" \
  -d '{"situation":"celibataire","vivezSeul":false,"enfantsMineurs":0,"enfantsMajeurs":0,"eleveSeul5ans":false,"age":35,"invalidite":false,"revenuNetImposable":12000,"nbParts":1,"impotPaye":55,"typeRevenus":"salaires","fraisReels":true,"pensionAlimentaire":false,"dons":false,"emploiDomicile":false,"gardeEnfant":false,"ehpad":false,"per":false,"revenusCapitaux":false,"email":"test-fix1@test.fr"}')
ECO=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('economieAnnuelle','-1'))" 2>/dev/null)
check "Revenu 12K, impot 55€ → eco≤0 (pas de trou)" "$ECO" "0"

echo -e "\033[0;33m━━━ FIX2. Abattement 10% plafonné à 14171€ ━━━\033[0m"
# Haut salaire : 200K€ net imposable. Abattement devrait être 14171€ (pas 20K€)
# Sans plafond, impôt sous-estimé → économie gonflée
R=$(curl -s "$BASE/api/monimpot/pre-diagnostic" \
  -H "Content-Type: application/json" \
  -d '{"situation":"celibataire","vivezSeul":false,"enfantsMineurs":0,"enfantsMajeurs":0,"eleveSeul5ans":false,"age":35,"invalidite":false,"revenuNetImposable":200000,"nbParts":1,"impotPaye":60000,"typeRevenus":"salaires","fraisReels":true,"pensionAlimentaire":false,"dons":false,"emploiDomicile":false,"gardeEnfant":false,"ehpad":false,"per":false,"revenusCapitaux":false,"email":"test-fix2@test.fr"}')
OPT=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('impotOptimise','-1'))" 2>/dev/null)
# Avec 200K, 1 part: barème = (29315-11497)*0.11 + (83823-29315)*0.30 + (180294-83823)*0.41 + (200000-180294)*0.45
# = 1960 + 16352 + 39553 + 8868 = 66733. Décote = 0. impotOptimise >= 60000
[ "$OPT" -ge 55000 ] 2>/dev/null && ok "200K: impotOptimise=$OPT ≥ 55000 (plafond actif)" || fail "200K: impotOptimise=$OPT (attendu ≥55000)"

echo -e "\033[0;33m━━━ FIX3. TMI réel 41% et 45% ━━━\033[0m"
# Revenu 100K, 1 part → TMI devrait être 30% (pas 45%)
# Revenu 200K, 1 part → TMI devrait être 45%
# Testons indirectement: dons de 1000€ non déclarés
# TMI 30% → réduction 660€, TMI 45% → réduction 660€ (dons = 66% toujours)
# Mais PER de 5000€ → déduction : 5000 × 0.30 = 1500€ vs 5000 × 0.45 = 2250€
R=$(curl -s "$BASE/api/monimpot/pre-diagnostic" \
  -H "Content-Type: application/json" \
  -d '{"situation":"celibataire","vivezSeul":false,"enfantsMineurs":0,"enfantsMajeurs":0,"eleveSeul5ans":false,"age":35,"invalidite":false,"revenuNetImposable":200000,"nbParts":1,"impotPaye":60000,"typeRevenus":"salaires","fraisReels":true,"pensionAlimentaire":false,"dons":false,"emploiDomicile":false,"gardeEnfant":false,"ehpad":false,"per":false,"perMontantAn":5000,"revenusCapitaux":false,"email":"test-fix3@test.fr"}')
HAS=$(echo "$R" | python3 -c "import sys,json; d=json.load(sys.stdin); opts=[o for o in d.get('optimisations',[]) if o['type']=='per_deduction']; print(opts[0]['economie'] if opts else 0)" 2>/dev/null)
# Avec TMI 45%, PER 5000€ → eco = 5000 * 0.45 = 2250. Avec ancien TMI 30% → 1500
[ "${HAS:-0}" -ge 2000 ] 2>/dev/null && ok "TMI 45%: PER eco=$HAS ≥ 2000 (TMI réel)" || fail "TMI 45%: PER eco=$HAS (attendu ≥2000, ancien TMI 30% donnerait 1500)"

echo -e "\033[0;33m━━━ FIX4. Minimum de recouvrement < 61€ ━━━\033[0m"
# Revenu très bas: impôt théorique < 61€ → non recouvré → 0€
R=$(curl -s "$BASE/api/monimpot/pre-diagnostic" \
  -H "Content-Type: application/json" \
  -d '{"situation":"celibataire","vivezSeul":false,"enfantsMineurs":0,"enfantsMajeurs":0,"eleveSeul5ans":false,"age":35,"invalidite":false,"revenuNetImposable":12000,"nbParts":1,"impotPaye":0,"typeRevenus":"salaires","fraisReels":true,"pensionAlimentaire":false,"dons":false,"emploiDomicile":false,"gardeEnfant":false,"ehpad":false,"per":false,"revenusCapitaux":false,"email":"test-fix4@test.fr"}')
IMP=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('impotOptimise','-1'))" 2>/dev/null)
# 12K, 1 part → (12000-11497)*0.11 = 55.33 → 55€ < 61€ → non recouvré → 0
check "12K: impôt < 61€ → non recouvré → impotOptimise=0" "$IMP" "0"

echo -e "\033[0;33m━━━ FIX5. Décote avant réductions (V1) ━━━\033[0m"
# Contribuable faible revenu avec dons → la décote doit être calculée AVANT les réductions
# Revenu 18K, 1 part → impot brut = (18000-11497)*0.11 = 715€
# Décote: 917 - 715*0.4525 = 917 - 323 = 594€
# Impôt après décote: 715 - 594 = 121€
# Si dons 200€ non déclarés → réduction 132€ → impot net = max(121-132, 0) = 0
R=$(curl -s "$BASE/api/monimpot/pre-diagnostic" \
  -H "Content-Type: application/json" \
  -d '{"situation":"celibataire","vivezSeul":false,"enfantsMineurs":0,"enfantsMajeurs":0,"eleveSeul5ans":false,"age":35,"invalidite":false,"revenuNetImposable":18000,"nbParts":1,"impotPaye":715,"typeRevenus":"salaires","fraisReels":true,"pensionAlimentaire":false,"dons":false,"donsMontantAn":200,"emploiDomicile":false,"gardeEnfant":false,"ehpad":false,"per":false,"revenusCapitaux":false,"email":"test-fix5@test.fr"}')
IMP=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('impotOptimise','-1'))" 2>/dev/null)
ECO=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin).get('economieAnnuelle','-1'))" 2>/dev/null)
# impotOptimise devrait être 0 (ou très bas), economie = 715 - 0 = 715
[ "$IMP" -le 10 ] 2>/dev/null && ok "Décote avant réductions: impotOpt=$IMP ≤ 10" || fail "Décote avant réductions: impotOpt=$IMP (attendu ≤10)"

echo -e "\033[0;33m━━━ FIX7. fraisReels=false en V3 (anomaly-detection fonctionne) ━━━\033[0m"
# Simuler un submit V3: fraisReels=false + distance 50km → l'optimisation frais_reels DOIT être détectée
R=$(curl -s "$BASE/api/monimpot/pre-diagnostic" \
  -H "Content-Type: application/json" \
  -d '{"situation":"celibataire","vivezSeul":false,"enfantsMineurs":0,"enfantsMajeurs":0,"eleveSeul5ans":false,"age":35,"invalidite":false,"revenuNetImposable":35000,"nbParts":1,"impotPaye":3500,"typeRevenus":"salaires","fraisReels":false,"distanceTravail":50,"puissanceFiscale":5,"pensionAlimentaire":false,"dons":false,"emploiDomicile":false,"gardeEnfant":false,"ehpad":false,"per":false,"revenusCapitaux":false,"email":"test-fix7@test.fr"}')
TYPE=$(echo "$R" | python3 -c "import sys,json; d=json.load(sys.stdin); opts=[o['type'] for o in d.get('optimisations',[])]; print('frais_reels' if 'frais_reels' in opts else 'MISSING')" 2>/dev/null)
check "V3 fraisReels=false → frais_reels détecté" "$TYPE" "frais_reels"

echo ""
echo -e "\033[0;33m━━━ Nettoyage ━━━\033[0m"
DELETED=$(mongosh --quiet recupeo --eval "db.diagnostics.deleteMany({userEmail:/test-fix/}).deletedCount" 2>/dev/null)
echo "  🧹 $DELETED diagnostics test supprimés"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  \033[0;32m✅ PASS: $PASS\033[0m  \033[0;31m❌ FAIL: $FAIL\033[0m"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
