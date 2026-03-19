'use client'
import { useState } from 'react'

interface CheckInteractifProps {
  label: string
  sublabel?: string
  checked: boolean
  onCheck: (checked: boolean) => void
  disabled?: boolean
}

export function CheckInteractif({ label, sublabel, checked, onCheck, disabled }: CheckInteractifProps) {
  const [confirming, setConfirming] = useState(false)

  const handleClick = () => {
    if (disabled) return
    if (!checked && !confirming) {
      setConfirming(true)
      return
    }
    if (confirming) {
      onCheck(true)
      setConfirming(false)
    }
  }

  const handleCancel = () => setConfirming(false)

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
      checked ? 'bg-emerald/5 border-emerald/20' :
      confirming ? 'bg-amber-50 border-amber-200' :
      'bg-white border-slate-200 hover:border-emerald/30 cursor-pointer'
    }`} onClick={!confirming && !checked ? handleClick : undefined}>
      {/* Checkbox */}
      <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
        checked ? 'bg-emerald border-emerald text-white' : 'border-slate-300'
      }`}>
        {checked && <span className="text-xs">✓</span>}
      </div>

      <div className="flex-1">
        <p className={`text-sm ${checked ? 'text-slate-muted line-through' : 'text-slate-text font-medium'}`}>
          {label}
        </p>
        {sublabel && <p className="text-xs text-slate-muted mt-0.5">{sublabel}</p>}

        {/* Confirmation */}
        {confirming && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-amber-700">Confirmer ?</span>
            <button onClick={handleClick} className="text-xs bg-emerald text-white px-3 py-1 rounded-md font-medium">
              Oui, c'est fait
            </button>
            <button onClick={handleCancel} className="text-xs text-slate-muted hover:text-slate-text">
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
