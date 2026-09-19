import type { Rsvp } from '../types/rsvp'
import { detectDuplicateIds, formatDate } from './formatters'

const DANGEROUS_PREFIXES = ['=', '+', '-', '@', '\t', '\r']

export function sanitizeCsvCell(value: unknown): string {
  let content = String(value ?? '')
  if (DANGEROUS_PREFIXES.some((prefix) => content.startsWith(prefix))) {
    content = `'${content}`
  }
  return `"${content.replace(/"/g, '""')}"`
}

export function exportRsvpsToCsv(rsvps: Rsvp[]): void {
  const duplicateIds = detectDuplicateIds(rsvps)
  const header = ['Nome', 'Nome em Caixa Alta', 'Data de Confirmação', 'Status']

  const rows = rsvps.map((rsvp) => {
    const isDuplicate = duplicateIds.has(rsvp.id) ? 'Possível Duplicata' : 'Único'
    return [
      sanitizeCsvCell(rsvp.name),
      sanitizeCsvCell(rsvp.normalizedName),
      sanitizeCsvCell(formatDate(rsvp.createdAt)),
      sanitizeCsvCell(isDuplicate),
    ].join(';')
  })

  const csvContent = '\uFEFF' + [header.map(sanitizeCsvCell).join(';'), ...rows].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    `confirmacoes-casamento-cesar-isadora-${new Date().toISOString().slice(0, 10)}.csv`
  )
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
