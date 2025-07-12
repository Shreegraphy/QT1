"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { googleSignUp } from "@/lib/google-auth"

export default function GoogleCompletePage() {
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      try {
        // googleSignUp will detect the hash token and finish the flow
        const user = await googleSignUp()
        const userData = {
          ...user,
          userType: "student", // default - you can store desired type in sessionStorage if needed
          loginMethod: "google",
          signupTime: new Date().toISOString(),
        }
        localStorage.setItem("user", JSON.stringify(userData))
        router.replace("/") // back to homepage / welcome
      } catch (e) {
        console.error(e)
        router.replace("/") // send back with error state
      }
    })()
  }, [router])

  return null
}
