// ============================================================
// RÉCUPÉO — Client email Brevo (partagé entre briques)
// ============================================================
// Envoie des emails transactionnels via l'API Brevo.
// Nécessite BREVO_API_KEY dans .env
// ============================================================

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

interface EmailOptions {
  to: string
  toName?: string
  subject: string
  htmlContent: string
  tags?: string[]
}

/**
 * Envoie un email transactionnel via Brevo.
 * Retourne true si envoyé, false sinon (silencieux — jamais bloquant).
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.warn('[EMAIL] BREVO_API_KEY non configurée — email non envoyé')
    return false
  }

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'RÉCUPÉO', email: 'contact@recupeo.fr' },
        to: [{ email: options.to, name: options.toName || options.to }],
        subject: options.subject,
        htmlContent: options.htmlContent,
        tags: options.tags || [],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[EMAIL] Erreur Brevo:', res.status, err)
      return false
    }

    console.log(`[EMAIL] Envoyé à ${options.to} — ${options.subject}`)
    return true
  } catch (err) {
    console.error('[EMAIL] Erreur envoi:', err instanceof Error ? err.message : err)
    return false
  }
}

// ─── Templates HTML ───

const HEADER = `
<div style="background:#0B1426;padding:24px 32px;text-align:center;">
  <span style="color:#00D68F;font-size:22px;font-weight:800;letter-spacing:-0.5px;">RÉCUPÉO</span>
  <span style="color:rgba(255,255,255,0.4);font-size:12px;margin-left:8px;">recupeo.fr</span>
</div>`

const FOOTER = `
<div style="margin-top:32px;padding:20px 32px;background:#F7F9FC;border-top:1px solid #E2E8F0;text-align:center;font-size:11px;color:#64748B;">
  <p>RÉCUPÉO — L'IA qui récupère ce qu'on vous doit</p>
  <p>Données traitées conformément au RGPD · <a href="https://recupeo.fr" style="color:#00D68F;">recupeo.fr</a></p>
</div>`

/**
 * Template : Récapitulatif pré-diagnostic MATAXE
 */
export function buildMataxeRecapEmail(data: {
  anomaliesCount: number
  impactAnnualMin: number
  impactAnnualMax: number
  impact4Years: number
  reliabilityLevel: string
  reliabilityScore: number
  anomalies: Array<{ title: string; impactAnnualMax: number; confidence: number }>
  commune: string
  diagnosticId: string
}): string {
  const anomalyRows = data.anomalies.map(a =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;font-size:13px;color:#1E293B;">${a.title}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;font-size:13px;color:#00D68F;font-weight:600;text-align:right;">+${a.impactAnnualMax}€/an</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;font-size:12px;color:#64748B;text-align:center;">${a.confidence}%</td>
    </tr>`
  ).join('')

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F7F9FC;">
<div style="max-width:600px;margin:0 auto;background:#FFFFFF;">
  ${HEADER}

  <div style="padding:32px;">
    <h1 style="font-size:22px;color:#1E293B;margin:0 0 8px;">Votre pré-diagnostic taxe foncière</h1>
    <p style="font-size:14px;color:#64748B;margin:0 0 24px;">Commune : ${data.commune} · Fiabilité : ${data.reliabilityScore}% (${data.reliabilityLevel})</p>

    <!-- Stats -->
    <div style="background:#F0FDF9;border:1px solid rgba(0,214,143,0.2);border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
      <div style="font-size:14px;color:#64748B;margin-bottom:4px;">${data.anomaliesCount} anomalie(s) détectée(s)</div>
      <div style="font-size:36px;font-weight:800;color:#00D68F;margin-bottom:4px;">~${data.impact4Years}€</div>
      <div style="font-size:12px;color:#64748B;">remboursement potentiel sur 4 ans</div>
    </div>

    <!-- Anomalies -->
    ${data.anomaliesCount > 0 ? `
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr style="background:#F7F9FC;">
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748B;text-transform:uppercase;">Anomalie</th>
        <th style="padding:8px 12px;text-align:right;font-size:11px;color:#64748B;text-transform:uppercase;">Impact</th>
        <th style="padding:8px 12px;text-align:center;font-size:11px;color:#64748B;text-transform:uppercase;">Confiance</th>
      </tr>
      ${anomalyRows}
    </table>` : ''}

    <!-- CTA -->
    <div style="text-align:center;margin:24px 0;">
      <a href="https://recupeo.fr/mataxe" style="display:inline-block;background:#00D68F;color:#0B1426;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;">
        Obtenir le rapport complet — 49€
      </a>
    </div>

    <!-- 6675-M reminder -->
    <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:10px;padding:16px;margin-top:16px;">
      <p style="font-size:13px;color:#92400E;margin:0 0 8px;font-weight:600;">💡 Améliorez la précision de votre diagnostic</p>
      <p style="font-size:12px;color:#92400E;margin:0;">Demandez gratuitement votre formulaire 6675-M aux impôts fonciers de ${data.commune}. Avec ce document, notre diagnostic passe à 95% de fiabilité. <a href="https://recupeo.fr/mataxe" style="color:#00D68F;font-weight:600;">En savoir plus →</a></p>
    </div>
  </div>

  ${FOOTER}
</div>
</body></html>`
}

// ─── Template : Récapitulatif pré-diagnostic MACAUTION ───

export function buildMacautionRecapEmail(data: {
  anomaliesCount: number
  estimatedAmount: number
  riskLevel: string
  anomalies: Array<{ title: string; amount: number; severity: string }>
  diagnosticId: string
}): string {
  const anomalyRows = data.anomalies.map(a =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;font-size:13px;color:#1E293B;">${a.title}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;font-size:13px;color:#00D68F;font-weight:600;text-align:right;">${a.amount}€</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;font-size:12px;color:#64748B;text-align:center;">${a.severity === 'confirmed' ? 'Confirmé' : 'Probable'}</td>
    </tr>`
  ).join('')

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F7F9FC;">
<div style="max-width:600px;margin:0 auto;background:#FFFFFF;">
  ${HEADER}
  <div style="padding:32px;">
    <h1 style="font-size:22px;color:#1E293B;margin:0 0 8px;">Votre pré-diagnostic caution</h1>
    <p style="font-size:14px;color:#64748B;margin:0 0 24px;">Risque : ${data.riskLevel === 'high' ? 'Élevé' : data.riskLevel === 'medium' ? 'Moyen' : 'Faible'}</p>

    <div style="background:#F0FDF9;border:1px solid rgba(0,214,143,0.2);border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
      <div style="font-size:14px;color:#64748B;margin-bottom:4px;">${data.anomaliesCount} anomalie(s) détectée(s)</div>
      <div style="font-size:36px;font-weight:800;color:#00D68F;margin-bottom:4px;">~${data.estimatedAmount}€</div>
      <div style="font-size:12px;color:#64748B;">montant récupérable estimé</div>
    </div>

    ${data.anomaliesCount > 0 ? `
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr style="background:#F7F9FC;">
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748B;text-transform:uppercase;">Anomalie</th>
        <th style="padding:8px 12px;text-align:right;font-size:11px;color:#64748B;text-transform:uppercase;">Montant</th>
        <th style="padding:8px 12px;text-align:center;font-size:11px;color:#64748B;text-transform:uppercase;">Fiabilité</th>
      </tr>
      ${anomalyRows}
    </table>` : ''}

    <div style="text-align:center;margin:24px 0;">
      <a href="https://recupeo.fr/macaution" style="display:inline-block;background:#00D68F;color:#0B1426;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;">
        Obtenir le rapport + courriers — 29€
      </a>
    </div>

    <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:10px;padding:16px;margin-top:16px;">
      <p style="font-size:13px;color:#92400E;margin:0 0 8px;font-weight:600;">📋 Prochaine étape</p>
      <p style="font-size:12px;color:#92400E;margin:0;">Le rapport complet inclut 3 courriers de réclamation personnalisés prêts à envoyer (mise en demeure, saisine CDC, signalement préfecture).</p>
    </div>
  </div>
  ${FOOTER}
</div>
</body></html>`
}

// ─── Template : Récapitulatif pré-diagnostic RETRAITIA ───

export function buildRetraitiaRecapEmail(data: {
  anomaliesCount: number
  impactMonthlyMin: number
  impactMonthlyMax: number
  impactLifetime: number
  riskLevel: string
  anomalies: Array<{ title: string; impactMonthlyMax: number; severity: string }>
  diagnosticId: string
}): string {
  const anomalyRows = data.anomalies.map(a =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;font-size:13px;color:#1E293B;">${a.title}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;font-size:13px;color:#00D68F;font-weight:600;text-align:right;">+${a.impactMonthlyMax}€/mois</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;font-size:12px;color:#64748B;text-align:center;">${a.severity === 'confirmed' ? 'Confirmé' : 'Probable'}</td>
    </tr>`
  ).join('')

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F7F9FC;">
<div style="max-width:600px;margin:0 auto;background:#FFFFFF;">
  ${HEADER}
  <div style="padding:32px;">
    <h1 style="font-size:22px;color:#1E293B;margin:0 0 8px;">Votre pré-diagnostic retraite</h1>
    <p style="font-size:14px;color:#64748B;margin:0 0 24px;">Risque : ${data.riskLevel === 'high' ? 'Élevé' : data.riskLevel === 'medium' ? 'Moyen' : 'Faible'}</p>

    <div style="background:#F0FDF9;border:1px solid rgba(0,214,143,0.2);border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
      <div style="font-size:14px;color:#64748B;margin-bottom:4px;">${data.anomaliesCount} anomalie(s) détectée(s)</div>
      <div style="font-size:36px;font-weight:800;color:#00D68F;margin-bottom:4px;">~${data.impactLifetime}€</div>
      <div style="font-size:12px;color:#64748B;">impact cumulé sur la durée de la retraite</div>
      <div style="font-size:13px;color:#1E293B;margin-top:8px;">soit ${data.impactMonthlyMin}–${data.impactMonthlyMax}€/mois en plus</div>
    </div>

    ${data.anomaliesCount > 0 ? `
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr style="background:#F7F9FC;">
        <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748B;text-transform:uppercase;">Anomalie</th>
        <th style="padding:8px 12px;text-align:right;font-size:11px;color:#64748B;text-transform:uppercase;">Impact</th>
        <th style="padding:8px 12px;text-align:center;font-size:11px;color:#64748B;text-transform:uppercase;">Fiabilité</th>
      </tr>
      ${anomalyRows}
    </table>` : ''}

    <div style="text-align:center;margin:24px 0;">
      <a href="https://recupeo.fr/retraitia" style="display:inline-block;background:#00D68F;color:#0B1426;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;">
        Obtenir le rapport complet — à partir de 79€
      </a>
    </div>

    <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:10px;padding:16px;margin-top:16px;">
      <p style="font-size:13px;color:#92400E;margin:0 0 8px;font-weight:600;">📄 Conseil</p>
      <p style="font-size:12px;color:#92400E;margin:0;">Demandez votre Relevé Individuel de Situation (RIS) sur <a href="https://info-retraite.fr" style="color:#00D68F;font-weight:600;">info-retraite.fr</a> pour un diagnostic encore plus précis.</p>
    </div>
  </div>
  ${FOOTER}
</div>
</body></html>`
}

// ─── Template : Récapitulatif vérification MONLOYER ───

export function buildMonloyerRecapEmail(data: {
  status: string
  currentRent: number
  referenceRentMajore: number
  excessMonthly: number
  totalRecoverable: number
  monthsSinceBail: number
  territory: string
  diagnosticId: string
}): string {
  const isExcess = data.status !== 'conforme'
  const statusLabel = isExcess ? 'Loyer excessif détecté' : 'Loyer conforme'
  const statusColor = isExcess ? '#EF4444' : '#00D68F'

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F7F9FC;">
<div style="max-width:600px;margin:0 auto;background:#FFFFFF;">
  ${HEADER}
  <div style="padding:32px;">
    <h1 style="font-size:22px;color:#1E293B;margin:0 0 8px;">Votre vérification de loyer</h1>
    <p style="font-size:14px;color:${statusColor};font-weight:600;margin:0 0 24px;">${statusLabel}</p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;font-size:13px;color:#64748B;">Votre loyer HC</td>
          <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;font-size:14px;color:#1E293B;text-align:right;font-weight:600;">${data.currentRent}€/mois</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;font-size:13px;color:#64748B;">Plafond légal (ref. majorée)</td>
          <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;font-size:14px;color:#1E293B;text-align:right;font-weight:600;">${data.referenceRentMajore}€/mois</td></tr>
      ${isExcess ? `
      <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;font-size:13px;color:#64748B;">Trop-perçu mensuel</td>
          <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;font-size:14px;color:#EF4444;text-align:right;font-weight:700;">${data.excessMonthly}€/mois</td></tr>
      ` : ''}
      <tr><td style="padding:10px 0;font-size:13px;color:#64748B;">Zone</td>
          <td style="padding:10px 0;font-size:14px;color:#1E293B;text-align:right;">${data.territory}</td></tr>
    </table>

    ${isExcess ? `
    <div style="background:#F0FDF9;border:1px solid rgba(0,214,143,0.2);border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
      <div style="font-size:14px;color:#64748B;margin-bottom:4px;">Remboursement estimé (${data.monthsSinceBail} mois)</div>
      <div style="font-size:36px;font-weight:800;color:#00D68F;margin-bottom:4px;">~${data.totalRecoverable}€</div>
      <div style="font-size:12px;color:#64748B;">+ baisse de loyer immédiate de ${data.excessMonthly}€/mois</div>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="https://recupeo.fr/monloyer" style="display:inline-block;background:#00D68F;color:#0B1426;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;">
        Obtenir les courriers de réclamation — 29€
      </a>
    </div>
    ` : `
    <div style="background:#F0FDF9;border:1px solid rgba(0,214,143,0.2);border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="font-size:14px;color:#1E293B;margin:0;">✅ Votre loyer est dans les limites légales de l'encadrement des loyers.</p>
    </div>
    `}

    <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:10px;padding:16px;margin-top:16px;">
      <p style="font-size:13px;color:#92400E;margin:0 0 8px;font-weight:600;">💡 Le saviez-vous ?</p>
      <p style="font-size:12px;color:#92400E;margin:0;">Vous pouvez aussi vérifier votre taxe foncière ou votre dépôt de garantie. <a href="https://recupeo.fr" style="color:#00D68F;font-weight:600;">Voir tous nos outils →</a></p>
    </div>
  </div>
  ${FOOTER}
</div>
</body></html>`
}

// ─── Template : Rapport prêt (post-paiement, toutes briques) ───

export function buildReportReadyEmail(data: {
  brique: string
  briqueName: string
  diagnosticId: string
  reportUrl: string
}): string {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F7F9FC;">
<div style="max-width:600px;margin:0 auto;background:#FFFFFF;">
  ${HEADER}
  <div style="padding:32px;text-align:center;">
    <div style="font-size:48px;margin-bottom:16px;">✅</div>
    <h1 style="font-size:22px;color:#1E293B;margin:0 0 8px;">Votre rapport ${data.briqueName} est prêt</h1>
    <p style="font-size:14px;color:#64748B;margin:0 0 32px;">Merci pour votre confiance. Votre rapport complet est disponible.</p>

    <a href="${data.reportUrl}" style="display:inline-block;background:#00D68F;color:#0B1426;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;">
      Consulter mon rapport
    </a>

    <p style="font-size:12px;color:#64748B;margin-top:24px;">Ce lien est valable 30 jours. Pensez à télécharger votre rapport en PDF.</p>
  </div>
  ${FOOTER}
</div>
</body></html>`
}

// ─── Template : Rapport MONIMPOT enrichi (post-paiement) ───

export function buildMonimpotReportEmail(data: {
  diagnosticId: string
  reportUrl: string
  economieAnnuelle: number
  economie3ans: number
  nbOptimisations: number
  plan: string
}): string {
  const fmtNum = (n: number) => new Intl.NumberFormat('fr-FR', { useGrouping: true }).format(n).replace(/\u00A0/g, ' ')
  const isMultiYear = data.plan === 'premium'

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F7F9FC;">
<div style="max-width:600px;margin:0 auto;background:#FFFFFF;">
  ${HEADER}
  <div style="padding:32px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:48px;margin-bottom:12px;">🎯</div>
      <h1 style="font-size:22px;color:#1E293B;margin:0 0 8px;">Votre audit fiscal est prêt</h1>
      <p style="font-size:14px;color:#64748B;margin:0;">Votre rapport complet et votre réclamation pré-remplie vous attendent.</p>
    </div>

    <!-- Résumé économie -->
    <div style="background:linear-gradient(135deg,#F0FDF4,#DCFCE7);border:1px solid #BBF7D0;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="font-size:13px;color:#166534;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Économie estimée</p>
      <p style="font-size:36px;color:#15803D;margin:0;font-weight:800;">${fmtNum(data.economieAnnuelle)} €<span style="font-size:16px;font-weight:400;">/an</span></p>
      ${isMultiYear ? `<p style="font-size:14px;color:#166534;margin:8px 0 0;">soit <strong>${fmtNum(data.economie3ans)} € sur 3 ans</strong></p>` : ''}
      <p style="font-size:12px;color:#166534;margin:8px 0 0;">${data.nbOptimisations} optimisation${data.nbOptimisations > 1 ? 's' : ''} identifiée${data.nbOptimisations > 1 ? 's' : ''}</p>
    </div>

    <!-- Contenu rapport -->
    <div style="background:#F8FAFC;border-radius:10px;padding:20px;margin-bottom:24px;">
      <p style="font-size:14px;color:#1E293B;margin:0 0 12px;font-weight:600;">Votre rapport contient :</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;font-size:13px;color:#64748B;">📊 Rapport détaillé</td><td style="padding:6px 0;font-size:13px;color:#15803D;text-align:right;font-weight:600;">+ PDF</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#64748B;">📝 Guide correction impots.gouv</td><td style="padding:6px 0;font-size:13px;color:#15803D;text-align:right;font-weight:600;">Étape par étape</td></tr>
        <tr><td style="padding:6px 0;font-size:13px;color:#64748B;">📄 Réclamation pré-remplie</td><td style="padding:6px 0;font-size:13px;color:#15803D;text-align:right;font-weight:600;">+ PDF</td></tr>
      </table>
    </div>

    <div style="text-align:center;margin-bottom:24px;">
      <a href="${data.reportUrl}" style="display:inline-block;background:#00D68F;color:#0B1426;padding:16px 40px;border-radius:12px;font-weight:700;font-size:16px;text-decoration:none;">
        Consulter mon rapport →
      </a>
    </div>

    <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:10px;padding:16px;">
      <p style="font-size:13px;color:#92400E;margin:0 0 4px;font-weight:600;">⏰ Prochaine étape</p>
      <p style="font-size:12px;color:#92400E;margin:0;">Téléchargez vos PDF depuis le rapport, puis suivez le guide pour corriger votre déclaration sur <strong>impots.gouv.fr</strong>. La correction en ligne est ouverte d'août à décembre.</p>
    </div>
  </div>
  ${FOOTER}
</div>
</body></html>`
}
