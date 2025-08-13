"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Search,
  AlertTriangle,
  Stethoscope,
  Activity,
  Book,
  Globe,
  Filter,
  Clock,
  Users,
  StickyNote,
  ChevronDown,
  ChevronUp,
  Save,
  Calculator,
  X,
} from "lucide-react"
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

const emergencyConditions: EmergencyCondition[] = emergencyConditionsData as EmergencyCondition[]

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
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("All")
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>({})
  const [notesSaving, setNotesSaving] = useState<Record<number, boolean>>({})
  const [calculatorOpen, setCalculatorOpen] = useState<number | null>(null)
  const [patientWeight, setPatientWeight] = useState("")
  const [patientHeight, setPatientHeight] = useState("")
  const [patientAge, setPatientAge] = useState("")
  const [drugConcentration, setDrugConcentration] = useState("")
  const [calculatedDose, setCalculatedDose] = useState<{
    totalDose: number
    volume: number
    bmi: number
    bsa: number
  } | null>(null)

  useEffect(() => {
    const savedNotes = localStorage.getItem("emergency-reference-notes")
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes))
      } catch (error) {
        console.error("Error loading notes from localStorage:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("emergency-reference-notes", JSON.stringify(notes))
  }, [notes])

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
    setPatientWeight("")
    setPatientHeight("")
    setPatientAge("")
    setDrugConcentration("")
    setCalculatedDose(null)
  }

  const closeCalculator = () => {
    setCalculatorOpen(null)
    setCalculatedDose(null)
  }

  const calculateDosage = (condition: EmergencyCondition, isPediatric = false) => {
    const weight = Number.parseFloat(patientWeight)
    const height = Number.parseFloat(patientHeight)
    const concentration = Number.parseFloat(drugConcentration)

    if (!weight || weight <= 0) return

    const treatment = isPediatric ? condition.pedsTreatment : condition.adultTreatment
    if (!treatment) return

    let totalDose = 0
    let volume = 0

    if (treatment.doseMgPerKg) {
      const mgPerKg = Number.parseFloat(treatment.doseMgPerKg.replace(/[^\d.]/g, ""))
      if (mgPerKg) {
        totalDose = mgPerKg * weight

        if (treatment.maxDose) {
          const maxDoseValue = Number.parseFloat(treatment.maxDose.replace(/[^\d.]/g, ""))
          if (maxDoseValue && totalDose > maxDoseValue) {
            totalDose = maxDoseValue
          }
        }
      }
    }

    if (concentration > 0 && totalDose > 0) {
      volume = totalDose / concentration
    }

    let bmi = 0
    if (height > 0) {
      const heightInMeters = height / 100
      bmi = weight / (heightInMeters * heightInMeters)
    }

    let bsa = 0
    if (height > 0) {
      bsa = Math.sqrt((height * weight) / 3600)
    }

    setCalculatedDose({
      totalDose,
      volume,
      bmi,
      bsa,
    })
  }

  const filteredConditions = useMemo(() => {
    return emergencyConditions.filter((condition) => {
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

      return matchesSearch && matchesSpecialty
    })
  }, [searchTerm, selectedSpecialty, notes])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
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
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conditions, symptoms, treatments, ICD codes, or your notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none min-w-48"
                  >
                    {specialties.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty === "All" ? "All Specialties" : specialty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              Specialty Color Legend
            </h3>
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
        </div>

        <div className="space-y-6">
          {filteredConditions.map((condition) => (
            <div
              key={condition.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className={`${specialtyColors[condition.specialty]} px-6 py-4 border-b`}>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <h2 className="text-xl font-bold leading-tight">{condition.condition}</h2>
                      <div className="text-2xl">{ageGroupIcons[condition.ageGroup]}</div>
                      {notes[condition.id]?.trim() && (
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
                      onClick={() => openCalculator(condition.id)}
                      className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      <Calculator className="h-3 w-3" />
                      Calculator
                    </button>
                    <button
                      onClick={() => toggleNotes(condition.id)}
                      className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      <StickyNote className="h-3 w-3" />
                      Notes
                      {expandedNotes[condition.id] ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {calculatorOpen === condition.id && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calculator className="h-6 w-6" />
                        <div>
                          <h3 className="text-lg font-semibold">Dosage Calculator</h3>
                          <p className="text-blue-100 text-sm">{condition.condition}</p>
                        </div>
                      </div>
                      <button onClick={closeCalculator} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="p-6 space-y-6">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-4">Patient Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg) *</label>
                            <input
                              type="number"
                              value={patientWeight}
                              onChange={(e) => setPatientWeight(e.target.value)}
                              placeholder="70"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                            <input
                              type="number"
                              value={patientHeight}
                              onChange={(e) => setPatientHeight(e.target.value)}
                              placeholder="170"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Age (years)</label>
                            <input
                              type="number"
                              value={patientAge}
                              onChange={(e) => setPatientAge(e.target.value)}
                              placeholder="30"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-4">
                        <h4 className="font-semibold text-blue-900 mb-4">Drug Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-blue-700 mb-2">
                              Drug Concentration (mg/mL)
                            </label>
                            <input
                              type="number"
                              value={drugConcentration}
                              onChange={(e) => setDrugConcentration(e.target.value)}
                              placeholder="10"
                              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => calculateDosage(condition, Number.parseInt(patientAge) < 18)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                              Calculate Dosage
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 rounded-xl p-4">
                          <h4 className="font-semibold text-green-900 mb-3">Adult Treatment</h4>
                          <div className="space-y-2 text-sm">
                            <p>
                              <span className="font-medium">Drug:</span> {condition.adultTreatment.drugName}
                            </p>
                            {condition.adultTreatment.dose && (
                              <p>
                                <span className="font-medium">Dose:</span> {condition.adultTreatment.dose}
                              </p>
                            )}
                            {condition.adultTreatment.doseMgPerKg && (
                              <p>
                                <span className="font-medium">mg/kg:</span> {condition.adultTreatment.doseMgPerKg}
                              </p>
                            )}
                            {condition.adultTreatment.maxDose && (
                              <p>
                                <span className="font-medium">Max:</span> {condition.adultTreatment.maxDose}
                              </p>
                            )}
                          </div>
                        </div>

                        {condition.pedsTreatment && (
                          <div className="bg-yellow-50 rounded-xl p-4">
                            <h4 className="font-semibold text-yellow-900 mb-3">Pediatric Treatment</h4>
                            <div className="space-y-2 text-sm">
                              <p>
                                <span className="font-medium">Drug:</span> {condition.pedsTreatment.drugName}
                              </p>
                              {condition.pedsTreatment.dose && (
                                <p>
                                  <span className="font-medium">Dose:</span> {condition.pedsTreatment.dose}
                                </p>
                              )}
                              {condition.pedsTreatment.doseMgPerKg && (
                                <p>
                                  <span className="font-medium">mg/kg:</span> {condition.pedsTreatment.doseMgPerKg}
                                </p>
                              )}
                              {condition.pedsTreatment.maxDose && (
                                <p>
                                  <span className="font-medium">Max:</span> {condition.pedsTreatment.maxDose}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {calculatedDose && (
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                          <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                            <Calculator className="h-5 w-5" />
                            Calculation Results
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              {calculatedDose.totalDose > 0 && (
                                <div className="bg-white rounded-lg p-3">
                                  <p className="text-sm text-gray-600">Total Dose</p>
                                  <p className="text-xl font-bold text-purple-900">
                                    {calculatedDose.totalDose.toFixed(1)} mg
                                  </p>
                                </div>
                              )}
                              {calculatedDose.volume > 0 && (
                                <div className="bg-white rounded-lg p-3">
                                  <p className="text-sm text-gray-600">Volume to Administer</p>
                                  <p className="text-xl font-bold text-purple-900">
                                    {calculatedDose.volume.toFixed(2)} mL
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="space-y-3">
                              {calculatedDose.bmi > 0 && (
                                <div className="bg-white rounded-lg p-3">
                                  <p className="text-sm text-gray-600">BMI</p>
                                  <p className="text-xl font-bold text-purple-900">
                                    {calculatedDose.bmi.toFixed(1)} kg/m²
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {calculatedDose.bmi < 18.5
                                      ? "Underweight"
                                      : calculatedDose.bmi < 25
                                        ? "Normal"
                                        : calculatedDose.bmi < 30
                                          ? "Overweight"
                                          : "Obese"}
                                  </p>
                                </div>
                              )}
                              {calculatedDose.bsa > 0 && (
                                <div className="bg-white rounded-lg p-3">
                                  <p className="text-sm text-gray-600">Body Surface Area</p>
                                  <p className="text-xl font-bold text-purple-900">
                                    {calculatedDose.bsa.toFixed(2)} m²
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                        <h4 className="font-semibold text-amber-900 mb-2">Quick Reference</h4>
                        <div className="text-sm text-amber-800 space-y-1">
                          <p>• BMI = Weight (kg) ÷ Height² (m²)</p>
                          <p>• BSA = √[(Height (cm) × Weight (kg)) ÷ 3600]</p>
                          <p>• Volume = Total Dose (mg) ÷ Concentration (mg/mL)</p>
                          <p>• Always verify calculations and check maximum doses</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {expandedNotes[condition.id] && (
                <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-amber-900 flex items-center gap-2">
                      <StickyNote className="h-4 w-4" />
                      Personal Notes
                    </h4>
                    {notesSaving[condition.id] && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <Save className="h-3 w-3" />
                        Saved
                      </div>
                    )}
                  </div>
                  <textarea
                    value={notes[condition.id] || ""}
                    onChange={(e) => handleNoteChange(condition.id, e.target.value)}
                    placeholder="Add your personal notes, observations, or reminders for this condition..."
                    className="w-full p-3 border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-vertical min-h-[100px]"
                  />
                  <p className="text-xs text-amber-700 mt-2">
                    Notes are automatically saved and stored locally in your browser.
                  </p>
                </div>
              )}

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
                      <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                        👨‍⚕️ Adult Treatment
                      </h4>
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
            </div>
          ))}
        </div>

        {filteredConditions.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <Search className="h-16 w-16 text-gray-300 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No conditions found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or filter criteria to find what you&#39;re looking for.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
