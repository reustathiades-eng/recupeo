'use client'
import { useState } from 'react'

export function MataxeBaseNetteHelper() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs text-emerald hover:text-emerald-dark font-medium underline transition-colors"
      >
        {open ? 'Masquer l\'aide' : 'Où trouver la base nette sur mon avis ?'}
      </button>

      {open && (
        <div className="mt-3 p-4 bg-emerald/5 border border-emerald/20 rounded-xl">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-xl">📄</span>
            <div>
              <p className="text-sm font-semibold text-slate-text mb-1">
                Comment trouver la base nette sur votre avis
              </p>
              <p className="text-xs text-slate-muted">
                Prenez votre avis de taxe foncière (reçu en septembre). Repérez le tableau de calcul.
              </p>
            </div>
          </div>

          {/* Schéma simplifié d'un avis de TF */}
          <div className="bg-white rounded-lg p-4 border border-slate-border text-xs font-mono">
            <div className="text-center text-slate-muted mb-2 font-sans font-semibold text-[10px] uppercase">
              Extrait de votre avis de taxe foncière
            </div>
            <div className="border border-slate-border rounded">
              <div className="flex border-b border-slate-border bg-slate-bg">
                <div className="flex-1 p-1.5 text-slate-muted">Désignation</div>
                <div className="w-24 p-1.5 text-right text-slate-muted">Montant</div>
              </div>
              <div className="flex border-b border-slate-border">
                <div className="flex-1 p-1.5 text-slate-muted">Revenu cadastral</div>
                <div className="w-24 p-1.5 text-right text-slate-muted">1 250€</div>
              </div>
              <div className="flex border-b border-slate-border bg-yellow-50 border-l-4 border-l-yellow-400">
                <div className="flex-1 p-1.5 font-bold text-slate-text">
                  Base nette d&apos;imposition ← C&apos;EST CE CHIFFRE
                </div>
                <div className="w-24 p-1.5 text-right font-bold text-yellow-700">2 840€</div>
              </div>
              <div className="flex border-b border-slate-border">
                <div className="flex-1 p-1.5 text-slate-muted">Taux commune</div>
                <div className="w-24 p-1.5 text-right text-slate-muted">28,57%</div>
              </div>
              <div className="flex border-b border-slate-border">
                <div className="flex-1 p-1.5 text-slate-muted">Taux interco.</div>
                <div className="w-24 p-1.5 text-right text-slate-muted">12,43%</div>
              </div>
              <div className="flex bg-slate-bg">
                <div className="flex-1 p-1.5 font-bold text-slate-text">Total à payer</div>
                <div className="w-24 p-1.5 text-right font-bold text-slate-text">1 198€</div>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <p className="text-xs text-slate-text">
              <strong>La base nette</strong> se trouve dans le tableau de calcul de votre avis, généralement au-dessus des lignes de taux.
            </p>
            <p className="text-xs text-slate-muted">
              💡 <strong>Pourquoi c&apos;est utile ?</strong> La base nette nous permet de déduire :
              le taux exact de votre commune et la VLC retenue par l&apos;administration.
              La précision de notre diagnostic passe de ~60% à ~80%.
            </p>
            <p className="text-xs text-slate-muted">
              Pas d&apos;inquiétude si vous ne la trouvez pas — le diagnostic fonctionne aussi sans.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
