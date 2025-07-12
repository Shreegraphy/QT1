"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  userType: "student" | "faculty"
  picture?: string
}

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    // Only run once on mount
    if (hasInitialized) return

    try {
      // Check for existing session
      const savedUser = localStorage.getItem("quiz_app_user")
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser)
        // Validate the user object has required fields
        if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.userType) {
          setUser(parsedUser)
        } else {
          // Clear invalid user data
          localStorage.removeItem("quiz_app_user")
        }
      }
    } catch (error) {
      console.error("Error parsing stored user:", error)
      localStorage.removeItem("quiz_app_user")
    } finally {
      setIsLoading(false)
      setHasInitialized(true)
    }
  }, [hasInitialized])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem("quiz_app_user", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("quiz_app_user")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
