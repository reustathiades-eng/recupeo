// ============================================================
// POST /api/retraitia/formulaire
// Sauvegarde le formulaire complementaire dans le dossier
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    const body = await request.json()
    const { dossierId, formulaire } = body

    if (!dossierId || !formulaire) {
      return NextResponse.json({ error: "dossierId et formulaire requis" }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const email = user.email.toLowerCase().trim()

    // Verifier que le dossier appartient au client
    const dossier = await payload.findByID({
      collection: 'retraitia-dossiers',
      id: dossierId,
    })

    const dossierEmail = (dossier as any).userEmail?.toLowerCase()
    const proche = (dossier as any).procheAidant
    const isOwner = dossierEmail === email
    const isProche = proche && proche.email?.toLowerCase() === email

    if (!isOwner && !isProche) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 })
    }

    // Determiner si le formulaire est complet
    const f = formulaire
    const identiteOk = !!(f.nom && f.prenom && f.dateNaissance && f.sexe && f.situationFamiliale)
    const enfantsOk = f.nombreEnfants !== undefined && f.nombreEnfants !== null
    const carriereOk = true // Les toggles ont des valeurs par defaut
    const formulaireComplet = identiteOk && enfantsOk && carriereOk

    await payload.update({
      collection: 'retraitia-dossiers',
      id: dossierId,
      data: {
        formulaire,
        formulaireComplet,
        clientName: f.prenom && f.nom ? f.prenom + " " + f.nom : (dossier as any).clientName,
        status: formulaireComplet && (dossier as any).status === 'created' ? 'collecting' : (dossier as any).status,
      },
    })

    return NextResponse.json({ success: true, formulaireComplet })
  } catch (err) {
    console.error('[RETRAITIA/FORMULAIRE] Erreur:', err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
