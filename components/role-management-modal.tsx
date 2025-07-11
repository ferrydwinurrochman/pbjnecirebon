"use client"

import { useState, useEffect } from "react"
import { PermissionManager, type Role, type Permission } from "@/lib/permissions"
import { X, Shield, Plus, Edit, Trash2, Check, Users, Lock } from "lucide-react"

interface RoleManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function RoleManagementModal({ isOpen, onClose, onSuccess }: RoleManagementModalProps) {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  })
  const [permissionsByCategory, setPermissionsByCategory] = useState<Record<string, Permission[]>>({})

  useEffect(() => {
    if (isOpen) {
      loadRoles()
      setPermissionsByCategory(PermissionManager.getPermissionsByCategory())
    }
  }, [isOpen])

  const loadRoles = () => {
    setRoles(PermissionManager.getAllRoles())
  }

  const handleCreateRole = () => {
    setIsCreating(true)
    setIsEditing(false)
    setSelectedRole(null)
    setFormData({
      name: "",
      description: "",
      permissions: [],
    })
  }

  const handleEditRole = (role: Role) => {
    if (role.isSystem) {
      alert("System roles cannot be edited")
      return
    }
    setIsEditing(true)
    setIsCreating(false)
    setSelectedRole(role)
    setFormData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    })
  }

  const handleDeleteRole = (role: Role) => {
    if (role.isSystem) {
      alert("System roles cannot be deleted")
      return
    }
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      PermissionManager.deleteRole(role.id)
      loadRoles()
      onSuccess()
    }
  }

  const handleSaveRole = () => {
    if (!formData.name.trim()) {
      alert("Role name is required")
      return
    }

    if (isCreating) {
      PermissionManager.createRole({
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
        isSystem: false,
      })
    } else if (selectedRole) {
      PermissionManager.updateRole(selectedRole.id, {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
      })
    }

    loadRoles()
    setIsCreating(false)
    setIsEditing(false)
    setSelectedRole(null)
    onSuccess()
  }

  const handlePermissionToggle = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }))
  }

  const handleSelectAllInCategory = (category: string) => {
    const categoryPermissions = permissionsByCategory[category].map((p) => p.id)
    const allSelected = categoryPermissions.every((p) => formData.permissions.includes(p))

    if (allSelected) {
      // Deselect all in category
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((p) => !categoryPermissions.includes(p)),
      }))
    } else {
      // Select all in category
      setFormData((prev) => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...categoryPermissions])],
      }))
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "user":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "page":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "system":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "analytics":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Role & Permission Management</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create and manage user roles with specific permissions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Roles List */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Roles</h3>
              <button
                onClick={handleCreateRole}
                className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                New Role
              </button>
            </div>

            <div className="space-y-2">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                    selectedRole?.id === role.id
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSelectedRole(role)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800 dark:text-white">{role.name}</h4>
                    <div className="flex items-center gap-1">
                      {role.isSystem && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                          System
                        </span>
                      )}
                      {!role.isSystem && (
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditRole(role)
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          >
                            <Edit size={14} className="text-gray-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteRole(role)
                            }}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{role.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Users size={12} />
                    <span>{role.permissions.length} permissions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role Details/Editor */}
          <div className="flex-1 p-6 overflow-y-auto">
            {isCreating || isEditing ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {isCreating ? "Create New Role" : "Edit Role"}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsCreating(false)
                        setIsEditing(false)
                        setSelectedRole(null)
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveRole}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center gap-2"
                    >
                      <Check size={16} />
                      Save Role
                    </button>
                  </div>
                </div>

                {/* Role Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      placeholder="Enter role name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      rows={3}
                      placeholder="Enter role description"
                    />
                  </div>

                  {/* Permissions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Permissions ({formData.permissions.length} selected)
                    </label>

                    <div className="space-y-4">
                      {Object.entries(permissionsByCategory).map(([category, permissions]) => {
                        const allSelected = permissions.every((p) => formData.permissions.includes(p.id))
                        const someSelected = permissions.some((p) => formData.permissions.includes(p.id))

                        return (
                          <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getCategoryColor(category)}`}
                                >
                                  {category}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  ({permissions.filter((p) => formData.permissions.includes(p.id)).length}/
                                  {permissions.length})
                                </span>
                              </div>
                              <button
                                onClick={() => handleSelectAllInCategory(category)}
                                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                  allSelected
                                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {allSelected ? "Deselect All" : "Select All"}
                              </button>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                              {permissions.map((permission) => (
                                <label
                                  key={permission.id}
                                  className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.permissions.includes(permission.id)}
                                    onChange={() => handlePermissionToggle(permission.id)}
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-800 dark:text-white">
                                      {permission.name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {permission.description}
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedRole ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{selectedRole.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedRole.description}</p>
                    </div>
                  </div>
                  {!selectedRole.isSystem && (
                    <button
                      onClick={() => handleEditRole(selectedRole)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center gap-2"
                    >
                      <Edit size={16} />
                      Edit Role
                    </button>
                  )}
                </div>

                {/* Role Info */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">
                      {selectedRole.permissions.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Permissions</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">
                      {selectedRole.isSystem ? "System" : "Custom"}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Role Type</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">
                      {selectedRole.createdAt.toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Created</div>
                  </div>
                </div>

                {/* Permissions List */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-4">Assigned Permissions</h4>
                  <div className="space-y-4">
                    {Object.entries(permissionsByCategory).map(([category, permissions]) => {
                      const rolePermissions = permissions.filter((p) => selectedRole.permissions.includes(p.id))
                      if (rolePermissions.length === 0) return null

                      return (
                        <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getCategoryColor(category)}`}
                            >
                              {category}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              ({rolePermissions.length} permissions)
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {rolePermissions.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"
                              >
                                <Check size={16} className="text-green-600 dark:text-green-400" />
                                <div>
                                  <div className="text-sm font-medium text-gray-800 dark:text-white">
                                    {permission.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {permission.description}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Select a Role</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose a role from the list to view or edit its permissions
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
