// POST /api/monimpot/pre-diagnostic — Pré-diagnostic GRATUIT (JS pur)
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { monimpotSchema } from '@/lib/monimpot/schema'
import { computeMonimpotCalculations } from '@/lib/monimpot/calculations'
import { detectOptimisations } from '@/lib/monimpot/anomaly-detection'
import type { MonimpotPreDiagResponse, ErrorResponse, SuggestionFuture, ProfilResume } from '@/lib/monimpot/types'
import type { AvisImpositionExtracted } from '@/lib/monimpot/extract-types'
import { track } from '@/lib/analytics'
import { sendEmail } from '@/lib/email'
import { fmt } from '@/lib/format'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = monimpotSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({
        success: false, error: 'Données invalides',
        details: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      } satisfies ErrorResponse, { status: 400 })
    }

    const data = parsed.data

    // Construire l'extraction partielle si données V2 disponibles
    let extraction: AvisImpositionExtracted | undefined
    let multiAvis: AvisImpositionExtracted[] | undefined

    if (data.isFromExtraction) {
      extraction = {
        annee: new Date().getFullYear() - 1,
        situationFamiliale: data.situation === 'marie_pacse' ? 'M' : data.situation === 'celibataire' ? 'C' : data.situation === 'divorce_separe' ? 'D' : 'V',
        nbPartsDeclarees: data.nbParts,
        nbPersonnesCharge: data.enfantsMineurs + data.enfantsMajeurs,
        caseT: false,
        caseL: data.eleveSeul5ans,
        revenuBrutGlobal: data.revenuNetImposable,
        revenuNetImposable: data.revenuNetImposable,
        rfr: data.rfr ?? data.revenuNetImposable,
        impotBrut: data.impotPaye,
        totalReductionsCredits: 0,
        impotNetAvantCredits: data.impotPaye,
        impotNet: data.impotPaye,
        soldeAPayer: 0,
        casesRenseignees: (data.extractedCases as AvisImpositionExtracted['casesRenseignees']) ?? {
          fraisReels1AK: 0, pensionVersee6EL: 0, dons7UF: 0, dons7UD: 0,
          emploiDomicile7DB: 0, gardeEnfant7GA: 0, ehpad7CD: 0, per6NS: 0,
          case2OP: false, investPME7CF: 0,
        },
        revenusCapitaux: data.extractedRevenusCapitaux || undefined,
        confidence: 80,
        warnings: [],
      }

      if (data.multiAvis && Array.isArray(data.multiAvis) && data.multiAvis.length > 1) {
        multiAvis = data.multiAvis as AvisImpositionExtracted[]
      }
    }

    const calc = computeMonimpotCalculations(data)
    const optimisations = detectOptimisations(data, calc, extraction, multiAvis)

    // ─── CORRECTION V2 : économie = estimations marginales plafonnées ───
    // En mode V2 (extraction), on a les vraies données de l'avis.
    // Le barème recalculé est imprécis (ne connaît pas les déductions déjà en place).
    // On utilise donc les estimations marginales (anomaly-detection), plus fiables,
    // mais plafonnées par l'impôt réellement payé (on ne peut pas récupérer plus).
    if (data.isFromExtraction && data.impotPaye >= 0 && optimisations.length > 0) {
      const totalMarginal = optimisations.reduce((s, o) => s + o.economie, 0)

      // Plafonner par l'impôt payé (impossible de récupérer plus que ce qu'on a payé)
      const finalEco = Math.min(totalMarginal, data.impotPaye)

      // Si le plafonnement réduit, ajuster proportionnellement
      if (finalEco < totalMarginal && totalMarginal > 0) {
        const ratio = finalEco / totalMarginal
        for (const opt of optimisations) {
          opt.economie = Math.round(opt.economie * ratio)
        }
      }

      calc.economieAnnuelle = finalEco
      calc.impotOptimise = Math.max(data.impotPaye - finalEco, 0)
      calc.economie3ans = finalEco * 3
    }

    // ─── GARDE-FOU V1 : pas d extraction → pas d optimisation = pas d économie ───
    if (!data.isFromExtraction && optimisations.length === 0) {
      calc.economieAnnuelle = 0
      calc.economie3ans = 0
      calc.impotOptimise = calc.impotPaye
    }

    // ─── GARDE-FOU UNIVERSEL : plafonner par l'impôt réellement payé ───
    // On ne peut pas récupérer plus que ce qu'on a payé (quel que soit le chemin)
    if (data.impotPaye !== undefined && data.impotPaye >= 0 && optimisations.length > 0) {
      const totalMarginal = optimisations.reduce((s, o) => s + o.economie, 0)
      const maxRecup = Math.max(data.impotPaye, 0)

      if (totalMarginal > maxRecup && maxRecup > 0) {
        // Réduire proportionnellement chaque optimisation
        const ratio = maxRecup / totalMarginal
        for (const opt of optimisations) {
          opt.economie = Math.round(opt.economie * ratio)
        }
      } else if (maxRecup === 0) {
        // Impôt = 0 → les optimisations ne génèrent pas d'économie réelle cette année
        // On les convertit en suggestions futures (economie = 0 mais on garde le label)
        for (const opt of optimisations) {
          opt.economie = 0
        }
      }

      const finalEcoUni = optimisations.reduce((s, o) => s + o.economie, 0)
      calc.economieAnnuelle = finalEcoUni
      calc.economie3ans = finalEcoUni * 3
      calc.impotOptimise = Math.max((data.impotPaye || 0) - finalEcoUni, 0)
    }

    // Sauvegarde en base Payload
    let diagnosticId = `IMP-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    try {
      const payload = await getPayload({ config })
      const doc = await payload.create({
        collection: 'diagnostics',
        data: {
          brique: 'monimpot',
          userEmail: data.email?.toLowerCase?.() || '',
          status: 'pre_diagnostic',
          anomaliesCount: optimisations.length,
          estimatedAmount: calc.economie3ans,
          inputData: data,
          aiAnalysis: { optimisations, calc },
          paid: false,
        },
      })
      diagnosticId = String(doc.id)
    } catch (dbError) {
      console.error('[MONIMPOT] Erreur sauvegarde DB:', dbError instanceof Error ? dbError.message : dbError)
    }

    // GA4 tracking avec palier tarifaire
    const ecoAn = calc.economieAnnuelle
    const palier = ecoAn <= 0 ? 'zero' : ecoAn < 300 ? 'express_19' : ecoAn < 1000 ? 'standard_39' : 'premium_69'
    track({
      event: 'prediag_generated',
      brique: 'monimpot',
      optimisations_count: optimisations.length,
      economie_annuelle: ecoAn,
      palier,
    })

    // ─── Email teaser pré-diagnostic (pas de détails, juste le nombre + fourchette) ───
    if (data.email) {
      const hasEco = calc.economieAnnuelle > 0
      const nbOpts = optimisations.filter(o => o.economie > 0).length
      // Fourchette d'économie (pas de montant exact)
      const eco = calc.economieAnnuelle
      const fourchette = eco < 30 ? 'moins de 50 €' : eco < 100 ? 'entre 30 et 150 €' : eco < 300 ? 'entre 100 et 400 €' : eco < 600 ? 'entre 300 et 800 €' : eco < 1000 ? 'entre 500 et 1 500 €' : eco < 2000 ? 'entre 1 000 et 2 500 €' : eco < 5000 ? 'entre 2 000 et 6 000 €' : 'plus de 5 000 €'
      sendEmail({
        to: data.email,
        subject: hasEco
          ? `RÉCUPÉO — ${nbOpts} optimisation${nbOpts > 1 ? 's' : ''} détectée${nbOpts > 1 ? 's' : ''} sur votre impôt`
          : 'RÉCUPÉO — Résultat de votre vérification fiscale',
        htmlContent: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:#0B1426">Résultat de votre vérification fiscale</h2>
            ${hasEco ? `
              <div style="background:#fefce8;border:1px solid #fde047;border-radius:12px;padding:16px;margin:16px 0">
                <p style="font-size:20px;font-weight:bold;color:#0B1426;margin:0">${nbOpts} optimisation${nbOpts > 1 ? 's' : ''} détectée${nbOpts > 1 ? 's' : ''}</p>
                <p style="color:#64748b;margin:4px 0 0">Économie potentielle estimée : <strong style="color:#059669">${fourchette}/an</strong></p>
              </div>
              <p style="color:#64748b;font-size:14px">Notre IA a analysé votre déclaration et identifié des pistes d'optimisation. Débloquez votre audit personnalisé pour découvrir les détails, les cases à corriger et votre réclamation pré-remplie.</p>
            ` : `
              <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:16px;margin:16px 0">
                <p style="font-size:18px;font-weight:bold;color:#059669;margin:0">✅ Votre déclaration semble bien remplie</p>
              </div>
            `}
            <a href="https://recupeo.fr/monimpot" style="display:inline-block;background:#00D68F;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
              ${hasEco ? 'Débloquer mon audit personnalisé →' : 'Vérifier une autre déclaration →'}
            </a>
            <p style="color:#94a3b8;font-size:11px;margin-top:8px">Audit complet à partir de 19 € · Paiement sécurisé</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
            <p style="color:#94a3b8;font-size:12px">
              RÉCUPÉO — L'IA qui récupère ce qu'on vous doit.<br/>
              Cet email fait suite à votre vérification gratuite sur recupeo.fr.
            </p>
          </div>
        `,
        tags: ['monimpot', 'prediag'],
      }).catch(() => {}) // Non-bloquant
    }

    // ─── Profil récap ───
    const tmi = (() => {
      const rpp = data.nbParts > 0 ? data.revenuNetImposable / data.nbParts : data.revenuNetImposable
      if (rpp <= 11497) return 0
      if (rpp <= 29315) return 0.11
      if (rpp <= 83823) return 0.30
      if (rpp <= 180294) return 0.41
      return 0.45
    })()

    const profil: ProfilResume = {
      situation: data.situation,
      age: data.age,
      nbParts: data.nbParts,
      revenuNetImposable: data.revenuNetImposable,
      impotEstime: calc.impotPaye,
      tmi: tmi * 100,
    }

    // ─── Suggestions futures (toujours générées) ───
    const suggestions: SuggestionFuture[] = []

    if (!data.per && tmi >= 0.11) {
      const ecoSug = Math.round(3000 * tmi)
      suggestions.push({
        id: 'per',
        titre: 'Ouvrir un PER (Plan \u00c9pargne Retraite)',
        description: `Chaque euro versé est déductible de votre revenu imposable. Pour 3 000 \u20ac versés, vous économisez environ ${ecoSug} \u20ac d\u2019impôt (TMI ${Math.round(tmi * 100)}%).`,
        economieEstimee: ecoSug,
        difficulte: 'facile',
        icone: '\ud83c\udfe6',
      })
    }

    if (!data.emploiDomicile) {
      suggestions.push({
        id: 'emploi_domicile',
        titre: 'D\u00e9clarer un emploi \u00e0 domicile',
        description: 'M\u00e9nage, jardinage, aide aux devoirs, garde d\u2019enfant\u2026 Vous b\u00e9n\u00e9ficiez d\u2019un cr\u00e9dit d\u2019imp\u00f4t de 50% des sommes vers\u00e9es (plafond 12 000 \u20ac/an).',
        economieEstimee: 3000,
        difficulte: 'facile',
        icone: '\ud83c\udfe0',
      })
    }

    if (!data.dons) {
      suggestions.push({
        id: 'dons',
        titre: 'Faire des dons \u00e0 des associations',
        description: 'R\u00e9duction d\u2019imp\u00f4t de 66% du montant donn\u00e9 (75% pour les organismes d\u2019aide aux personnes en difficult\u00e9, plafond 1 000 \u20ac).',
        economieEstimee: 330,
        difficulte: 'facile',
        icone: '\u2764\ufe0f',
      })
    }

    if (data.typeRevenus === 'salaires' && (data.distanceTravail ?? 0) >= 25 && !data.fraisReels) {
      suggestions.push({
        id: 'frais_reels',
        titre: 'Passer aux frais r\u00e9els',
        description: 'Avec votre trajet de ' + (data.distanceTravail || 25) + ' km, les frais r\u00e9els (bar\u00e8me kilom\u00e9trique + repas) pourraient d\u00e9passer l\u2019abattement de 10%.',
        economieEstimee: Math.round(1500 * tmi),
        difficulte: 'moyen',
        icone: '\ud83d\ude97',
      })
    }

    if (!data.gardeEnfant && data.enfantsMineurs > 0 && data.age < 50) {
      suggestions.push({
        id: 'garde_enfant',
        titre: 'D\u00e9clarer les frais de garde',
        description: 'Cr\u00e8che, assistante maternelle, centre de loisirs\u2026 Cr\u00e9dit d\u2019imp\u00f4t de 50% (plafond 3 500 \u20ac par enfant).',
        economieEstimee: 1750,
        difficulte: 'facile',
        icone: '\ud83d\udc76',
      })
    }

    const response: MonimpotPreDiagResponse = {
      success: true,
      diagnosticId,
      optimisations,
      totalOptimisations: optimisations.length,
      impotActuel: data.impotPaye,
      impotOptimise: calc.impotOptimise,
      economieAnnuelle: calc.economieAnnuelle,
      economie3ans: calc.economie3ans,
      hasOptimisations: optimisations.length > 0,
      profil,
      suggestions: suggestions.slice(0, 4),
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[monimpot-prediag] Erreur:', err)
    return NextResponse.json(
      { success: false, error: 'Erreur interne' } satisfies ErrorResponse,
      { status: 500 }
    )
  }
}
