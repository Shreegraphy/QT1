"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  Play,
  CheckCircle,
  User,
  Settings,
  LogOut,
  Bell,
  Target,
  Award,
  BarChart3,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function StudentDashboard() {
  const { user, logout: authLogout, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([])
  const router = useRouter()

  // Load user data from auth context
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

    // Load user-specific data
    const userDataKey = `student_data_${user.id}`
    const savedUserData = localStorage.getItem(userDataKey)

    if (savedUserData) {
      const parsedUserData = JSON.parse(savedUserData)
      setStats(parsedUserData.stats)
      setRecentQuizzes(parsedUserData.recentQuizzes)
    }

    // Load and update stats with real quiz results
    updateStatsWithRealData()
    setIsLoading(false)
  }, [user, authLoading, router])

  const updateStatsWithRealData = () => {
    if (!user) return

    // Get real quiz results for this student
    const quizResults = JSON.parse(localStorage.getItem("quiz_results") || "[]")
    const studentResults = quizResults.filter((result: any) => result.studentId === user.id)

    if (studentResults.length > 0) {
      // Calculate real stats from actual quiz results
      const totalQuizzesTaken = studentResults.length
      const averageScore = Math.round(
        studentResults.reduce((sum: number, result: any) => sum + result.score, 0) / totalQuizzesTaken,
      )
      const totalPoints = studentResults.reduce((sum: number, result: any) => sum + result.score, 0)

      // Update stats with real data while keeping generated data for other fields
      const userDataKey = `student_data_${user.id}`
      const savedUserData = localStorage.getItem(userDataKey)

      if (savedUserData) {
        const parsedUserData = JSON.parse(savedUserData)
        const updatedStats = {
          ...parsedUserData.stats,
          completedQuizzes: totalQuizzesTaken,
          averageScore: averageScore,
          totalPoints: totalPoints,
        }

        // Add real quiz results to recent quizzes
        const realRecentQuizzes = studentResults.slice(-4).map((result: any, index: number) => ({
          id: `real_${index}`,
          title: result.quizTitle,
          subject: result.quizCode,
          score: result.score,
          status: "completed",
          date: new Date(result.submittedAt).toISOString().split("T")[0],
          duration: `${Math.floor(result.timeSpent / 60)} min`,
        }))

        // Combine real quizzes with generated ones
        const combinedQuizzes = [
          ...realRecentQuizzes,
          ...parsedUserData.recentQuizzes.slice(0, 4 - realRecentQuizzes.length),
        ]

        const updatedData = {
          stats: updatedStats,
          recentQuizzes: combinedQuizzes,
        }

        localStorage.setItem(userDataKey, JSON.stringify(updatedData))
        setStats(updatedStats)
        setRecentQuizzes(combinedQuizzes)
      }
    }
  }

  const handleLogout = () => {
    authLogout()
  }

  // Generate user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "available":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  // Show loading state while checking authentication
  if (isLoading || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">QuizMaster</span>
              </div>
              <Badge variant="secondary" className="ml-4">
                Student Portal
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.picture || "/placeholder.png"} alt={user.name} />
                      <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        Signed in via {user.loginMethod === "google" ? "Google" : user.loginMethod}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="text-gray-600 mt-2">Ready to continue your learning journey?</p>
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
            <span>Account created: {new Date(user.signupTime || user.loginTime).toLocaleDateString()}</span>
            <span>•</span>
            <span>Login method: {user.loginMethod}</span>
            <span>•</span>
            <span>Student ID: {user.id.slice(-8).toUpperCase()}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedQuizzes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Class Rank</p>
                  <p className="text-2xl font-bold text-gray-900">#{stats.rank}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Points</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPoints}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Quizzes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Your Recent Quizzes
                </CardTitle>
                <CardDescription>Your latest quiz activities and scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentQuizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{quiz.title}</h3>
                        <p className="text-sm text-gray-600">
                          {quiz.subject} • {quiz.duration}
                        </p>
                        <p className="text-xs text-gray-500">{quiz.date}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(quiz.status)}>
                          {quiz.status === "completed" ? "Completed" : "Available"}
                        </Badge>
                        {quiz.score && <span className={`font-bold ${getScoreColor(quiz.score)}`}>{quiz.score}%</span>}
                        {quiz.status === "available" && (
                          <Button size="sm">
                            <Play className="mr-1 h-3 w-3" />
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.picture || "/placeholder.png"} alt={user.name} />
                    <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">Student Account</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-blue-600">{stats.completedQuizzes}</p>
                      <p className="text-xs text-gray-500">Completed</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{stats.averageScore}%</p>
                      <p className="text-xs text-gray-500">Avg Score</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Quiz Completion</span>
                    <span>{Math.round((stats.completedQuizzes / stats.totalQuizzes) * 100)}%</span>
                  </div>
                  <Progress value={(stats.completedQuizzes / stats.totalQuizzes) * 100} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Performance Level</span>
                    <span>{stats.averageScore}%</span>
                  </div>
                  <Progress value={stats.averageScore} />
                </div>
                <div className="pt-2 text-center">
                  <p className="text-sm text-gray-600">
                    You're ranked <span className="font-bold text-blue-600">#{stats.rank}</span> in your class!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Attend Quiz */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="mr-2 h-5 w-5" />
                  Join Quiz Session
                </CardTitle>
                <CardDescription>Enter the referral code provided by your teacher</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => router.push("/quiz/join")}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Attend Quiz
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">Get the quiz code from your teacher to join</p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse All Quizzes
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Performance
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Trophy className="mr-2 h-4 w-4" />
                  Leaderboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
