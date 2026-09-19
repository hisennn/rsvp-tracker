import { useState, useEffect, useMemo } from 'react'
import {
  Users,
  Search,
  Download,
  LogOut,
  AlertTriangle,
  RefreshCw,
  X,
} from 'lucide-react'
import type { Rsvp } from '../types/rsvp'
import {
  calculateStats,
  detectDuplicateIds,
  formatDate,
  groupRsvpsByLetter,
} from '../utils/formatters'
import { exportRsvpsToCsv } from '../utils/exportCsv'
import { fetchRsvps } from '../services/rsvpService'
import { AlphabetFilter } from './AlphabetFilter'
import { DuplicateBadge } from './DuplicateBadge'

interface AdminDashboardProps {
  onLogout: () => void
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [rsvps, setRsvps] = useState<Rsvp[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function reloadData() {
    setIsLoading(true)
    try {
      const data = await fetchRsvps()
      setRsvps(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function initialize() {
      try {
        const data = await fetchRsvps()
        if (active) {
          setRsvps(data)
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    initialize()

    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => calculateStats(rsvps), [rsvps])
  const duplicateIds = useMemo(() => detectDuplicateIds(rsvps), [rsvps])

  const filteredRsvps = useMemo(() => {
    return rsvps.filter((item) => {
      const matchesSearch = item.normalizedName
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase())

      if (!matchesSearch) return false

      if (selectedLetter) {
        const firstChar = item.normalizedName
          .charAt(0)
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase()
        return firstChar === selectedLetter
      }

      return true
    })
  }, [rsvps, searchQuery, selectedLetter])

  const groupedRsvps = useMemo(() => {
    return groupRsvpsByLetter(filteredRsvps)
  }, [filteredRsvps])

  const availableLetters = useMemo(() => {
    const letters = new Set<string>()
    for (const item of rsvps) {
      const char = item.normalizedName
        .charAt(0)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
      if (/^[A-Z]$/.test(char)) {
        letters.add(char)
      }
    }
    return Array.from(letters).sort()
  }, [rsvps])

  return (
    <div className="w-full max-w-3xl mx-auto px-3 py-4 sm:px-6 sm:py-6">
      <header className="flex items-center justify-between gap-2 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl text-stone-900 font-normal">
            Painel de Controle
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={reloadData}
            title="Atualizar lista"
            className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => exportRsvpsToCsv(rsvps)}
            disabled={rsvps.length === 0}
            className="inline-flex items-center gap-1.5 py-2 px-2.5 sm:px-3 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-[11px] font-medium uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar</span> CSV
          </button>

          <button
            type="button"
            onClick={onLogout}
            title="Sair do painel"
            className="inline-flex items-center gap-1 py-2 px-2.5 sm:px-3 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 hover:text-stone-900 text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 my-4">
        <div className="p-3 sm:p-4 rounded-xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider truncate">
              Total
            </span>
            <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          </div>
          <p className="font-serif text-xl sm:text-3xl text-stone-900 font-normal">
            {stats.total}
          </p>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider truncate">
              Únicos
            </span>
            <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              Sem rep.
            </span>
          </div>
          <p className="font-serif text-xl sm:text-3xl text-emerald-700 font-normal">
            {stats.unique}
          </p>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-white border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider truncate">
              Duplicatas
            </span>
            <AlertTriangle
              className={`w-3.5 h-3.5 shrink-0 ${
                stats.duplicatesCount > 0 ? 'text-amber-500' : 'text-stone-300'
              }`}
            />
          </div>
          <p
            className={`font-serif text-xl sm:text-3xl font-normal ${
              stats.duplicatesCount > 0 ? 'text-amber-600' : 'text-stone-400'
            }`}
          >
            {stats.duplicatesCount}
          </p>
        </div>
      </div>

      {stats.duplicatesCount > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>{stats.duplicatesCount} registros</strong> com possíveis
            duplicatas encontrados (identificados pela tag amarela).
          </span>
        </div>
      )}

      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white border border-stone-200 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <AlphabetFilter
          availableLetters={availableLetters}
          activeLetter={selectedLetter}
          onSelectLetter={setSelectedLetter}
        />
      </div>

      <div className="bg-white rounded-xl border border-stone-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-stone-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
            <p className="text-xs uppercase tracking-widest">Carregando...</p>
          </div>
        ) : Object.keys(groupedRsvps).length === 0 ? (
          <div className="py-12 text-center text-stone-500">
            <p className="text-sm font-medium text-stone-800 mb-1">
              Nenhuma confirmação encontrada
            </p>
            <p className="text-xs text-stone-400">
              {searchQuery || selectedLetter
                ? 'Tente ajustar os filtros ou termo de busca.'
                : 'Os nomes confirmados aparecerão aqui organizados de A a Z.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {Object.entries(groupedRsvps).map(([letter, list]) => (
              <div key={letter}>
                <div className="px-3.5 py-1.5 bg-stone-50/90 border-y border-stone-200/50 flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-700 uppercase tracking-wider">
                    {letter}
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">
                    {list.length}
                  </span>
                </div>

                <ul className="divide-y divide-stone-100">
                  {list.map((rsvp) => {
                    const isDuplicate = duplicateIds.has(rsvp.id)

                    return (
                      <li
                        key={rsvp.id}
                        className={`px-3.5 py-2.5 transition-colors ${
                          isDuplicate ? 'bg-amber-50/40' : 'hover:bg-stone-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-stone-900 uppercase tracking-wide">
                            {rsvp.name}
                          </span>
                          {isDuplicate && <DuplicateBadge />}
                        </div>
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          {formatDate(rsvp.createdAt)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
