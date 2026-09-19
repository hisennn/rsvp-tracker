import { Check } from 'lucide-react'

interface SuccessStateProps {
  confirmedName: string
  onReset: () => void
}

export function SuccessState({ confirmedName, onReset }: SuccessStateProps) {
  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-stone-900 text-stone-100 mb-3 sm:mb-4 shadow-xs">
        <Check className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
      </div>

      <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-stone-900 font-normal tracking-wide mb-1.5 sm:mb-2">
        Presença Confirmada!
      </h2>

      <p className="font-sans text-stone-600 text-sm sm:text-base leading-relaxed mb-4 sm:mb-5">
        Ficamos muito felizes em celebrar este momento com você,{' '}
        <span className="font-semibold text-stone-900 uppercase">
          {confirmedName}
        </span>
        .
      </p>

      <div className="bg-[#FBF8F1] border border-[#E6DCB8] rounded-xl px-4 py-3 sm:py-3.5 mb-4 sm:mb-5 text-center shadow-[0_2px_12px_rgba(140,115,62,0.04)]">
        <span className="block text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8C733E] mb-1">
          Aviso Importante
        </span>
        <p className="text-xs sm:text-[13px] text-[#5C4A28] font-sans font-medium leading-snug">
          É indispensável a apresentação do convite individual para a entrada no evento.
        </p>
      </div>

      <div className="pt-1">
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
