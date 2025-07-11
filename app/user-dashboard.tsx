"use client"

import { useState, useEffect } from "react"
import { getAllPages, userCanAccessPage, type User, type Page } from "@/lib/auth"
import { BottomNavigation } from "@/components/bottom-navigation"
import { PageViewer } from "@/components/page-viewer"
import { BarChart3, FileText, Globe, Home, UserIcon, Clock, Shield, CheckCircle, AlertCircle } from "lucide-react"

interface UserDashboardProps {
  user: User
  onLogout: () => void
}

export default function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [currentPageId, setCurrentPageId] = useState<string | null>(null)
  const [availablePages, setAvailablePages] = useState<Page[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Update available pages based on user permissions
    const allPages = getAllPages()
    const userPages = allPages.filter((page) => userCanAccessPage(user, page))
    setAvailablePages(userPages)

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [user])

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
        <PageViewer page={currentPage} onBack={handleHomeSelect} canEdit={false} />
        <BottomNavigation
          user={user}
          currentPageId={currentPageId}
          onPageSelect={handlePageSelect}
          onHomeSelect={handleHomeSelect}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img src="/jne-icon.png" alt="JNE" className="h-8 w-8" />
              <div>
                <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Dashboard Shipment JNE</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Welcome, {user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800 dark:text-white">
                  {currentTime.toLocaleTimeString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{currentTime.toLocaleDateString()}</div>
              </div>

              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* User Info Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{user.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{user.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  {user.isActive ? (
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
                {user.lastLogin && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Last login: {user.lastLogin.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Available Pages */}
        {availablePages.length > 0 ? (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Your Dashboard Pages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePages.map((page, index) => {
                const Icon = getPageIcon(page.type)
                const gradientColor = getPageColor(page.type)

                return (
                  <div
                    key={page.id}
                    className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                    onClick={() => handlePageSelect(page.id)}
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
                            {page.title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {page.type.toUpperCase()} • {page.subType?.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{page.content}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Updated: {page.updatedAt.toLocaleDateString()}
                        </span>
                        <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                          Click to Open
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
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Pages Available</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              You don't have access to any dashboard pages yet. Please contact your administrator to get access to the
              pages you need.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        user={user}
        currentPageId={currentPageId}
        onPageSelect={handlePageSelect}
        onHomeSelect={handleHomeSelect}
      />
    </div>
  )
}
