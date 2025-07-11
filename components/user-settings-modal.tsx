"use client"

import { useState, useEffect } from "react"
import { getAllPages, assignPagesToUser, updateUser, type User, type Page } from "@/lib/auth"
import { ROLES } from "@/lib/permissions"
import { X, Settings, Save, UserIcon, Shield, FileText, Check } from "lucide-react"

interface UserSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user: User | null
}

export function UserSettingsModal({ isOpen, onClose, onSuccess, user }: UserSettingsModalProps) {
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [selectedRole, setSelectedRole] = useState("")
  const [pages, setPages] = useState<Page[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user && isOpen) {
      setSelectedPages(user.assignedPages || [])
      setSelectedRole(user.role)
      setPages(getAllPages())
    }
  }, [user, isOpen])

  const handlePageToggle = (pageId: string) => {
    setSelectedPages((prev) => (prev.includes(pageId) ? prev.filter((id) => id !== pageId) : [...prev, pageId]))
  }

  const handleSave = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Update user role
      await updateUser(user.id, { role: selectedRole })

      // Update assigned pages (only for user role)
      if (selectedRole === "user") {
        await assignPagesToUser(user.id, selectedPages)
      }

      onSuccess()
    } catch (error) {
      console.error("Failed to update user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPageIcon = (pageType: string) => {
    switch (pageType) {
      case "powerbi":
        return "📊"
      case "spreadsheet":
        return "📋"
      case "html":
        return "🌐"
      default:
        return "📄"
    }
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">User Settings</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.name} ({user.username})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-800 dark:text-white">User Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Name:</span>
                <span className="ml-2 text-gray-800 dark:text-white">{user.name}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                <span className="ml-2 text-gray-800 dark:text-white">{user.email}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                <span className="ml-2 text-gray-800 dark:text-white">{user.phone}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                <span className={`ml-2 ${user.isActive ? "text-green-600" : "text-red-600"}`}>
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-800 dark:text-white">Role Assignment</h3>
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            >
              {ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} - {role.description}
                </option>
              ))}
            </select>
          </div>

          {/* Page Access (only for user role) */}
          {selectedRole === "user" && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Page Access</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Select which pages this user can access:</p>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`page-${page.id}`}
                        checked={selectedPages.includes(page.id)}
                        onChange={() => handlePageToggle(page.id)}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor={`page-${page.id}`} className="sr-only">
                        {page.title}
                      </label>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getPageIcon(page.type)}</span>
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">{page.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {page.type.toUpperCase()} • {page.subType?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {selectedPages.includes(page.id) && <Check className="w-5 h-5 text-green-500" />}
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Selected:</strong> {selectedPages.length} page(s)
                </p>
              </div>
            </div>
          )}

          {/* Role Info for non-user roles */}
          {selectedRole !== "user" && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>Note:</strong> Users with {ROLES.find((r) => r.id === selectedRole)?.name} role have access to
                pages based on their role permissions, not individual page assignments.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}
