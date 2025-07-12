"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Users,
  FileText,
  BarChart3,
  Plus,
  Eye,
  Settings,
  LogOut,
  Bell,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  User,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function FacultyDashboard() {
  const { user, logout: authLogout, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const router = useRouter()

  // Load user data from auth context
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/")
      return
    }

    if (user.userType !== "faculty") {
      router.push("/student/dashboard")
      return
    }

    // Load and update faculty data
    loadFacultyData()
    setIsLoading(false)
  }, [user, authLoading, router])

  const loadFacultyData = () => {
    if (!user) return

    // Load real quizzes created by this faculty
    const facultyQuizzes = JSON.parse(localStorage.getItem("faculty_quizzes") || "[]")
    const userQuizzes = facultyQuizzes.filter((quiz: any) => quiz.createdBy === user.id)

    // Load quiz results to calculate stats
    const quizResults = JSON.parse(localStorage.getItem("quiz_results") || "[]")
    const userQuizResults = quizResults.filter((result: any) =>
      userQuizzes.some((quiz: any) => quiz.code === result.quizCode),
    )

    // Calculate real stats
    const totalQuizzes = userQuizzes.length
    const activeQuizzes = userQuizzes.filter((quiz: any) => quiz.status === "active").length
    const totalSubmissions = userQuizResults.length
    const averageScore =
      userQuizResults.length > 0
        ? Math.round(
            userQuizResults.reduce((sum: number, result: any) => sum + result.score, 0) / userQuizResults.length,
          )
        : 0

    // Get unique students count
    const uniqueStudents = new Set(userQuizResults.map((result: any) => result.studentId)).size

    const realStats = {
      totalQuizzes,
      activeQuizzes,
      totalStudents: uniqueStudents,
      averageScore,
      totalSubmissions,
    }

    // Format recent quizzes for display
    const recentQuizzes = userQuizzes.slice(-4).map((quiz: any) => {
      const quizResults = userQuizResults.filter((result: any) => result.quizCode === quiz.code)
      return {
        id: quiz.code,
        title: quiz.title,
        subject: quiz.subject,
        students: quizResults.length,
        submissions: quizResults.length,
        averageScore:
          quizResults.length > 0
            ? Math.round(quizResults.reduce((sum: number, result: any) => sum + result.score, 0) / quizResults.length)
            : 0,
        status: quiz.status,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
        created: new Date(quiz.createdAt).toISOString().split("T")[0],
        code: quiz.code,
      }
    })

    // Generate recent activity from quiz results
    const recentActivity = userQuizResults.slice(-4).map((result: any, index: number) => ({
      id: index + 1,
      type: "submission",
      message: `${result.studentName} submitted '${result.quizTitle}' - Score: ${result.score}%`,
      time: `${Math.floor((Date.now() - new Date(result.submittedAt).getTime()) / (1000 * 60))} minutes ago`,
    }))

    // Update faculty data in localStorage
    const userDataKey = `faculty_data_${user.id}`
    const facultyData = {
      stats: realStats,
      recentQuizzes: recentQuizzes,
      recentActivity: recentActivity,
    }
    localStorage.setItem(userDataKey, JSON.stringify(facultyData))

    setStats(realStats)
    setRecentQuizzes(recentQuizzes)
    setRecentActivity(recentActivity)
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

  const handleLogout = () => {
    authLogout()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600"
    if (score >= 75) return "text-blue-600"
    if (score >= 65) return "text-yellow-600"
    return "text-red-600"
  }

  // Show loading state while checking authentication
  if (isLoading || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
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
                <BookOpen className="h-8 w-8 text-purple-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">QuizMaster</span>
              </div>
              <Badge variant="secondary" className="ml-4 bg-purple-100 text-purple-800">
                Faculty Portal
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
            <p className="text-gray-600 mt-2">Manage your quizzes and track student progress</p>
            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
              <span>Account created: {new Date(user.signupTime || user.loginTime).toLocaleDateString()}</span>
              <span>•</span>
              <span>Login method: {user.loginMethod}</span>
              <span>•</span>
              <span>Faculty ID: {user.id.slice(-8).toUpperCase()}</span>
            </div>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => router.push("/faculty/quiz/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Quiz
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
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
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Quizzes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeQuizzes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-yellow-600" />
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
                <Award className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quiz Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Your Quiz Management ({recentQuizzes.length})
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push("/faculty/results")}>
                    View All Results
                  </Button>
                </CardTitle>
                <CardDescription>Manage your quizzes and track student performance</CardDescription>
              </CardHeader>
              <CardContent>
                {recentQuizzes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No quizzes created yet</p>
                    <Button
                      onClick={() => router.push("/faculty/quiz/create")}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Quiz
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentQuizzes.map((quiz) => (
                      <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900">{quiz.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {quiz.code}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{quiz.subject}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>{quiz.students} students attempted</span>
                            <span>{quiz.submissions} submissions</span>
                            <span>Created: {quiz.created}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(quiz.status)}>{quiz.status}</Badge>
                          {quiz.submissions > 0 && (
                            <span className={`font-bold text-sm ${getScoreColor(quiz.averageScore)}`}>
                              Avg: {quiz.averageScore}%
                            </span>
                          )}
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push("/faculty/results")}
                              title="View Results"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Copy quiz code to clipboard
                                navigator.clipboard.writeText(quiz.code)
                                alert(`Quiz code ${quiz.code} copied to clipboard!`)
                              }}
                              title="Copy Quiz Code"
                            >
                              <FileText className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    <p className="text-xs text-gray-500">Faculty Account</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-purple-600">{stats.totalQuizzes}</p>
                      <p className="text-xs text-gray-500">Quizzes</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-600">{stats.totalStudents}</p>
                      <p className="text-xs text-gray-500">Students</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                  ) : (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full justify-start bg-purple-600 hover:bg-purple-700"
                  onClick={() => router.push("/faculty/quiz/create")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Quiz
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Students
                </Button>
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline"
                  onClick={() => router.push("/faculty/results")}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Results & Analytics
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Quiz
                </Button>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Class Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">This Week</span>
                    <span className="text-sm font-medium">{stats.totalSubmissions} submissions</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Score</span>
                    <span className="text-sm font-medium text-green-600">{stats.averageScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Quizzes</span>
                    <span className="text-sm font-medium text-blue-600">{stats.activeQuizzes}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
