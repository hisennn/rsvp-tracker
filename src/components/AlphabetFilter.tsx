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
    <div className="w-full overflow-x-auto pb-1.5 scrollbar-none">
      <div className="flex items-center gap-1.5 min-w-max p-1.5 rounded-xl bg-stone-100/80 border border-stone-200/60 mx-auto">
        <button
          type="button"
          onClick={() => onSelectLetter(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer touch-manipulation shrink-0 ${
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
              className={`w-8.5 h-8.5 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-all touch-manipulation shrink-0 ${
                isSelected
                  ? 'bg-stone-900 text-stone-50 shadow-xs cursor-pointer'
                  : hasEntries
                    ? 'text-stone-900 bg-white sm:bg-transparent border border-stone-200 sm:border-transparent hover:bg-stone-200/80 cursor-pointer font-semibold shadow-xs sm:shadow-none'
                    : 'text-stone-300 opacity-40 cursor-not-allowed'
              }`}
            >
              {char}
            </button>
          )
        })}
      </div>
    </div>
  )
}
