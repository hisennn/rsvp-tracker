interface AlphabetFilterProps {
  availableLetters: string[]
  activeLetter: string | null
  onSelectLetter: (letter: string | null) => void
}

const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function AlphabetFilter({
  availableLetters,
  activeLetter,
  onSelectLetter,
}: AlphabetFilterProps) {
  const availableSet = new Set(availableLetters)

  return (
    <div className="w-full flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-xl bg-stone-100/80 border border-stone-200/60">
      <button
        type="button"
        onClick={() => onSelectLetter(null)}
        className={`h-7 sm:h-8 px-2.5 sm:px-3 flex items-center justify-center rounded-lg text-xs font-medium transition-all cursor-pointer touch-manipulation shrink-0 ${
          activeLetter === null
            ? 'bg-stone-900 text-stone-50 shadow-xs'
            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
        }`}
      >
        Todos
      </button>

      {ALL_LETTERS.map((char) => {
        const hasEntries = availableSet.has(char)
        const isSelected = activeLetter === char

        return (
          <button
            key={char}
            type="button"
            disabled={!hasEntries}
            onClick={() => onSelectLetter(isSelected ? null : char)}
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all touch-manipulation shrink-0 ${
              isSelected
                ? 'bg-stone-900 text-stone-50 shadow-xs cursor-pointer font-semibold'
                : hasEntries
                  ? 'text-stone-900 bg-white border border-stone-200/80 shadow-xs hover:bg-stone-200/80 hover:border-stone-300 cursor-pointer font-semibold'
                  : 'text-stone-300 opacity-40 cursor-not-allowed select-none'
            }`}
          >
            {char}
          </button>
        )
      })}
    </div>
  )
}
