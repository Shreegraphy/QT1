"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Trophy, Clock, CheckCircle, Target, Home, RotateCcw, Share2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function QuizResultPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

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

    const quizResult = localStorage.getItem("quizResult")
    if (!quizResult) {
      router.push("/student/dashboard")
      return
    }

    const resultData = JSON.parse(quizResult)
    setResult(resultData)

    // Store the result in faculty results for viewing
    const studentResult = {
      ...resultData,
      studentId: user.id,
      studentName: user.name,
      studentEmail: user.email,
      section: user.section,
      department: user.department,
      submittedAt: new Date().toISOString(),
    }

    // Save to faculty results
    const existingResults = JSON.parse(localStorage.getItem("quiz_results") || "[]")
    existingResults.push(studentResult)
    localStorage.setItem("quiz_results", JSON.stringify(existingResults))

    setIsLoading(false)
  }, [user, authLoading, router])

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800"
    if (score >= 80) return "bg-blue-100 text-blue-800"
    if (score >= 70) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return "Excellent work! Outstanding performance!"
    if (score >= 80) return "Great job! You did very well!"
    if (score >= 70) return "Good work! Keep it up!"
    if (score >= 60) return "Not bad! There's room for improvement."
    return "Keep practicing! You'll do better next time."
  }

  const handleBackToDashboard = () => {
    localStorage.removeItem("quizResult")
    router.push("/student/dashboard")
  }

  const handleTakeAnotherQuiz = () => {
    localStorage.removeItem("quizResult")
    router.push("/quiz/join")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  if (!user || !result) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">QuizMaster</span>
              <Badge variant="secondary" className="ml-4">
                Quiz Results
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
          <p className="text-gray-600">Here are your results for {result.quizTitle}</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Score Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Your Score</CardTitle>
              <CardDescription>Quiz Code: {result.quizCode}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.score)}`}>{result.score}%</div>
                <Badge className={getScoreBadgeColor(result.score)}>
                  {result.correctAnswers} out of {result.totalQuestions} correct
                </Badge>
                <p className="text-gray-600 mt-2">{getPerformanceMessage(result.score)}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Score Progress</span>
                    <span>{result.score}%</span>
                  </div>
                  <Progress value={result.score} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center p-6">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">Correct Answers</p>
              <p className="text-2xl font-bold text-green-600">{result.correctAnswers}</p>
            </Card>

            <Card className="text-center p-6">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold text-blue-600">{result.totalQuestions}</p>
            </Card>

            <Card className="text-center p-6">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">Time Spent</p>
              <p className="text-2xl font-bold text-purple-600">{formatTime(result.timeSpent)}</p>
            </Card>
          </div>

          {/* Performance Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5" />
                Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Accuracy Rate</p>
                  <p className="text-xl font-bold text-blue-600">
                    {Math.round((result.correctAnswers / result.totalQuestions) * 100)}%
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Completion</p>
                  <p className="text-xl font-bold text-green-600">100%</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Student Details</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Student Name:</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Section:</span>
                    <span className="font-medium">Section {user.section}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Department:</span>
                    <span className="font-medium">{user.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quiz Title:</span>
                    <span className="font-medium">{result.quizTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed At:</span>
                    <span className="font-medium">{new Date(result.completedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quiz Code:</span>
                    <span className="font-medium font-mono">{result.quizCode}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleBackToDashboard}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button onClick={handleTakeAnotherQuiz} variant="outline" className="flex-1 h-12 bg-transparent">
              <RotateCcw className="mr-2 h-4 w-4" />
              Take Another Quiz
            </Button>
          </div>

          {/* Share Results */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Share your achievement!</p>
                  <p className="text-sm text-gray-600">Let others know about your great performance</p>
                </div>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
