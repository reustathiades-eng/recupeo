#!/bin/bash
# ============================================================
# RÉCUPÉO — Build Worker (exécuté en arrière-plan par build.sh)
# NE PAS APPELER DIRECTEMENT — utiliser ./scripts/build.sh
# ============================================================
APP_DIR="/var/www/recupeo"
LOG_FILE="/tmp/recupeo-build.log"
PID_FILE="/tmp/recupeo-build.pid"
STATUS_FILE="/tmp/recupeo-build.status"

cd "$APP_DIR"
echo "🔨 STARTED: $(date '+%Y-%m-%d %H:%M:%S')" > "$STATUS_FILE"
echo "========================================" > "$LOG_FILE"
echo "RÉCUPÉO BUILD — $(date)" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

# Build
npm run build >> "$LOG_FILE" 2>&1
BUILD_EXIT=$?

if [ $BUILD_EXIT -eq 0 ]; then
    echo "✅ Build réussi, restart PM2..." >> "$LOG_FILE"
    pm2 restart recupeo >> "$LOG_FILE" 2>&1
    PM2_EXIT=$?

    if [ $PM2_EXIT -eq 0 ]; then
        sleep 3
        HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>/dev/null)
        echo "HTTP check: $HTTP_CODE" >> "$LOG_FILE"
        echo "✅ SUCCESS: $(date '+%Y-%m-%d %H:%M:%S') — Build OK, PM2 restarted, HTTP $HTTP_CODE" > "$STATUS_FILE"
    else
        echo "⚠️ PARTIAL: $(date '+%Y-%m-%d %H:%M:%S') — Build OK mais PM2 restart échoué" > "$STATUS_FILE"
    fi
else
    echo "❌ Build ÉCHOUÉ" >> "$LOG_FILE"
    ERRORS=$(grep -A5 'error\|Error\|failed\|Failed' "$LOG_FILE" | tail -10)
    echo "❌ FAILED: $(date '+%Y-%m-%d %H:%M:%S') — Build échoué (code $BUILD_EXIT)" > "$STATUS_FILE"
    echo "Erreurs:" >> "$STATUS_FILE"
    echo "$ERRORS" >> "$STATUS_FILE"
fi

rm -f "$PID_FILE"
