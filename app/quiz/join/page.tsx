"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, ArrowLeft, Users, Clock, FileText, AlertCircle, CheckCircle, Loader2, Play } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function JoinQuizPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [quizCode, setQuizCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isValidating, setIsValidating] = useState(true)
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/")
      return
    }

    if (user.userType !== "student") {
      router.push("/faculty/dashboard")
      return
    }

    setIsValidating(false)
  }, [user, authLoading, router])

  // Generate user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Load quizzes from localStorage (created by teachers)
  const [mockQuizzes, setMockQuizzes] = useState<any>({})

  useEffect(() => {
    // Load quizzes created by teachers
    const savedQuizzes = JSON.parse(localStorage.getItem("mock_quizzes") || "{}")
    setMockQuizzes(savedQuizzes)
  }, [])

  const handleJoinQuiz = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!quizCode.trim()) {
      setError("Please enter a quiz code")
      return
    }

    setIsLoading(true)
    setError("")

    // Simulate API call
    setTimeout(() => {
      const quiz = mockQuizzes[quizCode.toUpperCase()]

      if (quiz) {
        // Store quiz info and redirect to quiz page
        localStorage.setItem(
          "currentQuiz",
          JSON.stringify({
            code: quizCode.toUpperCase(),
            ...quiz,
            joinedAt: new Date().toISOString(),
          }),
        )
        router.push(`/quiz/take/${quizCode.toUpperCase()}`)
      } else {
        setError("Invalid quiz code. Please check with your teacher and try again.")
      }
      setIsLoading(false)
    }, 1500)
  }

  const handleBackToDashboard = () => {
    router.push("/student/dashboard")
  }

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={handleBackToDashboard} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">QuizMaster</span>
              </div>
              <Badge variant="secondary" className="ml-4">
                Join Quiz
              </Badge>
            </div>

            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.picture || "/placeholder.png"} alt={user.name} />
                <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Student</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Play className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Quiz Session</h1>
          <p className="text-gray-600">Enter the referral code provided by your teacher to join the quiz</p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Enter Quiz Code</CardTitle>
              <CardDescription>Your teacher will provide you with a unique code to access the quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleJoinQuiz} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quizCode" className="text-sm font-medium">
                    Quiz Referral Code
                  </Label>
                  <Input
                    id="quizCode"
                    type="text"
                    placeholder="Enter code (e.g., MATH101)"
                    value={quizCode}
                    onChange={(e) => {
                      setQuizCode(e.target.value.toUpperCase())
                      setError("")
                    }}
                    disabled={isLoading}
                    className="h-12 text-center text-lg font-mono tracking-wider border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    maxLength={10}
                    required
                  />
                  <p className="text-xs text-gray-500 text-center">
                    Code format: Usually 6-8 characters (letters and numbers)
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !quizCode.trim()}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining Quiz...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Join Quiz
                    </>
                  )}
                </Button>
              </form>

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Sample Codes for Testing</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(mockQuizzes).map(([code, quiz]) => (
                    <Button
                      key={code}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuizCode(code)}
                      disabled={isLoading}
                      className="text-xs bg-transparent"
                    >
                      {code}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">How to get your quiz code:</h4>
                    <ul className="text-xs text-blue-800 mt-1 space-y-1">
                      <li>• Ask your teacher for the quiz referral code</li>
                      <li>• Check your class announcements or messages</li>
                      <li>• The code is usually shared at the start of class</li>
                      <li>• Codes are case-insensitive</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <Card className="text-center p-4">
              <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Active Quizzes</p>
              <p className="text-lg font-bold text-blue-600">{Object.keys(mockQuizzes).length}</p>
            </Card>
            <Card className="text-center p-4">
              <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Avg Duration</p>
              <p className="text-lg font-bold text-green-600">55 min</p>
            </Card>
            <Card className="text-center p-4">
              <FileText className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Questions</p>
              <p className="text-lg font-bold text-purple-600">25-40</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
