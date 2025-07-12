"use client"

import type React from "react"

import { useEffect } from "react"

import { useRouter } from "next/navigation"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, GraduationCap, Mail, Lock, Loader2, CheckCircle } from "lucide-react"
import { useGoogleAuth } from "@/hooks/use-google-auth"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [activeTab, setActiveTab] = useState("student")
  const [emailError, setEmailError] = useState("")
  const [showWelcome, setShowWelcome] = useState(false)
  const [showStudentDetails, setShowStudentDetails] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [studentDetails, setStudentDetails] = useState({
    section: "",
    department: "",
  })
  const router = useRouter()

  const { signUp: googleSignUp, isLoading: googleLoading, error: googleError, clearError } = useGoogleAuth()

  const { user: authUser, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading) {
      if (authUser) {
        setUser(authUser)
        if (authUser.userType === "student" && (!authUser.section || !authUser.department)) {
          setShowStudentDetails(true)
        } else {
          if (authUser.userType === "student") {
            router.push("/student/dashboard")
          } else {
            router.push("/faculty/dashboard")
          }
        }
      } else {
        router.push("/login")
      }
    }
  }, [authUser, authLoading, router])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email address")
    } else {
      setEmailError("")
    }
  }

  const handleManualSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    setEmailError("")
    const userData = {
      id: "manual_" + Math.random().toString(36).substring(2, 15),
      email,
      name: email.split("@")[0],
      picture: "/placeholder.png",
      userType: activeTab,
      loginMethod: "manual",
      signupTime: new Date().toISOString(),
    }

    setUser(userData)

    if (activeTab === "student") {
      setShowStudentDetails(true)
    } else {
      // Simulate login process for faculty
      setTimeout(() => {
        router.push("/faculty/dashboard")
      }, 1500)
    }
  }

  const handleGoogleSignup = () => {
    clearError()
    setTimeout(() => {
      const userData = {
        id: "google_" + Math.random().toString(36).substring(2, 15),
        email: "user@gmail.com",
        name: "Google User",
        picture: "/placeholder.png",
        userType: activeTab,
        loginMethod: "google",
        signupTime: new Date().toISOString(),
      }
      setUser(userData)

      if (activeTab === "student") {
        setShowStudentDetails(true)
      } else {
        // Simulate login process for faculty
        setTimeout(() => {
          router.push("/faculty/dashboard")
        }, 1500)
      }
    }, 1500)
  }

  const handleGitHubSignup = () => {
    const userData = {
      id: "github_" + Math.random().toString(36).substring(2, 15),
      email: "user@github.com",
      name: "GitHub User",
      picture: "/placeholder.png",
      userType: activeTab,
      loginMethod: "github",
      signupTime: new Date().toISOString(),
    }
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)

    if (activeTab === "student") {
      setShowStudentDetails(true)
    } else {
      // Simulate login process for faculty
      setTimeout(() => {
        router.push("/faculty/dashboard")
      }, 1500)
    }
  }

  const handleAppleSignup = () => {
    const userData = {
      id: "apple_" + Math.random().toString(36).substring(2, 15),
      email: "user@icloud.com",
      name: "Apple User",
      picture: "/placeholder.png",
      userType: activeTab,
      loginMethod: "apple",
      signupTime: new Date().toISOString(),
    }
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)

    if (activeTab === "student") {
      setShowStudentDetails(true)
    } else {
      // Simulate login process for faculty
      setTimeout(() => {
        router.push("/faculty/dashboard")
      }, 1500)
    }
  }

  const handleStudentDetailsSubmit = () => {
    if (!studentDetails.section || !studentDetails.department) {
      alert("Please select both section and department")
      return
    }

    const updatedUser = {
      ...user,
      section: studentDetails.section,
      department: studentDetails.department,
    }

    setUser(updatedUser)
    setShowStudentDetails(false)
    setShowWelcome(true)
  }

  const goToDashboard = () => {
    if (user?.userType === "student") {
      router.push("/student/dashboard")
    } else {
      router.push("/faculty/dashboard")
    }
  }

  const startOver = () => {
    localStorage.removeItem("user")
    setUser(null)
    setShowWelcome(false)
    setShowStudentDetails(false)
    setStudentDetails({ section: "", department: "" })
  }

  if (showStudentDetails && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4 mx-auto">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Student Details</CardTitle>
            <CardDescription className="text-gray-600">
              Please provide your class section and department
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto mb-4">
                <img
                  src={user.picture || "/placeholder.png"}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover border-2 border-gray-200"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="section">Class Section *</Label>
                <Select
                  value={studentDetails.section}
                  onValueChange={(value) => setStudentDetails({ ...studentDetails, section: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your section" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q"].map(
                      (section) => (
                        <SelectItem key={section} value={section}>
                          Section {section}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={studentDetails.department}
                  onValueChange={(value) => setStudentDetails({ ...studentDetails, department: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSE">Computer Science & Engineering (CSE)</SelectItem>
                    <SelectItem value="ECE">Electronics & Communication Engineering (ECE)</SelectItem>
                    <SelectItem value="CSBS">Computer Science & Business Systems (CSBS)</SelectItem>
                    <SelectItem value="AIML">Artificial Intelligence & Machine Learning (AIML)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleStudentDetailsSubmit}
                disabled={!studentDetails.section || !studentDetails.department}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Continue to Dashboard
              </Button>
              <Button onClick={startOver} variant="outline" className="w-full bg-transparent">
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showWelcome && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4 mx-auto">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome to QuizMaster!</CardTitle>
            <CardDescription className="text-gray-600">Your account has been successfully created</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto mb-4">
                <img
                  src={user.picture || "/placeholder.png"}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover border-2 border-gray-200"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user.userType === "student" ? "Student Account" : "Faculty Account"}
              </div>
              {user.userType === "student" && user.section && user.department && (
                <div className="flex justify-center space-x-2 mt-2">
                  <Badge variant="outline">Section {user.section}</Badge>
                  <Badge variant="outline">{user.department}</Badge>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={goToDashboard}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Go to Dashboard
              </Button>
              <Button onClick={startOver} variant="outline" className="w-full bg-transparent">
                Sign Up Another Account
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Signed up via{" "}
                {user.loginMethod === "google"
                  ? "Google"
                  : user.loginMethod === "github"
                    ? "GitHub"
                    : user.loginMethod === "apple"
                      ? "Apple"
                      : "Email"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading QuizMaster...</p>
      </div>
    </div>
  )
}

interface SignupFormProps {
  onSubmit: (e: React.FormEvent) => void
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  rememberMe: boolean
  setRememberMe: (remember: boolean) => void
  emailError: string
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  isLoading: boolean
}

function SignupForm({
  onSubmit,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  emailError,
  onEmailChange,
  isLoading,
}: SignupFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address"
            onChange={onEmailChange}
            disabled={isLoading}
            className={`pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
              emailError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
            }`}
            required
          />
        </div>
        {emailError && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {emailError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            disabled={isLoading}
            className="pl-10 pr-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          disabled={isLoading}
        />
        <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
          I agree to the Terms of Service and Privacy Policy
        </Label>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  )
}
