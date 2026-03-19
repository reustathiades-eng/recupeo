#!/bin/bash
# ============================================================
# MONIMPÔT V2 — Tests E2E automatisés (v2 — session 8)
# Usage:
#   ./scripts/test-monimpot.sh              → Tests rapides (~15s)
#   ./scripts/test-monimpot.sh --extract    → + Tests extraction PDF (~2min)
#   ./scripts/test-monimpot.sh --full       → + Claude IA + PDF (~3min)
# ============================================================

set -uo pipefail
BASE="http://localhost:3000"
PASS=0; FAIL=0
MODE=${1:-""}
TESTPDF="/tmp/test-avis"

ok() { echo -e "  \033[0;32m✅ $1\033[0m"; PASS=$((PASS+1)); }
ko() { echo -e "  \033[0;31m❌ $1\033[0m"; FAIL=$((FAIL+1)); }
sec() { echo -e "\n\033[0;33m━━━ $1 ━━━\033[0m"; }

check() {
  local name="$1" expected="$2" actual="$3"
  [[ "$actual" == "$expected" ]] && ok "$name (=$expected)" || ko "$name — attendu: $expected, obtenu: $actual"
}

check_range() {
  local name="$1" min="$2" max="$3" actual="$4"
  if [[ -n "$actual" ]] && (( actual >= min && actual <= max )); then
    ok "$name (=$actual, range $min-$max)"
  else
    ko "$name — attendu: $min-$max, obtenu: $actual"
  fi
}

jq_val() { echo "$1" | python3 -c "import sys,json;d=json.load(sys.stdin);print($2)" 2>/dev/null; }

prediag() {
  curl -s -X POST "$BASE/api/monimpot/pre-diagnostic" \
    -H "Content-Type: application/json" -d "$1"
}

extract() {
  curl -s --max-time 55 -X POST "$BASE/api/monimpot/extract" \
    -F "files=@$1;type=$2" \
    -F "visionConsent=${3:-false}"
}

# ──────────────────────────────────────────
sec "1. Santé serveur"
# ──────────────────────────────────────────
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/")
check "Homepage" "200" "$HTTP"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/monimpot")
check "/monimpot" "200" "$HTTP"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/monimpot/rapport")
check "/monimpot/rapport" "200" "$HTTP"

# ──────────────────────────────────────────
sec "2. V1 sans opti (O1 guard)"
# ──────────────────────────────────────────
R=$(prediag '{"situation":"celibataire","vivezSeul":false,"enfantsMineurs":0,"enfantsMajeurs":0,"eleveSeul5ans":false,"age":35,"invalidite":false,"revenuNetImposable":30000,"nbParts":1,"impotPaye":2500,"typeRevenus":"salaires","fraisReels":false,"pensionAlimentaire":false,"dons":false,"emploiDomicile":false,"gardeEnfant":false,"ehpad":false,"per":false,"revenusCapitaux":false,"email":"e2e1@test.com"}')
check "eco=0" "0" "$(jq_val "$R" 'd["economieAnnuelle"]')"
check "hasOpt=False" "False" "$(jq_val "$R" 'd["hasOptimisations"]')"
check "impotOpt=2500" "2500" "$(jq_val "$R" 'd["impotOptimise"]')"

# ──────────────────────────────────────────
sec "3. V1 frais réels (50km)"
# ──────────────────────────────────────────
R=$(prediag '{"situation":"celibataire","vivezSeul":false,"enfantsMineurs":0,"enfantsMajeurs":0,"eleveSeul5ans":false,"age":35,"invalidite":false,"revenuNetImposable":30000,"nbParts":1,"impotPaye":2200,"typeRevenus":"salaires","fraisReels":false,"distanceTravail":50,"puissanceFiscale":6,"pensionAlimentaire":false,"dons":false,"emploiDomicile":false,"gardeEnfant":false,"ehpad":false,"per":false,"revenusCapitaux":false,"email":"e2e2@test.com"}')
check "hasOpt=True" "True" "$(jq_val "$R" 'd["hasOptimisations"]')"
check "type=frais_reels" "frais_reels" "$(jq_val "$R" 'd["optimisations"][0]["type"]')"
ECO=$(jq_val "$R" 'd["economieAnnuelle"]')
[[ -n "$ECO" && "$ECO" -gt 0 ]] && ok "eco>0 ($ECO€)" || ko "eco devrait être > 0"

# ──────────────────────────────────────────
sec "4. Parent isolé (case T)"
# ──────────────────────────────────────────
R=$(prediag '{"situation":"divorce_separe","vivezSeul":true,"enfantsMineurs":2,"enfantsMajeurs":0,"eleveSeul5ans":false,"age":38,"invalidite":false,"revenuNetImposable":28000,"nbParts":2,"impotPaye":1500,"typeRevenus":"salaires","fraisReels":false,"pensionAlimentaire":false,"dons":false,"emploiDomicile":false,"gardeEnfant":false,"ehpad":false,"per":false,"revenusCapitaux":false,"email":"e2e3@test.com"}')
TYPE=$(jq_val "$R" '"case_t" in [o["type"] for o in d["optimisations"]]')
check "case_t détectée" "True" "$TYPE"

# ──────────────────────────────────────────
sec "5. V2 extraction simulée"
# ──────────────────────────────────────────
R=$(prediag '{"situation":"marie_pacse","vivezSeul":false,"enfantsMineurs":2,"enfantsMajeurs":0,"eleveSeul5ans":false,"age":42,"invalidite":false,"revenuNetImposable":45000,"nbParts":3,"impotPaye":229,"typeRevenus":"salaires","fraisReels":true,"pensionAlimentaire":false,"dons":false,"emploiDomicile":false,"gardeEnfant":false,"ehpad":false,"per":false,"revenusCapitaux":true,"case2op":false,"email":"e2e4@test.com","rfr":47200,"isFromExtraction":true,"extractedCases":{"fraisReels1AK":5622,"gardeEnfant7GA":1746,"case2OP":false}}')
check "impot=229" "229" "$(jq_val "$R" 'd["impotActuel"]')"
DIAG=$(jq_val "$R" 'd["diagnosticId"]')

# ──────────────────────────────────────────
sec "6. O5 calcul 2OP précis"
# ──────────────────────────────────────────
R=$(prediag '{"situation":"celibataire","vivezSeul":false,"enfantsMineurs":0,"enfantsMajeurs":0,"eleveSeul5ans":false,"age":35,"invalidite":false,"revenuNetImposable":22000,"nbParts":1,"impotPaye":500,"typeRevenus":"salaires","fraisReels":false,"pensionAlimentaire":false,"dons":false,"emploiDomicile":false,"gardeEnfant":false,"ehpad":false,"per":false,"revenusCapitaux":true,"case2op":false,"email":"e2e5@test.com","rfr":22500,"isFromExtraction":true,"extractedCases":{"case2OP":false},"extractedRevenusCapitaux":3000}')
ECO2OP=$(jq_val "$R" '[o["economie"] for o in d["optimisations"] if o["type"]=="case_2op"][0]')
[[ -n "$ECO2OP" && "$ECO2OP" -gt 0 ]] && ok "2OP eco>0 ($ECO2OP€)" || ko "2OP eco devrait être > 0"

# ──────────────────────────────────────────
sec "7. Non imposable (eco=0)"
# ──────────────────────────────────────────
R=$(prediag '{"situation":"celibataire","vivezSeul":false,"enfantsMineurs":0,"enfantsMajeurs":0,"eleveSeul5ans":false,"age":30,"invalidite":false,"revenuNetImposable":12000,"nbParts":1,"impotPaye":0,"typeRevenus":"salaires","fraisReels":false,"pensionAlimentaire":false,"dons":false,"emploiDomicile":false,"gardeEnfant":false,"ehpad":false,"per":false,"revenusCapitaux":false,"email":"e2e6@test.com"}')
check "eco=0" "0" "$(jq_val "$R" 'd["economieAnnuelle"]')"

# ──────────────────────────────────────────
sec "8. Robustesse formats"
# ──────────────────────────────────────────

# 8a. Format non supporté
R=$(curl -s -X POST "$BASE/api/monimpot/extract" -F "files=@/etc/hostname;type=text/plain" -F "visionConsent=false")
check "TXT rejeté" "False" "$(jq_val "$R" 'd["success"]')"

# 8b. Fichier trop gros (créer un fichier 11 Mo)
dd if=/dev/urandom bs=1M count=11 of=/tmp/toobig.pdf 2>/dev/null
R=$(curl -s --max-time 10 -X POST "$BASE/api/monimpot/extract" -F "files=@/tmp/toobig.pdf;type=application/pdf" -F "visionConsent=false")
check "11Mo rejeté" "False" "$(jq_val "$R" 'd["success"]')"
rm -f /tmp/toobig.pdf

# ──────────────────────────────────────────
sec "9. Anonymisation base"
# ──────────────────────────────────────────
PII=$(mongosh recupeo --quiet --eval "
  const d=db.diagnostics.findOne({brique:'monimpot',userEmail:/e2e/});
  if(!d){print('OK')} else {
    const s=JSON.stringify(d.inputData||{});
    print(/\d{2}\s?\d{2}\s?\d{3}\s?\d{3}\s?\d{3}/.test(s)?'FAIL':'OK')
  }" 2>/dev/null)
check "PII absentes" "OK" "$PII"

# ══════════════════════════════════════════
# TESTS EXTRACTION PDF (--extract ou --full)
# ══════════════════════════════════════════
if [[ "$MODE" == "--extract" || "$MODE" == "--full" ]]; then

  # Générer les PDF de test si pas déjà fait
  if [[ ! -f "$TESTPDF/avis-celibataire-simple.pdf" ]]; then
    sec "Génération PDF de test..."
    cd /var/www/recupeo && node scripts/generate-test-avis.cjs > /dev/null 2>&1
  fi

  sec "10. Extraction T-01 (célibataire simple)"
  R=$(extract "$TESTPDF/avis-celibataire-simple.pdf" "application/pdf")
  check "T-01 success" "True" "$(jq_val "$R" 'd["success"]')"
  check "T-01 sit=C" "C" "$(jq_val "$R" 'd["extraction"]["situationFamiliale"]')"
  check "T-01 parts=1" "1" "$(jq_val "$R" 'd["extraction"]["nbPartsDeclarees"]')"
  check "T-01 impot=1200" "1200" "$(jq_val "$R" 'd["extraction"]["impotNet"]')"
  RFR_T01=$(jq_val "$R" 'd["extraction"]["rfr"]')
  [[ -n "$RFR_T01" && "$RFR_T01" -gt 0 ]] && ok "T-01 rfr>0 ($RFR_T01)" || ko "T-01 rfr=0"

  sec "11. Extraction T-08 (restitution)"
  R=$(extract "$TESTPDF/avis-grosse-restitution.pdf" "application/pdf")
  check "T-08 success" "True" "$(jq_val "$R" 'd["success"]')"
  check "T-08 impot=3500" "3500" "$(jq_val "$R" 'd["extraction"]["impotNet"]')"
  SOLDE=$(jq_val "$R" 'd["extraction"]["soldeAPayer"]')
  [[ -n "$SOLDE" && "$SOLDE" -lt 0 ]] && ok "T-08 solde négatif ($SOLDE)" || ko "T-08 solde devrait être négatif ($SOLDE)"

  sec "12. Extraction T-03 (non imposable)"
  R=$(extract "$TESTPDF/avis-parent-isole.pdf" "application/pdf")
  check "T-03 impot=0" "0" "$(jq_val "$R" 'd["extraction"]["impotNet"]')"
  check "T-03 caseT" "True" "$(jq_val "$R" 'd["extraction"]["caseT"]')"

  sec "13. Faux document (bulletin paie)"
  if [[ -f "$TESTPDF/fake-bulletin-paie.pdf" ]]; then
    R=$(extract "$TESTPDF/fake-bulletin-paie.pdf" "application/pdf")
    check "Faux doc rejeté" "False" "$(jq_val "$R" 'd["success"]')"
  else
    ok "Faux doc (fichier absent, skip)"
  fi

  sec "14. Extraction JPEG"
  if [[ -f "$TESTPDF/avis-celibataire-jpg.jpg" ]]; then
    R=$(extract "$TESTPDF/avis-celibataire-jpg.jpg" "image/jpeg" "true")
    check "JPEG success" "True" "$(jq_val "$R" 'd["success"]')"
    check "JPEG impot=1200" "1200" "$(jq_val "$R" 'd["extraction"]["impotNet"]')"
  else
    ok "JPEG (fichier absent, skip)"
  fi
fi

# ══════════════════════════════════════════
# TESTS COMPLETS CLAUDE IA + PDF (--full)
# ══════════════════════════════════════════
if [[ "$MODE" == "--full" && -n "$DIAG" ]]; then
  echo -e "  ⏳ Pause 10s avant tests Claude IA (évite timeout API)..."
  sleep 10
  sec "15. Full-report Claude IA (~30s)"
  mongosh recupeo --quiet --eval "db.diagnostics.updateOne({_id:ObjectId('$DIAG')},{\$set:{paid:true,status:'paid'}})" > /dev/null 2>&1
  REP=$(curl -s --max-time 90 -X POST "$BASE/api/monimpot/full-report" -H "Content-Type: application/json" -d "{\"diagnosticId\":\"$DIAG\"}")
  check "full-report success" "True" "$(jq_val "$REP" 'd.get("success","")')"

  sec "16. PDF rapport"
  PDF_HTTP=$(curl -s -o /tmp/e2e-rapport.pdf -w "%{http_code}" -X POST "$BASE/api/monimpot/generate-pdf" \
    -H "Content-Type: application/json" -d "{\"diagnosticId\":\"$DIAG\",\"type\":\"report\"}")
  check "PDF rapport HTTP 200" "200" "$PDF_HTTP"
  PDF_MAGIC=$(head -c4 /tmp/e2e-rapport.pdf 2>/dev/null)
  check "PDF rapport valide" "%PDF" "$PDF_MAGIC"
  SIZE=$(stat -c%s /tmp/e2e-rapport.pdf 2>/dev/null || echo 0)
  [[ "$SIZE" -gt 50000 ]] && ok "PDF rapport > 50Ko ($SIZE)" || ko "PDF rapport trop petit ($SIZE)"

  sec "17. Generate letters (~30s)"
  LET=$(curl -s --max-time 90 -X POST "$BASE/api/monimpot/generate-letters" -H "Content-Type: application/json" \
    -d "{\"diagnosticId\":\"$DIAG\",\"sensitiveData\":{\"numeroFiscal\":\"12 34 567 890 123\",\"adresseCentre\":\"SIP Test\"}}")
  check "letters success" "True" "$(jq_val "$LET" 'd.get("success","")')"

  sec "18. PDF réclamation"
  REC_HTTP=$(curl -s -o /tmp/e2e-recl.pdf -w "%{http_code}" -X POST "$BASE/api/monimpot/generate-pdf" \
    -H "Content-Type: application/json" -d "{\"diagnosticId\":\"$DIAG\",\"type\":\"reclamation\",\"sensitiveData\":{\"numeroFiscal\":\"12 34 567 890 123\",\"adresseCentre\":\"SIP Test\"}}")
  check "PDF réclamation HTTP 200" "200" "$REC_HTTP"

  rm -f /tmp/e2e-rapport.pdf /tmp/e2e-recl.pdf
fi

# ──────────────────────────────────────────
sec "Nettoyage"
# ──────────────────────────────────────────
N=$(mongosh recupeo --quiet --eval "print(db.diagnostics.deleteMany({userEmail:/e2e/}).deletedCount)" 2>/dev/null)
echo -e "  🧹 ${N} diagnostics test supprimés"

# ──────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  \033[0;32m✅ PASS: $PASS\033[0m  \033[0;31m❌ FAIL: $FAIL\033[0m"
if [[ "$MODE" == "" ]]; then
  echo -e "  \033[0;33m💡 --extract : + tests extraction PDF (~2min)\033[0m"
  echo -e "  \033[0;33m💡 --full    : + Claude IA + PDF rapport (~3min)\033[0m"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
[[ $FAIL -gt 0 ]] && exit 1 || exit 0
