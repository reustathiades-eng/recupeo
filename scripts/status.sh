#!/bin/bash
# ============================================================
# RÉCUPÉO — Statut rapide (build + app + HTTP)
# ============================================================
echo "=== BUILD ==="
/var/www/recupeo/scripts/build.sh --status
echo ""
echo "=== PM2 ==="
pm2 list --no-color 2>/dev/null | head -8
echo ""
echo "=== HTTP ==="
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
echo "localhost:3000 → HTTP $HTTP"
echo ""
echo "=== DISK ==="
df -h / | tail -1 | awk '{print "Disk: "$3" used / "$2" total ("$5" used)"}'
echo ""
echo "=== RAM ==="
free -h | grep Mem | awk '{print "RAM: "$3" used / "$2" total"}'
