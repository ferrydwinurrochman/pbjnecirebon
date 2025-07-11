"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PageEditModal } from "@/components/page-edit-modal"
import { EnhancedVisualEditor } from "@/components/enhanced-visual-editor"
import { PageViewer } from "@/components/page-viewer"
import { UserDashboardPreview } from "@/components/user-dashboard-preview"
import { userCanAccessPage } from "@/lib/auth"
import type { User, Page, ActivityLog } from "@/lib/auth"
import { getAllPages, getActivityLogs, getAllUsers } from "@/lib/auth"
import {
  LayoutDashboard,
  FileText,
  Edit,
  Eye,
  Clock,
  ArrowLeft,
  Palette,
  Globe,
  BarChart3,
  Zap,
  Users,
  Monitor,
} from "lucide-react"

interface EditorDashboardProps {
  user: User
  onLogout: () => void
}

type EditorPage = "dashboard" | "pages" | "editor" | "page-view" | "page-edit" | "user-pages" | "user-dashboard-preview"

export default function EditorDashboard({ user, onLogout }: EditorDashboardProps) {
  const [currentPage, setCurrentPage] = useState<EditorPage>("dashboard")
  const [pages, setPages] = useState<Page[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [viewingPage, setViewingPage] = useState<Page | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [previewingUser, setPreviewingUser] = useState<User | null>(null)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadData = () => {
    const allPages = getAllPages()
    const userPages = allPages.filter((page) => userCanAccessPage(user, page))
    setPages(userPages)
    setUsers(getAllUsers())
    setActivities(getActivityLogs(10).filter((log) => log.action.includes("page")))
  }

  const handleEditPage = (page: Page) => {
    setEditingPage(page)
    setCurrentPage("page-edit")
  }

  const handleViewPage = (page: Page) => {
    setViewingPage(page)
    setCurrentPage("page-view")
  }

  const handleEditSettings = (page: Page) => {
    setSelectedPage(page)
    setShowEditModal(true)
  }

  const handlePreviewAsUser = (targetUser: User) => {
    setPreviewingUser(targetUser)
    setCurrentPage("user-dashboard-preview")
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

  const sidebarItems = [
    { id: "dashboard", label: "Editor Dashboard", icon: LayoutDashboard },
    { id: "pages", label: "Content Pages", icon: FileText },
    { id: "user-pages", label: "User Pages", icon: Users },
    { id: "editor", label: "Visual Editor", icon: Palette },
  ]

  const sidebar = (
    <nav className="px-4 space-y-2">
      {sidebarItems.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id as EditorPage)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              currentPage === item.id
                ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900 dark:hover:to-indigo-900"
            }`}
          >
            <Icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )

  const renderContent = () => {
    switch (currentPage) {
      case "user-dashboard-preview":
        if (!previewingUser) return null
        return (
          <UserDashboardPreview
            targetUser={previewingUser}
            currentUser={user}
            onBack={() => setCurrentPage("user-pages")}
            canEdit={true}
          />
        )

      case "user-pages":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Pages Management</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">Edit user dashboard experiences</div>
            </div>

            {/* User Pages Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {users
                .filter((u) => u.role === "user") // Only show users with 'user' role
                .map((userData) => (
                  <div
                    key={userData.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{userData.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{userData.username}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          userData.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {userData.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Assigned Pages</span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {userData.assignedPages?.length || 0}
                        </span>
                      </div>

                      {userData.assignedPages && userData.assignedPages.length > 0 ? (
                        <div className="space-y-2">
                          {userData.assignedPages.slice(0, 3).map((pageId) => {
                            const page = pages.find((p) => p.id === pageId)
                            if (!page) return null

                            return (
                              <div
                                key={pageId}
                                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-6 h-6 rounded flex items-center justify-center ${
                                      page.type === "powerbi"
                                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                                        : page.type === "spreadsheet"
                                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                                          : "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
                                    }`}
                                  >
                                    {page.type === "powerbi" ? (
                                      <BarChart3 size={12} />
                                    ) : page.type === "spreadsheet" ? (
                                      <FileText size={12} />
                                    ) : (
                                      <Globe size={12} />
                                    )}
                                  </div>
                                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                                    {page.title}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                          {userData.assignedPages.length > 3 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              +{userData.assignedPages.length - 3} more pages
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No pages assigned</p>
                      )}

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handlePreviewAsUser(userData)}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <Monitor size={14} />
                          Edit Dashboard
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {users.filter((u) => u.role === "user").length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No Users Found</h3>
                <p className="text-gray-600 dark:text-gray-400">No users available for dashboard editing.</p>
              </div>
            )}
          </div>
        )

      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Content Editor Dashboard</h2>
                  <p className="text-gray-600 dark:text-gray-400">Create and edit amazing content</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg shadow-lg">
                  <span className="text-sm font-medium">CONTENT EDITOR</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Editor Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Assigned Pages</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{pages.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pages you can edit</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Recent Edits</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{activities.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Edit className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Content modifications</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Editor Status</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">Active</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ready to create</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setCurrentPage("pages")}
                  className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                >
                  <FileText className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">View Pages</span>
                </button>
                <button
                  onClick={() => setCurrentPage("user-pages")}
                  className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  <Users className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">User Dashboards</span>
                </button>
                <button
                  onClick={() => setCurrentPage("editor")}
                  className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg"
                >
                  <Palette className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Visual Editor</span>
                </button>
                <button
                  onClick={() => pages.length > 0 && handleViewPage(pages[0])}
                  className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg"
                >
                  <Eye className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Preview</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Content Activity</h3>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 dark:text-white">{activity.details}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock size={12} />
                          <span>{activity.timestamp.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )

      case "pages":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Content Pages</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">{pages.length} pages available</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((page, index) => {
                const Icon = getPageIcon(page.type)
                const gradientColor = getPageColor(page.type)

                return (
                  <div
                    key={page.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 animate-fade-in hover:shadow-xl transition-shadow"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-10 h-10 bg-gradient-to-r ${gradientColor} rounded-lg flex items-center justify-center`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          page.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                        }`}
                      >
                        {page.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{page.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {page.type.toUpperCase()} • {page.subType?.toUpperCase()}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{page.content}</p>

                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      Updated: {page.updatedAt.toLocaleDateString()}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleViewPage(page)}
                        className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        <Eye size={14} />
                        Preview
                      </button>
                      <button
                        onClick={() => handleEditPage(page)}
                        className="px-3 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                    </div>
                    <button
                      onClick={() => handleEditSettings(page)}
                      className="w-full mt-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      Settings
                    </button>
                  </div>
                )
              })}
            </div>

            {pages.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Pages Available</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  You don't have access to any pages for editing. Contact your administrator to get access.
                </p>
              </div>
            )}
          </div>
        )

      case "editor":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Visual Content Editor</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Select a page from Content Pages to start editing
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Content Editor</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Go to Content Pages and click "Edit" on any page to start creating amazing content
                </p>
                <button
                  onClick={() => setCurrentPage("pages")}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-colors shadow-lg"
                >
                  Go to Content Pages
                </button>
              </div>
            </div>
          </div>
        )

      case "page-view":
        if (!viewingPage) return null
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentPage("pages")}
                  className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Preview: {viewingPage.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Content Preview • {viewingPage.type.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditPage(viewingPage)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Edit size={16} />
                  Edit Content
                </button>
              </div>
            </div>

            <PageViewer
              page={viewingPage}
              onBack={() => setCurrentPage("pages")}
              onEdit={() => handleEditPage(viewingPage)}
              canEdit={true}
            />
          </div>
        )

      case "page-edit":
        if (!editingPage) return null
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentPage("pages")}
                  className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Editing: {editingPage.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Visual Content Editor • {editingPage.type.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-sm font-medium flex items-center gap-1 shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Live Editing
                </div>
              </div>
            </div>

            <EnhancedVisualEditor
              page={editingPage}
              userId={user.id}
              onSave={(updatedPage) => {
                loadData()
                setCurrentPage("pages")
              }}
              onClose={() => setCurrentPage("pages")}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <DashboardLayout user={user} title="Editor - Dashboard Shipment JNE" sidebar={sidebar} onLogout={onLogout}>
        {renderContent()}
      </DashboardLayout>

      <PageEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          loadData()
          setShowEditModal(false)
        }}
        page={selectedPage}
        userId={user.id}
      />
    </>
  )
}
