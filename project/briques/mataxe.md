# 🏠 MATAXE — Taxe foncière

**Statut** : ✅ Live
**URL** : /mataxe
**Ticket** : 49€ (rapport + réclamation fiscale)
**Date de lancement** : 2026-03-16

## Concept
Audit de la valeur locative cadastrale d'un bien immobilier pour détecter les erreurs dans le calcul de la taxe foncière. 30-40% des avis contiennent une erreur (bases de 1970).

## Modèle
- **Pré-diagnostic GRATUIT** : nombre d'anomalies + économie estimée + baromètre de fiabilité
- **Rapport complet + réclamation fiscale** : 49€
- **Rétroactif** sur 4 ans → enjeu moyen 800–3 200€

## Innovation : Transparence
- Baromètre de fiabilité 4 niveaux (Bronze 40% / Argent 60% / Or 80% / Platine 95%)
- Confiance 0-100% par anomalie + "Confirmable avec..."
- Section "Ce qu'on sait vs ce qu'on ne sait pas"
- Assistant 6675-M gratuit (3 méthodes + lettres pré-rédigées)
- Champ "base nette" → déduit taux réel commune + VLC admin

## Architecture
- **Formulaire** : 24 champs, 4 sections, stepper
- **Calcul** : Surface pondérée (m² fictifs), catégorie, coefficient entretien, exonérations
- **IA** : Claude API (pré-diagnostic + rapport + réclamation)
- **PDF** : PDFKit (rapport + réclamation LRAR)
- **Anomalies JS** : 6 règles (coefficient entretien, équipements supprimés, surface, catégorie, dépendances, exonération)

## Fichiers (28)
- `lib/mataxe/` : 9 fichiers (types, constants, schema, calculations, anomaly-detection, prompts, reliability, demande-6675m, pdf-generator)
- `components/mataxe/` : 11 fichiers (Hero, Methode, Form, BaseNetteHelper, ReliabilityMeter, PreDiag, Transparency, 6675MAssistant, Paywall, Report, FAQ)
- `app/mataxe/` : 3 fichiers (page, layout, rapport/page)
- `app/api/mataxe/` : 5 routes (pre-diagnostic, full-report, generate-letters, generate-pdf, send-recap)

## Saisonnalité
Avis TF fin août → pic de trafic septembre-octobre
