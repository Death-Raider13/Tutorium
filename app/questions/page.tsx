"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MessageSquare, ThumbsUp, CheckCircle, AlertCircle, Eye } from "lucide-react"

export default function QuestionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  const questions = [
    {
      id: 1,
      title: "How to calculate the deflection of a simply supported beam with distributed load?",
      content:
        "I'm working on a structural analysis problem where I need to find the maximum deflection of a simply supported beam with a uniformly distributed load. The beam is 6m long with a load of 10 kN/m. Can someone help me with the formula and calculation steps?",
      author: {
        name: "Kemi Adebayo",
        avatar: "/placeholder-user.jpg",
        reputation: 245,
        level: "Student",
      },
      subject: "Civil Engineering",
      tags: ["beam-analysis", "deflection", "structural-analysis", "mechanics"],
      votes: 15,
      answers: 3,
      views: 127,
      status: "answered",
      timeAgo: "2 hours ago",
      hasAcceptedAnswer: true,
    },
    {
      id: 2,
      title: "What's the difference between AC and DC motor control systems?",
      content:
        "I'm studying motor control systems and I'm confused about the fundamental differences between AC and DC motor control. Can someone explain the key differences in terms of control methods, applications, and advantages/disadvantages?",
      author: {
        name: "Ibrahim Musa",
        avatar: "/placeholder-user.jpg",
        reputation: 189,
        level: "Student",
      },
      subject: "Electrical Engineering",
      tags: ["motors", "control-systems", "ac-motors", "dc-motors"],
      votes: 12,
      answers: 5,
      views: 89,
      status: "answered",
      timeAgo: "4 hours ago",
      hasAcceptedAnswer: false,
    },
    {
      id: 3,
      title: "How to design a heat exchanger for optimal efficiency?",
      content:
        "I need to design a shell-and-tube heat exchanger for a chemical process. The hot fluid enters at 150°C and should be cooled to 80°C. What are the key parameters I should consider for optimal heat transfer efficiency?",
      author: {
        name: "Grace Okafor",
        avatar: "/placeholder-user.jpg",
        reputation: 312,
        level: "Student",
      },
      subject: "Chemical Engineering",
      tags: ["heat-transfer", "heat-exchanger", "design", "thermal-systems"],
      votes: 8,
      answers: 2,
      views: 156,
      status: "open",
      timeAgo: "6 hours ago",
      hasAcceptedAnswer: false,
    },
    {
      id: 4,
      title: "Explain the working principle of a centrifugal pump",
      content:
        "I'm having trouble understanding how centrifugal pumps work. Can someone explain the working principle, the role of impeller design, and how to calculate pump efficiency?",
      author: {
        name: "David Okonkwo",
        avatar: "/placeholder-user.jpg",
        reputation: 156,
        level: "Student",
      },
      subject: "Mechanical Engineering",
      tags: ["pumps", "fluid-mechanics", "centrifugal", "efficiency"],
      votes: 6,
      answers: 1,
      views: 78,
      status: "open",
      timeAgo: "8 hours ago",
      hasAcceptedAnswer: false,
    },
    {
      id: 5,
      title: "How to analyze a three-phase power system with unbalanced loads?",
      content:
        "I'm working on a power systems problem involving unbalanced three-phase loads. What methods should I use to analyze the system and calculate the neutral current?",
      author: {
        name: "Fatima Aliyu",
        avatar: "/placeholder-user.jpg",
        reputation: 278,
        level: "Student",
      },
      subject: "Electrical Engineering",
      tags: ["power-systems", "three-phase", "unbalanced-loads", "analysis"],
      votes: 11,
      answers: 4,
      views: 203,
      status: "answered",
      timeAgo: "1 day ago",
      hasAcceptedAnswer: true,
    },
  ]

  const subjects = [
    "All Subjects",
    "Civil Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Chemical Engineering",
    "Computer Engineering",
    "Petroleum Engineering",
  ]

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesSubject = selectedSubject === "all" || question.subject === selectedSubject
    const matchesStatus = selectedStatus === "all" || question.status === selectedStatus

    return matchesSearch && matchesSubject && matchesStatus
  })

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    switch (sortBy) {
      case "votes":
        return b.votes - a.votes
      case "answers":
        return b.answers - a.answers
      case "views":
        return b.views - a.views
      default:
        return 0 // Keep original order for "recent"
    }
  })

  const getStatusIcon = (status: string, hasAcceptedAnswer: boolean) => {
    if (hasAcceptedAnswer) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    if (status === "answered") {
      return <MessageSquare className="h-4 w-4 text-blue-500" />
    }
    return <AlertCircle className="h-4 w-4 text-orange-500" />
  }

  const getStatusBadge = (status: string, hasAcceptedAnswer: boolean) => {
    if (hasAcceptedAnswer) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          Solved
        </Badge>
      )
    }
    if (status === "answered") {
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Answered
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
        Open
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Engineering Questions</h1>
            <p className="text-gray-600">Get expert answers to your engineering questions</p>
          </div>
          <Button className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700" asChild>
            <Link href="/ask">
              <Plus className="h-4 w-4 mr-2" />
              Ask Question
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search questions, tags, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.slice(1).map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="answered">Answered</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="votes">Most Votes</SelectItem>
                    <SelectItem value="answers">Most Answers</SelectItem>
                    <SelectItem value="views">Most Views</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {questions.filter((q) => q.hasAcceptedAnswer).length}
              </div>
              <div className="text-sm text-gray-600">Solved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {questions.filter((q) => q.status === "answered" && !q.hasAcceptedAnswer).length}
              </div>
              <div className="text-sm text-gray-600">Answered</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">
                {questions.filter((q) => q.status === "open").length}
              </div>
              <div className="text-sm text-gray-600">Open</div>
            </CardContent>
          </Card>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {sortedQuestions.map((question) => (
            <Card key={question.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(question.status, question.hasAcceptedAnswer)}
                      <Link
                        href={`/questions/${question.id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {question.title}
                      </Link>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{question.content}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {question.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="ml-4">{getStatusBadge(question.status, question.hasAcceptedAnswer)}</div>
                </div>

                {/* Question Stats and Author */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{question.votes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{question.answers} answers</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{question.views} views</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="text-xs">
                      {question.subject}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={question.author.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {question.author.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{question.author.name}</span>
                        <div className="text-gray-500">
                          {question.author.reputation} pts • {question.timeAgo}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Questions
          </Button>
        </div>
      </div>
    </div>
  )
}
