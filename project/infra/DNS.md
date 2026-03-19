# 🌐 DNS — État des domaines

**Dernière mise à jour** : 2026-03-15 03:00 UTC

## recupeo.fr

| Record | Type | Valeur actuelle | Valeur cible | Statut |
|--------|------|-----------------|--------------|--------|
| @ | A | 213.186.33.5 | **51.254.138.240** | ❌ À MODIFIER |
| www | A/CNAME | ? | **51.254.138.240** | ❌ À MODIFIER |
| @ | AAAA | ? | 2001:41d0:305:2100::f18d | ⏳ Optionnel |

## recupeo.com

| Record | Type | Valeur actuelle | Valeur cible | Statut |
|--------|------|-----------------|--------------|--------|
| @ | A | ? | **51.254.138.240** | ❌ À MODIFIER |
| www | A/CNAME | ? | **51.254.138.240** | ❌ À MODIFIER |

## SSL

| Domaine | Certificat | Expiration | Statut |
|---------|-----------|------------|--------|
| recupeo.fr | Aucun | - | ❌ BLOQUÉ par DNS |
| www.recupeo.fr | Aucun | - | ❌ BLOQUÉ par DNS |
| recupeo.com | Aucun | - | ❌ BLOQUÉ par DNS |

## Procédure DNS (OVH Manager)

1. https://www.ovh.com/manager → Web Cloud → Noms de domaine
2. Sélectionner recupeo.fr → Zone DNS
3. Modifier record A : 213.186.33.5 → 51.254.138.240
4. Ajouter/modifier www : A → 51.254.138.240
5. Propagation : 5-30 minutes

## Procédure SSL (après DNS)

```bash
sudo certbot --nginx -d recupeo.fr -d www.recupeo.fr \
  --non-interactive --agree-tos --email contact@recupeo.fr --redirect

sudo certbot --nginx -d recupeo.com -d www.recupeo.com \
  --non-interactive --agree-tos --email contact@recupeo.fr --redirect
```
