// ============================================================
// GET /api/og?brique=mataxe&montant=800&ref=ABC123
// Génère une image OG dynamique (1200×630) via satori + sharp
// ============================================================
import { NextRequest } from 'next/server'
import satori from 'satori'
import sharp from 'sharp'
import React from 'react'
import { anonymizeMontant, BRIQUE_SHARE_LABELS } from '@/lib/sharing/constants'

// Cache en mémoire (1h)
const cache = new Map<string, { buffer: Uint8Array; time: number }>()
const CACHE_TTL = 3600_000

// Police DM Sans
let fontData: ArrayBuffer | null = null
async function getFont(): Promise<ArrayBuffer> {
  if (fontData) return fontData
  const res = await fetch('https://cdn.jsdelivr.net/fontsource/fonts/dm-sans@latest/latin-700-normal.woff')
  fontData = await res.arrayBuffer()
  return fontData
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brique = searchParams.get('brique') || 'mataxe'
    const montant = parseInt(searchParams.get('montant') || '0')

    const cacheKey = `${brique}-${montant}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      return new Response(new Uint8Array(cached.buffer), {
        headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
      })
    }

    const label = BRIQUE_SHARE_LABELS[brique] || 'vos finances'
    const montantText = montant > 0 ? anonymizeMontant(montant) : 'un trop-perçu'
    const font = await getFont()

    const element = React.createElement(
      'div',
      {
        style: {
          width: '1200px', height: '630px',
          background: 'linear-gradient(135deg, #0B1426 0%, #162240 100%)',
          display: 'flex', flexDirection: 'column' as const,
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'DM Sans', padding: '60px',
        },
      },
      React.createElement('div', {
        style: { color: '#00D68F', fontSize: '36px', fontWeight: 700, letterSpacing: '-1px', marginBottom: '40px' },
      }, 'RÉCUPÉO'),
      React.createElement('div', {
        style: { color: '#00D68F', fontSize: '72px', fontWeight: 700, letterSpacing: '-2px', marginBottom: '24px', textAlign: 'center' as const },
      }, montantText),
      React.createElement('div', {
        style: { color: 'rgba(255,255,255,0.8)', fontSize: '28px', textAlign: 'center' as const, lineHeight: '1.4', maxWidth: '800px' },
      }, `de trop-perçu détecté sur ${label}`),
      React.createElement('div', {
        style: {
          marginTop: '48px', background: '#00D68F', color: '#0B1426',
          padding: '16px 40px', borderRadius: '12px', fontSize: '22px', fontWeight: 700,
        },
      }, 'Vérifiez gratuitement → recupeo.fr'),
    )

    const svg = await satori(element, {
      width: 1200,
      height: 630,
      fonts: [{ name: 'DM Sans', data: font, weight: 700, style: 'normal' as const }],
    })

    const pngBuffer = await sharp(Buffer.from(svg)).png({ quality: 85 }).toBuffer()
    const pngArray = new Uint8Array(pngBuffer)

    cache.set(cacheKey, { buffer: pngArray, time: Date.now() })

    return new Response(pngArray, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err) {
    console.error('[OG] Erreur génération:', err)
    return new Response('Erreur génération image', { status: 500 })
  }
}
