// ============================================================
// MAPAIE — Détection d'anomalies (8 types)
// ============================================================
import {
  verifierMinimumConventionnel, calculerPrimeAnciennete,
  calculerTauxHoraire, verifierSmicHoraire,
} from './calculations'
import { CONVENTION_HEURES_SUP, COTISATIONS, MAJORATION_HS_MINIMUM_CC } from './constants'
import { percentage, type AnomalyType, type AnomalySeverity } from './types/index'
import type { Bulletin } from './types/bulletin'
import type { Anomaly, AnomalyEvidence, AnomalyCalculation, AnomalyPrescription, AnomalyRecommendation } from './types/anomaly'

const r2 = (n: number) => Math.round(n * 100) / 100
let _seq = 0

function mkA(
  type: AnomalyType, severity: AnomalySeverity, titre: string,
  description: string, explication: string, evidence: AnomalyEvidence,
  montant: number, bulletinId: string,
): Anomaly {
  const now = new Date().toISOString()
  const presc = new Date(); presc.setFullYear(presc.getFullYear() - 3)
  const calculation: AnomalyCalculation = {
    montantMensuel: montant, montantTotal: montant, moisConcernes: [],
    anneesConcernees: [], methodologie: 'Calcul automatique MAPAIE', baseCalcul: montant,
  }
  const prescription: AnomalyPrescription = {
    dateDebutPrescription: presc.toISOString().slice(0, 10),
    dateFinPrescription: new Date().toISOString().slice(0, 10),
    estPrescrit: false, moisRecuperables: 36,
  }
  const recommendations: AnomalyRecommendation[] = [{
    action: 'RECLAMATION_EMPLOYEUR', priorite: 1,
    description: 'Envoyer une réclamation écrite à l\'employeur avec les références légales',
  }]
  return {
    id: `mapaie-${++_seq}-${Date.now()}`, type, severity, titre, description, explication,
    evidence, calculation, prescription, confidence: percentage(0.75),
    bulletinIds: [bulletinId], recommendations, createdAt: now, updatedAt: now,
  }
}

export function detectAnomalies(bulletin: Bulletin, minimumCCN: number | null = null): Anomaly[] {
  const anomalies: Anomaly[] = []
  const { heures, remuneration, salarie, employeur, lignes, cumuls, conges } = bulletin
  const conv = CONVENTION_HEURES_SUP[employeur.conventionCollective]
  const tauxHoraire = calculerTauxHoraire(remuneration.salaireBase, heures.heuresNormales)

  // ─── 1. HS mal majorées ───
  if (heures.heuresSup25 > 0 || heures.heuresSup50 > 0) {
    const t1 = Math.max(conv.tranche1Majoration, MAJORATION_HS_MINIMUM_CC)
    const t2 = Math.max(conv.tranche2Majoration, MAJORATION_HS_MINIMUM_CC)
    const du = r2(heures.heuresSup25 * tauxHoraire * (1 + t1) + heures.heuresSup50 * tauxHoraire * (1 + t2))
    const paye = lignes.filter(l => l.nature === 'GAIN' && /sup/i.test(l.libelle)).reduce((s, l) => s + l.montantSalarial, 0)
    const rappel = Math.max(0, r2(du - paye))
    if (rappel > 1) anomalies.push(mkA('MAJORATION_HS_INCORRECTE', 'CRITIQUE', 'Heures supplémentaires mal majorées',
      `${rappel.toFixed(2)}€ de rappel estimé sur ${heures.heuresSup25 + heures.heuresSup50}h de HS`,
      `Taux légal minimum : ${(t1 * 100).toFixed(0)}% (T1) / ${(t2 * 100).toFixed(0)}% (T2). Vérifiez chaque ligne HS.`,
      { expectedValue: du, actualValue: paye, delta: rappel, legalReference: 'Art. L.3121-36 C. trav.' },
      rappel, bulletin.id))
  }

  // ─── 2. Sous SMIC ───
  const smicCheck = verifierSmicHoraire(tauxHoraire)
  if (!smicCheck.conforme) anomalies.push(mkA('CONVENTION_MAL_APPLIQUEE', 'CRITIQUE', 'Taux horaire inférieur au SMIC',
    `Taux de ${tauxHoraire.toFixed(2)}€/h constaté, SMIC légal : 11,88€/h`,
    'Tout employeur est tenu de respecter le SMIC horaire légal, sans exception.',
    { expectedValue: 11.88, actualValue: tauxHoraire, delta: smicCheck.ecart, legalReference: 'Art. L.3231-2 C. trav.' },
    r2(Math.abs(smicCheck.ecart) * heures.heuresNormales), bulletin.id))

  // ─── 3. Sous minimum conventionnel ───
  const minC = verifierMinimumConventionnel(remuneration.salaireBase, minimumCCN, heures.heuresNormales)
  if (!minC.estConforme) anomalies.push(mkA('CONVENTION_MAL_APPLIQUEE', 'CRITIQUE', 'Salaire inférieur au minimum conventionnel',
    `Écart de ${Math.abs(minC.ecart).toFixed(2)}€/mois — base de référence : ${minC.baseReference}`,
    `La CCN ${employeur.conventionCollective} impose un salaire minimum que votre employeur n'applique pas.`,
    { expectedValue: minC.minimumApplicable, actualValue: minC.salaireBrut, delta: minC.ecart, legalReference: 'Art. L.2261-22 C. trav.' },
    Math.abs(minC.ecart), bulletin.id))

  // ─── 4. Prime d'ancienneté manquante ou insuffisante ───
  if (bulletin.ancienneteAnnees >= 3) {
    const line = lignes.find(l => /anciennet/i.test(l.libelle))
    const anc = calculerPrimeAnciennete(
      salarie.dateEntree,
      `${bulletin.periode.annee}-${String(bulletin.periode.mois).padStart(2, '0')}-01`,
      remuneration.salaireBase, line?.montantSalarial ?? 0,
    )
    if (anc.rappel > 0) anomalies.push(mkA('ANCIENNETE_INCORRECTE', 'MAJEURE', 'Prime d\'ancienneté insuffisante ou absente',
      `${anc.rappel.toFixed(2)}€ de rappel — ${bulletin.ancienneteAnnees} ans d\'ancienneté, taux attendu : ${(anc.tauxApplique * 100).toFixed(0)}%`,
      'La prime d\'ancienneté est obligatoire dans la plupart des CCN dès 3 ans de présence.',
      { expectedValue: anc.primeTheorique, actualValue: anc.primeBulletin, delta: anc.rappel, legalReference: 'Accord de branche applicable' },
      anc.rappel, bulletin.id))
  }

  // ─── 5. Classification erronée (coeff. < minimum CCN) ───
  if (salarie.coefficient && minimumCCN && remuneration.salaireBase < minimumCCN * 0.98) {
    const ecart = r2(minimumCCN - remuneration.salaireBase)
    anomalies.push(mkA('CLASSIFICATION_ERRONEE', 'MAJEURE', 'Coefficient de classification non respecté',
      `Salaire base (${remuneration.salaireBase}€) < minimum coeff. ${salarie.coefficient} (${minimumCCN}€)`,
      'Chaque coefficient de la grille de classification correspond à un salaire minimum obligatoire.',
      { expectedValue: minimumCCN, actualValue: remuneration.salaireBase, delta: -ecart, legalReference: 'Grille de classification CCN' },
      ecart, bulletin.id))
  }

  // ─── 6. Cotisations AGIRC-ARRCO taux obsolète ───
  const ligneAgirc = lignes.find(l => /agirc|arrco|retraite compl/i.test(l.libelle) && l.nature === 'COTISATION' && l.taux !== null)
  if (ligneAgirc?.taux && ligneAgirc.taux < COTISATIONS.AGIRC_ARRCO_T1_SALARIAL - 0.001) {
    anomalies.push(mkA('COTISATION_TAUX_OBSOLETE', 'MINEURE', 'Taux de retraite complémentaire incorrect',
      `Taux appliqué : ${(ligneAgirc.taux * 100).toFixed(2)}% vs taux légal : ${(COTISATIONS.AGIRC_ARRCO_T1_SALARIAL * 100).toFixed(2)}%`,
      'Un taux de cotisation obsolète réduit vos droits à la retraite complémentaire.',
      { bulletinLineCode: ligneAgirc.code, bulletinLineLibelle: ligneAgirc.libelle, expectedValue: COTISATIONS.AGIRC_ARRCO_T1_SALARIAL, actualValue: ligneAgirc.taux, legalReference: 'Accord AGIRC-ARRCO 17/11/2017' },
      0, bulletin.id))
  }

  // ─── 7. Repos compensateur manquant ───
  const seuilRC = conv.seuilReposCompensateur ?? 220
  if (conv.reposCompensateurObligatoire && cumuls.heuresSupCumulees > seuilRC && (conges.compteurReposCompensateur ?? 0) === 0) {
    anomalies.push(mkA('REPOS_COMPENSATEUR_MANQUANT', 'MAJEURE', 'Repos compensateur obligatoire non comptabilisé',
      `${cumuls.heuresSupCumulees}h de HS cumulées dépassent le contingent de ${seuilRC}h sans droit RC ouvert`,
      'Au-delà du contingent annuel, chaque heure sup. ouvre droit à un repos compensateur de remplacement.',
      { expectedValue: `> 0h`, actualValue: 0, legalReference: 'Art. L.3121-38 C. trav.' },
      r2(tauxHoraire * Math.max(0, cumuls.heuresSupCumulees - seuilRC)), bulletin.id))
  }

  // ─── 8. Convention collective mal appliquée (IDCC incohérent) ───
  const idccNum = employeur.idcc.replace(/\D/g, '')
  const ccnNum = employeur.conventionCollective.replace('IDCC_', '')
  if (employeur.conventionCollective !== 'AUTRE' && idccNum && !idccNum.includes(ccnNum)) {
    anomalies.push(mkA('CONVENTION_MAL_APPLIQUEE', 'MINEURE', 'Discordance IDCC / convention collective déclarée',
      `IDCC sur bulletin : ${employeur.idcc} — CCN déclarée : ${employeur.conventionCollective}`,
      'Une CCN mal appliquée peut priver le salarié de droits supérieurs à ceux du Code du travail.',
      { expectedValue: employeur.conventionCollective, actualValue: employeur.idcc, legalReference: 'Art. L.2261-2 C. trav.' },
      0, bulletin.id))
  }

  return anomalies
}
