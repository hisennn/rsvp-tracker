import { useState, useEffect, type FormEvent } from 'react'
import { Check } from 'lucide-react'
import { ConfirmationModal } from './ConfirmationModal'
import { submitRsvp } from '../services/rsvpService'
import type { Rsvp } from '../types/rsvp'
import { sanitizeGuestName, validateGuestName } from '../utils/formatters'
import { getDeviceConfirmedNames } from '../utils/deviceHistory'

interface RsvpFormProps {
  onSuccess: (rsvp: Rsvp) => void
  confirmedNames?: string[]
}

const COOLDOWN_SECONDS = 30
const COOLDOWN_KEY = 'wedding_rsvp_cooldown_ts'

function getRemainingCooldown(): number {
  try {
    const stored = localStorage.getItem(COOLDOWN_KEY)
    if (!stored) return 0
    const elapsed = Math.floor((Date.now() - Number(stored)) / 1000)
    return elapsed < COOLDOWN_SECONDS ? COOLDOWN_SECONDS - elapsed : 0
  } catch {
    return 0
  }
}

export function RsvpForm({ onSuccess, confirmedNames }: RsvpFormProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(getRemainingCooldown)

  const confirmedList = confirmedNames ?? getDeviceConfirmedNames()

  useEffect(() => {
    if (cooldownRemaining <= 0) return

    const timer = setInterval(() => {
      const remaining = getRemainingCooldown()
      setCooldownRemaining(remaining)
      if (remaining <= 0) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldownRemaining])

  function handleOpenModal(e: FormEvent) {
    e.preventDefault()

    if (cooldownRemaining > 0) {
      setError(`Aguarde ${cooldownRemaining}s antes de enviar uma nova confirmação.`)
      return
    }

    const sanitized = sanitizeGuestName(name)
    const validationError = validateGuestName(sanitized)
    if (validationError) {
      setError(validationError)
      return
    }

    setName(sanitized)
    setError(null)
    setIsModalOpen(true)
  }

  async function handleConfirmSubmission() {
    if (isSubmitting || cooldownRemaining > 0) return

    const sanitized = sanitizeGuestName(name)
    const validationError = validateGuestName(sanitized)
    if (validationError) {
      setError(validationError)
      setIsModalOpen(false)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await submitRsvp(sanitized)
      try {
        localStorage.setItem(COOLDOWN_KEY, String(Date.now()))
        setCooldownRemaining(COOLDOWN_SECONDS)
      } catch {}
      setIsModalOpen(false)
      onSuccess(result)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocorreu um erro ao confirmar a presença. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form
        onSubmit={handleOpenModal}
        className="w-full max-w-md mx-auto space-y-3.5 sm:space-y-4"
      >
        <div className="space-y-1.5 sm:space-y-2 text-left">
          <label
            htmlFor="guest-name"
            className="block text-xs uppercase tracking-widest font-medium text-stone-600"
          >
            Nome Completo
          </label>
          <input
            id="guest-name"
            type="text"
            required
            disabled={isSubmitting}
            autoComplete="name"
            placeholder="Digite seu nome completo"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError(null)
            }}
            className="w-full px-4 py-2.5 sm:py-3.5 rounded-xl bg-white border border-stone-300/80 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900 transition-all font-sans text-base shadow-xs disabled:opacity-60 disabled:bg-stone-50"
          />
        </div>

        {error && (
          <p className="text-xs text-rose-600 font-medium tracking-wide text-left">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || cooldownRemaining > 0}
          className="w-full py-3 sm:py-4 px-6 rounded-xl bg-stone-900 text-stone-50 font-medium text-sm uppercase tracking-widest transition-all hover:bg-stone-800 active:scale-[0.99] shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? 'Confirmando...'
            : cooldownRemaining > 0
            ? `Aguarde (${cooldownRemaining}s)`
            : 'Confirmar Presença'}
        </button>

        {confirmedList.length > 0 && (
          <div className="pt-2 sm:pt-2.5 text-center">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">
              Confirmados neste aparelho ({confirmedList.length}):
            </span>
            <div className="flex flex-wrap justify-center gap-1.5 max-h-16 overflow-y-auto px-1">
              {confirmedList.map((confirmed) => (
                <span
                  key={confirmed}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FBF8F1] text-[#5C4A28] border border-[#E6DCB8] shadow-2xs"
                >
                  <Check className="w-3 h-3 text-[#8C733E] stroke-[2.5] shrink-0" />
                  <span className="truncate max-w-[140px] sm:max-w-[180px]">{confirmed}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </form>

      <ConfirmationModal
        isOpen={isModalOpen}
        name={name}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmSubmission}
        onCancel={() => setIsModalOpen(false)}
      />
    </>
  )
}
