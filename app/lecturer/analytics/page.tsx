"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Users, BookOpen, MessageSquare, TrendingUp, Eye, ThumbsUp, Award } from "lucide-react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import RoleBasedRoute from "@/components/RoleBasedRoute"

interface AnalyticsData {
  totalStudents: number
  totalLessons: number
  totalQuestions: number
  totalViews: number
  monthlyViews: { month: string; views: number }[]
  topLessons: { title: string; views: number; likes: number }[]
  questionsBySubject: { subject: string; count: number }[]
  engagementRate: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function LecturerAnalyticsPage() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalStudents: 0,
    totalLessons: 0,
    totalQuestions: 0,
    totalViews: 0,
    monthlyViews: [],
    topLessons: [],
    questionsBySubject: [],
    engagementRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      // Fetch subscriptions (students)
      const subscriptionsRef = collection(db, "subscriptions")
      const subscriptionsQuery = query(subscriptionsRef, where("lecturerEmail", "==", user?.email))
      const subscriptionsSnapshot = await getDocs(subscriptionsQuery)
      const totalStudents = subscriptionsSnapshot.size

      // Fetch lessons
      const lessonsRef = collection(db, "lessons")
      const lessonsQuery = query(lessonsRef, where("uploadedBy", "==", user?.email))
      const lessonsSnapshot = await getDocs(lessonsQuery)
      const lessons = lessonsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      const totalLessons = lessons.length

      // Fetch questions answered by this lecturer
      const questionsRef = collection(db, "questions")
      const questionsQuery = query(questionsRef, where("answeredBy", "==", user?.email))
      const questionsSnapshot = await getDocs(questionsQuery)
      const totalQuestions = questionsSnapshot.size

      // Calculate total views from lessons
      const totalViews = lessons.reduce((sum: number, lesson: any) => sum + (lesson.views || 0), 0)

      // Generate mock monthly data (in real app, this would come from actual view logs)
      const monthlyViews = [
        { month: "Jan", views: Math.floor(Math.random() * 1000) + 200 },
        { month: "Feb", views: Math.floor(Math.random() * 1000) + 300 },
        { month: "Mar", views: Math.floor(Math.random() * 1000) + 400 },
        { month: "Apr", views: Math.floor(Math.random() * 1000) + 350 },
        { month: "May", views: Math.floor(Math.random() * 1000) + 500 },
        { month: "Jun", views: Math.floor(Math.random() * 1000) + 600 },
      ]

      // Top lessons by views
      const topLessons = lessons
        .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map((lesson: any) => ({
          title: lesson.title || "Untitled",
          views: lesson.views || 0,
          likes: lesson.likes || 0,
        }))

      // Questions by subject (mock data)
      const questionsBySubject = [
        { subject: "Mathematics", count: Math.floor(Math.random() * 20) + 5 },
        { subject: "Physics", count: Math.floor(Math.random() * 15) + 3 },
        { subject: "Chemistry", count: Math.floor(Math.random() * 12) + 2 },
        { subject: "Engineering", count: Math.floor(Math.random() * 18) + 4 },
        { subject: "Computer Science", count: Math.floor(Math.random() * 25) + 8 },
      ]

      // Calculate engagement rate
      const engagementRate = totalStudents > 0 ? Math.round((totalViews / totalStudents) * 100) / 100 : 0

      setAnalytics({
        totalStudents,
        totalLessons,
        totalQuestions,
        totalViews,
        monthlyViews,
        topLessons,
        questionsBySubject,
        engagementRate,
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    )
  }

  return (
    <RoleBasedRoute allowedRoles={["lecturer", "admin"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your teaching performance and student engagement</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Subscribed to your content</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lessons Created</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalLessons}</div>
                <p className="text-xs text-muted-foreground">Total content uploaded</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalQuestions}</div>
                <p className="text-xs text-muted-foreground">Student questions helped</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across all content</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content Performance</TabsTrigger>
              <TabsTrigger value="engagement">Student Engagement</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Views Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Views</CardTitle>
                    <CardDescription>Content views over the last 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.monthlyViews}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Questions by Subject */}
                <Card>
                  <CardHeader>
                    <CardTitle>Questions by Subject</CardTitle>
                    <CardDescription>Distribution of questions you've answered</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.questionsBySubject}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analytics.questionsBySubject.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Engagement Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.engagementRate}</div>
                    <p className="text-xs text-muted-foreground">Views per student</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">95%</div>
                    <p className="text-xs text-muted-foreground">Questions answered</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4.8</div>
                    <p className="text-xs text-muted-foreground">Out of 5 stars</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              {/* Top Performing Lessons */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Lessons</CardTitle>
                  <CardDescription>Your most viewed content</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.topLessons.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.topLessons.map((lesson, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{lesson.title}</h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {lesson.views} views
                              </div>
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                {lesson.likes} likes
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline">#{index + 1}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No lessons uploaded yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Content Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Content Performance</CardTitle>
                  <CardDescription>Views and engagement for your top lessons</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analytics.topLessons}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="views" fill="#8884d8" name="Views" />
                      <Bar dataKey="likes" fill="#82ca9d" name="Likes" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="engagement" className="space-y-6">
              {/* Student Engagement Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Activity</CardTitle>
                    <CardDescription>How students interact with your content</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active Students</span>
                      <span className="text-sm text-gray-500">{Math.round(analytics.totalStudents * 0.8)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Session Time</span>
                      <span className="text-sm text-gray-500">12 minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Completion Rate</span>
                      <span className="text-sm text-gray-500">78%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Return Rate</span>
                      <span className="text-sm text-gray-500">65%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Teaching Impact</CardTitle>
                    <CardDescription>Your contribution to student learning</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Questions Resolved</span>
                      <span className="text-sm text-gray-500">{analytics.totalQuestions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Students Helped</span>
                      <span className="text-sm text-gray-500">{analytics.totalStudents}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Content Created</span>
                      <span className="text-sm text-gray-500">{analytics.totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Reach</span>
                      <span className="text-sm text-gray-500">{analytics.totalViews.toLocaleString()} views</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RoleBasedRoute>
  )
}
