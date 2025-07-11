"use client"

import React from "react"
import { LayoutDashboard, FileText, Code, Eye } from "lucide-react"
import type { User, Page } from "@/lib/auth"

interface DynamicBottomNavigationProps {
  user: User
  pages: Page[]
  currentPageId?: string
  onPageSelect: (pageId: string) => void
  onPreviewAsUser?: (userId: string) => void
}

export function DynamicBottomNavigation({ 
  user, 
  pages, 
  currentPageId, 
  onPageSelect,
  onPreviewAsUser 
}: DynamicBottomNavigationProps) {
  // Filter pages based on user role and permissions
  const accessiblePages = pages.filter(page => {
    if (user.role === "admin" || user.role === "developer") {
      return page.isActive
    }
    return page.isActive && 
           user.assignedPages?.includes(page.id) && 
           (page.allowedRoles?.includes(user.role) || !page.allowedRoles)
  })

  if (accessiblePages.length === 0) {
    return null
  }

  const getPageIcon = (page: Page) => {
    switch (page.type) {
      case "powerbi":
        return <LayoutDashboard size={20} />
      case "spreadsheet":
        return <FileText size={20} />
      case "html":
        return <Code size={20} />
      default:
        return <FileText size={20} />
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40">
      <div className="flex items-center justify-around px-4 py-2 max-w-4xl mx-auto">
        {accessiblePages.map((page) => (
          <button
            key={page.id}
            onClick={() => onPageSelect(page.id)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1 max-w-24 ${
              currentPageId === page.id
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {getPageIcon(page)}
            <span className="text-xs font-medium truncate w-full text-center">
              {page.title}
            </span>
          </button>
        ))}
        
        {/* Admin/Developer specific options */}
        {(user.role === "admin" || user.role === "developer") && (
          <button
            onClick={() => {/* Navigate to admin panel */}}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Eye size={20} />
            <span className="text-xs font-medium">Admin</span>
          </button>
        )}
      </div>
    </div>
  )
}
