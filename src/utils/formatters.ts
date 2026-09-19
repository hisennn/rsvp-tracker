import type { Rsvp, RsvpStats } from '../types/rsvp'

export function sanitizeGuestName(input: string): string {
  let cleaned = ''
  for (const char of input) {
    const code = char.charCodeAt(0)
    if ((code >= 0 && code <= 31) || (code >= 127 && code <= 159) || char === '<' || char === '>') {
      continue
    }
    cleaned += char
  }
  return cleaned.replace(/\s+/g, ' ').trim()
}

export function validateGuestName(sanitized: string): string | null {
  if (!sanitized) {
    return 'Por favor, digite seu nome completo.'
  }
  if (sanitized.length < 3) {
    return 'O nome deve conter pelo menos 3 letras.'
  }
  if (sanitized.length > 100) {
    return 'O nome não pode exceder 100 caracteres.'
  }
  const nameRegex = /^[\p{L}\s'.-]+$/u
  if (!nameRegex.test(sanitized)) {
    return 'O nome contém caracteres inválidos. Utilize apenas letras.'
  }
  return null
}

export function normalizeName(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase()
}

export function formatDisplayName(value: string): string {
  const clean = value.trim().replace(/\s+/g, ' ')
  return clean
    .split(' ')
    .map((word) => {
      const lower = word.toLowerCase()
      if (['de', 'da', 'do', 'dos', 'das', 'e'].includes(lower)) {
        return lower
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function detectDuplicateIds(rsvps: Rsvp[]): Set<string> {
  const nameCounts = new Map<string, string[]>()
  for (const rsvp of rsvps) {
    const list = nameCounts.get(rsvp.normalizedName) ?? []
    list.push(rsvp.id)
    nameCounts.set(rsvp.normalizedName, list)
  }

  const duplicateIds = new Set<string>()
  for (const [, ids] of nameCounts) {
    if (ids.length > 1) {
      for (const id of ids) {
        duplicateIds.add(id)
      }
    }
  }

  return duplicateIds
}

export function calculateStats(rsvps: Rsvp[]): RsvpStats {
  const uniqueNames = new Set(rsvps.map((r) => r.normalizedName))
  const duplicateIds = detectDuplicateIds(rsvps)

  return {
    total: rsvps.length,
    unique: uniqueNames.size,
    duplicatesCount: duplicateIds.size,
  }
}

export function groupRsvpsByLetter(rsvps: Rsvp[]): Record<string, Rsvp[]> {
  const sorted = [...rsvps].sort((a, b) =>
    a.normalizedName.localeCompare(b.normalizedName, 'pt-BR')
  )

  const groups: Record<string, Rsvp[]> = {}
  for (const rsvp of sorted) {
    const firstChar = rsvp.normalizedName.charAt(0).toUpperCase()
    const key = /^[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ]$/i.test(firstChar)
      ? firstChar.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      : '#'
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(rsvp)
  }

  return groups
}
