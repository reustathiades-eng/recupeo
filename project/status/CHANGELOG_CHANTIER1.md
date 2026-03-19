# CHANGELOG — Chantier 1 : Compte Client (Mon Espace RÉCUPÉO)

## 2026-03-16 — Session 6

### COMPTE CLIENT — Chantier 1 complet ✅

#### Phase 1 — Fondation Auth
- `jose` installé (JWT Edge-compatible)
- `lib/auth/types.ts` — Types auth, profil, session, démarche
- `lib/auth/magic-link.ts` — Envoi + vérification magic link (SHA256 hash, rate limit 5/h, email Brevo)
- `lib/auth/session.ts` — JWT httpOnly cookie via jose (HS256, 30j, sameSite strict, Edge-compatible)
- `lib/auth/recommendations.ts` — Cross-sell intelligent (7 briques × profil × historique)

#### Phase 2 — Collections enrichies
- `collections/Users.ts` — +magicLinkToken, magicLinkExpiry, lastLoginAt, profile (6 checkboxes), referralCode, referralCredits, notifications (4 toggles), consentAt, deletionRequestedAt
- `collections/Diagnostics.ts` — +userEmail (indexé), status étendu (5 valeurs), demarche group (5 champs tracking), generatedPdfUrl, generatedLettersUrl

#### Phase 3 — Routes API (11 routes)
- `api/auth/magic-link` — POST envoie le magic link (email Brevo, template RÉCUPÉO)
- `api/auth/verify` — GET vérifie token → crée session JWT → rattache diagnostics orphelins → redirige /mon-espace
- `api/auth/me` — GET retourne le user connecté (ou null)
- `api/auth/logout` — POST détruit la session
- `api/auth/dashboard` — GET stats agrégées + diagnostics récents + recommandations cross-sell
- `api/auth/diagnostics` — GET tous les diagnostics du user
- `api/auth/demarche` — POST mise à jour suivi démarche (merge nested group Payload)
- `api/auth/profile` — GET + PUT profil utilisateur (prénom, situation, notifications)
- `api/auth/referral` — GET code parrain (auto-génération RCP-XXXXXX)
- `api/auth/export` — GET export RGPD JSON complet (profil + diagnostics)
- `api/auth/delete` — POST demande suppression J+30 + email confirmation + logout

#### Phase 4 — Middleware
- `middleware.ts` — Protection /mon-espace/* (vérifie JWT Edge, redirige /connexion?redirect=...)

#### Phase 5 — UI Composants (6 composants)
- `components/auth/useAuth.ts` — Hook client-side (login, logout, refresh)
- `components/auth/LoginForm.tsx` — Formulaire magic link (état envoyé, erreurs, loading)
- `components/auth/UserMenu.tsx` — Menu dropdown navbar (avatar, 3 liens, déconnexion)
- `components/auth/AccountPrompt.tsx` — Prompt création compte post-achat (email pré-rempli, dismissable)
- `components/mon-espace/Sidebar.tsx` — Sidebar responsive (7 liens, séparateur, mobile FAB)

#### Phase 6 — Pages (9 pages)
- `/connexion` — Formulaire login magic link + gestion erreurs URL (Suspense)
- `/mon-espace` → redirect /tableau-de-bord
- `/mon-espace/tableau-de-bord` — 4 stats cards + diagnostics récents + recommandations cross-sell
- `/mon-espace/mes-diagnostics` — Liste filtrable par brique, badges couleur, liens rapport
- `/mon-espace/mes-documents` — Rapports PDF + courriers (icônes, dates, téléchargement)
- `/mon-espace/mes-demarches` — Timeline interactive (4 étapes), boutons action, montant récupéré
- `/mon-espace/parrainage` — Code parrain, stats, boutons partage (WhatsApp/Facebook/Email), explication
- `/mon-espace/profil` — Prénom + 6 checkboxes situation (UI toggle cards)
- `/mon-espace/parametres` — 4 toggles notifications + Export RGPD JSON + Suppression compte (confirmation)

#### Phase 7 — Intégration existant
- **Navbar** — UserMenu intégré, +briques mabanque/monchomage dans dropdown + briqueLinks
- **analytics.ts** — +18 events GA4 (auth, mon-espace, parrainage, RGPD)
- **4 briques existantes** patchées (userEmail dans payload.create) : macaution, mataxe, retraitia, monloyer
- **3 briques nouvelles** reécrites avec persistence Payload : mabanque, monchomage, mapension
- **Webhook Stripe** — +3 briques dans briqueNames, +status 'paid' + userEmail
- **payment.ts** — +offres MAPENSION (29€/49€), MABANQUE (19€/29€), MONCHOMAGE (69€/129€)
- **3 pages rapport** — AccountPrompt intégré (mataxe, macaution, retraitia)
- **sitemap.ts** — /connexion ajouté (13 URLs total)
- **/confidentialite** — sections 2, 3, 6, 8, 10 mises à jour (compte, auth cookie, RGPD in-app)

### Bilan chiffré
- **~45 fichiers** créés ou modifiés
- **11 routes API** auth
- **9 pages** /mon-espace + /connexion
- **6 composants** auth + mon-espace
- **7 briques** avec persistence Payload + userEmail
- **18 events** GA4 ajoutés
- **Build OK**, PM2 restart, HTTP 200
