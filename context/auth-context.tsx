"use client"

// context/auth-context.tsx - Auth context migrated from Vite app
import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import ApiService from "@/lib/api-service"
import type { AuthUser, RegisterFormData, AuthContextType } from "@/types"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = ApiService.getToken()
        if (!token) {
          setLoading(false)
          setIsInitialized(true)
          return
        }

        const userData = await ApiService.getCurrentUser()
        setUser(userData as AuthUser)
      } catch (error: any) {
        console.error("Auth initialization failed:", error)
        ApiService.clearToken()
        setUser(null)
      } finally {
        setLoading(false)
        setIsInitialized(true)
      }
    }

    if (!isInitialized) {
      initializeAuth()
    }
  }, [isInitialized])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const response = await ApiService.login(email, password)

      if (response && response.user) {
        setUser(response.user as AuthUser)
        return true
      }

      throw new Error("Invalid login response")
    } catch (error: any) {
      console.error("Login failed:", error)
      setError(error.message || "Login failed. Please check your credentials.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterFormData): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const response = await ApiService.register(userData)

      if (response && response.user) {
        setUser(response.user as AuthUser)
        return true
      }

      throw new Error("Invalid registration response")
    } catch (error: any) {
      console.error("Registration failed:", error)

      if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
        setError("An account with this email already exists.")
      } else if (error.message?.includes("validation") || error.message?.includes("invalid")) {
        setError("Please check your information and try again.")
      } else {
        setError(error.message || "Registration failed. Please try again.")
      }

      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setLoading(true)

      try {
        await ApiService.logout()
      } catch (error) {
        console.warn("Server logout failed, but continuing with local logout:", error)
      }

      ApiService.clearToken()
      setUser(null)
      setError(null)

      window.location.href = "/auth"
    } catch (error: any) {
      console.error("Logout failed:", error)
      ApiService.clearToken()
      setUser(null)
      window.location.href = "/auth"
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    error,
    isAuthenticated: !!user && !!ApiService.getToken(),
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
