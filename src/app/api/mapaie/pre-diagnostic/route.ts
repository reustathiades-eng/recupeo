// POST /api/mapaie/pre-diagnostic — Pré-diagnostic GRATUIT (JS pur, pas d'IA)
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { PreDiagnosticSchema } from '@/lib/mapaie/schema'
import { detectAnomalies } from '@/lib/mapaie/anomaly-detection'
import { calculerRappelSur3Ans, calculerTauxHoraire } from '@/lib/mapaie/calculations'
import { DUREE_LEGALE_MENSUELLE, SMIC_MENSUEL_2026 } from '@/lib/mapaie/constants'
import { pii, percentage } from '@/lib/mapaie/types/index'
import type { Bulletin } from '@/lib/mapaie/types/bulletin'
import { track } from '@/lib/analytics'

// Minimums conventionnels (salaireMinimum depuis conventions.ts — SMIC si non listé)
const MIN_CCN: Record<string, number> = {
  IDCC_2216: SMIC_MENSUEL_2026,
  IDCC_1979: SMIC_MENSUEL_2026,
  IDCC_1596: SMIC_MENSUEL_2026,
  IDCC_3248: SMIC_MENSUEL_2026,
  IDCC_0573: SMIC_MENSUEL_2026,
  AUTRE: SMIC_MENSUEL_2026,
}

function buildSyntheticBulletin(
  emploi: {
    dateEntree: string
    conventionCollective: string
    coefficient?: number | null
    classification?: string | null
    qualification?: string | null
    dureeHebdomadaire: number
    idcc?: string
  },
  remuneration: {
    salaireBrutMensuel: number
    salaireNetMensuel: number
    heuresSupMensuelles: number
    ancienneteAnnees: number
  },
): Bulletin {
  const now = new Date()
  const heuresMensuelles = Math.round(emploi.dureeHebdomadaire * (52 / 12) * 100) / 100
  const heuresSupMens = remuneration.heuresSupMensuelles
  // Conservative: all monthly HS in T1 (25%)
  const heuresSup25 = heuresSupMens
  const heuresSup50 = 0

  // HS cumulées sur 12 mois (estimation annuelle)
  const heuresSupCumulees = Math.round(heuresSupMens * 12)

  const idcc = emploi.idcc ?? emploi.conventionCollective.replace('IDCC_', '')

  return {
    id: `synth-${Date.now()}`,
    periode: {
      mois: now.getMonth() + 1,
      annee: now.getFullYear(),
      dateDebut: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
      dateFin: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-28`,
    },
    salarie: {
      nom: pii('ANONYME'),
      prenom: pii('ANONYME'),
      matricule: pii('000000'),
      numeroSecu: pii(null),
      dateEntree: emploi.dateEntree,
      dateNaissance: pii(null),
      qualification: emploi.qualification ?? null,
      coefficient: emploi.coefficient ?? null,
      classification: emploi.classification ?? null,
    },
    employeur: {
      raisonSociale: 'Employeur',
      siret: pii('00000000000000'),
      codeNAF: '0000Z',
      adresse: '',
      conventionCollective: emploi.conventionCollective as Bulletin['employeur']['conventionCollective'],
      idcc,
    },
    heures: {
      heuresNormales: heuresMensuelles,
      heuresSup25,
      heuresSup50,
      heuresNuit: 0,
      heuresDimanche: 0,
      heuresFeriees: 0,
      totalHeures: heuresMensuelles + heuresSupMens,
    },
    conges: {
      acquisMois: 2.5,
      prisMois: 0,
      soldeConges: 0,
      compteurRTT: null,
      compteurReposCompensateur: 0,
    },
    lignes: heuresSup25 > 0
      ? [{
          code: 'HS25',
          libelle: 'Heures supplémentaires 25%',
          base: heuresSup25,
          taux: 1.25,
          montantSalarial: Math.round(calculerTauxHoraire(remuneration.salaireBrutMensuel, heuresMensuelles) * heuresSup25 * 1.25 * 100) / 100,
          montantPatronal: null,
          nature: 'GAIN' as const,
        }]
      : [],
    remuneration: {
      salaireBase: remuneration.salaireBrutMensuel,
      brutAvantCotisations: remuneration.salaireBrutMensuel,
      totalCotisationsSalariales: Math.round((remuneration.salaireBrutMensuel - remuneration.salaireNetMensuel) * 100) / 100,
      totalCotisationsPatronales: 0,
      netImposable: remuneration.salaireNetMensuel,
      netAPayer: remuneration.salaireNetMensuel,
      prelevement: null,
      netVerse: remuneration.salaireNetMensuel,
    },
    cumuls: {
      brutCumule: remuneration.salaireBrutMensuel * (now.getMonth() + 1),
      netImposableCumule: remuneration.salaireNetMensuel * (now.getMonth() + 1),
      heuresSupCumulees,
      congesAcquisCumules: (now.getMonth() + 1) * 2.5,
      congesPrisCumules: 0,
    },
    metadata: {
      sourceDocumentId: 'form-input',
      ocrConfidence: percentage(1),
      extractedAt: now.toISOString(),
      verifiedAt: null,
      pageCount: 0,
      rawTextHash: '',
    },
    ancienneteAnnees: remuneration.ancienneteAnnees,
    tempsTravail: emploi.dureeHebdomadaire >= 35 ? 'TEMPS_PLEIN' : 'TEMPS_PARTIEL',
    tauxActivite: emploi.dureeHebdomadaire >= 35
      ? null
      : percentage(Math.min(1, Math.max(0, emploi.dureeHebdomadaire / DUREE_LEGALE_MENSUELLE * 7))),
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = PreDiagnosticSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: 'Données invalides',
        details: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }, { status: 400 })
    }

    const { emploi, remuneration, periodeAudit } = parsed.data
    const minimumCCN = MIN_CCN[emploi.conventionCollective] ?? null

    const bulletin = buildSyntheticBulletin(emploi, remuneration)
    const anomalies = detectAnomalies(bulletin, minimumCCN)

    // Rappel total estimé sur 3 ans
    const totalMensuel = anomalies.reduce((s, a) => s + (a.calculation?.montantMensuel ?? 0), 0)
    const rappel3ans = totalMensuel > 0
      ? calculerRappelSur3Ans(totalMensuel, emploi.dateEntree)
      : { montantTotalBrut: 0, montantNetEstime: 0, moisConcernes: 0, prescriptionDepuis: '' }

    // Sauvegarde en base Payload
    let diagnosticId = `MAP-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    try {
      const payload = await getPayload({ config })
      const doc = await payload.create({
        collection: 'diagnostics',
        data: {
          brique: 'mapaie',
          userEmail: '',
          status: 'pre_diagnostic',
          anomaliesCount: anomalies.length,
          estimatedAmount: rappel3ans.montantTotalBrut,
          inputData: { emploi, remuneration, periodeAudit },
          aiAnalysis: { anomalies, rappel3ans },
          paid: false,
        },
      })
      diagnosticId = String(doc.id)
    } catch (dbError) {
      console.error('[MAPAIE] Erreur sauvegarde DB:', dbError instanceof Error ? dbError.message : dbError)
    }

    track({ event: 'mapaie_prediag_generated', brique: 'mapaie' })

    return NextResponse.json({
      success: true,
      diagnosticId,
      anomalies,
      totalAnomalies: anomalies.length,
      rappelMensuelEstime: totalMensuel,
      rappelTotalBrut: rappel3ans.montantTotalBrut,
      rappelTotalNet: rappel3ans.montantNetEstime,
      moisConcernes: rappel3ans.moisConcernes,
      prescriptionDepuis: rappel3ans.prescriptionDepuis,
      periodeAudit,
      conventionCollective: emploi.conventionCollective,
    })
  } catch (err) {
    console.error('[mapaie-prediag] Erreur:', err)
    return NextResponse.json(
      { success: false, error: 'Erreur interne' },
      { status: 500 }
    )
  }
}
