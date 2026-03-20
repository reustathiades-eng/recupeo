// ============================================================
// RÉCUPÉO — Analytics / Event Tracking (partagé)
// ============================================================
// Envoie des événements à Google Analytics 4 (gtag) si configuré.
// Silencieux si GA n'est pas chargé — jamais bloquant.
//
// Pour activer : ajouter NEXT_PUBLIC_GA_ID=G-XXXXXXX dans .env
// et le script GA dans layout.tsx
// ============================================================

/** Types d'événements trackés */
export type TrackEvent =
  // Formulaire
  | 'form_started'
  | 'form_step_completed'
  | 'form_submitted'
  // Pré-diagnostic
  | 'prediag_generated'
  | 'prediag_email_sent'
  // Engagement
  | 'base_nette_filled'
  | 'assistant_6675m_viewed'
  | 'assistant_6675m_copied'
  | 'cross_sell_clicked'
  // Conversion
  | 'paywall_viewed'
  | 'purchase_clicked'
  | 'report_generated'
  | 'pdf_downloaded'
  // Print
  | 'prediag_printed'
  // Upload
  | 'upload_started'
  | 'upload_completed'
  // Extraction 6675-M
  | 'extraction_success'
  | 'ocr_low_confidence'
  | '6675m_extraction_prefill'
  // Check (MonLoyer)
  | 'check_completed'
  // Auth (Compte Client)
  | 'magic_link_requested'
  | 'account_created'
  | 'login'
  | 'logout'
  // Mon espace
  | 'dashboard_viewed'
  | 'mes_diagnostics_viewed'
  | 'mes_documents_viewed'
  | 'mes_demarches_viewed'
  // MAPAIE
  | 'mapaie_cta_click'
  | 'mapaie_form_started'
  | 'mapaie_upload_started'
  | 'mapaie_upload_completed'
  | 'mapaie_prediag_generated'
  | 'mapaie_paywall_viewed'
  | 'mapaie_purchase_clicked'
  | 'mapaie_report_generated'
  | 'mapaie_pdf_downloaded'
  | 'mapaie_reclamation_generated'
  | 'mapaie_form_submit'
  | 'mapaie_plan_select'
  | 'mapaie_checkout_start'
  | 'parrainage_viewed'
  | 'profil_viewed'
  | 'diagnostic_viewed'
  | 'document_downloaded'
  | 'demarche_updated'
  | 'montant_recupere_declared'
  | 'profile_updated'
  | 'recommendation_clicked'
  // Parrainage
  | 'referral_link_copied'
  | 'referral_shared'
  // RGPD
  | 'rgpd_export'
  | 'account_deletion_requested'
  // Chat IA
  | 'chat_opened'
  | 'chat_closed'
  | 'chat_message_sent'
  | 'chat_cta_clicked'
  | 'chat_suggestion_clicked'
  | 'chat_rate_limited'
  // Avis clients
  | 'review_submitted'
  | 'review_montant_declared'
  | 'review_carousel_viewed'
  | 'review_section_viewed'
  // Partage social
  | 'share_initiated'
  | 'share_completed'
  | 'share_wall_viewed'

interface TrackParams {
  event: TrackEvent
  brique: string
  [key: string]: string | number | boolean | undefined
}

/**
 * Envoie un événement de tracking.
 * Supporte : Google Analytics 4 (gtag), console.log en dev.
 */
export function track(params: TrackParams): void {
  const { event, ...rest } = params

  // Dev logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[TRACK] ${event}`, rest)
  }

  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, {
      event_category: rest.brique,
      ...rest,
    })
  }

  // Plausible (si intégré plus tard)
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible(event, { props: rest })
  }
}

/**
 * Alias simplifié pour le tracking d'événements custom (sans brique obligatoire).
 * Utilisé par le flash RETRAITIA et les pages autonomes.
 */
export function trackEvent(event: string, data?: Record<string, string | number | boolean | undefined>): void {
  track({ event: event as TrackEvent, brique: 'retraitia', ...data })
}
