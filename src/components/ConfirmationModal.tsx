import { useEffect } from 'react'

interface ConfirmationModalProps {
  isOpen: boolean
  name: string
  isSubmitting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmationModal({
  isOpen,
  name,
  isSubmitting,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isSubmitting) {
        onCancel()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onCancel])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 md:p-8 shadow-xl border border-stone-200/80 text-center">
        <h3
          id="modal-title"
          className="font-serif text-2xl text-stone-900 font-normal tracking-wide mb-2"
        >
          Confirmar presença com o nome:
        </h3>

        <div className="my-4 py-3 px-4 rounded-xl bg-stone-50 border border-stone-200/60">
          <p className="font-sans font-semibold text-lg text-stone-950 tracking-wide break-words uppercase">
            {name}
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-2 sm:gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-stone-900 text-stone-50 font-medium text-sm tracking-wide transition-all hover:bg-stone-800 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? 'Confirmando...' : 'Confirmar'}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-transparent border border-stone-300 text-stone-700 font-medium text-sm tracking-wide transition-all hover:bg-stone-100 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
