"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, Clock, Hash, Pill, Stethoscope } from "lucide-react"

interface EmergencyCondition {
  id: number
  condition: string
  icd10Code: string
  abbrev: string
  specialty: string
  keywords: string[]
  adultTreatment: {
    drugName: string
    drugClass: string
  }
  pedsTreatment: {
    drugName: string
    drugClass: string
  } | null
}

interface SearchAutocompleteProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  conditions: EmergencyCondition[]
  recentSearches: string[]
  onSearchSelect: (term: string) => void
  placeholder?: string
}

interface Suggestion {
  type: "condition" | "icd10" | "drug" | "keyword" | "recent"
  value: string
  label: string
  icon: React.ReactNode
  condition?: EmergencyCondition
}

export default function SearchAutocomplete({
  searchTerm,
  onSearchChange,
  conditions,
  recentSearches,
  onSearchSelect,
  placeholder = "Search conditions, symptoms, treatments, ICD codes...",
}: SearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchTerm.length < 2) {
      // Show recent searches when no search term
      const recentSuggestions: Suggestion[] = recentSearches.slice(0, 5).map((search) => ({
        type: "recent",
        value: search,
        label: search,
        icon: <Clock className="h-4 w-4 text-gray-400" />,
      }))
      setSuggestions(recentSuggestions)
      return
    }

    const searchLower = searchTerm.toLowerCase()
    const newSuggestions: Suggestion[] = []

    // Add condition name matches
    conditions.forEach((condition) => {
      if (condition.condition.toLowerCase().includes(searchLower)) {
        newSuggestions.push({
          type: "condition",
          value: condition.condition,
          label: condition.condition,
          icon: <Stethoscope className="h-4 w-4 text-blue-500" />,
          condition,
        })
      }
    })

    // Add ICD-10 code matches
    conditions.forEach((condition) => {
      if (condition.icd10Code.toLowerCase().includes(searchLower)) {
        newSuggestions.push({
          type: "icd10",
          value: condition.icd10Code,
          label: `${condition.icd10Code} - ${condition.condition}`,
          icon: <Hash className="h-4 w-4 text-green-500" />,
          condition,
        })
      }
    })

    // Add drug name matches
    conditions.forEach((condition) => {
      if (condition.adultTreatment?.drugName?.toLowerCase().includes(searchLower)) {
        newSuggestions.push({
          type: "drug",
          value: condition.adultTreatment.drugName,
          label: `${condition.adultTreatment.drugName} (for ${condition.condition})`,
          icon: <Pill className="h-4 w-4 text-purple-500" />,
          condition,
        })
      }
      if (condition.pedsTreatment?.drugName?.toLowerCase().includes(searchLower)) {
        newSuggestions.push({
          type: "drug",
          value: condition.pedsTreatment.drugName,
          label: `${condition.pedsTreatment.drugName} (pediatric for ${condition.condition})`,
          icon: <Pill className="h-4 w-4 text-purple-500" />,
          condition,
        })
      }
    })

    // Add keyword matches
    conditions.forEach((condition) => {
      condition.keywords.forEach((keyword) => {
        if (keyword.toLowerCase().includes(searchLower)) {
          newSuggestions.push({
            type: "keyword",
            value: keyword,
            label: `${keyword} (related to ${condition.condition})`,
            icon: <Search className="h-4 w-4 text-orange-500" />,
            condition,
          })
        }
      })
    })

    // Remove duplicates and limit results
    const uniqueSuggestions = newSuggestions
      .filter(
        (suggestion, index, self) =>
          index === self.findIndex((s) => s.value === suggestion.value && s.type === suggestion.type),
      )
      .slice(0, 8)

    setSuggestions(uniqueSuggestions)
  }, [searchTerm, conditions, recentSearches])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    onSearchSelect(suggestion.value)
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onSearchChange(value)
    setIsOpen(true)
    setSelectedIndex(-1)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
          {searchTerm.length < 2 && recentSearches.length > 0 && (
            <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
              Recent Searches
            </div>
          )}
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.value}-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                index === selectedIndex ? "bg-blue-50 text-blue-800" : "text-gray-700"
              }`}
            >
              {suggestion.icon}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{suggestion.label}</div>
                {suggestion.condition && (
                  <div className="text-xs text-gray-500 truncate">
                    {suggestion.condition.specialty} • {suggestion.condition.icd10Code}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
