# 🏠 MONLOYER — Encadrement loyers (LEAD MAGNET)

**Statut** : 📋 À DÉVELOPPER (priorité #2)
**Dev estimé** : 3-5 jours
**Ticket** : Gratuit + 29€ pack lettre

## Marché
- 72 communes concernées
- 32% annonces dépassent plafonds (Fondation Logement sept 2025)
- Enjeu : 2.500-3.300€ trop-perçu récupérable (Paris/Lyon)
- Risque : expérimentation expire nov 2026 (pérennisation très probable)

## Parcours utilisateur
1. Landing /monloyer → Formulaire rapide
2. Résultat GRATUIT → "Votre loyer dépasse le plafond de X€/mois"
3. Upsell 29€ → Pack lettre mise en demeure
4. Cross-sell → MACAUTION, abonnement Premium

## Données nécessaires
- Base plafonds par commune/quartier (open data préfectures)
- Paris : OLAP (observatoiredesloyers.com)
- Lyon : données Toodego
- Lille, Montpellier, Bordeaux, etc.

## Fichiers à créer
- [ ] src/app/monloyer/page.tsx
- [ ] src/app/api/monloyer/check/route.ts
- [ ] src/lib/data/plafonds-loyers.ts
- [ ] src/lib/templates/lettre-encadrement.ts
