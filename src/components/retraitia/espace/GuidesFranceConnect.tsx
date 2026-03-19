'use client'
import { useState } from 'react'

interface GuidesFranceConnectProps {
  /** Filtrer sur un site spécifique (ancre depuis email) */
  initialOpen?: string
}

interface SiteGuide {
  id: string
  site: string
  url: string
  icon: string
  documents: Array<{
    label: string
    steps: string[]
    tip?: string
  }>
  connexion: string[]
  mdpOublie?: string[]
}

const GUIDES: SiteGuide[] = [
  {
    id: 'info-retraite',
    site: 'info-retraite.fr',
    url: 'https://www.info-retraite.fr',
    icon: '📊',
    connexion: [
      `Allez sur info-retraite.fr`,
      `Cliquez sur « J'accède à mon compte retraite »`,
      `Cliquez sur « S'identifier avec FranceConnect »`,
      `Choisissez votre service (Ameli, impots.gouv…)`,
      `Entrez vos identifiants habituels`,
    ],
    documents: [
      {
        label: 'Relevé de carrière (RIS)',
        steps: [
          `Menu « Ma carrière »`,
          `Cliquez sur « Mon relevé de carrière » ou « Consulter mon relevé »`,
          `Cliquez sur « Télécharger » ou « Enregistrer en PDF »`,
          `Le fichier PDF se télécharge sur votre appareil`,
        ],
      },
      {
        label: 'Estimation Indicative Globale (EIG)',
        steps: [
          `Menu « Ma future retraite »`,
          `Cliquez sur « Mon estimation retraite »`,
          `Téléchargez le PDF`,
        ],
        tip: `Disponible uniquement si vous avez 55 ans ou plus`,
      },
      {
        label: 'Attestation fiscale',
        steps: [
          `Menu « Ma retraite »`,
          `Cliquez sur « Mes attestations »`,
          `Téléchargez le PDF`,
        ],
      },
    ],
  },
  {
    id: 'lassuranceretraite',
    site: 'lassuranceretraite.fr',
    url: 'https://www.lassuranceretraite.fr',
    icon: '🏛️',
    connexion: [
      `Allez sur lassuranceretraite.fr`,
      `Cliquez sur « Mon compte retraite » en haut à droite`,
      `Cliquez sur « S'identifier avec FranceConnect »`,
      `Choisissez votre service et connectez-vous`,
    ],
    documents: [
      {
        label: 'Notification de pension',
        steps: [
          `Menu « Mon compte » puis « Mes documents »`,
          `Cherchez « Notification de retraite » ou « Titre de pension »`,
          `Téléchargez le PDF`,
        ],
        tip: `C'est le document le plus important après le RIS — il contient le détail du calcul de votre pension`,
      },
      {
        label: 'Relevé de mensualités',
        steps: [
          `Menu « Mon compte » puis « Mes paiements »`,
          `Cliquez sur « Télécharger un relevé de mensualités »`,
          `Choisissez la période souhaitée`,
        ],
      },
    ],
  },
  {
    id: 'agirc-arrco',
    site: 'agirc-arrco.fr',
    url: 'https://www.agirc-arrco.fr',
    icon: '📈',
    connexion: [
      `Allez sur agirc-arrco.fr`,
      `Cliquez sur « Mon espace personnel »`,
      `Cliquez sur « Se connecter avec FranceConnect »`,
      `Choisissez votre service et connectez-vous`,
    ],
    documents: [
      {
        label: 'Relevé de points',
        steps: [
          `Menu « Mon compte » puis « Mes relevés »`,
          `Cliquez sur « Relevé de points »`,
          `Téléchargez le PDF`,
        ],
      },
      {
        label: 'Relevé de paiements',
        steps: [
          `Menu « Mon compte » puis « Mes paiements »`,
          `Téléchargez le relevé souhaité`,
        ],
      },
    ],
  },
  {
    id: 'impots',
    site: 'impots.gouv.fr',
    url: 'https://www.impots.gouv.fr',
    icon: '💼',
    connexion: [
      `Allez sur impots.gouv.fr`,
      `Cliquez sur « Votre espace particulier »`,
      `Cliquez sur « Se connecter avec FranceConnect » (en bas du formulaire)`,
      `Choisissez votre service et connectez-vous`,
    ],
    documents: [
      {
        label: `Avis d'imposition`,
        steps: [
          `Menu « Documents »`,
          `Cherchez « Avis de situation déclarative » ou « Avis d'imposition »`,
          `Cliquez sur l'année la plus récente`,
          `Téléchargez le PDF`,
        ],
        tip: `Prenez le dernier avis disponible — nous avons besoin du RFR (Revenu Fiscal de Référence)`,
      },
    ],
  },
  {
    id: 'msa',
    site: 'msa.fr',
    url: 'https://www.msa.fr',
    icon: '🌾',
    connexion: [
      `Allez sur msa.fr`,
      `Cliquez sur « Mon espace privé »`,
      `Cliquez sur « Se connecter avec FranceConnect »`,
      `Choisissez votre service et connectez-vous`,
    ],
    documents: [
      {
        label: 'RIS agricole / Notification MSA',
        steps: [
          `Menu « Ma retraite »`,
          `Cherchez « Mon relevé de carrière » ou « Ma notification »`,
          `Téléchargez le PDF`,
        ],
      },
    ],
  },
  {
    id: 'ensap',
    site: 'ensap.gouv.fr',
    url: 'https://ensap.gouv.fr',
    icon: '🏛️',
    connexion: [
      `Allez sur ensap.gouv.fr`,
      `Cliquez sur « Se connecter »`,
      `Utilisez FranceConnect pour vous identifier`,
    ],
    documents: [
      {
        label: 'Titre de pension (Fonction publique État)',
        steps: [
          `Menu « Ma retraite »`,
          `Cliquez sur « Mes documents » ou « Mon titre de pension »`,
          `Téléchargez le PDF`,
        ],
      },
    ],
  },
  {
    id: 'cnracl',
    site: 'cnracl.retraites.fr',
    url: 'https://www.cnracl.retraites.fr',
    icon: '🏥',
    connexion: [
      `Allez sur cnracl.retraites.fr`,
      `Cliquez sur « Mon espace retraité »`,
      `Connectez-vous avec FranceConnect`,
    ],
    documents: [
      {
        label: 'Titre de pension (Territoriale / Hospitalière)',
        steps: [
          `Menu « Mes documents »`,
          `Cherchez « Notification de pension » ou « Titre de pension »`,
          `Téléchargez le PDF`,
        ],
      },
    ],
  },
]

export function GuidesFranceConnect({ initialOpen }: GuidesFranceConnectProps) {
  const [openSite, setOpenSite] = useState<string | null>(initialOpen || null)

  return (
    <div>
      <h2 className="font-bold text-slate-900 text-base mb-1">📖 Guides par site</h2>
      <p className="text-xs text-slate-500 mb-4">
        Cliquez sur un site pour voir comment vous connecter et récupérer vos documents.
      </p>

      <div className="space-y-2">
        {GUIDES.map(guide => (
          <div key={guide.id} className="border border-slate-200 rounded-xl overflow-hidden">
            {/* Header cliquable */}
            <button
              onClick={() => setOpenSite(openSite === guide.id ? null : guide.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{guide.icon}</span>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{guide.site}</p>
                  <p className="text-xs text-slate-400">
                    {guide.documents.map(d => d.label).join(' · ')}
                  </p>
                </div>
              </div>
              <span className="text-slate-300 text-sm">{openSite === guide.id ? '▲' : '▼'}</span>
            </button>

            {/* Contenu déplié */}
            {openSite === guide.id && (
              <div className="px-4 pb-4 border-t border-slate-100">
                {/* Connexion */}
                <div className="mt-3 mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Connexion</p>
                  <div className="space-y-1.5">
                    {guide.connexion.map((step, i) => (
                      <div key={i} className="flex gap-2 items-start text-sm text-slate-700">
                        <span className="flex-none w-5 h-5 rounded-full bg-emerald/10 text-emerald text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <p>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                {guide.documents.map((doc, di) => (
                  <div key={di} className="mb-3 bg-slate-50 rounded-lg p-3">
                    <p className="font-medium text-slate-800 text-sm mb-2">📄 {doc.label}</p>
                    <div className="space-y-1.5">
                      {doc.steps.map((step, si) => (
                        <p key={si} className="text-xs text-slate-600">→ {step}</p>
                      ))}
                    </div>
                    {doc.tip && (
                      <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded">💡 {doc.tip}</p>
                    )}
                  </div>
                ))}

                {/* Lien vers le site */}
                <a
                  href={guide.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1 text-xs text-emerald font-medium hover:underline"
                >
                  Ouvrir {guide.site} →
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
