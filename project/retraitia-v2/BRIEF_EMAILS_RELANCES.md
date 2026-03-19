# BRIEF_EMAILS_RELANCES — Séquences Brevo email + SMS

**Statut :** ✅ Validé
**Date :** 2026-03-18
**Dépendances :** DIAGNOSTIC_GRATUIT (#10), ESPACE_CLIENT_SUIVI (#13), tous les briefs parcours

---

## 1. Vue d'ensemble

Ce brief est le **catalogue centralisé de toutes les communications automatiques** envoyées au client par Brevo (email + SMS). C'est le référentiel unique — tous les autres briefs y renvoient.

**Technique :** envoi par API Brevo programmatique (comme MONIMPOT). Le contenu est généré côté serveur avec les variables du dossier. Pas de templates drag & drop Brevo.

**Ton de base :** professionnel, chaleureux, direct. Adaptation pour la réversion : plus sobre, pas d'urgence agressive.

**Règles anti-harcèlement :**
- Max 2 emails par semaine pour un même client
- Max 1 SMS par semaine
- Après J+60 sans activité → 1 email final puis stop
- Jamais d'email le dimanche
- Chaque email contient un lien de désabonnement (RGPD)
- Le client peut choisir "email uniquement" ou "email + SMS" dans ses paramètres

---

## 2. Catalogue des séquences

### Vue d'ensemble

| # | Séquence | Déclencheur | Nb messages | Canal | Arrêt |
|---|----------|-------------|-------------|-------|-------|
| S1 | Post-flash non-payant | Flash complété, pas de paiement 9€ | 4 emails | Email | Paiement 9€ ou J+14 |
| S2 | Bienvenue post-9€ | Paiement 9€ confirmé | 1 email | Email | — |
| S3 | Onboarding FranceConnect | Accès non validé après 48h | 4 emails + 1 SMS | Email + SMS | Accès validé ou J+30 |
| S4 | Relance collecte docs | Docs obligatoires non uploadés | 5 emails + 2 SMS | Email + SMS | Tous docs uploadés ou J+60 |
| S5 | Document extrait | Upload + extraction réussie | 1 email | Email | — |
| S6 | Diagnostic prêt | Diagnostic serré généré | 1 email + 1 SMS | Email + SMS | — |
| S7 | Post-diagnostic non-payant | Diagnostic vu, pas de paiement 49€ | 3 emails | Email | Paiement 49€ ou J+14 |
| S8 | Bienvenue post-49€ | Paiement 49€ confirmé | 1 email | Email | — |
| S9 | Suivi démarches | Message envoyé par le client | 4 emails + 2 SMS | Email + SMS | Anomalie résolue ou escalade |
| S10 | Anomalie corrigée | Client confirme correction | 1 email | Email | — |
| S11 | Escalade proposée | Délai dépassé sans réponse | 1 email | Email | Client agit ou J+14 |
| S12 | Cross-sell | Après résolution d'anomalies | 1 email | Email | — |
| S13 | Proche aidant | Invitation envoyée | 1 email | Email (au proche) | — |
| S14 | Rappel annuel | 1 an après corrections (pré-retraités) | 1 email | Email | — |
| S15 | Upsell départ | Approche date de départ prévue | 1 email | Email | — |

---

## 3. S1 — Post-flash non-payant

**Déclencheur :** le visiteur a complété le flash (4 questions + email) mais n'a pas payé les 9€.

**Objectif :** convertir le lead en payant 9€.

### S1-E1 : J+1

**Objet :** "Votre pension contient peut-être une erreur — votre résultat est en attente"

```
Bonjour {prenom},

Hier, vous avez testé votre pension sur RÉCUPÉO.

Votre résultat : risque {niveauRisque}

{facteurs_résumé}

Pour 9€, nous vérifions votre pension en détail à partir
de vos documents officiels. Ces 9€ sont déduits si vous
poursuivez l'analyse.

→ Vérifier ma pension pour 9€
   {lien_paiement}

L'équipe RÉCUPÉO
```

### S1-E2 : J+3

**Objet :** "1 pension sur 7 est mal calculée — la vôtre aussi ?"

```
Bonjour {prenom},

Saviez-vous que selon la Cour des Comptes, 1 pension
de retraite sur 7 contient une erreur ? Dans 75% des cas,
l'erreur est en défaveur du retraité.

Votre profil ({anneeNaissance}, {nbEnfants} enfants,
carrière {typeCarriere}) présente un risque {niveauRisque}.

Ne laissez pas passer une erreur qui pourrait vous
coûter des milliers d'euros.

→ Vérifier ma pension pour 9€
   {lien_paiement}

L'équipe RÉCUPÉO
```

### S1-E3 : J+7

**Objet :** "Chaque mois sans vérification, c'est de l'argent perdu"

```
Bonjour {prenom},

Si votre pension contient une erreur, chaque mois qui
passe est un mois de manque à gagner.

Pour les profils comme le vôtre, le manque à gagner
moyen est de plusieurs dizaines d'euros par mois.
Sur une année, ça représente des centaines d'euros.

Pour 9€, on prend votre dossier en main.

→ Vérifier ma pension
   {lien_paiement}

L'équipe RÉCUPÉO
```

### S1-E4 : J+14

**Objet :** "Un proche peut vérifier pour vous"

```
Bonjour {prenom},

Vous n'avez pas eu le temps de vérifier votre pension ?

Un proche (enfant, petit-enfant, ami) peut le faire
pour vous. Transmettez-lui ce lien :

→ {lien_test_flash}

Il pourra récupérer les documents en ligne et lancer
la vérification en 30 minutes.

L'équipe RÉCUPÉO
```

**Fin de séquence.** Pas de harcèlement après J+14.

---

## 4. S2 — Bienvenue post-9€

**Déclencheur :** paiement 9€ confirmé (webhook Stripe).

### S2-E1 : immédiat

**Objet :** "Votre espace RETRAITIA est prêt"

```
Bonjour {prenom},

Merci pour votre confiance. Votre espace RETRAITIA
est ouvert et prêt.

Voici ce qui vous attend :

1. Vérifier votre accès FranceConnect (2 min)
2. Récupérer vos documents en ligne (20-30 min)
3. Répondre à quelques questions complémentaires (5 min)
4. Recevoir votre diagnostic automatique

Vous pouvez vous arrêter et reprendre à tout moment.
Votre progression est sauvegardée.

→ Accéder à mon espace
   {lien_espace_client}

Un proche peut vous aider ? Transmettez-lui ce lien
depuis votre espace client.

L'équipe RÉCUPÉO

P.S. Rappel : ces 9€ sont déduits si vous poursuivez
avec le Pack Action.
```

---

## 5. S3 — Onboarding FranceConnect

**Déclencheur :** le client a payé 9€ mais n'a pas validé l'étape "Accès FranceConnect" après 48h.

### S3-E1 : J+2

**Objet :** "Besoin d'aide pour vous connecter ?"

```
Bonjour {prenom},

Votre espace RETRAITIA est en attente de votre
première connexion FranceConnect.

FranceConnect vous permet d'accéder à tous vos
documents de retraite avec un seul compte (Ameli,
impots.gouv ou La Poste).

→ Guide pas-à-pas pour se connecter
   {lien_guide_fc}

Si vous avez un compte Ameli, impots.gouv ou
La Poste, vous avez déjà FranceConnect.

L'équipe RÉCUPÉO
```

### S3-E2 : J+5 (email + SMS)

**Email — Objet :** "Mot de passe oublié ? Voici comment le retrouver"

```
Bonjour {prenom},

Beaucoup de personnes ont déjà un compte Ameli ou
impots.gouv sans le savoir (créé par un proche ou
un conseiller).

Si vous avez oublié votre mot de passe :
→ Ameli : {lien_guide_mdp_ameli}
→ Impots.gouv : {lien_guide_mdp_impots}

L'équipe RÉCUPÉO
```

**SMS :** "RÉCUPÉO : Besoin d'aide pour FranceConnect ? Voici le guide : {lien_court}"

### S3-E3 : J+10

**Objet :** "Un proche peut vous aider en 30 minutes"

```
Bonjour {prenom},

Si vous avez du mal à vous connecter, un proche
peut le faire pour vous.

→ Inviter un proche à m'aider
   {lien_espace_client}

Votre proche recevra les guides et pourra
récupérer vos documents à votre place.

L'équipe RÉCUPÉO
```

### S3-E4 : J+20

**Objet :** "Un conseiller France Services peut vous aider gratuitement"

```
Bonjour {prenom},

Si vous n'arrivez pas à vous connecter en ligne,
un conseiller France Services peut vous aider
gratuitement et sans rendez-vous.

L'espace le plus proche de chez vous :
{adresse_france_services}
{horaires_france_services}

Apportez votre carte Vitale et une pièce d'identité.

L'équipe RÉCUPÉO
```

**Fin de séquence à J+30** si toujours pas de progression.

---

## 6. S4 — Relance collecte documents

**Déclencheur :** le client a validé FranceConnect mais n'a pas uploadé tous les documents obligatoires.

**Logique :** les relances sont ciblées par document manquant. On ne relance pas sur un document déjà uploadé.

### S4-E1 : J+1 après validation FranceConnect

**Objet :** "Votre premier document à récupérer : le RIS"

```
Bonjour {prenom},

Première étape : récupérer votre Relevé de Carrière (RIS)
sur info-retraite.fr. C'est le document le plus important.

Comptez 5 minutes :
→ Guide pas-à-pas
   {lien_guide_ris}

Connectez-vous sur info-retraite.fr avec FranceConnect,
téléchargez votre relevé en PDF, et uploadez-le sur
votre espace RÉCUPÉO.

{lien_espace_client}

L'équipe RÉCUPÉO
```

### S4-E2 : J+4

**Objet :** "Avez-vous pu récupérer votre RIS ?"

```
Bonjour {prenom},

{si_ris_uploadé}
  Bravo, votre RIS est bien reçu ! Il vous reste
  {nb_docs_manquants} document(s) à récupérer :
  {liste_docs_manquants_avec_guides}
{sinon}
  Votre relevé de carrière (RIS) est en attente.
  C'est le document essentiel pour votre diagnostic.
  → Guide : {lien_guide_ris}
{fin_si}

{lien_espace_client}

L'équipe RÉCUPÉO
```

### S4-E3 : J+7 (email + SMS)

**Email — Objet :** "Il vous reste {nb} document(s) — votre dossier avance bien"

```
Bonjour {prenom},

État de votre dossier :

{pour_chaque_doc}
  {si_uploadé} ✅ {nom_doc}
  {si_manquant} 🔴 {nom_doc} → {lien_guide}
{fin_pour}

Précision actuelle de l'audit : {precision}%
Plus vous uploadez, plus l'analyse est précise.

{lien_espace_client}
```

**SMS :** "RÉCUPÉO : Il vous reste {nb} document(s) à uploader. Votre dossier : {lien_court}"

### S4-E4 : J+14

**Objet :** "Un proche peut récupérer vos documents pour vous"

```
Bonjour {prenom},

Vous n'avez pas eu le temps de récupérer tous vos
documents ? Un proche peut le faire pour vous avec
vos identifiants FranceConnect.

→ Inviter un proche
   {lien_espace_client}

L'équipe RÉCUPÉO
```

### S4-E5 : J+30 (email + SMS)

**Email — Objet :** "Votre dossier RETRAITIA est en attente"

```
Bonjour {prenom},

Votre espace RETRAITIA est toujours ouvert et en
attente de vos documents.

Documents manquants :
{liste_docs_manquants}

Votre dossier restera accessible. Vous pouvez
reprendre à tout moment.

{lien_espace_client}

L'équipe RÉCUPÉO
```

**SMS :** "RÉCUPÉO : Votre dossier retraite est en attente. Reprenez quand vous voulez : {lien_court}"

**J+60 :** dernier email sobre ("Votre dossier est toujours ouvert"), puis arrêt.

---

## 7. S5 — Document extrait

**Déclencheur :** un document vient d'être uploadé et extrait avec succès.

### S5-E1 : immédiat

**Objet :** "✅ {nom_doc} analysé — {résumé}"

```
Bonjour {prenom},

Votre {nom_doc} a été analysé avec succès.

Résumé :
{résumé_extraction}

Précision de l'audit : {precision}%
{si_docs_manquants}
  Il vous reste {nb} document(s) à récupérer pour
  améliorer la précision.
{sinon}
  Tous vos documents sont là ! Votre diagnostic
  sera bientôt prêt.
{fin_si}

{lien_espace_client}

L'équipe RÉCUPÉO
```

---

## 8. S6 — Diagnostic prêt

**Déclencheur :** le diagnostic serré est généré (documents minimum + formulaire complétés).

### S6-E1 : immédiat (email + SMS)

**Email — Objet :** "Votre diagnostic RETRAITIA : {nbAnomalies} anomalies détectées"

```
Bonjour {prenom},

Votre diagnostic RETRAITIA est prêt.

🔴 {nbAnomalies} anomalies détectées sur {nbNiveaux} niveaux
📊 Score de fiabilité : {scoreGlobal}
💰 Impact estimé : entre {impactMin} et {impactMax}€/mois

Connectez-vous pour voir le détail :
→ {lien_espace_client}

Pour {prix_pack_action}€, débloquez votre rapport complet
avec les montants exacts et les messages prêts à envoyer.

L'équipe RÉCUPÉO
```

**SMS :** "RÉCUPÉO : Votre diagnostic est prêt — {nbAnomalies} anomalies détectées. Voir : {lien_court}"

---

## 9. S7 — Post-diagnostic non-payant

**Déclencheur :** le client a vu le diagnostic serré mais n'a pas payé les 49€ dans les 48h.

### S7-E1 : J+2 après diagnostic

**Objet :** "{nbAnomalies} anomalies sur votre pension — voici comment agir"

```
Bonjour {prenom},

Votre diagnostic a révélé {nbAnomalies} anomalies avec un
impact estimé entre {impactMin} et {impactMax}€/mois.

Voici ce que le rapport complet vous apporte :
✓ Le montant exact de chaque anomalie
✓ Les messages prêts à copier-coller
✓ Le guide étape par étape pour chaque organisme
✓ Le suivi de vos démarches

→ Débloquer le rapport — {prix_pack_action}€
   {lien_paiement_49}

Rappel : {montant_déduit}€ déjà déduits de votre Pack Dossier.

L'équipe RÉCUPÉO
```

### S7-E2 : J+5

**Objet :** "Depuis votre départ en retraite, vous avez potentiellement perdu {impactCumule}€"

```
Bonjour {prenom},

Chaque mois sans correction, c'est entre {impactMin}
et {impactMax}€ de manque à gagner.

Depuis votre départ en {anneeDepart}, cela représente
entre {impactCumuléMin} et {impactCumuléMax}€.

Pour {prix_net}€, on vous dit exactement quoi faire
et on vous prépare tous les messages.

→ Agir maintenant
   {lien_paiement_49}

L'équipe RÉCUPÉO
```

### S7-E3 : J+10

**Objet :** "Dernière chance : votre diagnostic est en attente"

```
Bonjour {prenom},

Votre diagnostic RETRAITIA ({nbAnomalies} anomalies
détectées) est toujours disponible dans votre espace.

Nous ne vous enverrons plus de rappel à ce sujet.
Votre espace reste accessible à tout moment.

→ Voir mon diagnostic
   {lien_espace_client}

L'équipe RÉCUPÉO
```

**Fin de séquence.** Pas de relance après J+10 post-diagnostic.

---

## 10. S8 — Bienvenue post-49€

**Déclencheur :** paiement 49€ (ou 79€ couple, ou 39€ pré-retraité) confirmé.

### S8-E1 : immédiat

**Objet :** "Votre rapport est prêt — voici comment agir"

```
Bonjour {prenom},

Votre rapport RETRAITIA complet est disponible.

📄 Téléchargez votre rapport PDF :
→ {lien_rapport_pdf}

📋 {nbAnomalies} anomalies à traiter :
{pour_chaque_anomalie_top3}
  • {label} — +{impact}€/mois → {organisme}
{fin_pour}

Toutes vos démarches sont détaillées dans votre
espace client avec les messages prêts à copier :
→ {lien_demarches}

Nous vous recommandons de commencer par l'anomalie
au plus gros impact.

L'équipe RÉCUPÉO
```

---

## 11. S9 — Suivi des démarches

**Déclencheur :** le client a coché "J'ai envoyé le message" pour une anomalie.

### S9-E1 : immédiat

**Objet :** "Message envoyé ✅ — voici la suite"

```
Bonjour {prenom},

Vous avez envoyé votre message à {organisme}
pour l'anomalie : {anomalie_label}.

Prochaine étape : attendre la réponse.
Délai habituel : {délai_estimé}.
Nous vous préviendrons quand il sera temps
de relancer si nécessaire.

Votre espace : {lien_demarches}

L'équipe RÉCUPÉO
```

### S9-E2 : J+30 après envoi

**Objet :** "Avez-vous des nouvelles de {organisme} ?"

```
Bonjour {prenom},

Vous avez envoyé un message à {organisme} le
{date_envoi} concernant : {anomalie_label}.

Avez-vous reçu une réponse ?

→ Oui, j'ai une réponse
   {lien_demarche_detail}

→ Non, pas encore
   Le délai légal est de 2 mois. Nous vous
   préviendrons quand il sera temps de relancer.

L'équipe RÉCUPÉO
```

### S9-E3 : J+55 (email + SMS)

**Email — Objet :** "Le délai de réponse de {organisme} expire dans 5 jours"

```
Bonjour {prenom},

Le délai de 2 mois pour la réponse de {organisme}
expire le {date_échéance}.

Si vous n'avez pas reçu de réponse d'ici là,
une relance sera recommandée.

Connectez-vous pour mettre à jour votre dossier :
→ {lien_demarche_detail}

L'équipe RÉCUPÉO
```

**SMS :** "RÉCUPÉO : Délai {organisme} expire dans 5 jours. Avez-vous une réponse ? {lien_court}"

### S9-E4 : J+60

**Objet :** "Pas de réponse de {organisme} — voici comment relancer"

```
Bonjour {prenom},

Le délai de 2 mois est écoulé et {organisme} n'a
pas répondu à votre demande concernant :
{anomalie_label}.

Voici vos options :
1. Envoyer un message de relance (gratuit)
   → Message prêt dans votre espace

2. Envoyer un courrier recommandé (14,90€)
   → Plus formel, avec accusé de réception

Connectez-vous pour choisir :
→ {lien_demarche_detail}

L'équipe RÉCUPÉO
```

---

## 12. S10 — Anomalie corrigée

**Déclencheur :** le client confirme qu'une anomalie a été corrigée.

### S10-E1 : immédiat

**Objet :** "Bonne nouvelle : +{gain}€/mois récupérés"

```
Bonjour {prenom},

L'anomalie "{anomalie_label}" a été corrigée par
{organisme}.

Gain confirmé : +{gain}€/mois
Soit +{gainAnnuel}€/an

{si_anomalies_restantes}
  Il vous reste {nb} anomalie(s) à traiter.
  Gain potentiel restant : ~{gainRestant}€/mois
  → {lien_demarches}
{sinon}
  Toutes vos anomalies sont résolues !
  Gain total confirmé : +{gainTotal}€/mois
{fin_si}

L'équipe RÉCUPÉO
```

---

## 13. S11 — Escalade proposée

**Déclencheur :** refus explicite d'un organisme OU silence après relance.

### S11-E1 : immédiat

**Objet :** "{organisme} a refusé votre demande — voici la suite"

```
Bonjour {prenom},

{organisme} a {refusé votre demande / n'a pas répondu}
concernant : {anomalie_label}.

Ne vous découragez pas. Voici l'étape suivante :

{si_lrar_non_envoyée}
  → Envoyer un courrier recommandé (14,90€)
    Le courrier est prêt dans votre espace.
{si_lrar_envoyée}
  → Saisir la Commission de Recours Amiable (14,90€)
    La lettre de saisine est prête dans votre espace.
{si_cra_rejetée}
  → Saisir le médiateur (14,90€)
    La lettre de saisine est prête dans votre espace.
{fin_si}

→ {lien_demarche_detail}

L'équipe RÉCUPÉO
```

---

## 14. S12 — Cross-sell

**Déclencheur :** au moins 1 anomalie résolue + opportunités N4/N5 détectées.

### S12-E1 : J+7 après première anomalie corrigée

**Objet :** "Votre pension est corrigée — et vos impôts, votre taxe foncière ?"

```
Bonjour {prenom},

Félicitations pour la correction de votre pension !

Notre audit a aussi détecté des opportunités sur
d'autres domaines :

{si_exoneration_tf}
  🏠 Taxe foncière : exonération possible (~{impact}€/an)
  → Vérifier avec MATAXE : {lien_mataxe}
{fin_si}

{si_credit_impot}
  💶 Impôts : crédit d'impôt non optimisé (~{impact}€/an)
  → Vérifier avec MONIMPOT : {lien_monimpot}
{fin_si}

{si_aspa_css}
  🏥 Aides sociales : éligibilité possible
  → En savoir plus : {lien_info}
{fin_si}

L'équipe RÉCUPÉO
```

---

## 15. S13 — Proche aidant

**Déclencheur :** le client clique "Un proche peut m'aider" et saisit l'email du proche.

### S13-E1 : immédiat (envoyé AU PROCHE)

**Objet :** "{prenom_client} a besoin de votre aide pour vérifier sa pension"

```
Bonjour {prenom_proche},

{prenom_client} utilise le service RÉCUPÉO pour
vérifier sa pension de retraite et a besoin de
votre aide.

Voici ce que vous pouvez faire :

1. Accéder au dossier de {prenom_client}
   → {lien_magic_link}

2. Récupérer les documents en ligne
   → Vous aurez besoin des identifiants
     FranceConnect de {prenom_client}
   → Les guides pas-à-pas vous expliquent tout

3. Uploader les documents dans l'espace RÉCUPÉO

Comptez environ 30 minutes pour les 3 documents
essentiels.

→ Accéder au dossier
   {lien_magic_link}

L'équipe RÉCUPÉO
```

---

## 16. S14 — Rappel annuel (pré-retraités)

**Déclencheur :** 1 an après les corrections de carrière d'un pré-retraité.

### S14-E1 : J+365

**Objet :** "Votre RIS a-t-il été mis à jour ?"

```
Bonjour {prenom},

Il y a un an, nous avions identifié et corrigé
{nb} anomalies sur votre carrière.

Il est temps de vérifier que les corrections ont
bien été prises en compte sur votre nouveau RIS.

→ Téléchargez votre RIS sur info-retraite.fr
→ Uploadez-le dans votre espace RÉCUPÉO
→ Nous vérifierons automatiquement

{lien_espace_client}

L'équipe RÉCUPÉO
```

---

## 17. S15 — Upsell départ (pré-retraités)

**Déclencheur :** la date de départ prévue du pré-retraité approche (6 mois avant).

### S15-E1 : 6 mois avant le départ prévu

**Objet :** "Votre départ en retraite approche — vérifiez votre première pension"

```
Bonjour {prenom},

Votre départ en retraite est prévu pour {dateDepart}.

Nous avions corrigé {nb} anomalies sur votre carrière.
Il est maintenant temps de vérifier que votre première
pension sera correcte.

Pour {prix}€, nous vérifions votre notification de pension
dès que vous la recevez :
✓ Comparaison avec notre calcul
✓ Vérification des majorations
✓ Contrôle du taux de CSG
✓ Messages si des erreurs subsistent

→ Préparer la vérification de ma pension
   {lien_upsell}

L'équipe RÉCUPÉO
```

---

## 18. Variante réversion — Ton adapté

Pour toutes les séquences du parcours réversion, le ton est adapté :

**Ce qu'on NE dit PAS :**
- "💰 Vous perdez de l'argent !"
- "🚨 Urgence !"
- "Chaque mois qui passe..."
- Tout langage d'urgence agressive

**Ce qu'on dit :**
- "Faire valoir vos droits"
- "Nous sommes là pour vous accompagner"
- "Ces démarches sont votre droit"
- "Simplifier les formalités administratives"

**Exemples d'adaptation :**

Email diagnostic (réversion) :
```
Objet : "Vos droits à réversion — résultat de votre diagnostic"

Bonjour {prenom},

Suite à l'analyse de votre situation, nous avons
identifié {nbRegimes} régime(s) de votre conjoint
auprès desquels vous pouvez demander une pension
de réversion.

Montant estimé : entre {min} et {max}€/mois

Nous vous accompagnons dans chaque démarche.

→ Voir le détail
   {lien_espace_client}

L'équipe RÉCUPÉO
```

---

## 19. Données techniques

### Architecture Brevo

```typescript
// src/lib/retraitia/emails/

interface BrevoEmail {
  templateId: string      // identifiant interne (pas un template Brevo)
  sequence: string        // S1, S2, S3...
  étape: number          // E1, E2, E3...
  
  // Destinataire
  to: { email: string, name: string }
  
  // Contenu (généré côté serveur)
  subject: string
  htmlContent: string
  textContent: string
  
  // Timing
  scheduledAt?: Date     // envoi différé
  
  // Conditions
  conditionArrêt: string  // "paiement_9" | "acces_valide" | etc.
}

interface BrevoSMS {
  to: string             // numéro de téléphone
  content: string        // max 160 caractères
  scheduledAt?: Date
}
```

### Fichiers à créer

```
src/lib/retraitia/emails/
  ├── sequences/
  │   ├── s01-post-flash.ts
  │   ├── s02-bienvenue-9.ts
  │   ├── s03-onboarding-fc.ts
  │   ├── s04-relance-docs.ts
  │   ├── s05-document-extrait.ts
  │   ├── s06-diagnostic-pret.ts
  │   ├── s07-post-diagnostic.ts
  │   ├── s08-bienvenue-49.ts
  │   ├── s09-suivi-demarches.ts
  │   ├── s10-anomalie-corrigee.ts
  │   ├── s11-escalade.ts
  │   ├── s12-cross-sell.ts
  │   ├── s13-proche-aidant.ts
  │   ├── s14-rappel-annuel.ts
  │   └── s15-upsell-depart.ts
  ├── scheduler.ts         // Programmation des envois
  ├── conditions.ts        // Vérification conditions d'arrêt
  ├── renderer.ts          // Injection des variables + rendu HTML
  ├── sms.ts               // Envoi SMS via Brevo
  └── types.ts
```

### Routes API

```
POST /api/retraitia/emails/trigger
  Input: { dossierId, sequence, étape }
  → Vérifie les conditions (arrêt, fréquence max, désabonnement)
  → Génère le contenu avec les variables du dossier
  → Envoie via Brevo API
  → Log l'envoi

GET /api/retraitia/emails/history/:dossierId
  → Historique de tous les emails envoyés pour ce dossier

POST /api/retraitia/emails/unsubscribe
  → Désabonnement RGPD
```

### Cron job (scheduler)

```
// Toutes les heures, vérifier les emails programmés :
// - S3 : clients sans accès FC après 48h → E1
// - S4 : clients sans docs après J+1, J+4, J+7, J+14, J+30
// - S9 : compteurs de délai → J+30, J+55, J+60
// - S14 : rappels annuels pré-retraités
// - S15 : upsell 6 mois avant départ

// Le scheduler vérifie :
// 1. Le timing est atteint
// 2. La condition d'arrêt n'est pas remplie
// 3. Le max emails/semaine n'est pas dépassé
// 4. Le client n'est pas désabonné
// 5. Ce n'est pas un dimanche
```

---

## 20. Métriques

| Métrique | Cible |
|----------|-------|
| Taux d'ouverture emails (global) | > 40% |
| Taux de clic (global) | > 15% |
| Taux conversion S1 (flash → 9€) | > 15% (avec les 4 emails) |
| Taux conversion S7 (diagnostic → 49€) | > 40% (avec les 3 emails) |
| Taux de désabonnement | < 2% |
| Taux de lecture SMS | > 80% |
| Email le plus performant (taux de clic) | S6-E1 (diagnostic prêt) estimé |
| Nb moyen d'emails envoyés par client | ~10 sur le parcours complet |

