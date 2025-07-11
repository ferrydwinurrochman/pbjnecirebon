"use client"

import { useState, useEffect, useRef } from "react"
import { getAllPages, userCanAccessPage, type User, type Page } from "@/lib/auth"
import { BottomNavigation } from "@/components/bottom-navigation"
import { PageViewer } from "@/components/page-viewer"
import { InlineEditor } from "@/components/inline-editor"
import {
  BarChart3,
  FileText,
  Globe,
  Home,
  UserIcon,
  Clock,
  Shield,
  CheckCircle,
  AlertCircle,
  Edit,
  Eye,
  ArrowLeft,
} from "lucide-react"

interface UserDashboardPreviewProps {
  targetUser: User
  currentUser: User
  onBack: () => void
  canEdit?: boolean
}

export function UserDashboardPreview({ targetUser, currentUser, onBack, canEdit = false }: UserDashboardPreviewProps) {
  const [currentPageId, setCurrentPageId] = useState<string | null>(null)
  const [availablePages, setAvailablePages] = useState<Page[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isEditMode, setIsEditMode] = useState(false)
  const [editableContent, setEditableContent] = useState<any>({})
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Update available pages based on user permissions
    const allPages = getAllPages()
    const userPages = allPages.filter((page) => userCanAccessPage(targetUser, page))
    setAvailablePages(userPages)

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [targetUser])

  // Auto-save functionality
  const autoSave = async (content: any) => {
    if (!canEdit) return

    setAutoSaveStatus("saving")

    try {
      const response = await fetch(`/api/pages/user-dashboard`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: targetUser.id,
          content: content,
          updatedBy: currentUser.id,
        }),
      })

      if (response.ok) {
        setAutoSaveStatus("saved")
        setTimeout(() => setAutoSaveStatus("idle"), 2000)
      } else {
        setAutoSaveStatus("error")
      }
    } catch (error) {
      console.error("Auto-save failed:", error)
      setAutoSaveStatus("error")
    }
  }

  const handleContentChange = (key: string, value: any) => {
    if (!canEdit) return

    const newContent = { ...editableContent, [key]: value }
    setEditableContent(newContent)

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave(newContent)
    }, 1000) // Auto-save after 1 second of inactivity
  }

  const handlePageSelect = (pageId: string) => {
    setCurrentPageId(pageId)
  }

  const handleHomeSelect = () => {
    setCurrentPageId(null)
  }

  const getPageIcon = (pageType: string) => {
    switch (pageType) {
      case "powerbi":
        return BarChart3
      case "spreadsheet":
        return FileText
      case "html":
        return Globe
      default:
        return FileText
    }
  }

  const getPageColor = (pageType: string) => {
    switch (pageType) {
      case "powerbi":
        return "from-blue-500 to-blue-600"
      case "spreadsheet":
        return "from-green-500 to-green-600"
      case "html":
        return "from-purple-500 to-purple-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const currentPage = currentPageId ? availablePages.find((p) => p.id === currentPageId) : null

  if (currentPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <PageViewer
          page={currentPage}
          onBack={handleHomeSelect}
          canEdit={canEdit && isEditMode}
          viewingAsUser={targetUser}
          currentUser={currentUser}
        />
        <BottomNavigation
          user={targetUser}
          currentPageId={currentPageId}
          onPageSelect={handlePageSelect}
          onHomeSelect={handleHomeSelect}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Header with Edit Controls */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <img src="/jne-icon.png" alt="JNE" className="h-8 w-8" />
              <div>
                <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {isEditMode ? (
                    <InlineEditor
                      value={editableContent.title || "Dashboard Shipment JNE"}
                      onChange={(value) => handleContentChange("title", value)}
                      className="bg-transparent border-none text-lg font-semibold"
                    />
                  ) : (
                    editableContent.title || "Dashboard Shipment JNE"
                  )}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Previewing as: {targetUser.name}
                  {canEdit && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                      {currentUser.role.toUpperCase()} VIEW
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Auto-save Status */}
              {canEdit && (
                <div className="flex items-center gap-2">
                  {autoSaveStatus === "saving" && (
                    <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  )}
                  {autoSaveStatus === "saved" && (
                    <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle size={14} />
                      Saved
                    </div>
                  )}
                  {autoSaveStatus === "error" && (
                    <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                      <AlertCircle size={14} />
                      Error
                    </div>
                  )}
                </div>
              )}

              {/* Edit Mode Toggle */}
              {canEdit && (
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    isEditMode
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isEditMode ? <Eye size={16} /> : <Edit size={16} />}
                  {isEditMode ? "Preview Mode" : "Edit Mode"}
                </button>
              )}

              <div className="text-right">
                <div className="text-sm font-medium text-gray-800 dark:text-white">
                  {currentTime.toLocaleTimeString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{currentTime.toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Enhanced User Info Card with Edit Capabilities */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {isEditMode && canEdit ? (
                  <InlineEditor
                    value={editableContent.userName || targetUser.name}
                    onChange={(value) => handleContentChange("userName", value)}
                    className="text-xl font-semibold bg-transparent border-none"
                  />
                ) : (
                  editableContent.userName || targetUser.name
                )}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isEditMode && canEdit ? (
                  <InlineEditor
                    value={editableContent.userEmail || targetUser.email || ""}
                    onChange={(value) => handleContentChange("userEmail", value)}
                    className="bg-transparent border-none"
                  />
                ) : (
                  editableContent.userEmail || targetUser.email
                )}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{targetUser.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  {targetUser.isActive ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600 dark:text-red-400">Inactive</span>
                    </>
                  )}
                </div>
                {targetUser.lastLogin && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Last login: {targetUser.lastLogin.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Available Pages with Edit Capabilities */}
        {availablePages.length > 0 ? (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              {isEditMode && canEdit ? (
                <InlineEditor
                  value={editableContent.pagesTitle || "Your Dashboard Pages"}
                  onChange={(value) => handleContentChange("pagesTitle", value)}
                  className="text-2xl font-bold bg-transparent border-none"
                />
              ) : (
                editableContent.pagesTitle || "Your Dashboard Pages"
              )}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePages.map((page, index) => {
                const Icon = getPageIcon(page.type)
                const gradientColor = getPageColor(page.type)

                return (
                  <div
                    key={page.id}
                    className={`group cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                      isEditMode && canEdit ? "ring-2 ring-blue-300 ring-opacity-50" : ""
                    }`}
                    onClick={() => !isEditMode && handlePageSelect(page.id)}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 h-full hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${gradientColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {isEditMode && canEdit ? (
                              <InlineEditor
                                value={editableContent[`pageTitle_${page.id}`] || page.title}
                                onChange={(value) => handleContentChange(`pageTitle_${page.id}`, value)}
                                className="text-lg font-semibold bg-transparent border-none"
                              />
                            ) : (
                              editableContent[`pageTitle_${page.id}`] || page.title
                            )}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {page.type.toUpperCase()} • {page.subType?.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {isEditMode && canEdit ? (
                          <InlineEditor
                            value={editableContent[`pageContent_${page.id}`] || page.content}
                            onChange={(value) => handleContentChange(`pageContent_${page.id}`, value)}
                            multiline
                            className="text-sm bg-transparent border-none w-full"
                          />
                        ) : (
                          editableContent[`pageContent_${page.id}`] || page.content
                        )}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Updated: {page.updatedAt.toLocaleDateString()}
                        </span>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isEditMode && canEdit
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                              : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          }`}
                        >
                          {isEditMode && canEdit ? "Editing" : "Click to Open"}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              {isEditMode && canEdit ? (
                <InlineEditor
                  value={editableContent.noPagesTitle || "No Pages Available"}
                  onChange={(value) => handleContentChange("noPagesTitle", value)}
                  className="text-xl font-semibold bg-transparent border-none"
                />
              ) : (
                editableContent.noPagesTitle || "No Pages Available"
              )}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {isEditMode && canEdit ? (
                <InlineEditor
                  value={
                    editableContent.noPagesDescription ||
                    "You don't have access to any dashboard pages yet. Please contact your administrator to get access to the pages you need."
                  }
                  onChange={(value) => handleContentChange("noPagesDescription", value)}
                  multiline
                  className="bg-transparent border-none w-full text-center"
                />
              ) : (
                editableContent.noPagesDescription ||
                "You don't have access to any dashboard pages yet. Please contact your administrator to get access to the pages you need."
              )}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        user={targetUser}
        currentPageId={currentPageId}
        onPageSelect={handlePageSelect}
        onHomeSelect={handleHomeSelect}
      />

      {/* Edit Mode Indicator */}
      {isEditMode && canEdit && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <Edit size={16} />
          <span>Edit Mode Active</span>
        </div>
      )}
    </div>
  )
}
