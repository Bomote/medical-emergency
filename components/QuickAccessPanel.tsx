"use client"

import { AlertTriangle, X } from "lucide-react"

interface EmergencyCondition {
  id: number
  orderRank: number
  condition: string
  specialty: string
  ageGroup: "Adult" | "Pediatric" | "Both"
}

interface QuickAccessPanelProps {
  conditions: EmergencyCondition[]
  isVisible: boolean
  onClose: () => void
}

const ageGroupIcons = {
  Adult: "👨‍⚕️",
  Pediatric: "👶",
  Both: "👥",
}

export default function QuickAccessPanel({ conditions, isVisible, onClose }: QuickAccessPanelProps) {
  if (!isVisible) return null

  return (
    <div className="mb-8 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl shadow-lg border border-red-200 overflow-hidden">
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold text-lg">
            <AlertTriangle className="h-6 w-6" />
            Most Critical Conditions - Quick Access
          </h3>
          <button onClick={onClose} className="text-red-200 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-red-100 text-sm mt-1">Life-threatening conditions requiring immediate attention</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {conditions.map((condition) => (
            <button
              key={condition.id}
              onClick={() => {
                const element = document.getElementById(`condition-${condition.id}`)
                element?.scrollIntoView({ behavior: "smooth", block: "center" })
              }}
              className="bg-white hover:bg-red-50 border border-red-200 rounded-lg p-3 text-left transition-all hover:shadow-md group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-red-600">#{condition.orderRank}</span>
                <div className="text-lg">{ageGroupIcons[condition.ageGroup]}</div>
              </div>
              <div className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-red-700">
                {condition.condition}
              </div>
              <div className="text-xs text-gray-500 mt-1">{condition.specialty}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
