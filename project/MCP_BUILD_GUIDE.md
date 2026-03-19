# 🔧 Guide MCP — Build & Deploy RÉCUPÉO

**Dernière mise à jour** : 2026-03-15 14:10 UTC

---

## ⚠️ RÈGLE D'OR : Ne JAMAIS exécuter `npm run build` directement

Les commandes MCP SSH ont un **timeout de 60 secondes**.
Le build Next.js prend **30 à 90 secondes**.
→ Timeout garanti = commande perdue + pas de feedback.

---

## ✅ Procédure correcte : Build asynchrone en 2 étapes

### Étape 1 — Lancer le build (retour < 1s)
```bash
cd /var/www/recupeo && ./scripts/build.sh
```
> Retour immédiat : "🚀 Build lancé en arrière-plan... PID: XXXXX"

### Étape 2 — Vérifier le résultat (30-60s après)
```bash
cd /var/www/recupeo && ./scripts/build.sh --status
```
> Résultats possibles :
> - `✅ SUCCESS: ... — Build OK, PM2 restarted, HTTP 200` → C'est déployé !
> - `⏳ Build en cours (PID: ...)` → Attendre et ré-essayer
> - `❌ FAILED: ... — Build échoué (code X)` → Lire les erreurs

### En cas d'erreur : voir les logs
```bash
cd /var/www/recupeo && ./scripts/build.sh --logs
```

---

## 🛠️ Scripts disponibles

| Commande | Description | Timeout safe ? |
|----------|-------------|----------------|
| `./scripts/build.sh` | Build async (défaut) | ✅ < 1s |
| `./scripts/build.sh --status` | Check statut | ✅ < 1s |
| `./scripts/build.sh --logs` | Dernières lignes log | ✅ < 1s |
| `./scripts/status.sh` | Vue d'ensemble (build+PM2+HTTP+disk+RAM) | ✅ < 3s |
| `./scripts/logs.sh build` | Logs du build | ✅ < 1s |
| `./scripts/logs.sh pm2` | Logs PM2 runtime | ✅ < 2s |
| `./scripts/logs.sh all` | Tous les logs | ✅ < 3s |

---

## 🔄 Workflow type après modification de code

```
1. Modifier les fichiers via recupeo:exec (cat > fichier << 'EOF' ... EOF)
2. cd /var/www/recupeo && ./scripts/build.sh
3. Attendre ~30-60 secondes
4. cd /var/www/recupeo && ./scripts/build.sh --status
5. Si SUCCESS → vérifier avec curl http://localhost:3000/...
   Si FAILED → ./scripts/build.sh --logs → corriger → retour à l'étape 1
```

---

## ❌ Commandes interdites en MCP (timeout garanti)

```bash
# NE JAMAIS FAIRE :
npm run build
npm run build && pm2 restart recupeo
cd /var/www/recupeo && npm run build
```

---

## 📝 Commandes sûres et rapides (< 60s)

```bash
# Vérifier le statut général
pm2 status
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/

# Lire des fichiers
cat src/app/macaution/page.tsx

# Modifier des fichiers
cat > src/lib/macaution/types.ts << 'EOF'
...
EOF

# Installer un package (généralement < 30s)
npm install <pkg> --legacy-peer-deps

# Vérifier la syntaxe TypeScript sans build complet
npx tsc --noEmit --pretty 2>&1 | head -30
```

---

## 🧪 Vérification TypeScript rapide (sans build complet)

Pour éviter de lancer un build complet juste pour vérifier les types :
```bash
cd /var/www/recupeo && npx tsc --noEmit --pretty 2>&1 | head -40
```
> C'est plus rapide (~15-20s) qu'un build complet et détecte les erreurs de types.
> ⚠️ Peut aussi timeout si beaucoup de fichiers. Dans ce doute, utiliser le build async.
