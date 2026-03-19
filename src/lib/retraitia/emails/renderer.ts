// ============================================================
// RETRAITIA — Rendu HTML emails Brevo
// ============================================================
// Génère les emails HTML à partir du contenu des séquences.
// Réutilise le design system RÉCUPÉO (header vert, fond clair).
// ============================================================

const HEADER = `
<div style="background:#0B1426;padding:24px 32px;text-align:center;">
  <span style="color:#00D68F;font-size:22px;font-weight:800;letter-spacing:-0.5px;">RÉCUPÉO</span>
  <span style="color:rgba(255,255,255,0.4);font-size:12px;margin-left:8px;">RETRAITIA</span>
</div>`

const FOOTER_STANDARD = `
<div style="margin-top:32px;padding:20px 32px;background:#F7F9FC;border-top:1px solid #E2E8F0;font-size:11px;color:#64748B;text-align:center;">
  <p style="margin:4px 0;">RÉCUPÉO · L'IA qui récupère ce qu'on vous doit</p>
  <p style="margin:4px 0;">Données traitées conformément au RGPD · <a href="https://recupeo.fr" style="color:#00D68F;">recupeo.fr</a></p>
  <p style="margin:8px 0;"><a href="{lienDesabonnement}" style="color:#94a3b8;font-size:10px;">Se désabonner</a></p>
</div>`

/**
 * Wrap le contenu d'un email dans le template RÉCUPÉO.
 */
export function wrapEmail(body: string, dossierId?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://recupeo.fr'
  const unsubLink = dossierId
    ? `${baseUrl}/api/retraitia/emails/unsubscribe?id=${dossierId}`
    : `${baseUrl}/api/retraitia/emails/unsubscribe`

  const footer = FOOTER_STANDARD.replace('{lienDesabonnement}', unsubLink)

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F7F9FC;">
<div style="max-width:600px;margin:0 auto;background:#FFFFFF;">
${HEADER}
<div style="padding:28px 32px;">
${body}
</div>
${footer}
</div>
</body></html>`
}

/**
 * Génère un bouton CTA stylé.
 */
export function ctaButton(text: string, url: string): string {
  return `<div style="text-align:center;margin:28px 0;">
  <a href="${url}" style="display:inline-block;background:#00D68F;color:#060D1B;padding:16px 32px;border-radius:10px;font-weight:700;font-size:16px;text-decoration:none;">${text}</a>
</div>`
}

/**
 * Petit texte sous un bouton.
 */
export function ctaSubtext(text: string): string {
  return `<p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:-16px;">${text}</p>`
}

/**
 * Titre principal de l'email.
 */
export function heading(text: string): string {
  return `<h2 style="color:#0F172A;font-size:20px;font-weight:700;margin:0 0 16px;">${text}</h2>`
}

/**
 * Paragraphe standard.
 */
export function para(text: string): string {
  return `<p style="color:#334155;font-size:15px;line-height:1.6;margin:12px 0;">${text}</p>`
}

/**
 * Bloc gris (encadré info).
 */
export function infoBox(content: string): string {
  return `<div style="background:#f8fafc;border-radius:12px;padding:20px;margin:20px 0;">${content}</div>`
}

/**
 * Ligne d'état document (✅ / 🔴).
 */
export function docStatusLine(nom: string, uploaded: boolean, guideUrl?: string): string {
  if (uploaded) {
    return `<p style="margin:6px 0;font-size:14px;">✅ ${nom}</p>`
  }
  const guide = guideUrl ? ` → <a href="${guideUrl}" style="color:#00D68F;">Guide</a>` : ''
  return `<p style="margin:6px 0;font-size:14px;">🔴 ${nom}${guide}</p>`
}

/**
 * Bloc impact financier (fond sombre).
 */
export function impactBlock(nb: number, min: number, max: number, score?: string): string {
  const scoreHtml = score ? `<p style="font-size:13px;color:#94a3b8;margin:8px 0 0;">Score : ${score}</p>` : ''
  return `<div style="background:#060D1B;color:white;padding:20px;border-radius:12px;text-align:center;margin:20px 0;">
  <p style="font-size:13px;color:#94a3b8;margin:0 0 4px;">Anomalies détectées</p>
  <p style="font-size:32px;font-weight:800;color:#00D68F;margin:0;">${nb}</p>
  <p style="font-size:14px;color:#e2e8f0;margin:8px 0 0;">Impact estimé : ${min}–${max}€/mois</p>
  ${scoreHtml}
</div>`
}

/**
 * Ligne d'anomalie dans la liste (post-49€).
 */
export function anomalyLine(label: string, impact: number, organisme: string): string {
  return `<p style="margin:8px 0;font-size:14px;">• <strong>${label}</strong> — +${impact}€/mois → ${organisme}</p>`
}

/**
 * Signature standard.
 */
export function signature(): string {
  return `<p style="color:#64748b;font-size:14px;margin-top:24px;">L'équipe RÉCUPÉO</p>`
}
