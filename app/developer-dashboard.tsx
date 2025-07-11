"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { UserCreationModal } from "@/components/user-creation-modal"
import { PageCreationModal } from "@/components/page-creation-modal"
import { PageEditModal } from "@/components/page-edit-modal"
import { UserDashboardPreview } from "@/components/user-dashboard-preview"
import type { User, Page, ActivityLog } from "@/lib/auth"
import {
  getAllUsers,
  getAllPages,
  getDashboardStats,
  getActivityLogs,
  updateUserStatus,
  deleteUser,
  deletePage,
  getUserById,
  getPageById,
} from "@/lib/auth"
import {
  LayoutDashboard,
  Users,
  FileText,
  Code,
  Palette,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Activity,
  TrendingUp,
  Clock,
  Settings,
  BarChart3,
  Globe,
  Wrench,
  Monitor,
} from "lucide-react"
import { UserSettingsModal } from "@/components/user-settings-modal"

interface DeveloperDashboardProps {
  user: User
  onLogout: () => void
}

type DeveloperPage =
  | "dashboard"
  | "users"
  | "pages"
  | "editor"
  | "user-detail"
  | "page-detail"
  | "page-view"
  | "page-edit"
  | "user-pages"
  | "user-page-view"
  | "user-page-edit"
  | "user-dashboard-preview"

export default function DeveloperDashboard({ user, onLogout }: DeveloperDashboardProps) {
  const [currentPage, setCurrentPage] = useState<DeveloperPage>("dashboard")
  const [users, setUsers] = useState<User[]>([])
  const [pages, setPages] = useState<Page[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [stats, setStats] = useState<any>({})
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showPageModal, setShowPageModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [viewingPage, setViewingPage] = useState<Page | null>(null)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [showUserSettingsModal, setShowUserSettingsModal] = useState(false)
  const [selectedUserForSettings, setSelectedUserForSettings] = useState<User | null>(null)
  const [previewingUser, setPreviewingUser] = useState<User | null>(null)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadData = () => {
    setUsers(getAllUsers())
    setPages(getAllPages())
    setActivities(getActivityLogs(20))
    setStats(getDashboardStats())
  }

  const handleUserStatusToggle = (userId: string, currentStatus: boolean) => {
    updateUserStatus(userId, !currentStatus)
    loadData()
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUser(userId)
      loadData()
    }
  }

  const handleDeletePage = (pageId: string) => {
    if (confirm("Are you sure you want to delete this page?")) {
      deletePage(pageId, user.id)
      loadData()
    }
  }

  const handleViewUser = (userId: string) => {
    const userData = getUserById(userId)
    if (!userData) return
    setSelectedUser(userData)
    setCurrentPage("user-detail")
  }

  const handlePreviewAsUser = (targetUser: User) => {
    setPreviewingUser(targetUser)
    setCurrentPage("user-dashboard-preview")
  }

  const handleViewPage = (pageId: string) => {
    const pageData = getPageById(pageId)
    setSelectedPage(pageData)
    setCurrentPage("page-detail")
  }

  const handleEditPage = (pageData: Page) => {
    setSelectedPage(pageData)
    setShowEditModal(true)
  }

  const handleViewPageContent = (page: Page) => {
    setViewingPage(page)
    setCurrentPage("page-view")
  }

  const handleEditPageContent = (page: Page) => {
    setEditingPage(page)
    setCurrentPage("page-edit")
  }

  const handleUserSettings = (userData: User) => {
    setSelectedUserForSettings(userData)
    setShowUserSettingsModal(true)
  }

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users },
    { id: "pages", label: "Page Management", icon: FileText },
    { id: "user-pages", label: "User Pages", icon: BarChart3 },
    { id: "editor", label: "Visual Editor", icon: Code },
  ]

  const sidebar = (
    <nav className="px-4 space-y-2">
      {sidebarItems.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id as DeveloperPage)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              currentPage === item.id
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Pages Overview</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">Monitor and manage user page access</div>
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
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{userData.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{userData.username}</p>
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
                          {userData.assignedPages.map((pageId) => {
                            const page = pages.find((p) => p.id === pageId)
                            if (!page) return null

                            return (
                              <div
                                key={pageId}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                      page.type === "powerbi"
                                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                                        : page.type === "spreadsheet"
                                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                                          : "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
                                    }`}
                                  >
                                    {page.type === "powerbi" ? (
                                      <BarChart3 size={14} />
                                    ) : page.type === "spreadsheet" ? (
                                      <FileText size={14} />
                                    ) : (
                                      <Globe size={14} />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800 dark:text-white text-sm">{page.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {page.type.toUpperCase()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleViewPageContent(page)}
                                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-xs flex items-center gap-1"
                                    title="View Page"
                                  >
                                    <Eye size={10} />
                                    View
                                  </button>
                                  <button
                                    onClick={() => handleEditPageContent(page)}
                                    className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-xs flex items-center gap-1"
                                    title="Live Edit"
                                  >
                                    <Wrench size={10} />
                                    Edit
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No pages assigned</p>
                      )}

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleUserSettings(userData)}
                          className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm"
                        >
                          Manage Access
                        </button>
                        <button
                          onClick={() => handlePreviewAsUser(userData)}
                          className="px-3 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-sm flex items-center gap-1"
                          title="Preview Dashboard as User"
                        >
                          <Monitor size={14} />
                          Preview
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
                <p className="text-gray-600 dark:text-gray-400">Create users to manage their page access.</p>
              </div>
            )}
          </div>
        )

      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Developer Dashboard</h2>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium">Developer Mode</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Real-time Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Total Users",
                  value: stats.totalUsers || 0,
                  icon: Users,
                  color: "bg-blue-500",
                  change: `+${stats.recentRegistrations || 0} this month`,
                },
                {
                  title: "Active Pages",
                  value: stats.totalPages || 0,
                  icon: FileText,
                  color: "bg-green-500",
                  change: `${stats.activePages || 0} active`,
                },
                {
                  title: "Code Commits",
                  value: activities.filter((a) => a.action.includes("edit") || a.action.includes("create")).length,
                  icon: Code,
                  color: "bg-purple-500",
                  change: "Auto-saved",
                },
                {
                  title: "Live Edits",
                  value: activities.filter((a) => a.action === "page_edit").length,
                  icon: Palette,
                  color: "bg-orange-500",
                  change: "Real-time",
                },
              ].map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.title}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-fade-in hover:shadow-lg transition-shadow"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <TrendingUp size={14} />
                      <span>{stat.change}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Development Activity</h3>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activities.map((activity) => {
                  const activityUser = users.find((u) => u.id === activity.userId)
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.action.includes("edit") || activity.action.includes("create")
                            ? "bg-purple-500"
                            : "bg-blue-500"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 dark:text-white">
                          <span className="font-medium">{activityUser?.name || "Unknown User"}</span> {activity.details}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock size={12} />
                          <span>{activity.timestamp.toLocaleString()}</span>
                          {activity.ipAddress && <span>• {activity.ipAddress}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case "editor":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Visual Page Editor</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Select a page from Page Management to edit its content
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Page Editor</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Go to Page Management and click "Edit Content" on any page to start editing
                </p>
                <button
                  onClick={() => setCurrentPage("pages")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Page Management
                </button>
              </div>
            </div>
          </div>
        )

      case "users":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">{users.length} total users</span>
                <button
                  onClick={() => setShowUserModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add User
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {users.map((userData) => (
                      <tr key={userData.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{userData.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{userData.username}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              userData.role === "admin"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                : userData.role === "developer"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            }`}
                          >
                            {userData.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              userData.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {userData.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {userData.lastLogin ? userData.lastLogin.toLocaleDateString() : "Never"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleViewUser(userData.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleUserSettings(userData)}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            <Settings size={16} />
                          </button>
                          <button
                            onClick={() => handleUserStatusToggle(userData.id, userData.isActive)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            {userData.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(userData.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      case "pages":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Page Management</h2>
              <button
                onClick={() => setShowPageModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Create Page
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-fade-in hover:shadow-lg transition-shadow"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{page.title}</h3>
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
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {page.type.toUpperCase()} • {page.subType?.toUpperCase()}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{page.content}</p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Updated: {page.updatedAt.toLocaleDateString()}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleViewPageContent(page)}
                      className="px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <Eye size={14} />
                      View
                    </button>
                    <button
                      onClick={() => handleViewPage(page.id)}
                      className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleEditPageContent(page)}
                      className="px-3 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <Code size={14} />
                      Edit Content
                    </button>
                    <button
                      onClick={() => handleEditPage(page)}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <Edit size={14} />
                      Settings
                    </button>
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={() => handleDeletePage(page.id)}
                      className="w-full px-3 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      // ... rest of the cases remain the same as before
      default:
        return <div>Content for {currentPage}</div>
    }
  }

  return (
    <>
      <DashboardLayout user={user} title="Developer - Dashboard Shipment JNE" sidebar={sidebar} onLogout={onLogout}>
        {renderContent()}
      </DashboardLayout>

      <UserCreationModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSuccess={() => {
          loadData()
          setShowUserModal(false)
        }}
      />

      <PageCreationModal
        isOpen={showPageModal}
        onClose={() => setShowPageModal(false)}
        onSuccess={() => {
          loadData()
          setShowPageModal(false)
        }}
        userId={user.id}
      />

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

      <UserSettingsModal
        isOpen={showUserSettingsModal}
        onClose={() => setShowUserSettingsModal(false)}
        onSuccess={() => {
          loadData()
          setShowUserSettingsModal(false)
        }}
        user={selectedUserForSettings}
      />
    </>
  )
}
