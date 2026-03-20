// POST /api/mapaie/full-report — Rapport complet (payant 49€ / 129€)
import { NextRequest, NextResponse } from 'next/server'
import { callClaude } from '@/lib/anthropic'
import { PreDiagnosticSchema } from '@/lib/mapaie/schema'
import { detectAnomalies } from '@/lib/mapaie/anomaly-detection'
import { calculerRappelSur3Ans, calculerTauxHoraire } from '@/lib/mapaie/calculations'
import { FULL_REPORT_PROMPT, buildFullReportMessage } from '@/lib/mapaie/prompts'
import { DUREE_LEGALE_MENSUELLE, SMIC_MENSUEL_2026 } from '@/lib/mapaie/constants'
import { pii, percentage } from '@/lib/mapaie/types/index'
import type { Bulletin } from '@/lib/mapaie/types/bulletin'
import { verifyCheckoutSession } from '@/lib/payment'
import { track } from '@/lib/analytics'

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
  const heuresSup25 = remuneration.heuresSupMensuelles
  const heuresSup50 = 0
  const heuresSupCumulees = Math.round(heuresSup25 * 12)
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
      totalHeures: heuresMensuelles + heuresSup25,
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

    // Vérification du paiement Stripe
    const sessionId: string | undefined = body.sessionId
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Paiement requis' },
        { status: 402 }
      )
    }

    const payment = await verifyCheckoutSession(sessionId)
    if (!payment.paid || payment.brique !== 'mapaie') {
      return NextResponse.json(
        { success: false, error: 'Paiement non vérifié' },
        { status: 402 }
      )
    }

    // Validation des données formulaire
    const parsed = PreDiagnosticSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { emploi, remuneration } = parsed.data
    const minimumCCN = MIN_CCN[emploi.conventionCollective] ?? null

    const bulletin = buildSyntheticBulletin(emploi, remuneration)
    const anomalies = detectAnomalies(bulletin, minimumCCN)

    const totalMensuel = anomalies.reduce((s, a) => s + (a.calculation?.montantMensuel ?? 0), 0)
    const rappel = totalMensuel > 0
      ? calculerRappelSur3Ans(totalMensuel, emploi.dateEntree)
      : { montantMensuelMoyen: 0, montantTotalBrut: 0, montantNetEstime: 0, moisConcernes: 0, prescriptionDepuis: '' }

    // Appel Claude — rapport complet
    const userMessage = buildFullReportMessage(
      'Employeur',
      emploi.conventionCollective,
      remuneration.ancienneteAnnees,
      anomalies,
      rappel,
    )

    const claudeResponse = await callClaude({
      system: FULL_REPORT_PROMPT,
      userMessage,
      maxTokens: 4096,
      temperature: 0.3,
    })

    let sections: Array<{ id: string; title: string; content: string }> = []
    try {
      let cleaned = claudeResponse.trim()
      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7)
      else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3)
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)
      sections = JSON.parse(cleaned.trim()).sections ?? []
    } catch {
      sections = [{ id: 'rapport', title: 'Rapport', content: claudeResponse }]
    }

    track({ event: 'mapaie_report_generated', brique: 'mapaie' })

    return NextResponse.json({
      success: true,
      diagnosticId: payment.diagnosticId ?? body.diagnosticId ?? `MAP-${Date.now()}`,
      anomalies,
      rappelTotalBrut: rappel.montantTotalBrut,
      rappelTotalNet: rappel.montantNetEstime,
      moisConcernes: rappel.moisConcernes,
      plan: payment.plan,
      report: {
        title: 'Rapport d\'audit — Bulletin de paie',
        date: new Date().toISOString().split('T')[0],
        reference: `MAP-${Date.now()}`,
        sections,
      },
    })
  } catch (err) {
    console.error('[mapaie-full-report] Erreur:', err)
    return NextResponse.json(
      { success: false, error: 'Erreur interne' },
      { status: 500 }
    )
  }
}
