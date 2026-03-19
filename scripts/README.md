# 🛠️ RÉCUPÉO — Scripts Serveur

## Pourquoi ces scripts ?

Les commandes MCP SSH ont un **timeout de 60 secondes**. Le build Next.js prend ~30-90s selon la complexité. On utilise donc un **build asynchrone** : le script lance le build en arrière-plan et retourne immédiatement. On vérifie ensuite le statut.

## Commandes rapides

### Build & Deploy (2 étapes)
```bash
# ÉTAPE 1 — Lancer le build (retour immédiat)
./scripts/build.sh

# ÉTAPE 2 — Vérifier le résultat (~30-60s après)
./scripts/build.sh --status
```

### Raccourcis
```bash
./scripts/deploy.sh          # Alias de build.sh (lance le build async)
./scripts/status.sh          # Statut complet (build + PM2 + HTTP + disk + RAM)
./scripts/logs.sh build      # Logs du dernier build
./scripts/logs.sh pm2        # Logs PM2 (app runtime)
./scripts/logs.sh all        # Les deux
```

### Options de build.sh
```bash
./scripts/build.sh           # Build asynchrone (par défaut)
./scripts/build.sh --status  # Vérifie si le build est terminé
./scripts/build.sh --logs    # Affiche les logs du build
./scripts/build.sh --sync    # Build synchrone/bloquant (debug uniquement)
```

## Workflow type pour Claude MCP

```
1. Modifier les fichiers source
2. Appeler: ./scripts/build.sh
3. Attendre ~30s
4. Appeler: ./scripts/build.sh --status
5. Si ✅ SUCCESS → c'est déployé
   Si ❌ FAILED → lire les erreurs avec ./scripts/build.sh --logs
   Si ⏳ En cours → attendre et re-vérifier
```

## Fichiers temporaires
- `/tmp/recupeo-build.log` — Log complet du dernier build
- `/tmp/recupeo-build.pid` — PID du build en cours
- `/tmp/recupeo-build.status` — Statut résumé (1 ligne)

## Ne JAMAIS faire
- `npm run build` directement en MCP (timeout garanti)
- `cd /var/www/recupeo && npm run build && pm2 restart recupeo` (idem)
