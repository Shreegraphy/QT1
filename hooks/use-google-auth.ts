"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createUser, saveUser, getUserByEmail } from "@/lib/user-management"
import { useRouter } from "next/navigation"

interface GoogleUser {
  id: string
  name: string
  email: string
  picture: string
}

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const router = useRouter()

  const signInWithGoogle = useCallback(
    async (userType: "student" | "faculty") => {
      setIsLoading(true)
      setError(null)

      try {
        // Simulate Google OAuth flow
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Mock Google user data
        const mockGoogleUser: GoogleUser = {
          id: `google_${Date.now()}`,
          name: "John Doe",
          email: "john.doe@example.com",
          picture: "/placeholder.svg?height=40&width=40&text=JD",
        }

        // Check if user already exists
        let user = getUserByEmail(mockGoogleUser.email)

        if (!user) {
          // Create new user
          user = createUser(
            mockGoogleUser.id,
            mockGoogleUser.name,
            mockGoogleUser.email,
            userType,
            mockGoogleUser.picture,
          )
          saveUser(user)
        }

        // Log in the user
        login(user)

        // Redirect based on user type
        if (user.userType === "student") {
          router.push("/student/dashboard")
        } else {
          router.push("/faculty/dashboard")
        }
      } catch (err) {
        setError("Failed to sign in with Google. Please try again.")
        console.error("Google sign-in error:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [login, router],
  )

  return {
    signInWithGoogle,
    isLoading,
    error,
  }
}
