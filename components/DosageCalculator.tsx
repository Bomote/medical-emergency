"use client"

import type React from "react"

import { useState } from "react"
import { Calculator, X } from "lucide-react"

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

interface EmergencyCondition {
  id: number
  condition: string
  adultTreatment: Treatment
  pedsTreatment: Treatment | null
}

interface DosageCalculatorProps {
  condition: EmergencyCondition
  isOpen: boolean
  onClose: () => void
}

export default function DosageCalculator({ condition, isOpen, onClose }: DosageCalculatorProps) {
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

  const calculateDosage = (isPediatric = false) => {
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

  const handleClose = () => {
    setPatientWeight("")
    setPatientHeight("")
    setPatientAge("")
    setDrugConcentration("")
    setCalculatedDose(null)
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="h-6 w-6" />
            <div>
              <h3 className="text-lg font-semibold">Dosage Calculator</h3>
              <p className="text-blue-100 text-sm">{condition.condition}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
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
                <label className="block text-sm font-medium text-blue-700 mb-2">Drug Concentration (mg/mL)</label>
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
                  onClick={() => calculateDosage(Number.parseInt(patientAge) < 18)}
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
                      <p className="text-xl font-bold text-purple-900">{calculatedDose.totalDose.toFixed(1)} mg</p>
                    </div>
                  )}
                  {calculatedDose.volume > 0 && (
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-sm text-gray-600">Volume to Administer</p>
                      <p className="text-xl font-bold text-purple-900">{calculatedDose.volume.toFixed(2)} mL</p>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {calculatedDose.bmi > 0 && (
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-sm text-gray-600">BMI</p>
                      <p className="text-xl font-bold text-purple-900">{calculatedDose.bmi.toFixed(1)} kg/m²</p>
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
                      <p className="text-xl font-bold text-purple-900">{calculatedDose.bsa.toFixed(2)} m²</p>
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
  )
}
