# 🚀 Procédure de Déploiement

## Déploiement après modification de code

```bash
cd /var/www/recupeo

# 1. Modifier les fichiers...

# 2. Rebuild
npm run build

# 3. Redémarrer l'app
pm2 restart recupeo

# 4. Vérifier
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
pm2 logs recupeo --lines 20
```

## Ajout d'une dépendance npm

```bash
cd /var/www/recupeo
npm install <package> --legacy-peer-deps
npm run build
pm2 restart recupeo
```

## Mise à jour Payload CMS

```bash
cd /var/www/recupeo
npm update payload @payloadcms/next @payloadcms/db-mongodb --legacy-peer-deps
npx payload generate:importmap
npm run build
pm2 restart recupeo
```

## Rollback

```bash
# Si le build échoue, l'ancien build dans .next/ est toujours actif
# PM2 ne redémarre pas tant qu'on ne fait pas pm2 restart

# En cas de problème grave :
pm2 stop recupeo
# Corriger le problème...
npm run build
pm2 start ecosystem.config.cjs
```
