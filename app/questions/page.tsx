"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, ThumbsUp, MessageCircle, Clock, CheckCircle, TrendingUp, Plus, Eye, Award } from "lucide-react"

// Mock data
const questions = [
  {
    id: 1,
    title: "How to calculate deflection in a simply supported beam with distributed load?",
    description:
      "I'm working on a structural analysis problem where I need to find the maximum deflection of a simply supported beam under a uniformly distributed load. The beam is 6m long, made of steel with E = 200 GPa, and has a rectangular cross-section of 200mm x 300mm.",
    category: "Civil Engineering",
    tags: ["structural-analysis", "beam-deflection", "distributed-load"],
    author: {
      name: "Musa Ahmed",
      avatar: "/placeholder-user.jpg",
      level: "Student",
    },
    lecturer: {
      name: "Dr. Adebayo Ogundimu",
      avatar: "/placeholder-user.jpg",
      title: "Structural Engineering Professor",
      university: "University of Ibadan",
    },
    votes: 15,
    answers: 3,
    views: 234,
    timeAgo: "2 hours ago",
    status: "answered",
    isAnswered: true,
  },
  {
    id: 2,
    title: "What's the difference between AC and DC motors in industrial applications?",
    description:
      "I'm confused about when to use AC vs DC motors in industrial settings. Can someone explain the key differences, advantages, and typical applications for each type?",
    category: "Electrical Engineering",
    tags: ["motors", "ac-dc", "industrial"],
    author: {
      name: "Fatima Yakubu",
      avatar: "/placeholder-user.jpg",
      level: "Student",
    },
    lecturer: null,
    votes: 8,
    answers: 1,
    views: 156,
    timeAgo: "4 hours ago",
    status: "open",
    isAnswered: false,
  },
  {
    id: 3,
    title: "How to design a heat exchanger for a chemical process?",
    description:
      "I need help designing a shell-and-tube heat exchanger for cooling a chemical stream from 150°C to 80°C using cooling water. What are the key design considerations and calculations involved?",
    category: "Chemical Engineering",
    tags: ["heat-exchanger", "design", "thermal"],
    author: {
      name: "Chukwuma Okafor",
      avatar: "/placeholder-user.jpg",
      level: "Student",
    },
    lecturer: {
      name: "Prof. Amina Hassan",
      avatar: "/placeholder-user.jpg",
      title: "Chemical Engineering Professor",
      university: "Ahmadu Bello University",
    },
    votes: 22,
    answers: 5,
    views: 445,
    timeAgo: "1 day ago",
    status: "answered",
    isAnswered: true,
  },
]

const categories = [
  "All Categories",
  "Civil Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Chemical Engineering",
  "Computer Engineering",
  "Petroleum Engineering",
]

export default function QuestionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [sortBy, setSortBy] = useState("recent")

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All Categories" || question.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "answered":
        return "bg-green-100 text-green-800"
      case "open":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Engineering Questions</h1>
              <p className="text-gray-600 mt-1">Get expert answers from certified engineering professionals</p>
            </div>
            <Button asChild>
              <Link href="/ask">
                <Plus className="h-4 w-4 mr-2" />
                Ask Question
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="unanswered">Unanswered</SelectItem>
                      <SelectItem value="answered">Answered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Questions</span>
                  <span className="font-semibold">2,847</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Answered</span>
                  <span className="font-semibold text-green-600">2,156</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Lecturers</span>
                  <span className="font-semibold">127</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <span className="font-semibold">3.2 hours</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Questions</TabsTrigger>
                <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
                <TabsTrigger value="answered">Answered</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">
                    {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""} found
                  </p>
                </div>

                <div className="space-y-4">
                  {filteredQuestions.map((question) => (
                    <Card key={question.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          {/* Vote/Stats Column */}
                          <div className="flex flex-col items-center space-y-2 text-sm text-gray-500 min-w-[60px]">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4" />
                              <span className="font-medium">{question.votes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              <span className="font-medium">{question.answers}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span className="font-medium">{question.views}</span>
                            </div>
                          </div>

                          {/* Question Content */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <Link href={`/questions/${question.id}`}>
                                  <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                    {question.title}
                                  </h3>
                                </Link>
                                <p className="text-gray-600 mt-1 line-clamp-2">{question.description}</p>
                              </div>
                              <Badge className={getStatusColor(question.status)}>
                                {question.isAnswered && <CheckCircle className="h-3 w-3 mr-1" />}
                                {question.status}
                              </Badge>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">{question.category}</Badge>
                              {question.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            {/* Author and Lecturer Info */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={question.author.avatar || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {question.author.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                  <p className="font-medium text-gray-900">{question.author.name}</p>
                                  <p className="text-gray-500">{question.author.level}</p>
                                </div>
                              </div>

                              {question.lecturer && (
                                <div className="flex items-center gap-3">
                                  <div className="text-sm text-right">
                                    <p className="font-medium text-gray-900 flex items-center gap-1">
                                      <Award className="h-3 w-3 text-yellow-500" />
                                      {question.lecturer.name}
                                    </p>
                                    <p className="text-gray-500">{question.lecturer.title}</p>
                                  </div>
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={question.lecturer.avatar || "/placeholder.svg"} />
                                    <AvatarFallback>
                                      {question.lecturer.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                {question.timeAgo}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="unanswered">
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No unanswered questions</h3>
                  <p className="text-gray-500">All questions have been answered by our expert lecturers!</p>
                </div>
              </TabsContent>

              <TabsContent value="answered">
                <div className="space-y-4">
                  {filteredQuestions
                    .filter((q) => q.isAnswered)
                    .map((question) => (
                      <Card key={question.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="flex flex-col items-center space-y-2 text-sm text-gray-500 min-w-[60px]">
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                <span className="font-medium">{question.votes}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                <span className="font-medium">{question.answers}</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <Link href={`/questions/${question.id}`}>
                                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                  {question.title}
                                </h3>
                              </Link>
                              <p className="text-gray-600 mt-1 line-clamp-2">{question.description}</p>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline">{question.category}</Badge>
                                  {question.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <Clock className="h-4 w-4" />
                                  {question.timeAgo}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="trending">
                <div className="space-y-4">
                  {filteredQuestions
                    .sort((a, b) => b.votes - a.votes)
                    .map((question) => (
                      <Card
                        key={question.id}
                        className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500"
                      >
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="flex flex-col items-center space-y-2 text-sm text-gray-500 min-w-[60px]">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-orange-500" />
                                <span className="font-medium">{question.votes}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                <span className="font-medium">{question.answers}</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <Link href={`/questions/${question.id}`}>
                                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                  {question.title}
                                </h3>
                              </Link>
                              <p className="text-gray-600 mt-1 line-clamp-2">{question.description}</p>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline">{question.category}</Badge>
                                  {question.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <TrendingUp className="h-4 w-4 text-orange-500" />
                                  <Clock className="h-4 w-4" />
                                  {question.timeAgo}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
