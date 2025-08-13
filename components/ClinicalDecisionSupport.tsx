"use client"

import type React from "react"

import { useState } from "react"
import { X, AlertTriangle, Heart, Brain, TreesIcon as Lungs, Activity, Zap, Target } from "lucide-react"

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
  icd10Code: string // Changed from icd10 to icd10Code
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
  pedsTreatment: Treatment | null // Changed from pediatricTreatment to pedsTreatment
  procedure: string | null
  references: Reference[] | null
  whoGuideline: string | null
  lastUpdated: string
  keywords: string[]
}

interface ClinicalDecisionSupportProps {
  condition: EmergencyCondition
  isOpen: boolean
  onClose: () => void
}

interface ScoringResult {
  score: number
  risk: "Low" | "Moderate" | "High" | "Very High"
  recommendation: string
  color: string
}

export default function ClinicalDecisionSupport({ condition, isOpen, onClose }: ClinicalDecisionSupportProps) {
  // CURB-65 Score State
  const [curb65, setCurb65] = useState({
    confusion: false,
    urea: false,
    respiratoryRate: false,
    bloodPressure: false,
    age: false,
  })

  // qSOFA Score State
  const [qsofa, setQsofa] = useState({
    alteredMentation: false,
    systolicBP: false,
    respiratoryRate: false,
  })

  // GCS Score State
  const [gcs, setGcs] = useState({
    eyeOpening: 4,
    verbalResponse: 5,
    motorResponse: 6,
  })

  // Drug Allergy State
  const [allergies, setAllergies] = useState({
    penicillin: false,
    sulfa: false,
    nsaids: false,
    opioids: false,
    contrast: false,
  })

  // Wells Score for PE State
  const [wellsPE, setWellsPE] = useState({
    clinicalSigns: false,
    alternativeDiagnosis: false,
    heartRate: false,
    immobilization: false,
    previousPE: false,
    hemoptysis: false,
    malignancy: false,
  })

  // CHADS2-VASc State
  const [chadsVasc, setChadsVasc] = useState({
    chf: false,
    hypertension: false,
    age75: false,
    diabetes: false,
    stroke: false,
    vascular: false,
    age65: false,
    female: false,
  })

  // NIHSS State
  const [nihss, setNihss] = useState({
    consciousness: 0,
    gaze: 0,
    visual: 0,
    facialPalsy: 0,
    motorArm: 0,
    motorLeg: 0,
    limbAtaxia: 0,
    sensory: 0,
    language: 0,
    dysarthria: 0,
    extinction: 0,
  })

  // SOFA Score State
  const [sofa, setSofa] = useState({
    respiration: 0,
    coagulation: 0,
    liver: 0,
    cardiovascular: 0,
    cns: 0,
    renal: 0,
  })

  if (!isOpen) return null

  // CURB-65 Calculation
  const calculateCurb65 = (): ScoringResult => {
    const score = Object.values(curb65).filter(Boolean).length

    if (score <= 1) {
      return {
        score,
        risk: "Low",
        recommendation: "Consider outpatient treatment. Low risk of mortality (<3%).",
        color: "text-green-600 bg-green-50 border-green-200",
      }
    } else if (score === 2) {
      return {
        score,
        risk: "Moderate",
        recommendation: "Consider short inpatient stay or supervised outpatient treatment. Moderate risk (3-15%).",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      }
    } else {
      return {
        score,
        risk: "High",
        recommendation: "Severe pneumonia. Consider ICU admission. High mortality risk (>15%).",
        color: "text-red-600 bg-red-50 border-red-200",
      }
    }
  }

  // qSOFA Calculation
  const calculateQsofa = (): ScoringResult => {
    const score = Object.values(qsofa).filter(Boolean).length

    if (score < 2) {
      return {
        score,
        risk: "Low",
        recommendation: "Low risk for sepsis. Continue monitoring.",
        color: "text-green-600 bg-green-50 border-green-200",
      }
    } else {
      return {
        score,
        risk: "High",
        recommendation: "High risk for sepsis. Consider ICU evaluation and immediate intervention.",
        color: "text-red-600 bg-red-50 border-red-200",
      }
    }
  }

  // GCS Calculation
  const calculateGcs = (): ScoringResult => {
    const score = gcs.eyeOpening + gcs.verbalResponse + gcs.motorResponse

    if (score >= 13) {
      return {
        score,
        risk: "Low",
        recommendation: "Mild brain injury. Monitor closely.",
        color: "text-green-600 bg-green-50 border-green-200",
      }
    } else if (score >= 9) {
      return {
        score,
        risk: "Moderate",
        recommendation: "Moderate brain injury. Consider CT scan and neurosurgical consultation.",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      }
    } else {
      return {
        score,
        risk: "High",
        recommendation: "Severe brain injury. Immediate neurosurgical consultation and ICU care.",
        color: "text-red-600 bg-red-50 border-red-200",
      }
    }
  }

  // Get drug alternatives based on allergies
  const getDrugAlternatives = () => {
    const alternatives: Record<string, string[]> = {
      penicillin: ["Cephalexin (if no cross-reactivity)", "Azithromycin", "Clindamycin", "Vancomycin"],
      sulfa: ["Avoid Bactrim, use Doxycycline", "Cephalexin", "Azithromycin"],
      nsaids: ["Acetaminophen", "Topical analgesics", "Low-dose opioids if needed"],
      opioids: ["Acetaminophen", "NSAIDs (if not contraindicated)", "Tramadol", "Gabapentin"],
      contrast: ["Pre-medication with steroids/antihistamines", "Use alternative imaging", "Non-contrast studies"],
    }

    return Object.entries(allergies)
      .filter(([_, isAllergic]) => isAllergic)
      .map(([allergy, _]) => ({
        allergy: allergy.charAt(0).toUpperCase() + allergy.slice(1),
        alternatives: alternatives[allergy] || [],
      }))
  }

  // Wells Score for PE Calculation
  const calculateWellsPE = (): ScoringResult => {
    let score = 0
    if (wellsPE.clinicalSigns) score += 3
    if (wellsPE.alternativeDiagnosis) score -= 3
    if (wellsPE.heartRate) score += 1.5
    if (wellsPE.immobilization) score += 1.5
    if (wellsPE.previousPE) score += 1.5
    if (wellsPE.hemoptysis) score += 1
    if (wellsPE.malignancy) score += 1

    if (score <= 4) {
      return {
        score,
        risk: "Low",
        recommendation: "PE unlikely. Consider D-dimer. If negative, PE ruled out.",
        color: "text-green-600 bg-green-50 border-green-200",
      }
    } else {
      return {
        score,
        risk: "High",
        recommendation: "PE likely. Proceed directly to CTPA or V/Q scan.",
        color: "text-red-600 bg-red-50 border-red-200",
      }
    }
  }

  // CHADS2-VASc Calculation
  const calculateChadsVasc = (): ScoringResult => {
    let score = 0
    if (chadsVasc.chf) score += 1
    if (chadsVasc.hypertension) score += 1
    if (chadsVasc.age75) score += 2
    if (chadsVasc.diabetes) score += 1
    if (chadsVasc.stroke) score += 2
    if (chadsVasc.vascular) score += 1
    if (chadsVasc.age65) score += 1
    if (chadsVasc.female) score += 1

    if (score === 0) {
      return {
        score,
        risk: "Low",
        recommendation: "No anticoagulation recommended. Annual stroke risk <1%.",
        color: "text-green-600 bg-green-50 border-green-200",
      }
    } else if (score === 1) {
      return {
        score,
        risk: "Low",
        recommendation: "Consider anticoagulation. Annual stroke risk 1-2%.",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      }
    } else {
      return {
        score,
        risk: "High",
        recommendation: "Anticoagulation recommended. Annual stroke risk >2%.",
        color: "text-red-600 bg-red-50 border-red-200",
      }
    }
  }

  // NIHSS Calculation
  const calculateNIHSS = (): ScoringResult => {
    const score = Object.values(nihss).reduce((sum, value) => sum + value, 0)

    if (score <= 4) {
      return {
        score,
        risk: "Low",
        recommendation: "Minor stroke. Consider outpatient management with close follow-up.",
        color: "text-green-600 bg-green-50 border-green-200",
      }
    } else if (score <= 15) {
      return {
        score,
        risk: "Moderate",
        recommendation: "Moderate stroke. Admit for monitoring and rehabilitation.",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      }
    } else {
      return {
        score,
        risk: "High",
        recommendation: "Severe stroke. Consider ICU care and aggressive intervention.",
        color: "text-red-600 bg-red-50 border-red-200",
      }
    }
  }

  // SOFA Score Calculation
  const calculateSOFA = (): ScoringResult => {
    const score = Object.values(sofa).reduce((sum, value) => sum + value, 0)

    if (score <= 6) {
      return {
        score,
        risk: "Low",
        recommendation: "Low mortality risk (<10%). Continue monitoring.",
        color: "text-green-600 bg-green-50 border-green-200",
      }
    } else if (score <= 12) {
      return {
        score,
        risk: "Moderate",
        recommendation: "Moderate mortality risk (15-20%). Consider ICU care.",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      }
    } else {
      return {
        score,
        risk: "High",
        recommendation: "High mortality risk (>40%). Intensive care required.",
        color: "text-red-600 bg-red-50 border-red-200",
      }
    }
  }

  // Enhanced condition-specific alerts
  const getConditionSpecificAlerts = () => {
    const conditionName = condition.condition.toLowerCase()
    const alerts = []

    // Respiratory conditions
    if (conditionName.includes("asthma") || conditionName.includes("copd")) {
      alerts.push({
        type: "contraindication",
        message: "Avoid beta-blockers - can trigger severe bronchospasm",
        severity: "high",
      })
      alerts.push({
        type: "monitoring",
        message: "Monitor peak flow, oxygen saturation, and arterial blood gases",
        severity: "medium",
      })
    }

    // Cardiac conditions
    if (conditionName.includes("heart") || conditionName.includes("cardiac") || conditionName.includes("coronary")) {
      alerts.push({
        type: "contraindication",
        message: "Check renal function before ACE inhibitors/ARBs",
        severity: "high",
      })
      alerts.push({
        type: "monitoring",
        message: "Serial ECGs and cardiac enzymes required",
        severity: "high",
      })
    }

    // Stroke
    if (conditionName.includes("stroke")) {
      alerts.push({
        type: "time-critical",
        message: "Time is brain! Consider thrombolysis within 4.5 hours",
        severity: "critical",
      })
      alerts.push({
        type: "contraindication",
        message: "Check for bleeding contraindications before thrombolysis",
        severity: "critical",
      })
    }

    // Sepsis
    if (conditionName.includes("sepsis")) {
      alerts.push({
        type: "time-critical",
        message: "Hour-1 bundle: Blood cultures, lactate, antibiotics, fluids",
        severity: "critical",
      })
      alerts.push({
        type: "monitoring",
        message: "Serial lactate levels and organ function assessment",
        severity: "high",
      })
    }

    // Pulmonary embolism
    if (conditionName.includes("embolism") || conditionName.includes("pe")) {
      alerts.push({
        type: "contraindication",
        message: "Check bleeding risk before anticoagulation",
        severity: "high",
      })
      alerts.push({
        type: "monitoring",
        message: "Monitor for signs of massive PE requiring thrombolysis",
        severity: "high",
      })
    }

    // Diabetic emergencies
    if (conditionName.includes("diabetic") || conditionName.includes("dka") || conditionName.includes("hypoglycemia")) {
      alerts.push({
        type: "monitoring",
        message: "Frequent glucose, electrolytes, and ketone monitoring",
        severity: "high",
      })
      alerts.push({
        type: "contraindication",
        message: "Avoid rapid glucose correction - risk of cerebral edema",
        severity: "high",
      })
    }

    return alerts
  }

  // Determine which scoring systems are most relevant
  const getRelevantScores = () => {
    const conditionName = condition.condition.toLowerCase()
    const relevant = []

    // Always show drug allergies and GCS
    relevant.push("allergies", "gcs")

    if (conditionName.includes("pneumonia")) relevant.push("curb65")
    if (conditionName.includes("sepsis")) relevant.push("qsofa", "sofa")
    if (conditionName.includes("embolism") || conditionName.includes("pe")) relevant.push("wellsPE")
    if (conditionName.includes("stroke")) relevant.push("nihss", "chadsVasc")
    if (conditionName.includes("heart") || conditionName.includes("cardiac")) relevant.push("chadsVasc")

    return relevant
  }

  const relevantScores = getRelevantScores()

  const curb65Result = calculateCurb65()
  const qsofaResult = calculateQsofa()
  const gcsResult = calculateGcs()
  const drugAlternatives = getDrugAlternatives()
  const wellsPEResult = calculateWellsPE()
  const chadsVascResult = calculateChadsVasc()
  const nihssResult = calculateNIHSS()
  const sofaResult = calculateSOFA()
  const conditionAlerts = getConditionSpecificAlerts()

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Activity className="h-6 w-6" />
                Clinical Decision Support
              </h2>
              <p className="text-blue-100 mt-1">Evidence-based tools for {condition.condition}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Condition-Specific Alerts */}
          {conditionAlerts.length > 0 && (
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Critical Alerts for {condition.condition}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {conditionAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      alert.severity === "critical"
                        ? "bg-red-100 border-red-300"
                        : alert.severity === "high"
                          ? "bg-orange-100 border-orange-300"
                          : "bg-yellow-100 border-yellow-300"
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">
                      {alert.type === "time-critical"
                        ? "⏰ Time Critical"
                        : alert.type === "contraindication"
                          ? "⚠️ Contraindication"
                          : "🔍 Monitoring"}
                    </div>
                    <div className="text-sm text-gray-700">{alert.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drug Allergies Section */}
          {relevantScores.includes("allergies") && (
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Drug Allergies & Contraindications
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                {Object.entries(allergies).map(([allergy, isChecked]) => (
                  <label key={allergy} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => setAllergies((prev) => ({ ...prev, [allergy]: e.target.checked }))}
                      className="rounded border-red-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-red-800 capitalize">{allergy}</span>
                  </label>
                ))}
              </div>

              {drugAlternatives.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-red-900">⚠️ Alternative Medications:</h4>
                  {drugAlternatives.map(({ allergy, alternatives }) => (
                    <div key={allergy} className="bg-white rounded-lg p-3 border border-red-200">
                      <div className="font-medium text-red-800 mb-2">{allergy} Allergy - Use instead:</div>
                      <div className="flex flex-wrap gap-2">
                        {alternatives.map((alt, idx) => (
                          <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                            {alt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Scoring Systems Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Wells Score for PE */}
            {relevantScores.includes("wellsPE") && (
              <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Wells Score (PE)
                </h3>
                <p className="text-sm text-indigo-700 mb-4">Pulmonary embolism probability</p>

                <div className="space-y-3 mb-4">
                  {[
                    { key: "clinicalSigns", label: "Clinical signs of DVT (+3)", points: 3 },
                    { key: "alternativeDiagnosis", label: "Alternative diagnosis less likely (-3)", points: -3 },
                    { key: "heartRate", label: "Heart rate >100 bpm (+1.5)", points: 1.5 },
                    { key: "immobilization", label: "Immobilization/surgery (+1.5)", points: 1.5 },
                    { key: "previousPE", label: "Previous PE/DVT (+1.5)", points: 1.5 },
                    { key: "hemoptysis", label: "Hemoptysis (+1)", points: 1 },
                    { key: "malignancy", label: "Malignancy (+1)", points: 1 },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wellsPE[key as keyof typeof wellsPE]}
                        onChange={(e) => setWellsPE((prev) => ({ ...prev, [key]: e.target.checked }))}
                        className="mt-1 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-indigo-800">{label}</span>
                    </label>
                  ))}
                </div>

                <div className={`rounded-lg p-3 border ${wellsPEResult.color}`}>
                  <div className="font-bold">Score: {wellsPEResult.score.toFixed(1)}</div>
                  <div className="font-semibold">Probability: {wellsPEResult.risk}</div>
                  <div className="text-sm mt-1">{wellsPEResult.recommendation}</div>
                </div>
              </div>
            )}

            {/* CURB-65 Score */}
            {relevantScores.includes("curb65") && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <Lungs className="h-5 w-5" />
                  CURB-65 Score
                </h3>
                <p className="text-sm text-blue-700 mb-4">Pneumonia severity assessment</p>

                <div className="space-y-3 mb-4">
                  {[
                    { key: "confusion", label: "Confusion/Disorientation" },
                    { key: "urea", label: "Urea >7 mmol/L (BUN >19 mg/dL)" },
                    { key: "respiratoryRate", label: "Respiratory Rate ≥30/min" },
                    { key: "bloodPressure", label: "BP <90/60 mmHg" },
                    { key: "age", label: "Age ≥65 years" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={curb65[key as keyof typeof curb65]}
                        onChange={(e) => setCurb65((prev) => ({ ...prev, [key]: e.target.checked }))}
                        className="mt-1 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-blue-800">{label}</span>
                    </label>
                  ))}
                </div>

                <div className={`rounded-lg p-3 border ${curb65Result.color}`}>
                  <div className="font-bold">Score: {curb65Result.score}/5</div>
                  <div className="font-semibold">Risk: {curb65Result.risk}</div>
                  <div className="text-sm mt-1">{curb65Result.recommendation}</div>
                </div>
              </div>
            )}

            {/* qSOFA Score */}
            {relevantScores.includes("qsofa") && (
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  qSOFA Score
                </h3>
                <p className="text-sm text-orange-700 mb-4">Quick sepsis assessment</p>

                <div className="space-y-3 mb-4">
                  {[
                    { key: "alteredMentation", label: "Altered mental status (GCS <15)" },
                    { key: "systolicBP", label: "Systolic BP ≤100 mmHg" },
                    { key: "respiratoryRate", label: "Respiratory Rate ≥22/min" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={qsofa[key as keyof typeof qsofa]}
                        onChange={(e) => setQsofa((prev) => ({ ...prev, [key]: e.target.checked }))}
                        className="mt-1 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-orange-800">{label}</span>
                    </label>
                  ))}
                </div>

                <div className={`rounded-lg p-3 border ${qsofaResult.color}`}>
                  <div className="font-bold">Score: {qsofaResult.score}/3</div>
                  <div className="font-semibold">Risk: {qsofaResult.risk}</div>
                  <div className="text-sm mt-1">{qsofaResult.recommendation}</div>
                </div>
              </div>
            )}

            {/* GCS Score */}
            {relevantScores.includes("gcs") && (
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Glasgow Coma Scale
                </h3>
                <p className="text-sm text-purple-700 mb-4">Neurological assessment</p>

                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-800 mb-1">Eye Opening</label>
                    <select
                      value={gcs.eyeOpening}
                      onChange={(e) => setGcs((prev) => ({ ...prev, eyeOpening: Number(e.target.value) }))}
                      className="w-full p-2 border border-purple-300 rounded focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value={4}>Spontaneous (4)</option>
                      <option value={3}>To voice (3)</option>
                      <option value={2}>To pain (2)</option>
                      <option value={1}>None (1)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-800 mb-1">Verbal Response</label>
                    <select
                      value={gcs.verbalResponse}
                      onChange={(e) => setGcs((prev) => ({ ...prev, verbalResponse: Number(e.target.value) }))}
                      className="w-full p-2 border border-purple-300 rounded focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value={5}>Oriented (5)</option>
                      <option value={4}>Confused (4)</option>
                      <option value={3}>Inappropriate (3)</option>
                      <option value={2}>Incomprehensible (2)</option>
                      <option value={1}>None (1)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-800 mb-1">Motor Response</label>
                    <select
                      value={gcs.motorResponse}
                      onChange={(e) => setGcs((prev) => ({ ...prev, motorResponse: Number(e.target.value) }))}
                      className="w-full p-2 border border-purple-300 rounded focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value={6}>Obeys commands (6)</option>
                      <option value={5}>Localizes pain (5)</option>
                      <option value={4}>Withdraws from pain (4)</option>
                      <option value={3}>Flexion to pain (3)</option>
                      <option value={2}>Extension to pain (2)</option>
                      <option value={1}>None (1)</option>
                    </select>
                  </div>
                </div>

                <div className={`rounded-lg p-3 border ${gcsResult.color}`}>
                  <div className="font-bold">Total GCS: {gcsResult.score}/15</div>
                  <div className="font-semibold">Severity: {gcsResult.risk}</div>
                  <div className="text-sm mt-1">{gcsResult.recommendation}</div>
                </div>
              </div>
            )}

            {/* CHADS2-VASc Score */}
            {relevantScores.includes("chadsVasc") && (
              <div className="bg-pink-50 rounded-xl p-6 border border-pink-200">
                <h3 className="text-lg font-bold text-pink-900 mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  CHADS2-VASc Score
                </h3>
                <p className="text-sm text-pink-700 mb-4">Stroke risk assessment</p>

                <div className="space-y-3 mb-4">
                  {[
                    { key: "chf", label: "Congestive heart failure (+1)" },
                    { key: "hypertension", label: "Hypertension (+1)" },
                    { key: "age75", label: "Age ≥75 years (+2)" },
                    { key: "diabetes", label: "Diabetes mellitus (+1)" },
                    { key: "stroke", label: "Prior stroke (+2)" },
                    { key: "vascular", label: "Vascular disease (+1)" },
                    { key: "age65", label: "Age ≥65 years (+1)" },
                    { key: "female", label: "Female gender (+1)" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={chadsVasc[key as keyof typeof chadsVasc]}
                        onChange={(e) => setChadsVasc((prev) => ({ ...prev, [key]: e.target.checked }))}
                        className="mt-1 rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                      />
                      <span className="text-sm text-pink-800">{label}</span>
                    </label>
                  ))}
                </div>

                <div className={`rounded-lg p-3 border ${chadsVascResult.color}`}>
                  <div className="font-bold">Score: {chadsVascResult.score}</div>
                  <div className="font-semibold">Risk: {chadsVascResult.risk}</div>
                  <div className="text-sm mt-1">{chadsVascResult.recommendation}</div>
                </div>
              </div>
            )}

            {/* SOFA Score */}
            {relevantScores.includes("sofa") && (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  SOFA Score
                </h3>
                <p className="text-sm text-gray-700 mb-4">Sepsis severity assessment</p>

                <div className="space-y-3 mb-4">
                  {[
                    { key: "respiration", label: "Respiratory system" },
                    { key: "coagulation", label: "Coagulation system" },
                    { key: "liver", label: "Liver enzymes" },
                    { key: "cardiovascular", label: "Cardiovascular system" },
                    { key: "cns", label: "Central nervous system" },
                    { key: "renal", label: "Renal function" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-800 mb-1">{label}</label>
                      <select
                        value={sofa[key as keyof typeof sofa]}
                        onChange={(e) => setSofa((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-gray-500 focus:border-gray-500"
                      >
                        {Array.from({ length: 4 }, (_, i) => (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className={`rounded-lg p-3 border ${sofaResult.color}`}>
                  <div className="font-bold">Score: {sofaResult.score}/6</div>
                  <div className="font-semibold">Severity: {sofaResult.risk}</div>
                  <div className="text-sm mt-1">{sofaResult.recommendation}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
