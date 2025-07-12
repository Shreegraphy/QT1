"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Clock, Users, FileText, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Flag } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function TakeQuizPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [quiz, setQuiz] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [timeRemaining, setTimeRemaining] = useState(2700) // 45 minutes in seconds
  const [quizStarted, setQuizStarted] = useState(false)
  const router = useRouter()
  const params = useParams()

  // Get actual questions from the quiz
  const actualQuestions = quiz?.fullQuiz?.questions || []

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

    // Check for current quiz
    const currentQuiz = localStorage.getItem("currentQuiz")
    if (!currentQuiz) {
      router.push("/quiz/join")
      return
    }

    const quizData = JSON.parse(currentQuiz)
    if (quizData.code !== params.code) {
      router.push("/quiz/join")
      return
    }

    setQuiz(quizData)

    // Set timer based on actual quiz duration
    if (quizData.fullQuiz && quizData.fullQuiz.duration) {
      setTimeRemaining(quizData.fullQuiz.duration * 60) // Convert minutes to seconds
    }

    setIsLoading(false)
  }, [user, authLoading, router, params.code])

  // Timer effect
  useEffect(() => {
    if (quizStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [quizStarted, timeRemaining])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
  }

  const handleAnswerSelect = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answer,
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestion < actualQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmitQuiz = () => {
    // Calculate score
    let correctAnswers = 0
    const actualQuestions = quiz?.fullQuiz?.questions || []

    actualQuestions.forEach((question, index) => {
      const userAnswer = answers[index]

      // Handle different question types
      switch (question.type) {
        case "multiple-choice":
          if (question.correctAnswers.includes(userAnswer)) {
            correctAnswers++
          }
          break
        case "multiple-answers":
          // For multiple answers, check if user selected all correct answers
          const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
          const isCorrect =
            question.correctAnswers.every((correct) => userAnswers.includes(correct)) &&
            userAnswers.every((answer) => question.correctAnswers.includes(answer))
          if (isCorrect) {
            correctAnswers++
          }
          break
        case "fill-blanks":
          if (question.correctAnswers.includes(userAnswer)) {
            correctAnswers++
          }
          break
        case "match-following":
          // Handle matching questions (simplified for demo)
          if (userAnswer === "correct") {
            // This would need more complex logic
            correctAnswers++
          }
          break
        case "paragraph":
          // Paragraph answers would need manual grading
          // For demo, we'll give partial credit
          if (userAnswer && userAnswer.length > 10) {
            correctAnswers += 0.5
          }
          break
      }
    })

    const score = actualQuestions.length > 0 ? Math.round((correctAnswers / actualQuestions.length) * 100) : 0

    // Store result
    const result = {
      quizCode: quiz.code,
      quizTitle: quiz.title,
      score,
      correctAnswers: Math.floor(correctAnswers),
      totalQuestions: actualQuestions.length,
      completedAt: new Date().toISOString(),
      timeSpent: (quiz?.fullQuiz?.duration * 60 || 2700) - timeRemaining,
    }

    localStorage.setItem("quizResult", JSON.stringify(result))
    localStorage.removeItem("currentQuiz")
    router.push("/quiz/result")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (!user || !quiz) {
    return null
  }

  // Pre-quiz screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">QuizMaster</span>
                <Badge variant="secondary" className="ml-4">
                  Quiz: {quiz.code}
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
            <p className="text-gray-600">by {quiz.teacher}</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Quiz Instructions</CardTitle>
                <CardDescription>Please read carefully before starting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">Duration</p>
                    <p className="text-lg font-bold text-blue-600">{quiz.duration}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <FileText className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">Questions</p>
                    <p className="text-lg font-bold text-green-600">{actualQuestions.length}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">Participants</p>
                    <p className="text-lg font-bold text-purple-600">{quiz.participants}</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">Subject</p>
                    <p className="text-sm font-bold text-orange-600">{quiz.subject}</p>
                  </div>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Important Instructions:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• You have {quiz.duration} to complete this quiz</li>
                      <li>• You can navigate between questions using Next/Previous buttons</li>
                      <li>• Your answers are automatically saved</li>
                      <li>• Submit the quiz before time runs out</li>
                      <li>• Once submitted, you cannot change your answers</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleStartQuiz}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-lg"
                >
                  Start Quiz
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  // Quiz taking screen
  const currentQ = actualQuestions[currentQuestion]
  const progress = actualQuestions.length > 0 ? ((currentQuestion + 1) / actualQuestions.length) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">{quiz.title}</h1>
                <p className="text-sm text-gray-600">
                  Question {currentQuestion + 1} of {actualQuestions.length}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Time Remaining</p>
                <p className={`text-lg font-bold ${timeRemaining < 300 ? "text-red-600" : "text-blue-600"}`}>
                  {formatTime(timeRemaining)}
                </p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.picture || "/placeholder.png"} alt={user.name} />
                <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Question {currentQuestion + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg text-gray-900 leading-relaxed">{currentQ.question}</div>

            <div className="space-y-3">
              {currentQ?.type === "multiple-choice" || currentQ?.type === "multiple-answers" ? (
                currentQ.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full p-4 text-left border rounded-lg transition-all ${
                      answers[currentQuestion] === option
                        ? "border-blue-500 bg-blue-50 text-blue-900"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          answers[currentQuestion] === option ? "border-blue-500 bg-blue-500" : "border-gray-300"
                        }`}
                      >
                        {answers[currentQuestion] === option && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                        )}
                      </div>
                      <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                      <span className="ml-2">{option}</span>
                    </div>
                  </button>
                ))
              ) : currentQ?.type === "fill-blanks" ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Fill in the blanks:</p>
                  <input
                    type="text"
                    value={answers[currentQuestion] || ""}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    placeholder="Enter your answer"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              ) : currentQ?.type === "paragraph" ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Write your answer in paragraph form:</p>
                  <textarea
                    value={answers[currentQuestion] || ""}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    placeholder="Enter your detailed answer here..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                    rows={6}
                  />
                </div>
              ) : currentQ?.type === "match-following" ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Match the following items:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Column A</h4>
                      {currentQ.matchPairs?.map((pair, index) => (
                        <div key={index} className="p-2 border rounded mb-2">
                          {pair.left}
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Column B</h4>
                      {currentQ.matchPairs?.map((pair, index) => (
                        <div key={index} className="p-2 border rounded mb-2">
                          {pair.right}
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    For demo purposes, this is displayed as reference. In a real implementation, this would be
                    interactive.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex justify-between items-center pt-6 border-t">
              <Button onClick={handlePreviousQuestion} disabled={currentQuestion === 0} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="flex space-x-3">
                {currentQuestion === actualQuestions.length - 1 ? (
                  <Button onClick={handleSubmitQuiz} className="bg-green-600 hover:bg-green-700">
                    <Flag className="mr-2 h-4 w-4" />
                    Submit Quiz
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion} disabled={currentQuestion >= actualQuestions.length - 1}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Navigation */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Question Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {actualQuestions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-lg border text-sm font-medium transition-all ${
                    index === currentQuestion
                      ? "border-blue-500 bg-blue-500 text-white"
                      : answers[index]
                        ? "border-green-500 bg-green-100 text-green-800"
                        : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                Current
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 border border-green-500 rounded mr-2"></div>
                Answered
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-white border border-gray-300 rounded mr-2"></div>
                Not Answered
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
