# RECUPEO — Suivi Projet

**Derniere mise a jour** : 2026-03-17 12:30 UTC (post-session 7)
**Version** : 0.9.0 — 8 briques live, MONIMPOT V2 optimise, attend SIRET pour Stripe prod

## Etat du projet

| Metrique | Valeur |
|----------|--------|
| Briques live | 8/14 (MACAUTION, RETRAITIA, MONLOYER, MATAXE, MAPENSION, MABANQUE, MONCHOMAGE, MONIMPOT) |
| Fichiers TS/TSX | ~300 |
| URLs sitemap | 15 |
| Events GA4 | ~67 |
| Paywalls Stripe | 8 (mode test) |
| Tests E2E | 15 (monimpot, ./scripts/test-monimpot.sh) |
| Chantiers transversaux | 4/4 (Compte Client, Chat IA, Avis Clients, Partage Social) |
| Blocker | SIRET en attente (depose 16/03, 1-4 sem.) |
| Sessions | 7 completees |

## Structure du suivi

```
project/
├── README.md                   ← Ce fichier (vue d'ensemble)
├── BRIEF_NEXT_SESSION.md       ← Brief pour la prochaine session de travail
├── MCP_BUILD_GUIDE.md          ← Guide build async (JAMAIS npm run build direct)
├── ANONYMIZATION.md            ← Politique anonymisation PII
├── TRUST_REASSURANCE.md        ← Strategie reassurance client
├── CLAUDE_PROJECT_INSTRUCTIONS.md ← Instructions projet Claude Desktop
├── status/
│   ├── DONE.md                 ← Tout ce qui est termine (7 sessions)
│   ├── TODO.md                 ← Prochaines etapes prioritaires
│   ├── BLOCKERS.md             ← Problemes en cours / bloquants
│   ├── CHANGELOG.md            ← Journal des modifications
│   └── CHANGELOG_CHANTIER1.md  ← Detail chantier Compte Client
└── [briques/, infra/, design/, business/, logs/ — structure initiale]
```

## Commandes rapides

```bash
# Suivi projet
cat /var/www/recupeo/project/BRIEF_NEXT_SESSION.md
cat /var/www/recupeo/project/status/TODO.md
cat /var/www/recupeo/project/status/DONE.md
cat /var/www/recupeo/project/status/BLOCKERS.md
cat /var/www/recupeo/project/status/CHANGELOG.md

# Etat serveur
pm2 status
pm2 logs recupeo --lines 50 --nostream

# Tests
./scripts/test-monimpot.sh           # Rapide (15 tests, 10s)
./scripts/test-monimpot.sh --full    # Complet avec Claude IA (2min)

# Build (JAMAIS npm run build — timeout MCP)
cd /var/www/recupeo && ./scripts/build.sh
./scripts/build.sh --status          # Verifier 30-60s apres

# Sante HTTP
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```

## Historique sessions

| # | Date | Contenu | Fichiers |
|---|------|---------|----------|
| 0 | 15/03 | Setup infra VPS, Next.js, MongoDB, PM2, Nginx, SSL | ~20 |
| 1-4 | 15-16/03 | 5 briques (MACAUTION, RETRAITIA, MONLOYER, MATAXE, MAPENSION) + home + infra | ~150 |
| 5 | 16/03 soir | MABANQUE + MONCHOMAGE (2 briques) | ~42 |
| 6 | 16-17/03 nuit | 4 chantiers transversaux + MONIMPOT V1/V2 | ~110 |
| 7 | 17/03 aprem | MONIMPOT V2 : 10 optimisations + 3 bugs + 15 tests E2E | ~20 |
