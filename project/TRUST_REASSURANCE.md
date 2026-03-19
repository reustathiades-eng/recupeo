# 🛡️ RÉCUPÉO — Éléments de Réassurance (toutes briques)

**Dernière mise à jour** : 2026-03-15

---

## Pourquoi c'est critique

L'utilisateur nous confie des données sensibles (financières, juridiques, parfois médicales). La confiance est le facteur n°1 de conversion. Chaque page brique DOIT intégrer ces éléments.

---

## Composants disponibles (`src/components/shared/TrustBadges.tsx`)

### 1. `<TrustBadgesCompact />`
- **Où** : Sous chaque CTA, sous le formulaire
- **Contenu** : 🔒 Données chiffrées · 🤖 IA anonymisée · 🇫🇷 Serveur France · ❌ Aucun spam

### 2. `<TrustBadges />`
- **Où** : Entre le formulaire et le paywall
- **Contenu** : 5 badges (SSL, IA anonymisée, France, PayPlug, Remboursement 14j)

### 3. `<TrustBanner />`
- **Où** : Section dédiée, avant la FAQ
- **Contenu** : 4 blocs explicatifs (Anonymisation, France, Droit à jour, Zéro spam)

### 4. `<LegalDisclaimer brique="macaution" />`
- **Où** : OBLIGATOIRE en bas de chaque page brique
- **Contenu** : Avertissement juridique + mentions RGPD + contact suppression

---

## Règles d'intégration pour CHAQUE brique

```
Page brique type :
┌─ Hero ──────────────────────────┐
│  Accroche + CTA                 │
├─ Comment ça marche ─────────────┤
│  3 étapes + <TrustBadgesCompact>│
├─ Formulaire ────────────────────┤
│  ... champs ...                 │
│  <TrustBadgesCompact> sous CTA  │
├─ Résultat pré-diagnostic ───────┤
│  ... anomalies ...              │
├─ Paywall ───────────────────────┤
│  Offres + <TrustBadges>         │
│  "🔒 Paiement sécurisé..."     │
├─ <TrustBanner /> ───────────────┤
│  Section réassurance complète   │
├─ FAQ ───────────────────────────┤
│  Questions + réponses           │
├─ <LegalDisclaimer brique="xx" />┤
│  Disclaimer juridique + RGPD    │
└─────────────────────────────────┘
```

---

## Messages de réassurance par contexte

### Dans le formulaire
- Sous les champs email : "Pour recevoir votre pré-diagnostic. Aucun spam, promis."
- Sous le bouton submit : `<TrustBadgesCompact />`
- Feedback visuel : "🔒 Vos données sont confidentielles et ne sont jamais partagées."

### Pendant l'analyse IA
- Spinner avec message : "Analyse en cours... Vos données sont anonymisées."

### Sur le pré-diagnostic gratuit
- Badge : "🔒 Données personnelles non transmises à l'IA"

### Sur le paywall
- Sous les prix : "🔒 Paiement sécurisé par PayPlug · Satisfait ou remboursé sous 14 jours · Facture disponible"
- Badge "RECOMMANDÉ" sur l'offre premium

### Dans le rapport payant (futur)
- En-tête : "Ce rapport a été généré le JJ/MM/AAAA à HH:MM. Référence : #XXXXX"
- Disclaimer en bas de chaque page PDF

---

## Mentions obligatoires (RGPD / juridique)

### Sur chaque page brique
1. ⚖️ "Ce service est un outil d'aide. Il ne constitue pas un avis juridique."
2. 🔒 "Données anonymisées avant envoi à l'IA."
3. 🇫🇷 "Hébergement OVH, France. Conforme RGPD."
4. 📧 "Suppression sur demande : contact@recupeo.fr"

### Pages légales à créer (TODO)
- `/mentions-legales` — Éditeur, hébergeur, directeur publication
- `/cgu` — Conditions Générales d'Utilisation
- `/cgv` — Conditions Générales de Vente
- `/confidentialite` — Politique de confidentialité (RGPD)
- `/cookies` — Politique cookies

---

## Checklist réassurance pour chaque nouvelle brique

- [ ] `<TrustBadgesCompact />` sous la section "Comment ça marche"
- [ ] Texte réassurance sous le champ email du formulaire
- [ ] `<TrustBadgesCompact />` sous le bouton submit du formulaire
- [ ] Ligne "🔒 Paiement sécurisé..." sous le paywall
- [ ] `<TrustBanner />` avant la FAQ
- [ ] `<LegalDisclaimer brique="xxx" />` en toute fin de page
- [ ] Props `brique` dans LegalDisclaimer pour texte contextuel
