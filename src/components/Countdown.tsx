import { useState, useEffect } from 'react'

const WEDDING_TIMESTAMP = new Date('2026-10-17T20:00:00-03:00').getTime()

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(target: number): TimeLeft {
  const difference = Math.max(0, target - Date.now())

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}

function padZero(value: number): string {
  return String(value).padStart(2, '0')
}

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(WEDDING_TIMESTAMP))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(WEDDING_TIMESTAMP))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const items = [
    { label: 'DIAS', value: padZero(timeLeft.days) },
    { label: 'HORAS', value: padZero(timeLeft.hours) },
    { label: 'MIN', value: padZero(timeLeft.minutes) },
    { label: 'SEG', value: padZero(timeLeft.seconds) },
  ] as const

  return (
    <div className="w-full max-w-xs sm:max-w-sm mx-auto mt-4">
      <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center">
            <span className="font-serif text-2xl sm:text-3xl text-[#1E1B18] tabular-nums font-light leading-none">
              {item.value}
            </span>
            <span className="text-[9px] sm:text-[10px] font-sans tracking-[0.2em] text-[#78716C] uppercase mt-1.5">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
