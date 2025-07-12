"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, BookOpen, GraduationCap, Mail, Lock, User, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { userManager } from "@/lib/user-management"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("student")
  const [emailError, setEmailError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { user: authUser, login, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    if (authUser && !authLoading) {
      // User is already logged in, redirect to dashboard
      if (authUser.userType === "student") {
        router.push("/student/dashboard")
      } else {
        router.push("/faculty/dashboard")
      }
    }
  }, [authUser, authLoading, router])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    setError("")
    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email address")
    } else {
      setEmailError("")
    }
  }

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    if (!password) {
      setError("Please enter your password")
      return
    }

    setEmailError("")
    setError("")
    setIsLoading(true)

    // Authenticate user
    const authenticatedUser = userManager.authenticateUser(email, password, "manual")

    if (!authenticatedUser) {
      setError("Invalid email or password. Please check your credentials and try again.")
      setIsLoading(false)
      return
    }

    // Check if user type matches selected tab
    if (authenticatedUser.userType !== activeTab) {
      setError(`This account is registered as a ${authenticatedUser.userType}. Please select the correct account type.`)
      setIsLoading(false)
      return
    }

    // Login successful
    const userData = {
      id: authenticatedUser.id,
      email: authenticatedUser.email,
      name: authenticatedUser.name,
      picture: authenticatedUser.picture,
      userType: authenticatedUser.userType,
      loginMethod: authenticatedUser.loginMethod,
      signupTime: authenticatedUser.signupTime,
      section: authenticatedUser.section,
      department: authenticatedUser.department,
    }

    login(userData)
    setIsLoading(false)

    // Redirect to appropriate dashboard
    if (userData.userType === "student") {
      router.push("/student/dashboard")
    } else {
      router.push("/faculty/dashboard")
    }
  }

  const handleOAuthLogin = (provider: string) => {
    setError("")
    setIsLoading(true)

    // Simulate OAuth login
    setTimeout(() => {
      const email = `user@${provider}.com`

      // Check if user exists
      const authenticatedUser = userManager.authenticateUser(email, undefined, provider)

      if (!authenticatedUser) {
        setError(`No account found with this ${provider} email. Please sign up first.`)
        setIsLoading(false)
        return
      }

      // Check if user type matches selected tab
      if (authenticatedUser.userType !== activeTab) {
        setError(
          `This account is registered as a ${authenticatedUser.userType}. Please select the correct account type.`,
        )
        setIsLoading(false)
        return
      }

      // Login successful
      const userData = {
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        name: authenticatedUser.name,
        picture: authenticatedUser.picture,
        userType: authenticatedUser.userType,
        loginMethod: authenticatedUser.loginMethod,
        signupTime: authenticatedUser.signupTime,
        section: authenticatedUser.section,
        department: authenticatedUser.department,
      }

      login(userData)
      setIsLoading(false)

      // Redirect to appropriate dashboard
      if (userData.userType === "student") {
        router.push("/student/dashboard")
      } else {
        router.push("/faculty/dashboard")
      }
    }, 1500)
  }

  const goToSignup = () => {
    router.push("/signup")
  }

  // Don't render if user is already logged in (will redirect)
  if (authUser && !authLoading) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QuizMaster</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">Choose your portal and sign in to QuizMaster</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="faculty" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Faculty
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student" className="space-y-4">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600">Student Portal Sign In</p>
                </div>
                <LoginForm
                  onSubmit={handleManualLogin}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  emailError={emailError}
                  onEmailChange={handleEmailChange}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="faculty" className="space-y-4">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-2">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600">Faculty Portal Sign In</p>
                </div>
                <LoginForm
                  onSubmit={handleManualLogin}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  emailError={emailError}
                  onEmailChange={handleEmailChange}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or sign in with</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleOAuthLogin("google")}
                  disabled={isLoading}
                  className="w-full h-11 border-gray-200 hover:bg-gray-50 transition-colors bg-transparent"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  Sign in with Google
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleOAuthLogin("github")}
                  disabled={isLoading}
                  className="w-full h-11 border-gray-200 hover:bg-gray-50 transition-colors bg-transparent"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Sign in with GitHub
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleOAuthLogin("apple")}
                  disabled={isLoading}
                  className="w-full h-11 border-gray-200 hover:bg-gray-50 transition-colors bg-transparent"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  Sign in with Apple
                </Button>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button onClick={goToSignup} className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                  Create account here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our <button className="hover:underline">Terms of Service</button> and{" "}
            <button className="hover:underline">Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>
  )
}

interface LoginFormProps {
  onSubmit: (e: React.FormEvent) => void
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  emailError: string
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  isLoading: boolean
}

function LoginForm({ onSubmit, showPassword, setShowPassword, emailError, onEmailChange, isLoading }: LoginFormProps) {
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
            placeholder="Enter your password"
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

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  )
}
