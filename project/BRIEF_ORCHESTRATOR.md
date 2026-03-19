# BRIEF ORCHESTRATEUR MULTI-AGENTS — RÉCUPÉO

**Date :** 2026-03-19
**Statut :** Brainstorm terminé, construction en cours

---

## 1. Architecture

### Agents
| Agent | Modèle | Coût/MTok | Rôle |
|-------|--------|-----------|------|
| Orchestrateur | Haiku 4.5 | 1$/5$ | Lit TODO, choisit tâche, dispatche, vérifie checklist |
| Coder | Sonnet 4.6 | 3$/15$ | Écrit les fichiers TS/TSX |
| Contenu | Sonnet 4.6 | 3$/15$ | Rédige textes, emails, SEO, ton de marque |
| Tester | Sonnet 4.6 | 3$/15$ | Génère tests Jest + fixtures synthétiques |
| Reviewer | Sonnet 4.6 | 3$/15$ | Note /10, vérifie build/tests/conventions |
| Escalade | Opus 4.6 | 5$/25$ | Si reviewer refuse 2 fois |

### Quality gate — critères reviewer
1. tsc 0 erreurs
2. Tests Jest passent
3. Conventions respectées (fmt(), design tokens, heredoc, pas de toLocaleString)
4. Français correct + bon registre de ton
5. Pattern UX harmonisé (Hero → Upload → Form → PreDiag → Paywall → etc.)
6. Accessibilité (contraste, taille police, messages erreur humains)
7. Fallbacks erreur (upload échoué, OCR vide, API down)
8. Cross-sell câblé
9. Checklist transversale complète
10. Anti-harcèlement email hérité
11. Anonymisation PII avant appel Claude API

### Règles de décision
- Agent décide seul pour TOUT
- Agent demande UNIQUEMENT si : brief ambigu/contradictoire OU blocage après 2 tentatives
- Question → email reustathiades@tendance-parfums.com immédiatement
- Continue sur tâches non-bloquées en attendant réponse

### Budget
- Par tâche : max 3$
- Par brique : max 70$ (warning 56$, stop 70$)
- Budget test MAPAIE : 100$ (marge 30$ setup + fixtures)
- 2 tentatives max avant escalade Opus
- 2 tentatives Opus max avant question humain

### Ton de marque — 3 registres
- Combatif-rassurant : MAPAIE, MONDEPART, MONCHOMAGE
- Bienveillant-pédagogue : MESDROITS, MAPENSION, MONLOYER
- Sobre-expert : RETRAITIA, MATAXE, MONDPE, MONPRET

### Checklist transversale par brique
1. constants.ts → available: true
2. payment.ts → nouvelles offres Stripe
3. chat/knowledge/ → fiche knowledge base
4. sitemap.ts → nouvelle URL
5. payload.config.ts → nouvelle collection si nécessaire
6. CrossSellBriques.tsx → ajout cross-sell
7. Navbar → lien nouvelle brique
8. Landing page → section ou carte

### Ordre des briques
1. MAPAIE (test — en cours)
2. MESDROITS
3. MONDEPART
4. MONDPE
5. MONPRET

### Hors scope orchestrateur
- MONASSURANCE (supprimée)
- RETRAITIA P2 (EUSTAT s'en occupe)

## 2. Infrastructure
- Git : github.com/reustathiades-eng/recupeo (privé)
- Jest : configuré, jest.config.cjs, maxWorkers=1
- Build : ./scripts/build.sh (async) puis --status
- Deploy : git commit avant/après chaque tâche
- Orchestrateur : tourne en local sur PC EUSTAT
- Dashboard : localhost:3456
- Notifications : Brevo API → reustathiades@tendance-parfums.com

## 3. VPS
- IP : 51.254.138.240
- User : ubuntu
- App : /var/www/recupeo
- SSH key : standard
