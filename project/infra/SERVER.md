# 🖥️ Configuration Serveur

**Dernière mise à jour** : 2026-03-15 03:00 UTC

## VPS OVH

| Paramètre | Valeur |
|-----------|--------|
| Offre | VPS-2 |
| IP | 51.254.138.240 |
| IPv6 | 2001:41d0:305:2100::f18d |
| Hostname | vps-410f1e3b |
| OS | Ubuntu 25.04 |
| RAM | 12 Go |
| vCores | 6 |
| Disque | 100 Go SSD NVMe (94 Go libres) |
| Bande passante | Illimitée |
| Coût | 10,19€ TTC/mois |
| User SSH | ubuntu |
| MCP Connector | "recupeo" dans claude_desktop_config.json |

## Logiciels installés

| Logiciel | Version | Port | Statut |
|----------|---------|------|--------|
| Node.js | 20.20.1 | - | ✅ |
| npm | 10.8.2 | - | ✅ |
| MongoDB | 7.0.30 | 27017 | ✅ systemd |
| PM2 | 6.0.14 | - | ✅ |
| Nginx | 1.26.3 | 80 (443 pending) | ✅ systemd |
| Certbot | 2.11.0 | - | ✅ (SSL pas encore configuré) |
| Next.js | 15.5.12 | 3000 | ✅ via PM2 |
| Payload CMS | 3.79.0 | (intégré Next.js) | ✅ |

## Fichiers de config importants

```
/var/www/recupeo/.env                    ← Variables d'environnement
/var/www/recupeo/ecosystem.config.cjs    ← Config PM2
/etc/nginx/sites-available/recupeo       ← Config Nginx
/etc/nginx/sites-enabled/recupeo         ← Symlink actif
/var/log/recupeo/                        ← Logs PM2
```

## Commandes utiles

```bash
# App
pm2 status                    # Statut app
pm2 logs recupeo              # Logs temps réel
pm2 restart recupeo           # Redémarrer
pm2 stop recupeo              # Arrêter

# Rebuild après modif code
cd /var/www/recupeo && npm run build && pm2 restart recupeo

# MongoDB
mongosh                       # Shell MongoDB
systemctl status mongod       # Statut

# Nginx
nginx -t                      # Tester config
systemctl reload nginx        # Recharger
```
