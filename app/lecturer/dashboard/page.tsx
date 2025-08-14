"use client"

import { useAuth } from "@/hooks/useAuth"
import RoleBasedRoute from "@/components/RoleBasedRoute"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, MessageSquareReply, Upload, GraduationCap, BarChart3, TrendingUp, Star } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { USER_ROLES, DASHBOARD_CONFIG } from "@/lib/constants"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface LecturerStats {
  totalLessons: number
  totalStudents: number
  questionsAnswered: number
  pendingQuestions: number
  totalViews: number
  averageRating: number
  monthlyEarnings: number
  recentQuestions: any[]
  popularLessons: any[]
  studentEngagement: number
}

export default function LecturerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<LecturerStats>({
    totalLessons: 0,
    totalStudents: 0,
    questionsAnswered: 0,
    pendingQuestions: 0,
    totalViews: 0,
    averageRating: 0,
    monthlyEarnings: 0,
    recentQuestions: [],
    popularLessons: [],
    studentEngagement: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLecturerStats = async () => {
      if (!user) return

      try {
        // Fetch lecturer's lessons
        const lessonsQuery = query(
          collection(db, "lessons"),
          where("uploadedBy", "==", user.email),
          orderBy("createdAt", "desc"),
        )
        const lessonsSnap = await getDocs(lessonsQuery)
        const lessons = lessonsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        // Fetch questions answered by lecturer
        const answeredQuestionsQuery = query(
          collection(db, "questions"),
          where("answeredBy", "==", user.uid),
          where("answered", "==", true),
        )
        const answeredQuestionsSnap = await getDocs(answeredQuestionsQuery)

        // Fetch pending questions in lecturer's subjects
        const pendingQuestionsQuery = query(
          collection(db, "questions"),
          where("answered", "==", false),
          orderBy("createdAt", "desc"),
          limit(10),
        )
        const pendingQuestionsSnap = await getDocs(pendingQuestionsQuery)
        const pendingQuestions = pendingQuestionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        // Calculate total views from lessons
        const totalViews = lessons.reduce((sum, lesson) => sum + (lesson.views || 0), 0)

        // Calculate average rating
        const ratingsSum = lessons.reduce((sum, lesson) => sum + (lesson.rating || 0), 0)
        const averageRating = lessons.length > 0 ? ratingsSum / lessons.length : 0

        // Get unique students who viewed lessons
        const studentIds = new Set()
        lessons.forEach((lesson) => {
          if (lesson.viewedBy) {
            lesson.viewedBy.forEach((studentId: string) => studentIds.add(studentId))
          }
        })

        setStats({
          totalLessons: lessons.length,
          totalStudents: studentIds.size,
          questionsAnswered: answeredQuestionsSnap.size,
          pendingQuestions: pendingQuestionsSnap.size,
          totalViews,
          averageRating,
          monthlyEarnings: 0, // This would be calculated based on your payment system
          recentQuestions: pendingQuestions.slice(0, 5),
          popularLessons: lessons.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3),
          studentEngagement: studentIds.size > 0 ? totalViews / studentIds.size : 0,
        })
      } catch (error) {
        console.error("Error fetching lecturer stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLecturerStats()
  }, [user])

  const config = DASHBOARD_CONFIG[USER_ROLES.LECTURER]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    )
  }

  return (
    <RoleBasedRoute allowedRoles={[USER_ROLES.LECTURER]}>
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
                <Badge className="bg-green-100 text-green-800">
                  <Star className="h-3 w-3 mr-1" />
                  {stats.averageRating.toFixed(1)} Rating
                </Badge>
                <Badge variant="outline">{stats.totalStudents} Students</Badge>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLessons}</div>
                <p className="text-xs text-muted-foreground">{stats.totalViews} total views</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
                <MessageSquareReply className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.questionsAnswered}</div>
                <p className="text-xs text-muted-foreground">{stats.pendingQuestions} pending</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Students Reached</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Unique learners</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.studentEngagement.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Views per student</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks for lecturers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.quickActions.map((action) => (
                      <Link key={action.href} href={action.href}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg bg-gray-100 ${action.color}`}>
                                {action.icon === "MessageSquareReply" && <MessageSquareReply className="h-5 w-5" />}
                                {action.icon === "Upload" && <Upload className="h-5 w-5" />}
                                {action.icon === "GraduationCap" && <GraduationCap className="h-5 w-5" />}
                                {action.icon === "BarChart3" && <BarChart3 className="h-5 w-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                                <p className="text-sm text-gray-500">
                                  {action.title === "Answer Questions" && "Help students with their queries"}
                                  {action.title === "Upload Content" && "Share your knowledge with students"}
                                  {action.title === "View Students" && "See who's learning from you"}
                                  {action.title === "Analytics" && "Track your teaching performance"}
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

              {/* Popular Lessons */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Popular Lessons</CardTitle>
                  <CardDescription>Your most viewed content</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.popularLessons.length > 0 ? (
                    <div className="space-y-4">
                      {stats.popularLessons.map((lesson, index) => (
                        <div key={lesson.id} className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <Badge variant="outline">#{index + 1}</Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{lesson.title}</p>
                            <p className="text-xs text-gray-500">
                              {lesson.views || 0} views •{" "}
                              {lesson.rating ? `${lesson.rating.toFixed(1)} rating` : "No ratings yet"}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <Progress
                              value={
                                ((lesson.views || 0) / Math.max(...stats.popularLessons.map((l) => l.views || 0))) * 100
                              }
                              className="w-16 h-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-500 mb-4">No lessons uploaded yet</p>
                      <Button size="sm" asChild>
                        <Link href="/lecturer/upload">Upload Your First Lesson</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Questions */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Questions</CardTitle>
                  <CardDescription>Students need your help</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.recentQuestions.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentQuestions.map((question, index) => (
                        <div key={question.id} className="border-l-2 border-blue-200 pl-4">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">{question.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {question.subject} •{" "}
                            {question.createdAt?.toDate ? question.createdAt.toDate().toLocaleDateString() : "Recently"}
                          </p>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent" asChild>
                        <Link href="/lecturer/questions">Answer Questions</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <MessageSquareReply className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-500 mb-4">No pending questions</p>
                      <Button size="sm" asChild>
                        <Link href="/lecturer/questions">View All Questions</Link>
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
