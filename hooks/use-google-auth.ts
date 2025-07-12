"use client"
import { useState } from "react"
import { googleSignUp } from "@/lib/google-auth"

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signUp = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await googleSignUp() // success handled in redirect page
    } catch (e: any) {
      setError(e.message || "Google sign-up failed")
    } finally {
      setIsLoading(false)
    }
  }

  return { signUp, isLoading, error, clearError: () => setError(null) }
}
