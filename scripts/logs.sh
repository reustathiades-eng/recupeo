#!/bin/bash
# ============================================================
# RÉCUPÉO — Logs rapides (build + PM2)
# ============================================================
case "${1:-build}" in
    build|b)
        /var/www/recupeo/scripts/build.sh --logs
        ;;
    pm2|p)
        pm2 logs recupeo --nostream --lines 30 2>/dev/null
        ;;
    all|a)
        echo "=== BUILD LOG ==="
        /var/www/recupeo/scripts/build.sh --logs
        echo ""
        echo "=== PM2 LOG ==="
        pm2 logs recupeo --nostream --lines 15 2>/dev/null
        ;;
    *)
        echo "Usage: ./scripts/logs.sh [build|pm2|all]"
        ;;
esac
