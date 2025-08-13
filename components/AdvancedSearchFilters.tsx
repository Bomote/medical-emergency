"use client"

import { useState } from "react"
import { Filter, ChevronDown, ChevronUp, X, AlertTriangle, Clock } from "lucide-react"

interface AdvancedSearchFiltersProps {
  selectedSpecialty: string
  onSpecialtyChange: (specialty: string) => void
  selectedAgeGroup: string
  onAgeGroupChange: (ageGroup: string) => void
  selectedSeverity: string
  onSeverityChange: (severity: string) => void
  showFavoritesOnly: boolean
  onToggleFavoritesOnly: () => void
  specialties: string[]
  onClearFilters: () => void
}

const severityLevels = [
  { value: "All", label: "All Severity Levels", icon: null, color: "text-gray-600" },
  { value: "Critical", label: "Critical/Life-threatening", icon: AlertTriangle, color: "text-red-600" },
  { value: "High", label: "High Priority", icon: AlertTriangle, color: "text-orange-600" },
  { value: "Moderate", label: "Moderate Priority", icon: Clock, color: "text-yellow-600" },
  { value: "Low", label: "Low Priority", icon: Clock, color: "text-green-600" },
]

const ageGroups = [
  { value: "All", label: "All Age Groups", icon: "👥" },
  { value: "Adult", label: "Adult Only", icon: "👨‍⚕️" },
  { value: "Pediatric", label: "Pediatric Only", icon: "👶" },
  { value: "Both", label: "Both Adult & Pediatric", icon: "👨‍👩‍👧‍👦" },
]

export default function AdvancedSearchFilters({
  selectedSpecialty,
  onSpecialtyChange,
  selectedAgeGroup,
  onAgeGroupChange,
  selectedSeverity,
  onSeverityChange,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  specialties,
  onClearFilters,
}: AdvancedSearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasActiveFilters =
    selectedSpecialty !== "All" || selectedAgeGroup !== "All" || selectedSeverity !== "All" || showFavoritesOnly

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-700">Advanced Filters</span>
          {hasActiveFilters && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Active</span>}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Specialty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medical Specialty</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => onSpecialtyChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty === "All" ? "All Specialties" : specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Age Group Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
            <div className="grid grid-cols-2 gap-2">
              {ageGroups.map((group) => (
                <button
                  key={group.value}
                  onClick={() => onAgeGroupChange(group.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    selectedAgeGroup === group.value
                      ? "bg-blue-50 border-blue-200 text-blue-800"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">{group.icon}</span>
                  <span className="text-sm font-medium">{group.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity Level</label>
            <div className="space-y-2">
              {severityLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => onSeverityChange(level.value)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left ${
                    selectedSeverity === level.value
                      ? "bg-blue-50 border-blue-200 text-blue-800"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {level.icon && <level.icon className={`h-4 w-4 ${level.color}`} />}
                  <span className="text-sm font-medium">{level.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Favorites Filter */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={onToggleFavoritesOnly}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Show favorites only</span>
            </label>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={onClearFilters}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
