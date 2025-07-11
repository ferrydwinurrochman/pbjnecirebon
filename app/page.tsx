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
import RegisterPage from "./register"
import ForgotPasswordPage from "./forgot-password"
import { Eye, EyeOff, UserIcon, Lock } from "lucide-react"

type Page = "login" | "register" | "forgot-password" | "dashboard"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState<Page>("login")

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

  if (currentPage === "dashboard" && user) {
    return renderDashboard()
  }

  if (currentPage === "register") {
    return <RegisterPage onBack={() => setCurrentPage("login")} />
  }

  if (currentPage === "forgot-password") {
    return <ForgotPasswordPage onBack={() => setCurrentPage("login")} />
  }

  if (user) {
    return renderDashboard()
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/jne-icon.png" alt="JNE" className="h-12 w-12 mr-3" />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[#f00000]">JNE Dashboard</h1>
              <p className="text-sm text-[#f00000]">Dashboard Shipment JNE Cirebon</p>
            </div>
          </div>
          <img src="/jne-tagline.png" alt="JNE Tagline" className="h-8 mx-auto mb-4" />
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-white/90 text-sm font-medium">
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
            <label htmlFor="password" className="block text-sm font-medium text-[#f00000] mb-2">
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#f00000] hover:text-[#f00000] dark:hover:text-[#f00000]"
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

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent bg-gradient-to-r from-[#25C2F7] to-[#1877F2] hover:from-[#1BA8E0] hover:to-[#1565C0] focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner /> : "Access Dashboard"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              type="button"
              onClick={() => setCurrentPage("register")}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent bg-gradient-to-r from-[#25C2F7] to-[#4FC3F7] hover:from-[#1BA8E0] hover:to-[#29B6F6] focus:ring-blue-300"
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage("forgot-password")}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent bg-gradient-to-r from-[#FF6A4D] to-[#F23A3A] hover:from-[#FF5722] hover:to-[#E53935] focus:ring-red-400"
            >
              Forgot Password
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 JNE Dashboard. All rights reserved.</p>
        </div>
      </div>
    </AuthLayout>
  )
}
