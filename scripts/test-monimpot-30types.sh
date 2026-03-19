#!/bin/bash
# ============================================================
# MONIMPOT — Test 30 types d'optimisation
# Chaque test envoie un profil spécifique au pré-diagnostic
# et vérifie que l'optimisation attendue est détectée
# ============================================================

URL="http://localhost:3000/api/monimpot/pre-diagnostic"
PASS=0
FAIL=0
TOTAL=0

test_opt() {
  local NAME="$1"
  local EXPECTED_TYPE="$2"
  local DATA="$3"
  TOTAL=$((TOTAL + 1))
  
  RESULT=$(curl -s -X POST "$URL" -H "Content-Type: application/json" -d "$DATA")
  
  # Check if expected type is in optimisations
  HAS=$(echo "$RESULT" | python3 -c "
import sys, json
try:
  d = json.load(sys.stdin)
  types = [o['type'] for o in d.get('optimisations', [])]
  eco = sum(o['economie'] for o in d.get('optimisations', []) if o['type'] == '$EXPECTED_TYPE')
  found = '$EXPECTED_TYPE' in types
  print(f'OK:{eco}' if found else 'MISSING')
except: print('ERROR')
" 2>/dev/null)
  
  if [[ "$HAS" == OK* ]]; then
    ECO=$(echo "$HAS" | cut -d: -f2)
    echo "  ✅ $NAME → $EXPECTED_TYPE (${ECO}€)"
    PASS=$((PASS + 1))
  elif [[ "$HAS" == "MISSING" ]]; then
    echo "  ❌ $NAME → $EXPECTED_TYPE NOT DETECTED"
    FAIL=$((FAIL + 1))
  else
    echo "  ⚠️  $NAME → ERROR"
    FAIL=$((FAIL + 1))
  fi
}

BASE=',"vivezSeul":false,"enfantsMajeurs":0,"eleveSeul5ans":false,"invalidite":false,"dons":false,"emploiDomicile":false,"gardeEnfant":false,"ehpad":false,"per":false,"pensionAlimentaire":false,"revenusCapitaux":false,"case2op":false,"email":"test@test.com"'

echo "═══ MONIMPOT — Test 30 types d'optimisation ═══"
echo ""

# 1. Frais réels
test_opt "Frais réels (35km)" "frais_reels" \
  "{\"situation\":\"celibataire\",\"enfantsMineurs\":0,\"age\":35,\"revenuNetImposable\":35000,\"nbParts\":1,\"impotPaye\":3200,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"distanceTravail\":35,\"puissanceFiscale\":5$BASE}"

# 2. Case T
test_opt "Case T (parent isolé)" "case_t" \
  "{\"situation\":\"divorce_separe\",\"enfantsMineurs\":2,\"age\":40,\"revenuNetImposable\":30000,\"nbParts\":2,\"impotPaye\":1500,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"vivezSeul\":true,\"enfantsMajeurs\":0,\"eleveSeul5ans\":false,\"invalidite\":false,\"dons\":false,\"emploiDomicile\":false,\"gardeEnfant\":false,\"ehpad\":false,\"per\":false,\"pensionAlimentaire\":false,\"revenusCapitaux\":false,\"case2op\":false,\"email\":\"test@test.com\"}"

# 3. Case L
test_opt "Case L (élevé seul 5 ans)" "case_l" \
  "{\"situation\":\"celibataire\",\"enfantsMineurs\":0,\"age\":55,\"revenuNetImposable\":25000,\"nbParts\":1,\"impotPaye\":1800,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"eleveSeul5ans\":true,\"vivezSeul\":false,\"enfantsMajeurs\":0,\"invalidite\":false,\"dons\":false,\"emploiDomicile\":false,\"gardeEnfant\":false,\"ehpad\":false,\"per\":false,\"pensionAlimentaire\":false,\"revenusCapitaux\":false,\"case2op\":false,\"email\":\"test@test.com\"}"

# 4. Dons oubliés
test_opt "Dons oubliés" "dons_oublies" \
  "{\"situation\":\"celibataire\",\"enfantsMineurs\":0,\"age\":40,\"revenuNetImposable\":40000,\"nbParts\":1,\"impotPaye\":5000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"dons\":false,\"donsMontantAn\":1000,\"emploiDomicile\":false,\"gardeEnfant\":false,\"ehpad\":false,\"per\":false,\"pensionAlimentaire\":false,\"revenusCapitaux\":false,\"case2op\":false,\"vivezSeul\":true,\"enfantsMajeurs\":0,\"eleveSeul5ans\":false,\"invalidite\":false,\"email\":\"test@test.com\"}"

# 5. Emploi domicile
test_opt "Emploi domicile" "emploi_domicile" \
  "{\"situation\":\"celibataire\",\"enfantsMineurs\":0,\"age\":40,\"revenuNetImposable\":50000,\"nbParts\":1,\"impotPaye\":8000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"emploiDomicile\":true,\"emploiDomicileMontantAn\":6000$BASE}"

# 6. Garde enfant
test_opt "Garde enfant" "garde_enfant" \
  "{\"situation\":\"marie_pacse\",\"enfantsMineurs\":1,\"age\":35,\"revenuNetImposable\":50000,\"nbParts\":2.5,\"impotPaye\":3000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"gardeEnfant\":true,\"gardeMontantAn\":3500$BASE}"

# 7. Pension alimentaire
test_opt "Pension alimentaire" "pension_alimentaire" \
  "{\"situation\":\"divorce_separe\",\"enfantsMineurs\":0,\"age\":45,\"revenuNetImposable\":40000,\"nbParts\":1,\"impotPaye\":5000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"pensionAlimentaire\":false,\"pensionMontantMois\":300,\"vivezSeul\":true,\"enfantsMajeurs\":0,\"eleveSeul5ans\":false,\"invalidite\":false,\"dons\":false,\"emploiDomicile\":false,\"gardeEnfant\":false,\"ehpad\":false,\"per\":false,\"revenusCapitaux\":false,\"case2op\":false,\"email\":\"test@test.com\"}"

# 8. EHPAD
test_opt "EHPAD" "ehpad" \
  "{\"situation\":\"celibataire\",\"enfantsMineurs\":0,\"age\":50,\"revenuNetImposable\":40000,\"nbParts\":1,\"impotPaye\":5000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"ehpad\":true,\"ehpadMontantAn\":8000$BASE}"

# 9. PER
test_opt "PER déduction" "per_deduction" \
  "{\"situation\":\"celibataire\",\"enfantsMineurs\":0,\"age\":40,\"revenuNetImposable\":50000,\"nbParts\":1,\"impotPaye\":8000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"per\":true,\"perMontantAn\":5000$BASE}"

# 10. Abattement senior
test_opt "Abattement senior 65+" "abattement_senior" \
  "{\"situation\":\"celibataire\",\"enfantsMineurs\":0,\"age\":67,\"revenuNetImposable\":20000,\"nbParts\":1,\"impotPaye\":1200,\"typeRevenus\":\"retraite\",\"fraisReels\":false$BASE}"

# 11. Case 2OP (barème vs PFU)
test_opt "Case 2OP (barème)" "case_2op" \
  "{\"situation\":\"celibataire\",\"enfantsMineurs\":0,\"age\":40,\"revenuNetImposable\":20000,\"nbParts\":1,\"impotPaye\":1000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"revenusCapitaux\":true,\"case2op\":false,\"vivezSeul\":true,\"enfantsMajeurs\":0,\"eleveSeul5ans\":false,\"invalidite\":false,\"dons\":false,\"emploiDomicile\":false,\"gardeEnfant\":false,\"ehpad\":false,\"per\":false,\"pensionAlimentaire\":false,\"email\":\"test@test.com\"}"

# 12. Scolarité collège
test_opt "Scolarité collège" "scolarite_college" \
  "{\"situation\":\"marie_pacse\",\"enfantsMineurs\":2,\"age\":40,\"revenuNetImposable\":50000,\"nbParts\":3,\"impotPaye\":2000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"enfantsCollege\":2$BASE}"

# 13. Scolarité lycée
test_opt "Scolarité lycée" "scolarite_lycee" \
  "{\"situation\":\"marie_pacse\",\"enfantsMineurs\":1,\"age\":45,\"revenuNetImposable\":50000,\"nbParts\":2.5,\"impotPaye\":3000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"enfantsLycee\":1$BASE}"

# 14. Scolarité supérieur
test_opt "Scolarité supérieur" "scolarite_superieur" \
  "{\"situation\":\"marie_pacse\",\"enfantsMineurs\":0,\"enfantsMajeurs\":1,\"age\":50,\"revenuNetImposable\":60000,\"nbParts\":2.5,\"impotPaye\":5000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"enfantsSuperieur\":1,\"vivezSeul\":false,\"eleveSeul5ans\":false,\"invalidite\":false,\"dons\":false,\"emploiDomicile\":false,\"gardeEnfant\":false,\"ehpad\":false,\"per\":false,\"pensionAlimentaire\":false,\"revenusCapitaux\":false,\"case2op\":false,\"email\":\"test@test.com\"}"

# 15. Syndicat
test_opt "Cotisations syndicales" "syndicat" \
  "{\"situation\":\"celibataire\",\"enfantsMineurs\":0,\"age\":40,\"revenuNetImposable\":35000,\"nbParts\":1,\"impotPaye\":3000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"cotisationsSyndicales\":400$BASE}"

# 16. Borne électrique
test_opt "Borne électrique" "borne_electrique" \
  "{\"situation\":\"celibataire\",\"enfantsMineurs\":0,\"age\":40,\"revenuNetImposable\":40000,\"nbParts\":1,\"impotPaye\":5000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"borneElectriqueMontant\":2$BASE}"

# 17. Prêt étudiant
test_opt "Prêt étudiant" "pret_etudiant" \
  "{\"situation\":\"celibataire\",\"enfantsMineurs\":0,\"age\":28,\"revenuNetImposable\":28000,\"nbParts\":1,\"impotPaye\":2000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"pretEtudiantMontant\":500$BASE}"

# 18. Déficit foncier
test_opt "Déficit foncier" "deficit_foncier" \
  "{\"situation\":\"celibataire\",\"enfantsMineurs\":0,\"age\":50,\"revenuNetImposable\":60000,\"nbParts\":1,\"impotPaye\":10000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"deficitsFonciersAnterieurs\":8000$BASE}"

# 19. Micro-foncier vs réel
test_opt "Micro-foncier vs réel" "micro_foncier_vs_reel" \
  "{\"situation\":\"celibataire\",\"enfantsMineurs\":0,\"age\":50,\"revenuNetImposable\":60000,\"nbParts\":1,\"impotPaye\":10000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"loyersBruts\":12000,\"chargesLocatives\":5000$BASE}"

# 20. CSG déductible
test_opt "CSG déductible" "csg_deductible" \
  "{\"situation\":\"celibataire\",\"enfantsMineurs\":0,\"age\":50,\"revenuNetImposable\":60000,\"nbParts\":1,\"impotPaye\":10000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"csgDeductibleMontant\":2000$BASE}"

# 21. Prestation compensatoire
test_opt "Prestation compensatoire" "prestation_compensatoire" \
  "{\"situation\":\"divorce_separe\",\"enfantsMineurs\":0,\"age\":50,\"revenuNetImposable\":60000,\"nbParts\":1,\"impotPaye\":10000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"prestationCompensatoireMontant\":10000,\"vivezSeul\":true,\"enfantsMajeurs\":0,\"eleveSeul5ans\":false,\"invalidite\":false,\"dons\":false,\"emploiDomicile\":false,\"gardeEnfant\":false,\"ehpad\":false,\"per\":false,\"pensionAlimentaire\":false,\"revenusCapitaux\":false,\"case2op\":false,\"email\":\"test@test.com\"}"

# 22. Abattement DOM-TOM
test_opt "Abattement DOM-TOM" "abattement_dom_tom" \
  "{\"situation\":\"celibataire\",\"enfantsMineurs\":0,\"age\":40,\"revenuNetImposable\":35000,\"nbParts\":1,\"impotPaye\":3000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"domTom\":true$BASE}"

# 23. Pinel
test_opt "Investissement Pinel" "pinel" \
  "{\"situation\":\"celibataire\",\"enfantsMineurs\":0,\"age\":45,\"revenuNetImposable\":60000,\"nbParts\":1,\"impotPaye\":10000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"pinelMontant\":200000$BASE}"

# 24. Outre-mer
test_opt "Investissement outre-mer" "outre_mer" \
  "{\"situation\":\"celibataire\",\"enfantsMineurs\":0,\"age\":45,\"revenuNetImposable\":60000,\"nbParts\":1,\"impotPaye\":10000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"outreMerMontant\":20000$BASE}"

# 25. Investissement forestier
test_opt "Investissement forestier" "foret" \
  "{\"situation\":\"celibataire\",\"enfantsMineurs\":0,\"age\":50,\"revenuNetImposable\":60000,\"nbParts\":1,\"impotPaye\":10000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"investForestier\":3000$BASE}"

# 26. Rénovation énergétique
test_opt "Rénovation énergétique" "renovation_energetique" \
  "{\"situation\":\"celibataire\",\"enfantsMineurs\":0,\"age\":50,\"revenuNetImposable\":50000,\"nbParts\":1,\"impotPaye\":8000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"renovationEnergetique\":10000$BASE}"

# 27. Micro-BIC vs réel
test_opt "Micro-BIC vs réel" "micro_bic_vs_reel" \
  "{\"situation\":\"celibataire\",\"enfantsMineurs\":0,\"age\":50,\"revenuNetImposable\":60000,\"nbParts\":1,\"impotPaye\":10000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"locationMeubleeCA\":15000,\"chargesLocatives\":10000$BASE}"

# 28. Rattachement enfant majeur
test_opt "Rattachement enfant majeur" "rattachement_enfant" \
  "{\"situation\":\"marie_pacse\",\"enfantsMineurs\":0,\"enfantsMajeurs\":1,\"age\":55,\"revenuNetImposable\":60000,\"nbParts\":2,\"impotPaye\":5000,\"typeRevenus\":\"salaires\",\"fraisReels\":false,\"vivezSeul\":false,\"eleveSeul5ans\":false,\"invalidite\":false,\"dons\":false,\"emploiDomicile\":false,\"gardeEnfant\":false,\"ehpad\":false,\"per\":false,\"pensionAlimentaire\":false,\"revenusCapitaux\":false,\"case2op\":false,\"email\":\"test@test.com\"}"

echo ""
echo "═══ RÉSULTATS ═══"
echo "  Total : $TOTAL"
echo "  ✅ Pass : $PASS"
echo "  ❌ Fail : $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 ALL TESTS PASSED"
  exit 0
else
  echo "⚠️  $FAIL test(s) échoué(s)"
  exit 1
fi
