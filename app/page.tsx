"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { authenticate, getDefaultCredentials, type User } from "@/lib/auth"
import { AuthLayout } from "@/components/auth-layout"
import { AuthInput } from "@/components/auth-input"
import { AuthButton } from "@/components/auth-button"
import { LoadingSpinner } from "@/components/loading-spinner"
import AdminDashboard from "@/app/admin-dashboard"
import DeveloperDashboard from "@/app/developer-dashboard"
import EditorDashboard from "@/app/editor-dashboard"
import UserDashboard from "@/app/user-dashboard"
import { Eye, EyeOff, Info, UserIcon, Lock, Zap } from "lucide-react"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showCredentials, setShowCredentials] = useState(false)

  // Check for existing session on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("currentUser")
      }
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const authenticatedUser = authenticate(username, password)
      if (authenticatedUser) {
        setUser(authenticatedUser)
        localStorage.setItem("currentUser", JSON.stringify(authenticatedUser))
        setUsername("")
        setPassword("")
      } else {
        setError("Invalid username or password")
      }
    } catch (error) {
      setError("An error occurred during login")
      console.error("Login error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
    setUsername("")
    setPassword("")
    setError("")
  }

  const fillCredentials = (role: string) => {
    const credentials = getDefaultCredentials()
    const cred = credentials[role as keyof typeof credentials]
    if (cred) {
      setUsername(cred.username)
      setPassword(cred.password)
      setShowCredentials(false)
    }
  }

  const renderDashboard = () => {
    if (!user) return null

    switch (user.role) {
      case "admin":
        return <AdminDashboard user={user} onLogout={handleLogout} />
      case "developer":
        return <DeveloperDashboard user={user} onLogout={handleLogout} />
      case "editor":
        return <EditorDashboard user={user} onLogout={handleLogout} />
      case "user":
      default:
        return <UserDashboard user={user} onLogout={handleLogout} />
    }
  }

  // If user is logged in, render the appropriate dashboard
  if (user) {
    return renderDashboard()
  }

  // Render login form
  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/jne-icon.png" alt="JNE" className="h-12 w-12 mr-3" />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">JNE Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Shipment Management System</p>
            </div>
          </div>
          <img src="/jne-tagline.png" alt="JNE Tagline" className="h-8 mx-auto mb-4" />
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <AuthInput
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              icon={<UserIcon size={20} />}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <AuthInput
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                icon={<Lock size={20} />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <AuthButton type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Signing in...
              </>
            ) : (
              <>
                <Zap size={20} />
                Sign In
              </>
            )}
          </AuthButton>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowCredentials(!showCredentials)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Info size={16} />
            {showCredentials ? "Hide" : "Show"} Demo Credentials
          </button>

          {showCredentials && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Demo Accounts:</h3>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(getDefaultCredentials()).map(([key, cred]) => (
                  <button
                    key={key}
                    onClick={() => fillCredentials(key)}
                    className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-left"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-white capitalize">{key} Account</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {cred.username} / {cred.password}
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        key === "admin"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          : key === "developer"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                            : key === "editor"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      }`}
                    >
                      {key.toUpperCase()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 JNE Dashboard. All rights reserved.</p>
        </div>
      </div>
    </AuthLayout>
  )
}
