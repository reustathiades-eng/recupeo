import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { computeFlashRisk, getFactorTexts } from '@/lib/retraitia/flash'
import type { FlashInput } from '@/lib/retraitia/types'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation basique
    const { status, birthYear, childrenCount, careerType, email } = body
    if (!status || !birthYear || childrenCount === undefined || !careerType || !email) {
      return NextResponse.json({ error: 'Données incomplètes' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }
    if (birthYear < 1930 || birthYear > 2000) {
      return NextResponse.json({ error: 'Année de naissance invalide' }, { status: 400 })
    }

    const input: FlashInput = {
      status,
      birthYear,
      childrenCount: Math.max(0, Math.min(20, childrenCount)),
      careerType,
      email: email.toLowerCase().trim(),
    }

    // Calcul du score de risque
    const result = computeFlashRisk(input)
    const factorTexts = getFactorTexts(result.factors, input)

    // Sauvegarde dans Payload
    const payload = await getPayload({ config })
    const flash = await payload.create({
      collection: 'retraitia-flash',
      data: {
        email: input.email,
        status: input.status,
        birthYear: input.birthYear,
        childrenCount: input.childrenCount,
        careerType: input.careerType,
        riskLevel: result.riskLevel,
        riskScore: result.riskScore,
        riskFactors: result.factors,
        source: body.utm_source || undefined,
        medium: body.utm_medium || undefined,
        campaign: body.utm_campaign || undefined,
        referralCode: body.ref || undefined,
      },
    })

    // Email Brevo — résultat du flash (S1-E1)
    try {
      const statusLabel = {
        retired: 'Retraité(e)',
        pre_retired: 'Pré-retraité(e)',
        surviving: 'Conjoint survivant',
      }[input.status] || 'Retraité(e)'

      const careerLabel = {
        simple_prive: 'Salarié du privé',
        simple_public: 'Fonctionnaire',
        independant: 'Indépendant',
        mixte: 'Carrière mixte',
        agricole: 'Agriculteur',
        liberal: 'Profession libérale',
      }[input.careerType] || input.careerType

      const factorsHtml = factorTexts
        .map(f => `<p style="margin:8px 0;padding:10px 14px;background:#f8fafc;border-left:3px solid #00D68F;border-radius:4px;font-size:14px;"><strong>${f.label}</strong><br/>${f.text}</p>`)
        .join('')

      await sendEmail({
        to: input.email,
        subject: `Votre résultat RÉCUPÉO : risque ${result.riskLevel.replace('_', ' ')} sur votre pension`,
        htmlContent: `
          <h2 style="color:#0F172A;font-size:22px;">Votre résultat de test pension RÉCUPÉO</h2>
          <p style="color:#64748b;font-size:14px;">
            Profil : ${statusLabel} · Né(e) en ${input.birthYear} · ${input.childrenCount} enfant${input.childrenCount > 1 ? 's' : ''} · ${careerLabel}
          </p>
          <div style="background:#060D1B;color:white;padding:20px;border-radius:12px;text-align:center;margin:20px 0;">
            <p style="font-size:13px;color:#94a3b8;margin:0 0 8px;">Niveau de risque</p>
            <p style="font-size:28px;font-weight:800;color:#00D68F;margin:0;">${result.riskLevel.replace('_', ' ')}</p>
          </div>
          <h3 style="font-size:16px;color:#0F172A;margin:20px 0 10px;">Pourquoi ce résultat :</h3>
          ${factorsHtml}
          <p style="font-size:13px;color:#64748b;margin-top:16px;">
            📊 En France, 1 pension sur 7 contient une erreur (Cour des Comptes). 75% des erreurs sont en défaveur des retraités.
          </p>
          <div style="text-align:center;margin:30px 0;">
            <a href="https://recupeo.fr/retraitia/test?upgrade=1&ref=${flash.id}" style="display:inline-block;background:#00D68F;color:#060D1B;padding:16px 32px;border-radius:10px;font-weight:700;font-size:16px;text-decoration:none;">
              Vérifier ma pension — 9€
            </a>
            <p style="font-size:12px;color:#94a3b8;margin-top:8px;">Ces 9€ sont déduits si vous poursuivez l'analyse.</p>
          </div>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>
          <p style="font-size:12px;color:#94a3b8;text-align:center;">
            📤 Partagez ce test avec vos proches : <a href="https://recupeo.fr/retraitia/test" style="color:#00D68F;">recupeo.fr/retraitia/test</a>
          </p>
        `,
      })
    } catch (emailErr) {
      console.error('[retraitia/flash] Email error:', emailErr)
      // On ne bloque pas le résultat si l'email échoue
    }

    return NextResponse.json({
      success: true,
      flashId: flash.id,
      riskLevel: result.riskLevel,
      riskScore: result.riskScore,
      headline: result.headline,
      subline: result.subline,
      factors: factorTexts,
    })
  } catch (err) {
    console.error('[retraitia/flash] Error:', err)
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 },
    )
  }
}
