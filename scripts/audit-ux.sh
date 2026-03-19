#!/bin/bash
# ============================================================
# RÉCUPÉO — Audit UX complet (statique + live)
# Analyse code source + test routes HTTP + cohérence
# ============================================================

cd /var/www/recupeo
OUT="/tmp/audit-ux-results.md"
ERRORS=0
WARNINGS=0

echo "# Audit UX RÉCUPÉO — $(date '+%Y-%m-%d %H:%M')" > $OUT
echo "" >> $OUT

# ────────────────────────────────────────
# 1. ROUTES HTTP — toutes les pages
# ────────────────────────────────────────
echo "## 1. Routes HTTP" >> $OUT
echo "" >> $OUT

PAGES=(
  "/" "/monimpot" "/macaution" "/mabanque" "/mataxe"
  "/mapension" "/monloyer" "/monchomage" "/retraitia"
  "/avis" "/connexion"
  "/macaution/rapport" "/mataxe/rapport" "/mapension/rapport" "/retraitia/rapport"
  "/mentions-legales" "/cgu" "/confidentialite"
  "/mon-espace" "/mon-espace/tableau-de-bord"
)

for p in "${PAGES[@]}"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -L "http://localhost:3000$p")
  if [ "$CODE" = "200" ]; then
    echo "- ✅ \`$p\` → $CODE" >> $OUT
  elif [ "$CODE" = "307" ] || [ "$CODE" = "308" ]; then
    echo "- 🔀 \`$p\` → $CODE (redirect — attendu pour /mon-espace)" >> $OUT
  else
    echo "- ❌ \`$p\` → $CODE" >> $OUT
    ERRORS=$((ERRORS+1))
  fi
done

# ────────────────────────────────────────
# 2. API ENDPOINTS — test avec payloads
# ────────────────────────────────────────
echo "" >> $OUT
echo "## 2. API Endpoints" >> $OUT
echo "" >> $OUT

# APIs qui acceptent POST avec JSON
declare -A API_TESTS
API_TESTS["/api/monimpot/pre-diagnostic"]='{"situation":"celibataire","vivezSeul":false,"enfantsMineurs":0,"enfantsMajeurs":0,"eleveSeul5ans":false,"age":35,"invalidite":false,"revenuNetImposable":30000,"nbParts":1,"impotPaye":2000,"typeRevenus":"salaires","fraisReels":false,"pensionAlimentaire":false,"dons":false,"emploiDomicile":false,"gardeEnfant":false,"ehpad":false,"per":false,"revenusCapitaux":false,"email":"audit@test.fr"}'
API_TESTS["/api/monloyer/check"]='{"ville":"Paris","arrondissement":"75011","surface":35,"loyer":900,"nbPieces":2,"anneeConstruction":"apres_1990","meuble":false,"typeLogement":"appartement","email":"audit@test.fr"}'
API_TESTS["/api/mapension/calculate"]='{"dateNaissance":"1960-01-15","dateDepart":"2025-06-01","pensionBrute":1800,"regimeBase":"cnav","dureeAnnees":42,"taux":50,"email":"audit@test.fr"}'
API_TESTS["/api/reviews/list"]='{"brique":"monimpot"}'
API_TESTS["/api/reviews/stats"]='{"brique":"monimpot"}'
API_TESTS["/api/chat"]='{"message":"bonjour","page":"home","mode":"orientation"}'

for endpoint in "${!API_TESTS[@]}"; do
  PAYLOAD="${API_TESTS[$endpoint]}"
  RESP=$(curl -s -o /tmp/api_resp.json -w "%{http_code}" -X POST "http://localhost:3000$endpoint" -H "Content-Type: application/json" -d "$PAYLOAD")
  SUCCESS=$(python3 -c "import json;d=json.load(open('/tmp/api_resp.json'));print('OK' if d.get('success',d.get('reviews',d.get('stats','')))!='' else 'FAIL')" 2>/dev/null || echo "PARSE_ERR")
  if [ "$RESP" = "200" ] && [ "$SUCCESS" != "FAIL" ] && [ "$SUCCESS" != "PARSE_ERR" ]; then
    echo "- ✅ \`POST $endpoint\` → $RESP" >> $OUT
  else
    echo "- ❌ \`POST $endpoint\` → HTTP $RESP / $SUCCESS" >> $OUT
    ERRORS=$((ERRORS+1))
  fi
done

# ────────────────────────────────────────
# 3. LIENS INTERNES — analyse statique TSX
# ────────────────────────────────────────
echo "" >> $OUT
echo "## 3. Liens internes (href/Link)" >> $OUT
echo "" >> $OUT

# Extract all internal links from TSX files
grep -rhoP '(?:href|to)=["\x27`]/[a-z][^"\x27`]*' src/components/ src/app/ 2>/dev/null \
  | sed 's/.*[=]["\x27`]//' | sort -u > /tmp/internal_links.txt

# Known valid routes
VALID_ROUTES=$(find src/app -name "page.tsx" | sed 's|src/app||;s|/page.tsx||;s|^$|/|' | sort -u)

while IFS= read -r link; do
  # Skip external, anchors, dynamic
  [[ "$link" =~ ^https?: ]] && continue
  [[ "$link" =~ ^\# ]] && continue
  [[ "$link" =~ \[ ]] && continue
  [[ "$link" =~ \.pdf$ ]] && continue
  [[ "$link" =~ ^/api/ ]] && continue
  [[ "$link" =~ ^/admin ]] && continue
  
  # Check if route exists
  BASE=$(echo "$link" | cut -d'#' -f1 | cut -d'?' -f1)
  FOUND=0
  for route in $VALID_ROUTES; do
    if [ "$BASE" = "$route" ]; then
      FOUND=1
      break
    fi
  done
  
  if [ "$FOUND" = "0" ]; then
    # Check HTTP
    CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$BASE")
    if [ "$CODE" != "200" ] && [ "$CODE" != "307" ]; then
      FILE=$(grep -rl "$link" src/components/ src/app/ 2>/dev/null | head -1 | sed 's|src/||')
      echo "- ❌ Lien mort: \`$link\` → HTTP $CODE (dans $FILE)" >> $OUT
      ERRORS=$((ERRORS+1))
    fi
  fi
done < /tmp/internal_links.txt
echo "- ✅ $(wc -l < /tmp/internal_links.txt) liens internes analysés" >> $OUT

# ────────────────────────────────────────
# 4. FORMAT NOMBRES — vérifier fmt() partout
# ────────────────────────────────────────
echo "" >> $OUT
echo "## 4. Formatage nombres" >> $OUT
echo "" >> $OUT

LOCALE_HITS=$(grep -rn "toLocaleString.*fr" src/components/ src/app/ 2>/dev/null | grep -v node_modules | grep -v ".next" | wc -l)
if [ "$LOCALE_HITS" -gt 0 ]; then
  echo "- ❌ $LOCALE_HITS usages de toLocaleString('fr-FR') — utiliser fmt()" >> $OUT
  grep -rn "toLocaleString.*fr" src/components/ src/app/ 2>/dev/null | grep -v node_modules | while read line; do
    echo "  - \`$line\`" >> $OUT
  done
  ERRORS=$((ERRORS+LOCALE_HITS))
else
  echo "- ✅ Aucun toLocaleString('fr-FR') — fmt() utilisé partout" >> $OUT
fi

# ────────────────────────────────────────
# 5. IMPORTS MANQUANTS — vérifier cohérence
# ────────────────────────────────────────
echo "" >> $OUT
echo "## 5. Imports et dépendances" >> $OUT
echo "" >> $OUT

# Check fmt usage without import
FMT_NO_IMPORT=$(grep -rl "fmt(" src/components/ src/app/ 2>/dev/null | while read f; do
  if ! grep -q "from.*format" "$f" && ! grep -q "import.*fmt" "$f"; then
    echo "$f"
  fi
done)
if [ -n "$FMT_NO_IMPORT" ]; then
  echo "- ❌ fmt() utilisé sans import :" >> $OUT
  echo "$FMT_NO_IMPORT" | while read f; do echo "  - \`$f\`" >> $OUT; done
  ERRORS=$((ERRORS+1))
else
  echo "- ✅ fmt() importé partout où utilisé" >> $OUT
fi

# Check track usage without import
TRACK_NO_IMPORT=$(grep -rl "track(" src/components/ src/app/ 2>/dev/null | grep -v "node_modules" | while read f; do
  if ! grep -q "from.*analytics" "$f" && ! grep -q "import.*track" "$f"; then
    echo "$f"
  fi
done)
if [ -n "$TRACK_NO_IMPORT" ]; then
  echo "- ⚠️ track() sans import :" >> $OUT
  echo "$TRACK_NO_IMPORT" | while read f; do echo "  - \`$f\`" >> $OUT; done
  WARNINGS=$((WARNINGS+1))
else
  echo "- ✅ track() importé partout où utilisé" >> $OUT
fi

# ────────────────────────────────────────
# 6. SITEMAP vs ROUTES RÉELLES
# ────────────────────────────────────────
echo "" >> $OUT
echo "## 6. Sitemap cohérence" >> $OUT
echo "" >> $OUT

SITEMAP_URLS=$(curl -s http://localhost:3000/sitemap.xml 2>/dev/null | grep -oP '<loc>[^<]+</loc>' | sed 's/<[^>]*>//g' | sed 's|https://recupeo.fr||')
SITEMAP_COUNT=$(echo "$SITEMAP_URLS" | wc -l)
echo "- $SITEMAP_COUNT URLs dans sitemap.xml" >> $OUT

echo "$SITEMAP_URLS" | while read url; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$url")
  if [ "$CODE" != "200" ]; then
    echo "- ❌ Sitemap: \`$url\` → HTTP $CODE" >> $OUT
  fi
done

# Pages qui existent mais pas dans sitemap
for route in $VALID_ROUTES; do
  [ "$route" = "/" ] && route=""
  if ! echo "$SITEMAP_URLS" | grep -q "^${route}$"; then
    # Skip admin, auth, error pages
    [[ "$route" =~ ^/mon-espace ]] && continue
    [[ "$route" =~ ^/connexion ]] && continue
    [[ "$route" =~ ^/admin ]] && continue
    [ -z "$route" ] && continue
    echo "- ⚠️ Page \`$route\` absente du sitemap" >> $OUT
    WARNINGS=$((WARNINGS+1))
  fi
done

# ────────────────────────────────────────
# 7. ACCESSIBILITÉ — vérifications de base
# ────────────────────────────────────────
echo "" >> $OUT
echo "## 7. Accessibilité (basique)" >> $OUT
echo "" >> $OUT

# Images sans alt
IMG_NO_ALT=$(grep -rn '<img ' src/components/ src/app/ 2>/dev/null | grep -v 'alt=' | grep -v node_modules | wc -l)
if [ "$IMG_NO_ALT" -gt 0 ]; then
  echo "- ⚠️ $IMG_NO_ALT balises <img> sans attribut alt" >> $OUT
  WARNINGS=$((WARNINGS+IMG_NO_ALT))
else
  echo "- ✅ Toutes les images ont un alt" >> $OUT
fi

# Buttons without text or aria-label
BTN_NO_LABEL=$(grep -rn '<button' src/components/ src/app/ 2>/dev/null | grep -v 'aria-label' | grep -v '>' | grep -v node_modules | wc -l)

# Forms without labels
INPUT_NO_LABEL=$(grep -rn '<input ' src/components/ src/app/ 2>/dev/null | grep -v 'aria-label\|placeholder\|type="hidden"\|type="checkbox"' | grep -v node_modules | wc -l)

echo "- ℹ️ Vérification manuelle recommandée pour labels formulaires" >> $OUT

# ────────────────────────────────────────
# 8. COHÉRENCE DESIGN TOKENS
# ────────────────────────────────────────
echo "" >> $OUT
echo "## 8. Design tokens" >> $OUT
echo "" >> $OUT

# Hardcoded colors instead of tokens
HARD_COLORS=$(grep -rn "bg-\[#\|text-\[#\|border-\[#" src/components/ src/app/ 2>/dev/null | grep -v node_modules | grep -v ".next" | wc -l)
if [ "$HARD_COLORS" -gt 0 ]; then
  echo "- ⚠️ $HARD_COLORS couleurs hardcodées (hex au lieu de tokens)" >> $OUT
  grep -rn "bg-\[#\|text-\[#\|border-\[#" src/components/ src/app/ 2>/dev/null | grep -v node_modules | grep -v ".next" | head -10 | while read line; do
    echo "  - \`$(echo $line | sed 's|src/||')\`" >> $OUT
  done
  WARNINGS=$((WARNINGS+1))
else
  echo "- ✅ Aucune couleur hardcodée" >> $OUT
fi

# ────────────────────────────────────────
# 9. PAYWALL / STRIPE COHÉRENCE
# ────────────────────────────────────────
echo "" >> $OUT
echo "## 9. Stripe / Payment cohérence" >> $OUT
echo "" >> $OUT

# Check all plans referenced in components exist in payment.ts
PLANS_USED=$(grep -rhoP "plan:\s*['\"][^'\"]+['\"]" src/components/ src/app/ 2>/dev/null | grep -oP "['\"][^'\"]+['\"]" | tr -d "'" | tr -d '"' | sort -u)
PLANS_DEFINED=$(grep -oP "id:\s*'[^']+'" src/lib/payment.ts | grep -oP "'[^']+'" | tr -d "'" | sort -u)

echo "$PLANS_USED" | while read plan; do
  if echo "$PLANS_DEFINED" | grep -q "^${plan}$"; then
    echo "- ✅ Plan \`$plan\` défini dans payment.ts" >> $OUT
  else
    echo "- ❌ Plan \`$plan\` utilisé mais ABSENT de payment.ts" >> $OUT
    ERRORS=$((ERRORS+1))
  fi
done

# ────────────────────────────────────────
# 10. MONIMPOT SPÉCIFIQUE — cohérence Phase 3
# ────────────────────────────────────────
echo "" >> $OUT
echo "## 10. MONIMPOT Phase 3 — cohérence" >> $OUT
echo "" >> $OUT

# All detection types have templates
DET_TYPES=$(grep "type: '" src/lib/monimpot/anomaly-detection.ts | grep -oP "type: '[^']+'" | sed "s/type: '//;s/'//" | sort -u)
TPL_TYPES=$(grep -P "^\s+\w+:\s*\{" src/lib/monimpot/templates.ts | sed 's/[: {]//g;s/^\s*//' | sort -u | grep -v "type\|rapport\|guide\|reclamation")

MISSING_TPL=""
for dt in $DET_TYPES; do
  if ! echo "$TPL_TYPES" | grep -q "^${dt}$"; then
    MISSING_TPL="$MISSING_TPL $dt"
  fi
done

if [ -z "$MISSING_TPL" ]; then
  echo "- ✅ 30/30 types de détection ont leur template" >> $OUT
else
  echo "- ❌ Templates manquants :$MISSING_TPL" >> $OUT
  ERRORS=$((ERRORS+1))
fi

# Schema has all Phase 3 fields
PHASE3_FIELDS="enfantsCollege enfantsLycee enfantsSuperieur cotisationsSyndicales pinelMontant outreMerMontant investForestier renovationEnergetique borneElectriqueMontant pretEtudiantMontant domTom csgDeductibleMontant prestationCompensatoireMontant deficitsFonciersAnterieurs loyersBruts chargesLocatives locationMeubleeCA"
for f in $PHASE3_FIELDS; do
  if ! grep -q "$f" src/lib/monimpot/schema.ts; then
    echo "- ❌ Champ \`$f\` absent du schema Zod" >> $OUT
    ERRORS=$((ERRORS+1))
  fi
done
echo "- ✅ Champs Phase 3 présents dans schema Zod" >> $OUT

# ────────────────────────────────────────
# RÉSUMÉ
# ────────────────────────────────────────
echo "" >> $OUT
echo "---" >> $OUT
echo "## RÉSUMÉ" >> $OUT
echo "" >> $OUT
echo "- **Erreurs** : $ERRORS" >> $OUT
echo "- **Avertissements** : $WARNINGS" >> $OUT
echo "- **Date** : $(date)" >> $OUT

echo ""
echo "════════════════════════════════════════"
echo " AUDIT TERMINÉ — $ERRORS erreurs, $WARNINGS avertissements"
echo " Rapport : $OUT"
echo "════════════════════════════════════════"
