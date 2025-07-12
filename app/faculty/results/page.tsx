"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BookOpen,
  ArrowLeft,
  Users,
  Trophy,
  BarChart3,
  Download,
  Search,
  Filter,
  TrendingUp,
  Target,
  Award,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function FacultyResultsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [results, setResults] = useState<any[]>([])
  const [filteredResults, setFilteredResults] = useState<any[]>([])
  const [selectedSection, setSelectedSection] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedQuiz, setSelectedQuiz] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

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

    // Load quiz results
    const quizResults = JSON.parse(localStorage.getItem("quiz_results") || "[]")
    setResults(quizResults)
    setFilteredResults(quizResults)
    setIsLoading(false)
  }, [user, authLoading, router])

  // Filter results based on selected criteria
  useEffect(() => {
    let filtered = results

    if (selectedSection !== "all") {
      filtered = filtered.filter((result) => result.section === selectedSection)
    }

    if (selectedDepartment !== "all") {
      filtered = filtered.filter((result) => result.department === selectedDepartment)
    }

    if (selectedQuiz !== "all") {
      filtered = filtered.filter((result) => result.quizCode === selectedQuiz)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (result) =>
          result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredResults(filtered)
  }, [results, selectedSection, selectedDepartment, selectedQuiz, searchTerm])

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
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

  // Calculate statistics
  const calculateStats = () => {
    if (filteredResults.length === 0) {
      return {
        totalStudents: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0,
      }
    }

    const scores = filteredResults.map((result) => result.score)
    const totalStudents = filteredResults.length
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / totalStudents)
    const highestScore = Math.max(...scores)
    const lowestScore = Math.min(...scores)
    const passRate = Math.round((scores.filter((score) => score >= 60).length / totalStudents) * 100)

    return {
      totalStudents,
      averageScore,
      highestScore,
      lowestScore,
      passRate,
    }
  }

  const stats = calculateStats()

  // Get unique values for filters
  const uniqueSections = [...new Set(results.map((result) => result.section))].filter(Boolean).sort()
  const uniqueDepartments = [...new Set(results.map((result) => result.department))].filter(Boolean)
  const uniqueQuizzes = [...new Set(results.map((result) => result.quizCode))].filter(Boolean)

  const handleBackToDashboard = () => {
    router.push("/faculty/dashboard")
  }

  const handleExportResults = () => {
    const csvContent = [
      [
        "Student Name",
        "Email",
        "Section",
        "Department",
        "Quiz Code",
        "Quiz Title",
        "Score",
        "Correct Answers",
        "Total Questions",
        "Time Spent",
        "Submitted At",
      ],
      ...filteredResults.map((result) => [
        result.studentName,
        result.studentEmail,
        result.section,
        result.department,
        result.quizCode,
        result.quizTitle,
        result.score,
        result.correctAnswers,
        result.totalQuestions,
        Math.floor(result.timeSpent / 60) + "m " + (result.timeSpent % 60) + "s",
        new Date(result.submittedAt).toLocaleString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `quiz_results_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

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
              <Button variant="ghost" onClick={handleBackToDashboard} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-purple-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">QuizMaster</span>
              </div>
              <Badge variant="secondary" className="ml-4 bg-purple-100 text-purple-800">
                Results & Analytics
              </Badge>
            </div>

            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.picture || "/placeholder.png"} alt={user?.name} />
                <AvatarFallback>{getUserInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Faculty</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Results & Analytics</h1>
          <p className="text-gray-600 mt-2">View and analyze student performance across all quizzes</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                <BarChart3 className="h-8 w-8 text-green-600" />
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
                  <p className="text-sm font-medium text-gray-600">Highest Score</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.highestScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Lowest Score</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.lowestScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.passRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Search Student</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Section</label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {uniqueSections.map((section) => (
                      <SelectItem key={section} value={section}>
                        Section {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Department</label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {uniqueDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Quiz</label>
                <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Quizzes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quizzes</SelectItem>
                    {uniqueQuizzes.map((quiz) => (
                      <SelectItem key={quiz} value={quiz}>
                        {quiz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleExportResults} variant="outline" className="w-full bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Student Results ({filteredResults.length})
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredResults.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No results found matching your criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Quiz</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Correct/Total</TableHead>
                      <TableHead>Time Spent</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{getUserInitials(result.studentName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{result.studentName}</p>
                              <p className="text-sm text-gray-500">{result.studentEmail}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Section {result.section}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{result.department}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{result.quizCode}</p>
                            <p className="text-sm text-gray-500">{result.quizTitle}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getScoreBadgeColor(result.score)}>{result.score}%</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {result.correctAnswers}/{result.totalQuestions}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {new Date(result.submittedAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
