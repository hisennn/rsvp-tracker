import { AlertCircle } from 'lucide-react'

interface DuplicateBadgeProps {
  count?: number
}

export function DuplicateBadge({ count }: DuplicateBadgeProps) {
  return (
    <span
      title="Existe outro registro com este mesmo nome"
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/80"
    >
      <AlertCircle className="w-3 h-3 text-amber-600" />
      Possível Duplicata{count && count > 1 ? ` (${count})` : ''}
    </span>
  )
}
