"use client"

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { VariableSizeList as List } from "react-window"
import {
  Search,
  AlertTriangle,
  Stethoscope,
  Activity,
  Book,
  Globe,
  Clock,
  Users,
  StickyNote,
  ChevronDown,
  ChevronUp,
  Save,
  Calculator,
  Star,
} from "lucide-react"

interface Treatment {
  drugName: string
  drugClass: string
  dose?: string
  doseMgPerKg?: string
  maxDose?: string | null
  route: string
  frequency: string
  duration: string | null
  notes: string
}

interface Reference {
  textbook: string
  edition: string
  chapter: string
  pages: string
}

interface EmergencyCondition {
  id: number
  orderRank: number
  condition: string
  icd10Code: string
  abbrev: string
  specialty:
    | "Internal Medicine"
    | "Surgery"
    | "Pediatrics"
    | "Obstetrics"
    | "Gynecology"
    | "Emergency"
    | "Critical Care"
    | "Neurology"
  subSpecialty: string | null
  ageGroup: "Adult" | "Pediatric" | "Both"
  presentation: string
  investigations: string
  redFlags: string[]
  differentials: string[]
  adultTreatment: Treatment
  pedsTreatment: Treatment | null
  procedure: string | null
  references: Reference[] | null
  whoGuideline: string | null
  lastUpdated: string
  keywords: string[]
}

interface VirtualizedConditionListProps {
  conditions: EmergencyCondition[]
  notes: Record<number, string>
  expandedNotes: Record<number, boolean>
  notesSaving: Record<number, boolean>
  favorites: Set<number>
  onNoteChange: (conditionId: number, noteText: string) => void
  onToggleNotes: (conditionId: number) => void
  onToggleFavorite: (conditionId: number) => void
  onOpenCalculator: (conditionId: number) => void
  onOpenClinicalSupport: (conditionId: number) => void
}

// Search result cache
const searchCache = new Map<string, EmergencyCondition[]>()
const CACHE_SIZE_LIMIT = 50

const specialtyColors = {
  "Internal Medicine": "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 border-blue-200",
  Surgery: "bg-gradient-to-r from-green-50 to-green-100 text-green-900 border-green-200",
  Pediatrics: "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-900 border-yellow-200",
  Obstetrics: "bg-gradient-to-r from-pink-50 to-pink-100 text-pink-900 border-pink-200",
  Gynecology: "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-900 border-purple-200",
  Emergency: "bg-gradient-to-r from-red-50 to-red-100 text-red-900 border-red-200",
  "Critical Care": "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-900 border-orange-200",
  Neurology: "bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-900 border-indigo-200",
}

const ageGroupIcons = {
  Adult: "👨‍⚕️",
  Pediatric: "👶",
  Both: "👥",
}

// Lazy loaded condition details component
const LazyConditionDetails = React.memo(
  ({
    condition,
    isExpanded,
    onToggleExpanded,
  }: {
    condition: EmergencyCondition
    isExpanded: boolean
    onToggleExpanded: () => void
  }) => {
    const [detailsLoaded, setDetailsLoaded] = useState(false)

    useEffect(() => {
      if (isExpanded && !detailsLoaded) {
        // Simulate lazy loading with a small delay
        const timer = setTimeout(() => setDetailsLoaded(true), 50)
        return () => clearTimeout(timer)
      }
    }, [isExpanded, detailsLoaded])

    const formatTreatment = useCallback((treatment: Treatment | null, isPediatric = false) => {
      if (!treatment) return <div className="text-gray-500 italic">No treatment data available</div>

      const dose = isPediatric && treatment.doseMgPerKg ? treatment.doseMgPerKg : treatment.dose
      const maxDoseText = isPediatric && treatment.maxDose ? ` (max ${treatment.maxDose})` : ""

      return (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="font-semibold text-lg">
              <span className="text-blue-700">{treatment.drugName || "Not specified"}</span>
            </div>
            {treatment.drugClass && (
              <span className="text-sm bg-gray-100 px-2 py-1 rounded-full text-gray-600">{treatment.drugClass}</span>
            )}
          </div>

          {dose && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-600 min-w-0">Dose:</span>
              <span className="bg-blue-50 px-2 py-1 rounded text-blue-800 font-mono">
                {dose}
                {maxDoseText}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
            {treatment.route && (
              <div className="flex items-center gap-1">
                <span className="font-medium text-gray-600">Route:</span>
                <span className="bg-green-50 px-2 py-1 rounded text-green-800">{treatment.route}</span>
              </div>
            )}
            {treatment.frequency && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="bg-purple-50 px-2 py-1 rounded text-purple-800">{treatment.frequency}</span>
              </div>
            )}
            {treatment.duration && (
              <div className="flex items-center gap-1">
                <span className="font-medium text-gray-600">Duration:</span>
                <span className="bg-orange-50 px-2 py-1 rounded text-orange-800">{treatment.duration}</span>
              </div>
            )}
          </div>

          {treatment.notes && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r">
              <p className="text-sm text-amber-800 italic">{treatment.notes}</p>
            </div>
          )}
        </div>
      )
    }, [])

    if (!isExpanded) return null

    if (!detailsLoaded) {
      return (
        <div className="p-6 animate-pulse">
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="p-6">
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Clinical Presentation
              </h4>
              <p className="text-blue-800 leading-relaxed">{condition.presentation}</p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">Key Investigations</h4>
              <p className="text-green-800 leading-relaxed">{condition.investigations}</p>
            </div>

            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                RED FLAGS - Immediate Action Required
              </h4>
              <div className="space-y-2">
                {condition.redFlags.map((flag, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-red-800 leading-relaxed">{flag}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Differential Diagnoses</h4>
              <div className="flex flex-wrap gap-2">
                {condition.differentials.map((diff, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm border border-gray-200 hover:bg-gray-200 transition-colors"
                  >
                    {diff}
                  </span>
                ))}
              </div>
            </div>

            {condition.procedure && (
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">Key Procedures</h4>
                <p className="text-purple-800 leading-relaxed">{condition.procedure}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">👨‍⚕️ Adult Treatment</h4>
              {formatTreatment(condition.adultTreatment)}
            </div>

            {condition.pedsTreatment && (
              <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                <h4 className="font-bold text-yellow-900 mb-4 text-lg flex items-center gap-2">
                  👶 Pediatric Treatment
                </h4>
                <div className="text-yellow-800">{formatTreatment(condition.pedsTreatment, true)}</div>
              </div>
            )}

            <div className="space-y-4">
              {condition.references && condition.references.length > 0 && (
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <Book className="h-4 w-4" />
                    References
                  </h4>
                  {condition.references.map((ref, index) => (
                    <p key={index} className="text-indigo-800 text-sm">
                      {ref.textbook} {ref.edition} ed, Ch. {ref.chapter}, p. {ref.pages}
                    </p>
                  ))}
                </div>
              )}

              {condition.whoGuideline && (
                <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                  <h4 className="font-semibold text-teal-900 mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    WHO Guideline
                  </h4>
                  <p className="text-teal-800 text-sm">{condition.whoGuideline}</p>
                </div>
              )}

              {condition.keywords.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Keywords</h4>
                  <div className="flex flex-wrap gap-1">
                    {condition.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs border border-blue-200"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  },
)

LazyConditionDetails.displayName = "LazyConditionDetails"

// Individual condition item component
const ConditionItem = React.memo(
  ({
    index,
    style,
    data,
  }: {
    index: number
    style: React.CSSProperties
    data: {
      conditions: EmergencyCondition[]
      notes: Record<number, string>
      expandedNotes: Record<number, boolean>
      notesSaving: Record<number, boolean>
      favorites: Set<number>
      expandedDetails: Record<number, boolean>
      onNoteChange: (conditionId: number, noteText: string) => void
      onToggleNotes: (conditionId: number) => void
      onToggleFavorite: (conditionId: number) => void
      onOpenCalculator: (conditionId: number) => void
      onOpenClinicalSupport: (conditionId: number) => void
      onToggleDetails: (conditionId: number) => void
    }
  }) => {
    const condition = data.conditions[index]
    const isDetailsExpanded = data.expandedDetails[condition.id] || false

    return (
      <div style={style} className="px-4">
        <div
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 mb-6"
          id={`condition-${condition.id}`}
        >
          <div className={`${specialtyColors[condition.specialty]} px-6 py-4 border-b`}>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-2">
                  <h2 className="text-xl font-bold leading-tight">{condition.condition}</h2>
                  <div className="text-2xl">{ageGroupIcons[condition.ageGroup]}</div>
                  <button
                    onClick={() => data.onToggleFavorite(condition.id)}
                    className={`p-1 rounded-full transition-all ${
                      data.favorites.has(condition.id)
                        ? "text-yellow-500 bg-white/30"
                        : "text-white/60 hover:text-white/80 hover:bg-white/20"
                    }`}
                  >
                    <Star className={`h-5 w-5 ${data.favorites.has(condition.id) ? "fill-current" : ""}`} />
                  </button>
                  {data.notes[condition.id]?.trim() && (
                    <div className="bg-white/30 p-1 rounded-full">
                      <StickyNote className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {condition.abbrev && (
                    <span className="bg-white/20 px-2 py-1 rounded-lg text-sm font-medium">{condition.abbrev}</span>
                  )}
                  <span className="bg-white/20 px-2 py-1 rounded-lg text-sm font-mono">{condition.icd10Code}</span>
                  {condition.subSpecialty && (
                    <span className="bg-white/20 px-2 py-1 rounded-lg text-sm">{condition.subSpecialty}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-medium">#{condition.orderRank}</span>
                <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {condition.ageGroup}
                </span>
                <button
                  onClick={() => data.onOpenCalculator(condition.id)}
                  className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  <Calculator className="h-3 w-3" />
                  Calculator
                </button>
                <button
                  onClick={() => data.onOpenClinicalSupport(condition.id)}
                  className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  <Activity className="h-3 w-3" />
                  Clinical Tools
                </button>
                <button
                  onClick={() => data.onToggleNotes(condition.id)}
                  className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  <StickyNote className="h-4 w-4" />
                  Notes
                  {data.expandedNotes[condition.id] ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
                <button
                  onClick={() => data.onToggleDetails(condition.id)}
                  className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  Details
                  {isDetailsExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </div>

          {data.expandedNotes[condition.id] && (
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-amber-900 flex items-center gap-2">
                  <StickyNote className="h-4 w-4" />
                  Personal Notes
                </h4>
                {data.notesSaving[condition.id] && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <Save className="h-3 w-3" />
                    Saved
                  </div>
                )}
              </div>
              <textarea
                value={data.notes[condition.id] || ""}
                onChange={(e) => data.onNoteChange(condition.id, e.target.value)}
                placeholder="Add your personal notes, observations, or reminders for this condition..."
                className="w-full p-3 border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-vertical min-h-[100px]"
              />
              <p className="text-xs text-amber-700 mt-2">
                Notes are automatically saved and stored locally in your browser.
              </p>
            </div>
          )}

          <LazyConditionDetails
            condition={condition}
            isExpanded={isDetailsExpanded}
            onToggleExpanded={() => data.onToggleDetails(condition.id)}
          />
        </div>
      </div>
    )
  },
)

ConditionItem.displayName = "ConditionItem"

// Main virtualized list component
export default function VirtualizedConditionList({
  conditions,
  notes,
  expandedNotes,
  notesSaving,
  favorites,
  onNoteChange,
  onToggleNotes,
  onToggleFavorite,
  onOpenCalculator,
  onOpenClinicalSupport,
}: VirtualizedConditionListProps) {
  const [expandedDetails, setExpandedDetails] = useState<Record<number, boolean>>({})
  const listRef = useRef<List>(null)

  const onToggleDetails = useCallback((conditionId: number) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [conditionId]: !prev[conditionId],
    }))
  }, [])

  // Calculate dynamic item height based on expanded state
  const getItemSize = useCallback(
    (index: number) => {
      const condition = conditions[index]
      let baseHeight = 200 // Base height for collapsed state

      if (expandedNotes[condition.id]) {
        baseHeight += 180 // Add height for notes section
      }

      if (expandedDetails[condition.id]) {
        baseHeight += 600 // Add height for details section
      }

      return baseHeight
    },
    [conditions, expandedNotes, expandedDetails],
  )

  const itemData = useMemo(
    () => ({
      conditions,
      notes,
      expandedNotes,
      notesSaving,
      favorites,
      expandedDetails,
      onNoteChange,
      onToggleNotes,
      onToggleFavorite,
      onOpenCalculator,
      onOpenClinicalSupport,
      onToggleDetails,
    }),
    [
      conditions,
      notes,
      expandedNotes,
      notesSaving,
      favorites,
      expandedDetails,
      onNoteChange,
      onToggleNotes,
      onToggleFavorite,
      onOpenCalculator,
      onOpenClinicalSupport,
      onToggleDetails,
    ],
  )

  if (conditions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <Search className="h-16 w-16 text-gray-300 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No conditions found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or filter criteria to find what you&apos;re looking for.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[800px]">
      <List
        ref={listRef}
        height={800}
        width="100%"
        itemCount={conditions.length}
        itemSize={getItemSize}
        itemData={itemData}
        overscanCount={2}
      >
        {ConditionItem}
      </List>
    </div>
  )
}

// Export search cache utilities
export const clearSearchCache = () => {
  searchCache.clear()
}

export const getCachedSearchResult = (cacheKey: string): EmergencyCondition[] | undefined => {
  return searchCache.get(cacheKey)
}

export const setCachedSearchResult = (cacheKey: string, result: EmergencyCondition[]): void => {
  if (searchCache.size >= CACHE_SIZE_LIMIT) {
    const firstKey = searchCache.keys().next().value
    if (firstKey !== undefined) {
      searchCache.delete(firstKey)
    }
  }
  searchCache.set(cacheKey, result)
}
