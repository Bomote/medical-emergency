"use client"

import { Star } from "lucide-react"

interface FavoritesManagerProps {
  showFavoritesOnly: boolean
  onToggleShowFavoritesOnly: () => void
}

export default function FavoritesManager({ showFavoritesOnly, onToggleShowFavoritesOnly }: FavoritesManagerProps) {
  return (
    <button
      onClick={onToggleShowFavoritesOnly}
      className={`px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
        showFavoritesOnly
          ? "bg-yellow-500 text-white shadow-md"
          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
    >
      <Star className={`h-4 w-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
      Favorites Only
    </button>
  )
}
