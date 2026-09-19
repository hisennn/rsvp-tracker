const DEVICE_CONFIRMED_KEY = 'wedding_confirmed_device_names'

export function getDeviceConfirmedNames(): string[] {
  try {
    const raw = localStorage.getItem(DEVICE_CONFIRMED_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0
      )
    }
    return []
  } catch {
    return []
  }
}

export function addDeviceConfirmedName(name: string): string[] {
  const trimmed = name.trim()
  if (!trimmed) {
    return getDeviceConfirmedNames()
  }

  const current = getDeviceConfirmedNames()
  const exists = current.some(
    (item) => item.trim().toLowerCase() === trimmed.toLowerCase()
  )

  if (exists) {
    return current
  }

  const updated = [...current, trimmed]
  try {
    localStorage.setItem(DEVICE_CONFIRMED_KEY, JSON.stringify(updated))
  } catch {}

  return updated
}

export function clearDeviceConfirmedNames(): void {
  try {
    localStorage.removeItem(DEVICE_CONFIRMED_KEY)
  } catch {}
}
