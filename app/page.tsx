"use client"

import { useState, useMemo } from "react"
import { Search, Stethoscope, Activity, Clock, StickyNote, Star } from "lucide-react"
import DosageCalculator from "@/components/DosageCalculator"
import ClinicalDecisionSupport from "@/components/ClinicalDecisionSupport"
import QuickAccessPanel from "@/components/QuickAccessPanel"
import FavoritesManager from "@/components/FavoritesManager"
import SearchAutocomplete from "@/components/SearchAutocomplete"
import AdvancedSearchFilters from "@/components/AdvancedSearchFilters"
import DataManager from "@/components/DataManager"
import VirtualizedConditionList from "@/components/VirtualizedConditionList"
import emergencyConditionsData from "@/data/emergencyConditions.json"

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

export default function EmergencyReference() {
  const emergencyConditions = emergencyConditionsData as EmergencyCondition[]
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("All")
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("All")
  const [selectedSeverity, setSelectedSeverity] = useState("All")
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>({})
  const [notesSaving, setNotesSaving] = useState<Record<number, boolean>>({})
  const [calculatorOpen, setCalculatorOpen] = useState<number | null>(null)
  const [clinicalSupportOpen, setClinicalSupportOpen] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [showQuickAccess, setShowQuickAccess] = useState(true)

  useMemo(() => {
    const savedNotes = localStorage.getItem("emergency-reference-notes")
    const savedFavorites = localStorage.getItem("emergency-reference-favorites")
    const savedRecentSearches = localStorage.getItem("emergency-reference-recent-searches")

    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes))
      } catch (error) {
        console.error("Error loading notes from localStorage:", error)
      }
    }

    if (savedFavorites) {
      try {
        setFavorites(new Set(JSON.parse(savedFavorites)))
      } catch (error) {
        console.error("Error loading favorites from localStorage:", error)
      }
    }

    if (savedRecentSearches) {
      try {
        setRecentSearches(JSON.parse(savedRecentSearches))
      } catch (error) {
        console.error("Error loading recent searches from localStorage:", error)
      }
    }
  }, [])

  const handleSearch = (term: string) => {
    setSearchTerm(term)

    if (term.trim() && term.length > 2) {
      setRecentSearches((prev) => {
        const filtered = prev.filter((search) => search !== term.trim())
        return [term.trim(), ...filtered].slice(0, 10) // Keep last 10 searches
      })
    }
  }

  const toggleFavorite = (conditionId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(conditionId)) {
        newFavorites.delete(conditionId)
      } else {
        newFavorites.add(conditionId)
      }
      return newFavorites
    })
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
  }

  const handleNoteChange = (conditionId: number, noteText: string) => {
    setNotes((prev) => ({ ...prev, [conditionId]: noteText }))

    setNotesSaving((prev) => ({ ...prev, [conditionId]: true }))

    setTimeout(() => {
      setNotesSaving((prev) => ({ ...prev, [conditionId]: false }))
    }, 1000)
  }

  const toggleNotes = (conditionId: number) => {
    setExpandedNotes((prev) => ({ ...prev, [conditionId]: !prev[conditionId] }))
  }

  const openCalculator = (conditionId: number) => {
    setCalculatorOpen(conditionId)
  }

  const closeCalculator = () => {
    setCalculatorOpen(null)
  }

  const openClinicalSupport = (conditionId: number) => {
    setClinicalSupportOpen(conditionId)
  }

  const closeClinicalSupport = () => {
    setClinicalSupportOpen(null)
  }

  const clearAllFilters = () => {
    setSelectedSpecialty("All")
    setSelectedAgeGroup("All")
    setSelectedSeverity("All")
    setShowFavoritesOnly(false)
    setSearchTerm("")
  }

  const filteredConditions = useMemo(() => {
    const cacheKey = `${searchTerm}-${selectedSpecialty}-${selectedAgeGroup}-${selectedSeverity}-${showFavoritesOnly}-${Array.from(favorites).join(",")}`

    // Check cache first
    const cachedResult = localStorage.getItem(`search-cache-${cacheKey}`)
    if (cachedResult) {
      try {
        return JSON.parse(cachedResult) as EmergencyCondition[]
      } catch (error) {
        console.error("Error parsing cached search result:", error)
      }
    }

    const result = emergencyConditions.filter((condition) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        !searchTerm ||
        condition.condition.toLowerCase().includes(searchLower) ||
        condition.presentation.toLowerCase().includes(searchLower) ||
        condition.differentials.some((diff) => diff.toLowerCase().includes(searchLower)) ||
        condition.keywords.some((keyword) => keyword.toLowerCase().includes(searchLower)) ||
        condition.adultTreatment?.drugName?.toLowerCase().includes(searchLower) ||
        condition.pedsTreatment?.drugName?.toLowerCase().includes(searchLower) ||
        condition.icd10Code.toLowerCase().includes(searchLower) ||
        condition.abbrev?.toLowerCase().includes(searchLower) ||
        (notes[condition.id] && notes[condition.id].toLowerCase().includes(searchLower))

      const matchesSpecialty = selectedSpecialty === "All" || condition.specialty === selectedSpecialty
      const matchesAgeGroup = selectedAgeGroup === "All" || condition.ageGroup === selectedAgeGroup

      const matchesSeverity =
        selectedSeverity === "All" ||
        (selectedSeverity === "Critical" && condition.orderRank <= 5) ||
        (selectedSeverity === "High" && condition.orderRank <= 15) ||
        (selectedSeverity === "Moderate" && condition.orderRank <= 50) ||
        (selectedSeverity === "Low" && condition.orderRank > 50)

      const matchesFavorites = !showFavoritesOnly || favorites.has(condition.id)

      return matchesSearch && matchesSpecialty && matchesAgeGroup && matchesSeverity && matchesFavorites
    })

    // Cache the result with size limit
    try {
      const cacheKeys = Object.keys(localStorage).filter((key) => key.startsWith("search-cache-"))
      if (cacheKeys.length >= 50) {
        // Remove oldest cache entries
        cacheKeys.slice(0, 10).forEach((key) => localStorage.removeItem(key))
      }
      localStorage.setItem(`search-cache-${cacheKey}`, JSON.stringify(result))
    } catch (error) {
      console.error("Error caching search result:", error)
    }

    return result
  }, [
    searchTerm,
    selectedSpecialty,
    selectedAgeGroup,
    selectedSeverity,
    notes,
    showFavoritesOnly,
    favorites,
    emergencyConditions,
  ])

  const mostCriticalConditions = useMemo(() => {
    const criticalIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] // Top 10 by order rank
    return emergencyConditions.filter((condition) => criticalIds.includes(condition.orderRank))
  }, [])

  const specialties = ["All", ...Array.from(new Set(emergencyConditions.map((c) => c.specialty)))]

  const formatTreatment = (treatment: Treatment, isPediatric = false) => {
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
  }

  const handleDataImport = (importedData: {
    notes: Record<number, string>
    favorites: number[]
    recentSearches: string[]
  }) => {
    setNotes(importedData.notes)
    setFavorites(new Set(importedData.favorites))
    setRecentSearches(importedData.recentSearches)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {calculatorOpen && (
        <DosageCalculator
          condition={emergencyConditions.find((c) => c.id === calculatorOpen)!}
          isOpen={calculatorOpen !== null}
          onClose={closeCalculator}
        />
      )}

      {clinicalSupportOpen && (
        <ClinicalDecisionSupport
          condition={emergencyConditions.find((c) => c.id === clinicalSupportOpen)!}
          isOpen={clinicalSupportOpen !== null}
          onClose={closeClinicalSupport}
        />
      )}

      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Activity className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Emergency Medicine Reference</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Comprehensive clinical decision support with personal notes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md">
                  {filteredConditions.length} conditions
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md flex items-center gap-2">
                  <StickyNote className="h-4 w-4" />
                  {Object.keys(notes).filter((id) => notes[Number.parseInt(id)]?.trim()).length} notes
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  {favorites.size} favorites
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <SearchAutocomplete
                  searchTerm={searchTerm}
                  onSearchChange={handleSearch}
                  conditions={emergencyConditions}
                  recentSearches={recentSearches}
                  onSearchSelect={setSearchTerm}
                />

                <div className="flex gap-3">
                  <FavoritesManager
                    showFavoritesOnly={showFavoritesOnly}
                    onToggleShowFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  />
                </div>
              </div>

              <AdvancedSearchFilters
                selectedSpecialty={selectedSpecialty}
                onSpecialtyChange={setSelectedSpecialty}
                selectedAgeGroup={selectedAgeGroup}
                onAgeGroupChange={setSelectedAgeGroup}
                selectedSeverity={selectedSeverity}
                onSeverityChange={setSelectedSeverity}
                showFavoritesOnly={showFavoritesOnly}
                onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
                specialties={specialties}
                onClearFilters={clearAllFilters}
              />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QuickAccessPanel
          conditions={mostCriticalConditions}
          isVisible={showQuickAccess && !showFavoritesOnly && !searchTerm}
          onClose={() => setShowQuickAccess(false)}
        />

        <section className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              Specialty Color Legend
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(specialtyColors).map(([specialty, colorClass]) => (
                <div
                  key={specialty}
                  className={`${colorClass} px-4 py-3 rounded-xl border font-medium text-center transition-transform hover:scale-105`}
                >
                  {specialty}
                </div>
              ))}
            </div>
          </div>
        </section>

        <VirtualizedConditionList
          conditions={filteredConditions}
          notes={notes}
          expandedNotes={expandedNotes}
          notesSaving={notesSaving}
          favorites={favorites}
          onNoteChange={handleNoteChange}
          onToggleNotes={toggleNotes}
          onToggleFavorite={toggleFavorite}
          onOpenCalculator={openCalculator}
          onOpenClinicalSupport={openClinicalSupport}
        />

        {filteredConditions.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                {showFavoritesOnly ? (
                  <Star className="h-16 w-16 text-gray-300 mx-auto" />
                ) : (
                  <Search className="h-16 w-16 text-gray-300 mx-auto" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {showFavoritesOnly ? "No favorites found" : "No conditions found"}
              </h3>
              <p className="text-gray-600">
                {showFavoritesOnly
                  ? "Start adding conditions to your favorites by clicking the star icon."
                  : "Try adjusting your search terms or filter criteria to find what you're looking for."}
              </p>
            </div>
          </div>
        )}

        <DataManager
          notes={notes}
          favorites={favorites}
          recentSearches={recentSearches}
          onImportData={handleDataImport}
        />
      </main>
    </div>
  )
}
