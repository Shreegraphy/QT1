"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { userManager } from "@/lib/user-management"

interface User {
  id: string
  email: string
  name: string
  picture: string
  userType: "student" | "faculty"
  loginMethod: string
  signupTime: string
  section?: string
  department?: string
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  isLoading: boolean
  updateUser: (userData: Partial<User>) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem("current_user")
    const sessionExpiry = localStorage.getItem("session_expiry")

    if (savedUser && sessionExpiry) {
      const expiryTime = new Date(sessionExpiry).getTime()
      const currentTime = new Date().getTime()

      if (currentTime < expiryTime) {
        // Session is still valid
        const userData = JSON.parse(savedUser)

        // Verify user still exists in registered users
        const registeredUser = userManager.getUserById(userData.id)
        if (registeredUser) {
          setUser(userData)
          setIsAuthenticated(true)
          initializeUserData(userData)
        } else {
          // User no longer exists, clear session
          clearSession()
        }
      } else {
        // Session expired, clear data
        clearSession()
      }
    }

    setIsLoading(false)
  }, [])

  const clearSession = () => {
    localStorage.removeItem("current_user")
    localStorage.removeItem("session_expiry")
    setUser(null)
    setIsAuthenticated(false)
  }

  const initializeUserData = (userData: User) => {
    if (userData.userType === "student") {
      // Initialize student data if it doesn't exist
      const userDataKey = `student_data_${userData.id}`
      const existingData = localStorage.getItem(userDataKey)

      if (!existingData) {
        const generatedData = generateStudentData(userData.id, userData.name)
        localStorage.setItem(userDataKey, JSON.stringify(generatedData))
      }
    } else if (userData.userType === "faculty") {
      // Initialize faculty data if it doesn't exist
      const userDataKey = `faculty_data_${userData.id}`
      const existingData = localStorage.getItem(userDataKey)

      if (!existingData) {
        const generatedData = generateFacultyData(userData.id, userData.name)
        localStorage.setItem(userDataKey, JSON.stringify(generatedData))
      }
    }
  }

  const generateStudentData = (userId: string, userName: string) => {
    // Use user ID as seed for consistent random data
    const seed = userId.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
    const random = (min: number, max: number) => {
      const x = Math.sin(seed * 9999) * 10000
      return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min
    }

    // Generate personalized stats
    const totalQuizzes = random(15, 30)
    const completedQuizzes = random(Math.floor(totalQuizzes * 0.6), totalQuizzes - 2)
    const averageScore = random(70, 95)
    const rank = random(1, 50)
    const totalPoints = completedQuizzes * random(80, 120)

    const userStats = {
      totalQuizzes,
      completedQuizzes,
      averageScore,
      rank,
      totalPoints,
    }

    // Generate recent quizzes with user-specific scores
    const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "History", "English", "Computer Science"]
    const topics = {
      Mathematics: ["Algebra Basics", "Calculus", "Geometry", "Statistics"],
      Physics: ["Newton's Laws", "Thermodynamics", "Electromagnetism", "Quantum Physics"],
      Chemistry: ["Periodic Table", "Organic Chemistry", "Chemical Bonds", "Reactions"],
      Biology: ["Cell Structure", "Genetics", "Evolution", "Ecology"],
      History: ["World War II", "Ancient Civilizations", "Renaissance", "Industrial Revolution"],
      English: ["Shakespeare", "Poetry Analysis", "Grammar", "Literature"],
      "Computer Science": ["Data Structures", "Algorithms", "Programming", "Databases"],
    }

    const userRecentQuizzes = []
    for (let i = 0; i < 4; i++) {
      const subject = subjects[random(0, subjects.length - 1)]
      const topic = topics[subject][random(0, topics[subject].length - 1)]
      const isCompleted = random(0, 100) < 75 // 75% chance completed
      const score = isCompleted ? random(60, 100) : null
      const status = isCompleted ? "completed" : "available"

      userRecentQuizzes.push({
        id: i + 1,
        title: `${subject} - ${topic}`,
        subject,
        score,
        status,
        date: new Date(Date.now() - random(1, 10) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        duration: `${random(20, 60)} min`,
      })
    }

    return {
      stats: userStats,
      recentQuizzes: userRecentQuizzes,
    }
  }

  const generateFacultyData = (userId: string, userName: string) => {
    // Use user ID as seed for consistent random data
    const seed = userId.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
    const random = (min: number, max: number) => {
      const x = Math.sin(seed * 9999) * 10000
      return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min
    }

    // Generate personalized faculty stats (these will be updated with real data)
    const totalQuizzes = 0 // Start with 0, will be updated with real quizzes
    const activeQuizzes = 0
    const totalStudents = random(50, 300)
    const averageScore = random(65, 85)
    const totalSubmissions = 0 // Start with 0, will be updated with real submissions

    const facultyStats = {
      totalQuizzes,
      activeQuizzes,
      totalStudents,
      averageScore,
      totalSubmissions,
    }

    return {
      stats: facultyStats,
      recentQuizzes: [],
      recentActivity: [],
    }
  }

  const login = (userData: User) => {
    // Set session to expire in 30 days for better persistence
    const expiryTime = new Date()
    expiryTime.setDate(expiryTime.getDate() + 30)

    localStorage.setItem("current_user", JSON.stringify(userData))
    localStorage.setItem("session_expiry", expiryTime.toISOString())
    setUser(userData)
    setIsAuthenticated(true)

    // Initialize user data
    initializeUserData(userData)
  }

  const logout = () => {
    clearSession()
    router.push("/")
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      localStorage.setItem("current_user", JSON.stringify(updatedUser))
      setUser(updatedUser)

      // Update in registered users as well
      userManager.updateUser(user.id, userData)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
