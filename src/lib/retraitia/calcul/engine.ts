// ============================================================
// RETRAITIA V2 — Orchestrateur du moteur de calcul
// ============================================================

import type {
  CalculResult, DossierFormulaire, DossierExtractions, DocumentType,
} from '../types'
import { calculerRegimeGeneral } from './regime-general'
import { calculerAgircArrco } from './agirc-arrco'
import { calculerFonctionnaires } from './fonctionnaires'
import { calculerMSAExploitant } from './msa-exploitants'
import { calculerCNAVPL } from './cnavpl'
import { verifierComplementaires } from './complementaires'
import { verifierCSG } from './csg'

interface EngineInput {
  formulaire: DossierFormulaire
  extractions: DossierExtractions
}

/**
 * Lance le moteur de calcul complet.
 * Appelle les sous-moteurs selon les regimes et donnees disponibles.
 */
export function runCalculEngine(input: EngineInput): CalculResult {
  const { formulaire, extractions } = input
  const regimes = formulaire.carriere.regimes || []

  const documentsUtilises: DocumentType[] = []
  if (extractions.ris) documentsUtilises.push('ris')
  if (extractions.notificationCnav) documentsUtilises.push('notification_cnav')
  if (extractions.agircArrco) documentsUtilises.push('releve_agirc_arrco')
  if (extractions.avisImposition) documentsUtilises.push('avis_imposition')
  if (extractions.mensualites) documentsUtilises.push('releve_mensualites')
  if (extractions.notificationFP) documentsUtilises.push(
    extractions.notificationFP.regime === 'sre' ? 'notification_sre' : 'notification_cnracl'
  )
  if (extractions.notificationMSA) documentsUtilises.push('notification_msa')
  if (extractions.releveCNAVPL) documentsUtilises.push('releve_cnavpl')

  // ── Calcul CNAV (regime general, MSA salaries via Lura, ex-RSI) ──
  const hasCNAV = regimes.some(r => ['cnav', 'ssi', 'msa_salarie'].includes(r))
  const cnav = hasCNAV
    ? calculerRegimeGeneral({
        ris: extractions.ris,
        notification: extractions.notificationCnav,
        formulaire,
      })
    : undefined

  // ── Calcul Agirc-Arrco ──
  const agircArrco = extractions.agircArrco
    ? calculerAgircArrco({
        agircArrco: extractions.agircArrco,
        formulaire,
        dateDepartRetraite: formulaire.carriere.retraiteDateDepart,
      })
    : undefined

  // ── Calcul Fonctionnaires (SRE ou CNRACL) ──
  const hasFP = regimes.some(r => ['sre', 'cnracl'].includes(r))
  const fonctionnaires = hasFP
    ? calculerFonctionnaires({
        ris: extractions.ris,
        notification: extractions.notificationFP || undefined,
        formulaire,
        regime: regimes.includes('sre') ? 'sre' : 'cnracl',
      })
    : undefined

  // ── Calcul MSA Exploitants ──
  const hasMSAExpl = regimes.includes('msa_exploitant')
  const msaExploitant = hasMSAExpl
    ? calculerMSAExploitant({
        ris: extractions.ris,
        notificationMSA: extractions.notificationMSA || undefined,
        formulaire,
      })
    : undefined

  // ── Calcul CNAVPL (liberaux) ──
  const hasCNAVPL = regimes.includes('cnavpl')
  const cnavpl = hasCNAVPL
    ? calculerCNAVPL({
        ris: extractions.ris,
        releveCNAVPL: extractions.releveCNAVPL || undefined,
        formulaire,
      })
    : undefined

  // ── Complementaires (RAFP, Ircantec, RCI) ──
  const complementaires = verifierComplementaires({
    formulaire,
    releveRAFP: extractions.releveRAFP || undefined,
    releveIrcantec: extractions.releveIrcantec || undefined,
    releveRCI: extractions.releveRCI || undefined,
  })

  // ── Verification CSG ──
  const csg = verifierCSG({
    avisImposition: extractions.avisImposition,
    avisImpositionN1: extractions.avisImpositionN1,
    mensualites: extractions.mensualites,
  })

  // ── Totaux ──
  let totalRecalcule = 0
  let totalNotification = 0
  let hasRecalcule = false
  let hasNotification = false

  // CNAV
  if (cnav?.pensionBruteMensuelle) {
    totalRecalcule += cnav.pensionBruteMensuelle.value
    if (cnav.majorationEnfants?.applicable) totalRecalcule += cnav.majorationEnfants.montant
    hasRecalcule = true
  }
  if (extractions.notificationCnav?.montantMensuelBrut) {
    totalNotification += extractions.notificationCnav.montantMensuelBrut
    hasNotification = true
  }

  // Agirc-Arrco
  if (agircArrco?.pensionMensuelle) {
    totalRecalcule += agircArrco.pensionMensuelle.value
    if (agircArrco.majorationEnfants?.applicable) totalRecalcule += agircArrco.majorationEnfants.montant
    hasRecalcule = true
  }
  if (extractions.agircArrco?.pensionAnnuelle) {
    totalNotification += extractions.agircArrco.pensionAnnuelle / 12
    hasNotification = true
  }

  // FP
  if (fonctionnaires?.pensionBruteMensuelle) {
    totalRecalcule += fonctionnaires.pensionBruteMensuelle.value
    if (fonctionnaires.majorationEnfants?.applicable) totalRecalcule += fonctionnaires.majorationEnfants.montant
    hasRecalcule = true
  }
  if (extractions.notificationFP?.pensionBruteMensuelle) {
    totalNotification += extractions.notificationFP.pensionBruteMensuelle
    hasNotification = true
  }

  // MSA Exploitant
  if (msaExploitant?.pensionMensuelle) {
    totalRecalcule += msaExploitant.pensionMensuelle.value
    if (msaExploitant.majorationEnfants?.applicable) totalRecalcule += msaExploitant.majorationEnfants.montant
    hasRecalcule = true
  }

  // CNAVPL
  if (cnavpl?.pensionBruteMensuelle) {
    totalRecalcule += cnavpl.pensionBruteMensuelle.value
    if (cnavpl.majorationEnfants?.applicable) totalRecalcule += cnavpl.majorationEnfants.montant
    hasRecalcule = true
  }

  // Complementaires (RAFP, Ircantec, RCI)
  for (const compl of complementaires) {
    if (compl.pensionMensuelle.value > 0) {
      totalRecalcule += compl.pensionMensuelle.value
      if (compl.majorationEnfants?.applicable) totalRecalcule += compl.majorationEnfants.montant
      hasRecalcule = true
    }
  }

  totalRecalcule = Math.round(totalRecalcule * 100) / 100
  totalNotification = Math.round(totalNotification * 100) / 100

  const pensionTotalRecalculee = hasRecalcule
    ? { value: totalRecalcule, confidence: 'HAUTE_CONFIANCE' as const, source: 'Somme tous regimes recalcules' }
    : undefined

  const pensionTotalNotification = hasNotification ? totalNotification : undefined

  // ── Precision de l'audit ──
  let precision = 0
  if (extractions.ris) precision += 20
  if (extractions.notificationCnav) precision += 20
  if (extractions.agircArrco) precision += 15
  if (extractions.notificationFP) precision += 20
  if (extractions.notificationMSA) precision += 15
  if (extractions.releveCNAVPL) precision += 15
  if (extractions.releveRAFP) precision += 5
  if (extractions.releveIrcantec) precision += 5
  if (extractions.releveRCI) precision += 5
  if (formulaire.carriere.pensionBaseBrute || formulaire.carriere.totalPensionsMensuelles) precision += 8
  if (extractions.avisImposition) precision += 5
  if (extractions.mensualites) precision += 5
  precision = Math.min(100, precision)

  return {
    cnav,
    fonctionnaires,
    agircArrco: agircArrco ?? undefined,
    msaExploitant,
    cnavpl,
    complementaires: complementaires.length > 0 ? complementaires : undefined,
    csg: csg ?? undefined,
    pensionTotalRecalculee: pensionTotalRecalculee,
    pensionTotalNotification,
    ecartTotal: pensionTotalRecalculee && pensionTotalNotification
      ? {
          value: Math.round((totalRecalcule - totalNotification) * 100) / 100,
          confidence: 'HAUTE_CONFIANCE' as const,
          source: 'Ecart total recalcul vs notification',
        }
      : undefined,
    precisionAudit: precision,
    documentsUtilises,
  }
}
