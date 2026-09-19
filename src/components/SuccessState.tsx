import { Check } from 'lucide-react'

interface SuccessStateProps {
  confirmedName: string
  onReset: () => void
}

export function SuccessState({ confirmedName, onReset }: SuccessStateProps) {
  return (
    <div className="w-full max-w-md mx-auto text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-900 text-stone-100 mb-6 shadow-md">
        <Check className="w-8 h-8 stroke-[2.5]" />
      </div>

      <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal tracking-wide mb-3">
        Presença Confirmada!
      </h2>

      <p className="font-sans text-stone-600 text-base leading-relaxed mb-6">
        Ficamos muito felizes em celebrar este momento com você,{' '}
        <span className="font-semibold text-stone-900 uppercase">
          {confirmedName}
        </span>
        .
      </p>

      <div className="pt-2">
        <button
          type="button"
          onClick={onReset}
          className="text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900 underline underline-offset-4 transition-colors cursor-pointer"
        >
          Confirmar outro convidado
        </button>
      </div>
    </div>
  )
}
