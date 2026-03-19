#!/bin/bash
# ============================================================
# RÉCUPÉO — Build asynchrone avec suivi de statut
# ============================================================
# Usage:
#   ./scripts/build.sh          → Lance le build en arrière-plan
#   ./scripts/build.sh --status → Vérifie le statut du build
#   ./scripts/build.sh --logs   → Affiche les dernières lignes du log
#   ./scripts/build.sh --sync   → Build synchrone (bloquant, pour debug)
# ============================================================

APP_DIR="/var/www/recupeo"
LOG_FILE="/tmp/recupeo-build.log"
PID_FILE="/tmp/recupeo-build.pid"
STATUS_FILE="/tmp/recupeo-build.status"

show_status() {
    if [ -f "$STATUS_FILE" ]; then
        cat "$STATUS_FILE"
    else
        echo "⚪ Aucun build lancé"
    fi
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo "⏳ Build en cours (PID: $PID)"
            return 1
        fi
    fi
    return 0
}

show_logs() {
    if [ -f "$LOG_FILE" ]; then
        echo "=== 30 dernières lignes du build ==="
        tail -30 "$LOG_FILE"
    else
        echo "Pas de log de build disponible"
    fi
}

sync_build() {
    echo "🔧 Build synchrone (bloquant)..."
    cd "$APP_DIR"
    npm run build 2>&1
    RESULT=$?
    if [ $RESULT -eq 0 ]; then
        echo "✅ Build réussi, restart PM2..."
        pm2 restart recupeo
        echo "✅ Terminé"
    else
        echo "❌ Build échoué (code: $RESULT)"
    fi
    return $RESULT
}

async_build() {
    if [ -f "$PID_FILE" ]; then
        OLD_PID=$(cat "$PID_FILE")
        if kill -0 "$OLD_PID" 2>/dev/null; then
            echo "⚠️  Build déjà en cours (PID: $OLD_PID). Utilisez --status pour suivre."
            return 1
        fi
    fi

    echo "🚀 Build lancé en arrière-plan..."
    echo "   Log: $LOG_FILE"
    echo "   Statut: ./scripts/build.sh --status"

    nohup "$APP_DIR/scripts/_build_worker.sh" > /dev/null 2>&1 &
    BUILD_PID=$!
    echo "$BUILD_PID" > "$PID_FILE"

    echo "⏳ PID: $BUILD_PID"
    echo "🔍 Vérifier dans ~30-60s avec: ./scripts/build.sh --status"
    return 0
}

case "${1:-}" in
    --status|-s)  show_status ;;
    --logs|-l)    show_logs ;;
    --sync)       sync_build ;;
    --help|-h)
        echo "Usage: ./scripts/build.sh [--status|--logs|--sync|--help]"
        echo "  (défaut)    Lance le build async (retour immédiat)"
        echo "  --status    Vérifie si le build est terminé + résultat"
        echo "  --logs      Affiche les 30 dernières lignes du log"
        echo "  --sync      Build bloquant (pour debug)"
        ;;
    *)            async_build ;;
esac
