"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Eye,
  Clock,
  Award,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Bookmark,
  Share2,
  Flag,
  MoreHorizontal,
} from "lucide-react"
import { ENGINEERING_SUBJECTS, ACADEMIC_LEVELS, QUESTION_STATUS } from "@/lib/constants"

interface Question {
  id: string
  title: string
  content: string
  author: {
    name: string
    avatar: string
    university: string
    level: string
    points: number
    verified: boolean
  }
  subject: string
  level: string
  difficulty: string
  status: "Open" | "Answered" | "Closed" | "Under Review"
  votes: number
  answers: number
  views: number
  tags: string[]
  createdAt: string
  lastActivity: string
  featured: boolean
  urgent: boolean
  bounty?: number
  bestAnswer?: {
    author: string
    content: string
    votes: number
    verified: boolean
  }
}

// Mock data for questions
const mockQuestions: Question[] = [
  {
    id: "1",
    title: "How does a cantilever beam work in real-world structures?",
    content:
      "I'm studying structural analysis and I understand the theory behind cantilever beams, but I'm having trouble visualizing how they work in actual buildings and bridges. Can someone explain with practical examples?",
    author: {
      name: "Musa Abdullahi",
      avatar: "/placeholder-user.jpg",
      university: "Ahmadu Bello University",
      level: "300 Level",
      points: 1250,
      verified: false,
    },
    subject: "Civil Engineering",
    level: "300 Level",
    difficulty: "Intermediate",
    status: "Answered",
    votes: 23,
    answers: 4,
    views: 156,
    tags: ["Structural Analysis", "Cantilever", "Beams", "Real-world Applications"],
    createdAt: "2024-01-20T10:30:00Z",
    lastActivity: "2024-01-21T14:22:00Z",
    featured: true,
    urgent: false,
    bestAnswer: {
      author: "Engr. Kola Akinwale",
      content:
        "Cantilever beams are extensively used in modern construction. Think of balconies extending from buildings - they're perfect examples of cantilevers...",
      votes: 18,
      verified: true,
    },
  },
  {
    id: "2",
    title: "What is the purpose of a flywheel in a mechanical system?",
    content:
      "I'm working on a project involving rotating machinery and I need to understand the role of flywheels. How do they store and release energy? What are the design considerations?",
    author: {
      name: "Ngozi Okafor",
      avatar: "/placeholder-user.jpg",
      university: "University of Nigeria, Nsukka",
      level: "400 Level",
      points: 890,
      verified: true,
    },
    subject: "Mechanical Engineering",
    level: "400 Level",
    difficulty: "Advanced",
    status: "Open",
    votes: 15,
    answers: 2,
    views: 89,
    tags: ["Flywheel", "Energy Storage", "Rotating Machinery", "Design"],
    createdAt: "2024-01-22T09:15:00Z",
    lastActivity: "2024-01-22T16:45:00Z",
    featured: false,
    urgent: true,
    bounty: 500,
  },
  {
    id: "3",
    title: "Circuit analysis using Kirchhoff's laws - need help with complex networks",
    content:
      "I'm struggling with applying Kirchhoff's voltage and current laws to complex circuits with multiple loops and nodes. Can someone walk me through the systematic approach?",
    author: {
      name: "Adebayo Johnson",
      avatar: "/placeholder-user.jpg",
      university: "University of Lagos",
      level: "200 Level",
      points: 456,
      verified: false,
    },
    subject: "Electrical Engineering",
    level: "200 Level",
    difficulty: "Beginner",
    status: "Answered",
    votes: 31,
    answers: 6,
    views: 234,
    tags: ["Kirchhoff's Laws", "Circuit Analysis", "Network Theory"],
    createdAt: "2024-01-19T14:20:00Z",
    lastActivity: "2024-01-20T11:30:00Z",
    featured: true,
    urgent: false,
    bestAnswer: {
      author: "Prof. Fatima Yakubu",
      content:
        "The key to solving complex circuits is to be systematic. Start by identifying all nodes and loops, then apply KCL at nodes and KVL around loops...",
      votes: 25,
      verified: true,
    },
  },
  {
    id: "4",
    title: "Thermodynamic cycle efficiency calculations",
    content:
      "I'm having trouble calculating the efficiency of different thermodynamic cycles (Otto, Diesel, Brayton). What's the best approach to solve these problems?",
    author: {
      name: "Fatima Aliyu",
      avatar: "/placeholder-user.jpg",
      university: "Federal University of Technology, Minna",
      level: "300 Level",
      points: 678,
      verified: false,
    },
    subject: "Mechanical Engineering",
    level: "300 Level",
    difficulty: "Intermediate",
    status: "Open",
    votes: 12,
    answers: 1,
    views: 67,
    tags: ["Thermodynamics", "Cycles", "Efficiency", "Otto", "Diesel", "Brayton"],
    createdAt: "2024-01-23T08:45:00Z",
    lastActivity: "2024-01-23T12:15:00Z",
    featured: false,
    urgent: false,
  },
  {
    id: "5",
    title: "Digital logic design - minimizing Boolean expressions",
    content:
      "I need help with minimizing Boolean expressions using K-maps and algebraic methods. When should I use each approach?",
    author: {
      name: "Ibrahim Suleiman",
      avatar: "/placeholder-user.jpg",
      university: "Bayero University Kano",
      level: "200 Level",
      points: 234,
      verified: false,
    },
    subject: "Computer Engineering",
    level: "200 Level",
    difficulty: "Beginner",
    status: "Under Review",
    votes: 8,
    answers: 0,
    views: 45,
    tags: ["Digital Logic", "Boolean Algebra", "K-maps", "Minimization"],
    createdAt: "2024-01-23T16:30:00Z",
    lastActivity: "2024-01-23T16:30:00Z",
    featured: false,
    urgent: false,
  },
]

export default function QuestionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [activeTab, setActiveTab] = useState("all")

  const filteredQuestions = useMemo(() => {
    let filtered = mockQuestions

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (question) =>
          question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by subject
    if (selectedSubject !== "all") {
      filtered = filtered.filter((question) => question.subject === selectedSubject)
    }

    // Filter by level
    if (selectedLevel !== "all") {
      filtered = filtered.filter((question) => question.level === selectedLevel)
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((question) => question.status === selectedStatus)
    }

    // Filter by tab
    if (activeTab === "featured") {
      filtered = filtered.filter((question) => question.featured)
    } else if (activeTab === "urgent") {
      filtered = filtered.filter((question) => question.urgent)
    } else if (activeTab === "unanswered") {
      filtered = filtered.filter((question) => question.answers === 0)
    }

    // Sort questions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "votes":
          return b.votes - a.votes
        case "answers":
          return b.answers - a.answers
        case "views":
          return b.views - a.views
        case "activity":
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, selectedSubject, selectedLevel, selectedStatus, sortBy, activeTab])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Answered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Open":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "Closed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "Under Review":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Answered":
        return "bg-green-100 text-green-800"
      case "Open":
        return "bg-blue-100 text-blue-800"
      case "Closed":
        return "bg-red-100 text-red-800"
      case "Under Review":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks}w ago`
  }

  const QuestionCard = ({ question }: { question: Question }) => (
    <Card className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            {getStatusIcon(question.status)}
            <Badge className={`text-xs ${getStatusColor(question.status)}`}>{question.status}</Badge>
            {question.featured && <Badge className="bg-yellow-500 text-xs">Featured</Badge>}
            {question.urgent && <Badge className="bg-red-500 text-xs">Urgent</Badge>}
            {question.bounty && (
              <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                ₦{question.bounty} bounty
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors cursor-pointer">
          {question.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{question.content}</p>

        <div className="flex flex-wrap gap-1 mb-4">
          {question.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {question.tags.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{question.tags.length - 4} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={question.author.avatar || "/placeholder.svg"} alt={question.author.name} />
              <AvatarFallback>{question.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <p className="text-sm font-medium truncate">{question.author.name}</p>
                {question.author.verified && <Award className="h-3 w-3 text-blue-500" />}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{question.author.university}</span>
                <span>•</span>
                <span>{question.author.level}</span>
                <span>•</span>
                <span>{question.author.points} points</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <span className="text-xs font-medium">{question.votes}</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{question.answers}</span>
            </div>

            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{question.views}</span>
            </div>

            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatTimeAgo(question.lastActivity)}</span>
            </div>
          </div>
        </div>

        {question.bestAnswer && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Best Answer</span>
              <span className="text-xs text-green-600">by {question.bestAnswer.author}</span>
              {question.bestAnswer.verified && <Award className="h-3 w-3 text-green-600" />}
            </div>
            <p className="text-sm text-green-700 line-clamp-2">{question.bestAnswer.content}</p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-1 text-xs text-green-600">
                <ChevronUp className="h-3 w-3" />
                <span>{question.bestAnswer.votes} votes</span>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-green-600 h-6">
                View full answer
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {question.subject}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {question.level}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {question.difficulty}
            </Badge>
          </div>

          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Questions & Answers</h1>
            <p className="text-gray-600">Get help from certified Nigerian engineering lecturers and fellow students</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Ask Question
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search questions, topics, or users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {ENGINEERING_SUBJECTS.slice(0, 15).map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {ACADEMIC_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {QUESTION_STATUS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="votes">Most Votes</SelectItem>
                  <SelectItem value="answers">Most Answers</SelectItem>
                  <SelectItem value="views">Most Views</SelectItem>
                  <SelectItem value="activity">Recent Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="all">All Questions</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="urgent">Urgent</TabsTrigger>
            <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Showing {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""}
              </p>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              <div className="space-y-4">
                {filteredQuestions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))}
              </div>

              {filteredQuestions.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or browse all available questions.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Ask the first question
                  </Button>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
