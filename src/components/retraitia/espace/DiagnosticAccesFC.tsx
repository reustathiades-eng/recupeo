'use client'
import { useState } from 'react'

type FCProvider = 'ameli' | 'impots' | 'laposte' | 'msa' | 'france_identite' | 'aucun'
type Step = 'provider' | 'password' | 'guide_mdp' | 'guide_creation' | 'france_services' | 'done'

interface DiagnosticAccesFCProps {
  onComplete: () => void
  onNeedHelp?: () => void // ouvre le magic link proche
}

const PROVIDERS: Array<{ id: FCProvider; label: string; icon: string }> = [
  { id: 'ameli', label: 'Ameli.fr (Assurance Maladie)', icon: '🏥' },
  { id: 'impots', label: 'Impots.gouv.fr', icon: '💼' },
  { id: 'laposte', label: 'La Poste (Identité Numérique)', icon: '📮' },
  { id: 'msa', label: 'MSA (agriculteurs)', icon: '🌾' },
  { id: 'france_identite', label: 'France Identité (application)', icon: '📱' },
  { id: 'aucun', label: 'Aucun de ces services', icon: '❌' },
]

export function DiagnosticAccesFC({ onComplete, onNeedHelp }: DiagnosticAccesFCProps) {
  const [step, setStep] = useState<Step>('provider')
  const [provider, setProvider] = useState<FCProvider | null>(null)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">📡</div>
        <div>
          <h2 className="font-bold text-slate-900 text-base">Vos accès en ligne</h2>
          <p className="text-xs text-slate-500">Première étape avant de récupérer vos documents</p>
        </div>
      </div>

      {/* Étape 1 : Quel fournisseur ? */}
      {step === 'provider' && (
        <div>
          <p className="text-sm text-slate-700 mb-3">
            Tous vos documents retraite sont accessibles via <strong>FranceConnect</strong>. Si vous avez un compte sur l'un de ces services, vous avez déjà FranceConnect.
          </p>
          <p className="text-sm font-medium text-slate-800 mb-3">Avez-vous un compte sur l'un de ces services ?</p>
          <div className="space-y-2">
            {PROVIDERS.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setProvider(p.id)
                  if (p.id === 'aucun') {
                    setStep('guide_creation')
                  } else {
                    setStep('password')
                  }
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all text-sm
                  ${provider === p.id
                    ? 'border-emerald bg-emerald/5 text-slate-900'
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
              >
                <span className="text-lg">{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Étape 2 : Mot de passe connu ? */}
      {step === 'password' && provider && provider !== 'aucun' && (
        <div>
          <p className="text-sm text-slate-700 mb-3">
            Vous avez un compte <strong>{PROVIDERS.find(p => p.id === provider)?.label}</strong>.
          </p>
          <p className="text-sm font-medium text-slate-800 mb-3">Connaissez-vous votre mot de passe ?</p>
          <div className="flex gap-3">
            <button
              onClick={() => { setStep('done'); onComplete() }}
              className="flex-1 py-3 rounded-xl font-semibold text-sm bg-emerald text-[#060D1B] hover:bg-emerald-dark transition-colors"
            >
              ✅ Oui, je le connais
            </button>
            <button
              onClick={() => setStep('guide_mdp')}
              className="flex-1 py-3 rounded-xl font-medium text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              ❌ Non, oublié
            </button>
          </div>
        </div>
      )}

      {/* Guide mot de passe oublié */}
      {step === 'guide_mdp' && provider && (
        <div>
          <h3 className="font-bold text-slate-900 text-sm mb-3">
            🔑 Retrouver votre mot de passe {PROVIDERS.find(p => p.id === provider)?.label}
          </h3>
          <GuideMdp provider={provider} />
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => { setStep('done'); onComplete() }}
              className="flex-1 py-3 rounded-xl font-semibold text-sm bg-emerald text-[#060D1B] hover:bg-emerald-dark transition-colors"
            >
              ✅ C'est fait, j'ai retrouvé mon accès
            </button>
            <button
              onClick={() => setStep('guide_creation')}
              className="py-3 px-4 rounded-xl font-medium text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Ça ne marche pas
            </button>
          </div>
        </div>
      )}

      {/* Guide création de compte */}
      {step === 'guide_creation' && (
        <div>
          <h3 className="font-bold text-slate-900 text-sm mb-2">
            📱 Créer un compte FranceConnect
          </h3>
          <p className="text-xs text-slate-500 mb-3">Le plus simple : créer un compte Ameli (5 minutes)</p>

          <GuideCreation />

          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={() => { setStep('done'); onComplete() }}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-emerald text-[#060D1B] hover:bg-emerald-dark transition-colors"
            >
              ✅ C'est fait, mon compte est créé
            </button>
            <button
              onClick={() => setStep('france_services')}
              className="w-full py-3 rounded-xl font-medium text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Je n'y arrive pas
            </button>
            {onNeedHelp && (
              <button
                onClick={onNeedHelp}
                className="w-full py-2 text-xs text-emerald font-medium hover:underline"
              >
                Un proche peut m'aider →
              </button>
            )}
          </div>
        </div>
      )}

      {/* France Services (dernier recours) */}
      {step === 'france_services' && (
        <div>
          <h3 className="font-bold text-slate-900 text-sm mb-2">
            🏢 France Services — Un conseiller vous aide sur place
          </h3>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 mb-3">
            <p className="mb-2">Il existe <strong>2 800 espaces France Services</strong> en France. Un conseiller peut vous aider à créer vos comptes en ligne <strong>gratuitement</strong>.</p>
            <a
              href="https://www.france-services.gouv.fr/demarches-et-services/trouver-une-france-services"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 font-semibold text-blue-700 underline"
            >
              🔍 Trouver l'espace le plus proche
            </a>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 mb-3">
            <p className="font-medium mb-1">Ce qu'il faut apporter :</p>
            <p>✓ Pièce d'identité (carte d'identité ou passeport)</p>
            <p>✓ Carte Vitale</p>
            <p>✓ Dernier avis d'imposition (si vous l'avez)</p>
            <p>✓ Téléphone mobile</p>
            <p>✓ Adresse email</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setStep('done'); onComplete() }}
              className="flex-1 py-3 rounded-xl font-semibold text-sm bg-emerald text-[#060D1B] hover:bg-emerald-dark transition-colors"
            >
              ✅ C'est fait
            </button>
            {onNeedHelp && (
              <button
                onClick={onNeedHelp}
                className="py-3 px-4 rounded-xl font-medium text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Un proche peut m'aider
              </button>
            )}
          </div>
        </div>
      )}

      {/* Terminé */}
      {step === 'done' && (
        <div className="text-center py-4">
          <div className="text-3xl mb-2">✅</div>
          <p className="font-bold text-slate-900 text-sm">Accès FranceConnect vérifié</p>
          <p className="text-xs text-slate-500 mt-1">Vous pouvez maintenant récupérer vos documents</p>
        </div>
      )}

      {/* Bouton retour */}
      {step !== 'provider' && step !== 'done' && (
        <button
          onClick={() => setStep(step === 'password' ? 'provider' : step === 'guide_mdp' ? 'password' : 'provider')}
          className="mt-3 text-xs text-slate-400 hover:text-slate-600"
        >
          ← Retour
        </button>
      )}
    </div>
  )
}

// ─── Guide mot de passe oublié ───

function GuideMdp({ provider }: { provider: FCProvider }) {
  const guides: Partial<Record<FCProvider, React.ReactNode>> = {
    ameli: (
      <div className="space-y-2 text-sm text-slate-700">
        <Step n={1}>Allez sur <strong>ameli.fr</strong></Step>
        <Step n={2}>Cliquez sur « Mon compte ameli » en haut à droite</Step>
        <Step n={3}>Cliquez sur « Mot de passe oublié »</Step>
        <Step n={4}>Entrez votre numéro de sécurité sociale</Step>
        <Step n={5}>Un email de réinitialisation est envoyé à votre adresse</Step>
        <Tip text="Si vous n'avez plus accès à cet email, appelez le 3646 pour le mettre à jour." />
      </div>
    ),
    impots: (
      <div className="space-y-2 text-sm text-slate-700">
        <Step n={1}>Allez sur <strong>impots.gouv.fr</strong></Step>
        <Step n={2}>Cliquez sur « Votre espace particulier »</Step>
        <Step n={3}>Cliquez sur « Mot de passe oublié »</Step>
        <Step n={4}>Entrez votre numéro fiscal (13 chiffres, sur votre avis d'imposition)</Step>
        <Step n={5}>Un lien de réinitialisation est envoyé par email</Step>
        <Tip text="Si vous n'avez plus accès à cet email, appelez le 0 809 401 401." />
      </div>
    ),
    laposte: (
      <div className="space-y-2 text-sm text-slate-700">
        <Step n={1}>Ouvrez l'application « L'Identité Numérique » sur votre téléphone</Step>
        <Step n={2}>Cliquez sur « Code oublié »</Step>
        <Step n={3}>Suivez les instructions de vérification d'identité</Step>
        <Tip text="Vous pouvez aussi vous rendre en bureau de poste avec votre pièce d'identité." />
      </div>
    ),
    msa: (
      <div className="space-y-2 text-sm text-slate-700">
        <Step n={1}>Allez sur <strong>msa.fr</strong></Step>
        <Step n={2}>Cliquez sur « Mon espace privé »</Step>
        <Step n={3}>Cliquez sur « Mot de passe oublié »</Step>
        <Step n={4}>Entrez votre numéro MSA</Step>
        <Step n={5}>Un email de réinitialisation est envoyé</Step>
      </div>
    ),
    france_identite: (
      <div className="space-y-2 text-sm text-slate-700">
        <Step n={1}>Ouvrez l'application « France Identité »</Step>
        <Step n={2}>Cliquez sur « J'ai oublié mon code »</Step>
        <Step n={3}>Re-scannez votre carte d'identité nouvelle génération</Step>
        <Tip text="Nécessite une carte d'identité post-2021 avec puce NFC." />
      </div>
    ),
  }

  return <>{guides[provider] || <p className="text-sm text-slate-500">Consultez le site du service pour réinitialiser votre mot de passe.</p>}</>
}

// ─── Guide création compte Ameli ───

function GuideCreation() {
  return (
    <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-sm text-slate-700">
      <p className="text-xs text-slate-500 font-medium">Ce dont vous avez besoin : carte Vitale + email + téléphone mobile</p>
      <Step n={1}>Allez sur <strong>ameli.fr</strong></Step>
      <Step n={2}>Cliquez sur « Mon compte ameli » puis « Créer mon compte »</Step>
      <Step n={3}>Entrez votre numéro de sécurité sociale (13 chiffres + clé, sur la carte Vitale)</Step>
      <Step n={4}>Entrez votre date de naissance et code postal</Step>
      <Step n={5}>Un code SMS est envoyé au numéro connu par l'Assurance Maladie</Step>
      <Step n={6}>Saisissez le code et choisissez un mot de passe</Step>
      <Tip text="Notez le mot de passe sur un papier et gardez-le dans un endroit sûr." />

      <div className="pt-2 border-t border-slate-200">
        <p className="text-xs text-slate-500">
          <strong>Ameli ne fonctionne pas ?</strong> Essayez avec <strong>impots.gouv.fr</strong> (numéro fiscal + revenu de référence sur votre avis d'imposition).
        </p>
      </div>
    </div>
  )
}

// ─── Helpers ───

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="flex-none w-6 h-6 rounded-full bg-emerald/10 text-emerald text-xs font-bold flex items-center justify-center">{n}</span>
      <p className="pt-0.5">{children}</p>
    </div>
  )
}

function Tip({ text }: { text: string }) {
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5 text-xs text-amber-700 ml-9">
      ⚠️ {text}
    </div>
  )
}
