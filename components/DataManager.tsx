"use client"

import type React from "react"

import { useState } from "react"
import { Download, Upload, Printer, Database, FileText, Save, AlertCircle, CheckCircle } from "lucide-react"

interface DataManagerProps {
  notes: Record<number, string>
  favorites: Set<number>
  recentSearches: string[]
  onImportData: (data: { notes: Record<number, string>; favorites: number[]; recentSearches: string[] }) => void
}

interface ExportData {
  notes: Record<number, string>
  favorites: number[]
  recentSearches: string[]
  exportDate: string
  version: string
}

export default function DataManager({ notes, favorites, recentSearches, onImportData }: DataManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [importMessage, setImportMessage] = useState("")

  const exportData = () => {
    const exportData: ExportData = {
      notes,
      favorites: Array.from(favorites),
      recentSearches,
      exportDate: new Date().toISOString(),
      version: "1.0",
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `emergency-reference-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportNotes = () => {
    const notesData = {
      notes,
      exportDate: new Date().toISOString(),
      totalNotes: Object.keys(notes).filter((id) => notes[Number.parseInt(id)]?.trim()).length,
    }

    const dataStr = JSON.stringify(notesData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `emergency-reference-notes-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)

        // Validate the imported data structure
        if (importedData.notes && importedData.favorites && importedData.recentSearches) {
          onImportData({
            notes: importedData.notes || {},
            favorites: Array.isArray(importedData.favorites) ? importedData.favorites : [],
            recentSearches: Array.isArray(importedData.recentSearches) ? importedData.recentSearches : [],
          })
          setImportStatus("success")
          setImportMessage(
            `Successfully imported ${Object.keys(importedData.notes || {}).length} notes, ${importedData.favorites?.length || 0} favorites, and ${importedData.recentSearches?.length || 0} recent searches.`,
          )
        } else {
          throw new Error("Invalid file format")
        }
      } catch (error) {
        setImportStatus("error")
        setImportMessage("Failed to import data. Please check the file format.")
      }
    }
    reader.readAsText(file)

    // Reset the input
    event.target.value = ""
  }

  const printCurrentView = () => {
    window.print()
  }

  const printCondition = (conditionId: number) => {
    const conditionElement = document.getElementById(`condition-${conditionId}`)
    if (conditionElement) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Emergency Reference - Condition ${conditionId}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .condition-card { max-width: 800px; margin: 0 auto; }
                .specialty-header { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                .section { margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
                .red-flags { background: #fef2f2; border-color: #fecaca; }
                .treatment { background: #f9fafb; }
                .keywords { display: flex; flex-wrap: wrap; gap: 5px; }
                .keyword { background: #dbeafe; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="condition-card">
                ${conditionElement.innerHTML}
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      localStorage.removeItem("emergency-reference-notes")
      localStorage.removeItem("emergency-reference-favorites")
      localStorage.removeItem("emergency-reference-recent-searches")
      onImportData({ notes: {}, favorites: [], recentSearches: [] })
      setImportStatus("success")
      setImportMessage("All data has been cleared.")
    }
  }

  const getDataStats = () => {
    const notesCount = Object.keys(notes).filter((id) => notes[Number.parseInt(id)]?.trim()).length
    const favoritesCount = favorites.size
    const searchesCount = recentSearches.length

    return { notesCount, favoritesCount, searchesCount }
  }

  const { notesCount, favoritesCount, searchesCount } = getDataStats()

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-40"
        title="Data Management"
      >
        <Database className="h-6 w-6" />
      </button>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[9999]" onClick={() => setIsOpen(false)} />
      <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-[9999] overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Database className="h-7 w-7" />
                  Data Management
                </h2>
                <p className="text-blue-100 mt-1">Export, import, and manage your emergency reference data</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Data Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-900">{notesCount}</div>
                    <div className="text-sm text-green-700">Personal Notes</div>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Save className="h-8 w-8 text-yellow-600" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-900">{favoritesCount}</div>
                    <div className="text-sm text-yellow-700">Favorites</div>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Database className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold text-purple-900">{searchesCount}</div>
                    <div className="text-sm text-purple-700">Recent Searches</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Import/Export Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Download className="h-5 w-5 text-blue-600" />
                  Export Data
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={exportData}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Complete Backup
                  </button>
                  <button
                    onClick={exportNotes}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Export Notes Only
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Export your data as JSON files for backup or sharing between devices.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-green-600" />
                  Import Data
                </h3>
                <div className="space-y-3">
                  <label className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Import Backup File
                    <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                  </label>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Import previously exported data to restore your notes, favorites, and searches.
                </p>

                {importStatus !== "idle" && (
                  <div
                    className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
                      importStatus === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {importStatus === "success" ? (
                      <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    )}
                    <span className="text-sm">{importMessage}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Print Section */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Printer className="h-5 w-5 text-purple-600" />
                Print Options
              </h3>
              <div className="space-y-3">
                <button
                  onClick={printCurrentView}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print Current View
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Print the current filtered view of conditions for offline reference.
              </p>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Danger Zone
              </h3>
              <button
                onClick={clearAllData}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Clear All Data
              </button>
              <p className="text-sm text-red-700 mt-3">
                This will permanently delete all your notes, favorites, and recent searches. This action cannot be
                undone.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .bg-gradient-to-r,
          .bg-gradient-to-br {
            background: #f9fafb !important;
          }
          .shadow-lg,
          .shadow-xl,
          .shadow-2xl {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
          .sticky {
            position: static !important;
          }
          .fixed {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}
