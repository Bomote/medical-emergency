"use client"

import { useMemo } from "react"
import { ArrowRight, Stethoscope, Hash } from "lucide-react"

interface EmergencyCondition {
  id: number
  condition: string
  icd10Code: string
  specialty: string
  keywords: string[]
  orderRank: number
}

interface RelatedConditionsProps {
  currentCondition: EmergencyCondition
  allConditions: EmergencyCondition[]
  onConditionSelect: (conditionId: number) => void
}

export default function RelatedConditions({
  currentCondition,
  allConditions,
  onConditionSelect,
}: RelatedConditionsProps) {
  const relatedConditions = useMemo(() => {
    const related: Array<{ condition: EmergencyCondition; score: number }> = []

    allConditions.forEach((condition) => {
      if (condition.id === currentCondition.id) return

      let score = 0

      // Same specialty gets high score
      if (condition.specialty === currentCondition.specialty) {
        score += 3
      }

      // Shared keywords get points
      const sharedKeywords = condition.keywords.filter((keyword) => currentCondition.keywords.includes(keyword))
      score += sharedKeywords.length * 2

      // Similar condition names (basic text similarity)
      const currentWords = currentCondition.condition.toLowerCase().split(" ")
      const conditionWords = condition.condition.toLowerCase().split(" ")
      const sharedWords = currentWords.filter((word) => conditionWords.includes(word) && word.length > 3)
      score += sharedWords.length

      // Proximity in order rank (similar severity/commonness)
      const rankDifference = Math.abs(condition.orderRank - currentCondition.orderRank)
      if (rankDifference <= 5) score += 2
      else if (rankDifference <= 10) score += 1

      if (score > 0) {
        related.push({ condition, score })
      }
    })

    // Sort by score and return top 6
    return related
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((item) => item.condition)
  }, [currentCondition, allConditions])

  if (relatedConditions.length === 0) {
    return null
  }

  const scrollToCondition = (conditionId: number) => {
    const element = document.getElementById(`condition-${conditionId}`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      // Highlight the condition briefly
      element.classList.add("ring-2", "ring-blue-500", "ring-opacity-50")
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-blue-500", "ring-opacity-50")
      }, 2000)
    }
    onConditionSelect(conditionId)
  }

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
      <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
        <Stethoscope className="h-4 w-4" />
        Related Conditions
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {relatedConditions.map((condition) => (
          <button
            key={condition.id}
            onClick={() => scrollToCondition(condition.id)}
            className="flex items-center gap-2 p-3 bg-white rounded-lg border border-indigo-200 hover:border-indigo-300 hover:shadow-sm transition-all text-left group"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-indigo-900 truncate group-hover:text-indigo-700">
                {condition.condition}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded">{condition.specialty}</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {condition.icd10Code}
                </span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  )
}
