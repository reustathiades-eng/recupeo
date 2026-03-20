// ============================================================
// RÉCUPÉO — Knowledge Base par brique (injecté dans system prompt)
// ============================================================

import { mapaie } from './mapaie'

export const KNOWLEDGE: Record<string, string> = {
  macaution: `MACAUTION — Dépôt de garantie
- Article 22 loi 6 juillet 1989 : restitution sous 1 mois (état conforme) ou 2 mois (dégradations)
- Retenues possibles : réparations locatives (art. 7d), charges impayées, loyers impayés
- Retenues INTERDITES : vétusté (usure normale), travaux embellissement, défauts pré-existants
- Grille de vétusté : amortissement linéaire (ex: peinture 7-9 ans, moquette 7 ans, parquet 15 ans)
- Si non restitué dans le délai : pénalité de 10% du loyer par mois de retard
- Tickets : 29€ (rapport) / 49€ (rapport + 3 courriers : mise en demeure, conciliateur, tribunal)
- Notre outil compare l'état des lieux d'entrée et de sortie via OCR + IA
- URL : /macaution`,

  monloyer: `MONLOYER — Encadrement des loyers
- Loi ELAN (2018) + dispositif expérimental dans 28 villes/agglomérations
- Villes : Paris, Lille, Lyon, Bordeaux, Montpellier, Pays Basque, Plaine Commune, Est Ensemble, etc.
- Le loyer ne peut dépasser le loyer de référence majoré (préfecture) pour le quartier/type/époque
- Complément de loyer possible UNIQUEMENT si caractéristiques exceptionnelles (terrasse, vue, etc.)
- Si dépassement : le locataire peut demander la mise en conformité + remboursement du trop-perçu
- Délai : 3 ans pour agir (action en diminution de loyer)
- Pré-diagnostic GRATUIT + courriers 29€
- URL : /monloyer`,

  retraitia: `RETRAITIA — Audit pension de retraite
- 10-14% des pensions contiennent une erreur (Cour des comptes)
- Erreurs fréquentes : trimestres manquants, salaires sous-évalués, majorations oubliées, bonifications absentes
- Majorations : enfants (+10% pour 3 enfants), surcote (après 62/64 ans + taux plein)
- Régimes : CNAV (base), AGIRC-ARRCO (complémentaire), IRCANTEC (public contractuel)
- On analyse le relevé de carrière (RIS) via OCR + IA
- Tickets : 79€ (solo) / 149€ (couple) / 199€ (couple + suivi 3 mois)
- URL : /retraitia`,

  mataxe: `MATAXE — Taxe foncière
- 15-20% des avis contiennent une anomalie (estimation DGFiP)
- Calcul : Valeur locative × Taux communal × Coefficients
- Anomalies fréquentes : surface cadastrale erronée, catégorie cadastrale trop élevée, exonérations oubliées
- Exonérations : construction neuve (2 ans), personnes âgées/handicapées, zones franches
- Formulaire 6675-M : demande de rectification auprès du centre des impôts fonciers
- On peut scanner le formulaire 6675-M via OCR + IA pour pré-remplir
- Ticket : 49€ (rapport + réclamation fiscale prête à envoyer)
- URL : /mataxe`,

  mapension: `MAPENSION — Pension alimentaire
- Article 208 Code civil : obligation alimentaire
- Revalorisation annuelle obligatoire selon l'indice INSEE des prix à la consommation
- Si le débiteur ne revalorise pas : arriérés récupérables sur 5 ans (art. 2224 CC)
- ARIPA (CAF) : peut intervenir pour recouvrer les pensions impayées
- Calcul : pension initiale × (nouvel indice / ancien indice) — mois par mois
- Tickets : 29€ (rapport) / 49€ (rapport + courriers ex-conjoint, CAF, avocat)
- URL : /mapension`,

  mabanque: `MABANQUE — Frais bancaires
- Plafonds légaux : commission d'intervention 8€/op et 80€/mois, rejet chèque 30€/<50€ ou 50€/>50€, rejet prélèvement 20€
- Client fragile (FICP/surendettement) : 4€/op, 20€/mois, 200€/an, 25€/rejet
- Article L312-1-3 CMF : plafonnement des commissions d'intervention
- Offre spécifique client fragile : max 3€/mois (obligatoire depuis 2014)
- Contestation : courrier banque → médiateur bancaire → ACPR
- Tickets : 19€ (rapport) / 29€ (rapport + courrier banque + médiateur + SignalConso)
- URL : /mabanque`,

  monchomage: `MONCHOMAGE — Allocations chômage
- ARE = Allocation de Retour à l'Emploi (France Travail, ex-Pôle Emploi)
- SJR = Salaire Journalier de Référence = salaires bruts 24 mois / jours travaillés
- AJ = max(40.4% SJR + 12.95€, 57% SJR) — minimum 31.97€/jour (2024)
- Durée : 1 jour indemnisé pour 1 jour travaillé, max 730j (<53 ans) ou 913j (53-54 ans) ou 1095j (55+)
- Dégressivité : -30% après 6 mois si SJR > 159.68€/j et <57 ans (sauf exceptions)
- Erreurs fréquentes : primes omises, arrêts maladie non neutralisés, multi-contrats mal agrégés
- Tickets : 69€ (rapport) / 129€ (rapport + contestation + médiateur)
- URL : /monchomage`,

  mapaie,

  monimpot: `MONIMPOT — Déclaration de revenus (V2 avec upload)
- Upload avis d'imposition (PDF/photo) → extraction automatique par IA
- Formulaire réduit : seulement 4-7 questions sur les cases vides détectées
- Multi-avis : upload jusqu'à 3 années (N, N-1, N-2) pour comparaison et détection des cases perdues
- 69% des foyers oublient au moins une déduction ou réduction d'impôt
- La déclaration préremplie ne couvre PAS les déductions/réductions volontaires
- Correction possible : en ligne (été-automne) ou réclamation contentieuse (jusqu'au 31/12 N+2)
- On peut récupérer le trop-payé des 3 dernières années
- Optimisations fréquentes : frais réels (case 1AK), case T (parent isolé), case L (ancien parent isolé), dons (7UF), emploi domicile (7DB), garde enfant (7GA), pension alimentaire (6EL), EHPAD (7CD), PER (6NS)
- Barème progressif 2026 : 0% jusqu'à 11 497, 11% jusqu'à 29 315, 30% jusqu'à 83 823, 41% jusqu'à 180 294, 45% au-delà
- Vérification gratuite : score /100, fourchette d'économie, 1 optimisation dévoilée sur N
- Audit payant : toutes les optimisations, montants exacts, cases fiscales, PDF, réclamation
- Tickets : 19€ (express — optimisations + cases + PDF) / 39€ (standard — + réclamation + guide) / 69€ (premium — + multi-années + accompagnement 30j)
- URL : /monimpot`,
}
