"use client"

import { Clock } from "lucide-react"

interface RecentSearchesProps {
  searches: string[]
  isVisible: boolean
  onSearchSelect: (search: string) => void
  onClear: () => void
}

export default function RecentSearches({ searches, isVisible, onSearchSelect, onClear }: RecentSearchesProps) {
  if (!isVisible || searches.length === 0) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Recent Searches</span>
        <button onClick={onClear} className="text-xs text-gray-500 hover:text-gray-700">
          Clear
        </button>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {searches.map((search, index) => (
          <button
            key={index}
            onClick={() => onSearchSelect(search)}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Clock className="h-3 w-3 text-gray-400" />
            {search}
          </button>
        ))}
      </div>
    </div>
  )
}
