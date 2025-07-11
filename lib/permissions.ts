// Permission definitions for role-based access control
export interface Permission {
  id: string
  name: string
  description: string
  category: string
}

export interface Role {
  id: string
  name: string
  permissions: string[]
  description: string
}

// Define all available permissions
export const PERMISSIONS: Permission[] = [
  // User management permissions
  { id: "users.view", name: "View Users", description: "Can view user list and details", category: "Users" },
  { id: "users.create", name: "Create Users", description: "Can create new users", category: "Users" },
  { id: "users.edit", name: "Edit Users", description: "Can modify user information", category: "Users" },
  { id: "users.delete", name: "Delete Users", description: "Can delete users", category: "Users" },
  {
    id: "users.manage_roles",
    name: "Manage Roles",
    description: "Can assign and modify user roles",
    category: "Users",
  },

  // Page management permissions
  { id: "pages.view", name: "View Pages", description: "Can view pages", category: "Pages" },
  { id: "pages.create", name: "Create Pages", description: "Can create new pages", category: "Pages" },
  { id: "pages.edit", name: "Edit Pages", description: "Can modify page content and settings", category: "Pages" },
  { id: "pages.delete", name: "Delete Pages", description: "Can delete pages", category: "Pages" },

  // Analytics permissions
  { id: "analytics.view", name: "View Analytics", description: "Can view analytics dashboards", category: "Analytics" },

  // System permissions
  { id: "system.logs", name: "System Logs", description: "Can view system logs", category: "System" },
  { id: "system.settings", name: "System Settings", description: "Can modify system settings", category: "System" },
]

// Define roles with their permissions
export const ROLES: Role[] = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full system access with all permissions",
    permissions: [
      "users.view",
      "users.create",
      "users.edit",
      "users.delete",
      "users.manage_roles",
      "pages.view",
      "pages.create",
      "pages.edit",
      "pages.delete",
      "analytics.view",
      "system.logs",
      "system.settings",
    ],
  },
  {
    id: "developer",
    name: "Developer",
    description: "Development access with user and page management",
    permissions: [
      "users.view",
      "users.create",
      "users.edit",
      "users.delete",
      "pages.view",
      "pages.create",
      "pages.edit",
      "pages.delete",
      "analytics.view",
    ],
  },
  {
    id: "editor",
    name: "Content Editor",
    description: "Content editing access for assigned pages",
    permissions: ["pages.view", "pages.edit"],
  },
  {
    id: "user",
    name: "Standard User",
    description: "View-only access to assigned pages",
    permissions: ["pages.view"],
  },
]

// Permission manager class
export class PermissionManager {
  static hasPermission(userRole: string, permission: string): boolean {
    const role = ROLES.find((r) => r.id === userRole)
    if (!role) return false

    return role.permissions.includes(permission)
  }

  static getRolePermissions(roleId: string): string[] {
    const role = ROLES.find((r) => r.id === roleId)
    return role ? role.permissions : []
  }

  static getAllPermissions(): Permission[] {
    return PERMISSIONS
  }

  static getAllRoles(): Role[] {
    return ROLES
  }

  static getRole(roleId: string): Role | undefined {
    return ROLES.find((r) => r.id === roleId)
  }

  static canUserAccessPage(userRole: string, pageRequiredPermissions: string[]): boolean {
    if (!pageRequiredPermissions || pageRequiredPermissions.length === 0) {
      return true // No specific permissions required
    }

    return pageRequiredPermissions.every((permission) => this.hasPermission(userRole, permission))
  }
}
