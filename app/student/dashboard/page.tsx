"use client"

import { useAuth } from "@/hooks/useAuth"
import RoleBasedRoute from "@/components/RoleBasedRoute"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, HelpCircle, Users, Trophy, Clock, CheckCircle, TrendingUp, Target, Award } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { USER_ROLES, DASHBOARD_CONFIG } from "@/lib/constants"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface StudentStats {
  totalQuestions: number
  answeredQuestions: number
  lessonsWatched: number
  studyGroupsJoined: number
  totalPoints: number
  currentLevel: number
  achievements: string[]
  recentActivity: any[]
  weeklyProgress: number
  monthlyGoal: number
  streakDays: number
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<StudentStats>({
    totalQuestions: 0,
    answeredQuestions: 0,
    lessonsWatched: 0,
    studyGroupsJoined: 0,
    totalPoints: 0,
    currentLevel: 1,
    achievements: [],
    recentActivity: [],
    weeklyProgress: 0,
    monthlyGoal: 10,
    streakDays: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudentStats = async () => {
      if (!user) return

      try {
        // Fetch user's questions
        const questionsQuery = query(
          collection(db, "questions"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
        )
        const questionsSnap = await getDocs(questionsQuery)
        const questions = questionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        const answeredCount = questions.filter((q) => q.answered).length

        // Fetch user's study groups
        const studyGroupsQuery = query(collection(db, "studyGroups"), where("members", "array-contains", user.uid))
        const studyGroupsSnap = await getDocs(studyGroupsQuery)

        // Fetch user's lesson progress
        const userProgressQuery = doc(db, "userProgress", user.uid)
        const userProgressSnap = await getDoc(userProgressQuery)
        const progressData = userProgressSnap.exists() ? userProgressSnap.data() : {}

        // Fetch user's achievements
        const achievementsQuery = query(collection(db, "userAchievements"), where("userId", "==", user.uid))
        const achievementsSnap = await getDocs(achievementsQuery)
        const userAchievements = achievementsSnap.docs.map((doc) => doc.data().achievementId)

        // Calculate weekly progress
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        const weeklyQuestions = questions.filter((q) => q.createdAt?.toDate() >= weekStart).length

        setStats({
          totalQuestions: questions.length,
          answeredQuestions: answeredCount,
          lessonsWatched: progressData.lessonsWatched || 0,
          studyGroupsJoined: studyGroupsSnap.size,
          totalPoints: user.points || 0,
          currentLevel: user.level || 1,
          achievements: userAchievements,
          recentActivity: questions.slice(0, 5),
          weeklyProgress: weeklyQuestions,
          monthlyGoal: 10,
          streakDays: progressData.streakDays || 0,
        })
      } catch (error) {
        console.error("Error fetching student stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentStats()
  }, [user])

  const calculateResponseRate = () => {
    if (!stats.totalQuestions || stats.totalQuestions === 0) return 0
    const rate = (stats.answeredQuestions / stats.totalQuestions) * 100
    return isNaN(rate) ? 0 : Math.round(rate)
  }

  const getNextLevelProgress = () => {
    const pointsForNextLevel = stats.currentLevel * 100
    const currentLevelPoints = stats.totalPoints % 100
    return (currentLevelPoints / pointsForNextLevel) * 100
  }

  const config = DASHBOARD_CONFIG[USER_ROLES.STUDENT]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    )
  }

  return (
    <RoleBasedRoute allowedRoles={[USER_ROLES.STUDENT]}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{config.title}</h1>
                <p className="text-gray-600 mt-1">{config.description}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className="bg-blue-100 text-blue-800">Level {stats.currentLevel}</Badge>
                <Badge variant="outline">{stats.totalPoints} points</Badge>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Target className="h-4 w-4 mr-2 text-blue-600" />
                  Weekly Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Questions Asked</span>
                    <span>
                      {stats.weeklyProgress}/{stats.monthlyGoal}
                    </span>
                  </div>
                  <Progress value={(stats.weeklyProgress / stats.monthlyGoal) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Award className="h-4 w-4 mr-2 text-purple-600" />
                  Next Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>Level {stats.currentLevel + 1}</span>
                  </div>
                  <Progress value={getNextLevelProgress()} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Trophy className="h-4 w-4 mr-2 text-yellow-600" />
                  Learning Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.streakDays}</div>
                <p className="text-xs text-gray-500">days in a row</p>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Questions Asked</CardTitle>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalQuestions}</div>
                <p className="text-xs text-muted-foreground">{stats.answeredQuestions} answered</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calculateResponseRate()}%</div>
                <p className="text-xs text-muted-foreground">Of your questions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lessons Watched</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.lessonsWatched}</div>
                <p className="text-xs text-muted-foreground">Total content viewed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Study Groups</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.studyGroupsJoined}</div>
                <p className="text-xs text-muted-foreground">Groups joined</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks for students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.quickActions.map((action) => (
                      <Link key={action.href} href={action.href}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg bg-gray-100 ${action.color}`}>
                                {action.icon === "HelpCircle" && <HelpCircle className="h-5 w-5" />}
                                {action.icon === "BookOpen" && <BookOpen className="h-5 w-5" />}
                                {action.icon === "Users" && <Users className="h-5 w-5" />}
                                {action.icon === "Trophy" && <Trophy className="h-5 w-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                                <p className="text-sm text-gray-500">
                                  {action.title === "Ask a Question" && "Get help from verified lecturers"}
                                  {action.title === "Browse Lessons" && "Watch video lessons from experts"}
                                  {action.title === "Join Study Groups" && "Collaborate with fellow students"}
                                  {action.title === "View Achievements" && "Track your learning milestones"}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest questions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`p-1 rounded-full ${activity.answered ? "bg-green-100" : "bg-yellow-100"}`}>
                            {activity.answered ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <Clock className="h-3 w-3 text-yellow-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {activity.title || "Untitled Question"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activity.answered ? "Answered" : "Pending"} •{" "}
                              {activity.createdAt?.toDate
                                ? activity.createdAt.toDate().toLocaleDateString()
                                : "Recently"}
                            </p>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent" asChild>
                        <Link href="/questions">View All Questions</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-500 mb-4">No recent activity yet</p>
                      <Button size="sm" asChild>
                        <Link href="/ask">Ask Your First Question</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RoleBasedRoute>
  )
}
