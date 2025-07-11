"use client"
import { useState } from "react"
import type { Page, User } from "@/lib/auth"
import { ArrowLeft, Edit, Eye, Users } from "lucide-react"

interface PageViewerProps {
  page: Page
  onBack?: () => void
  onEdit?: () => void
  canEdit?: boolean
  viewingAsUser?: User
  currentUser?: User
}

export function PageViewer({ page, onBack, onEdit, canEdit = false, viewingAsUser, currentUser }: PageViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const renderPageContent = () => {
    switch (page.type) {
      case "html":
        if (page.htmlContent) {
          return (
            <div className="w-full h-full">
              <div dangerouslySetInnerHTML={{ __html: page.htmlContent }} />
            </div>
          )
        }
        return (
          <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No HTML content available</p>
          </div>
        )

      case "powerbi":
        if (page.embedUrl) {
          return (
            <div className="w-full" style={{ height: isFullscreen ? "100vh" : "600px" }}>
              <iframe
                src={page.embedUrl}
                title={`Power BI Report - ${page.title}`}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                className="rounded-lg"
              />
            </div>
          )
        }
        return (
          <div className="flex items-center justify-center h-64 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <p className="text-blue-600 dark:text-blue-400 font-medium">Power BI Dashboard</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">No embed URL configured</p>
            </div>
          </div>
        )

      case "spreadsheet":
        if (page.embedUrl) {
          return (
            <div className="w-full" style={{ height: isFullscreen ? "100vh" : "600px" }}>
              <iframe
                src={page.embedUrl}
                title={`Spreadsheet - ${page.title}`}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                className="rounded-lg"
              />
            </div>
          )
        }
        return (
          <div className="flex items-center justify-center h-64 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-dashed border-green-300 dark:border-green-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <p className="text-green-600 dark:text-green-400 font-medium">Spreadsheet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">No embed URL configured</p>
            </div>
          </div>
        )

      default:
        return (
          <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 font-medium">Unknown Page Type</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{page.type}</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className={`${isFullscreen ? "fixed inset-0 z-50 bg-white dark:bg-gray-900" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{page.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="capitalize">{page.type}</span>
              {page.subType && (
                <>
                  <span>•</span>
                  <span className="capitalize">{page.subType}</span>
                </>
              )}
              {viewingAsUser && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                    <Users size={12} />
                    <span>Viewing as {viewingAsUser.name}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit size={16} />
              Edit Page
            </button>
          )}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {page.content && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">{page.content}</p>
          </div>
        )}
        <div className="p-4">{renderPageContent()}</div>
      </div>

      {/* Footer Info */}
      {!isFullscreen && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div>
              <span>Last updated: {page.updatedAt.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Status: {page.isActive ? "Active" : "Inactive"}</span>
              {currentUser && (
                <span>
                  Viewed by: {currentUser.name} ({currentUser.role})
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
