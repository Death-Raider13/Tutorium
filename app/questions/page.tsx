"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Award,
  Calendar,
  Plus,
} from "lucide-react"
import { ENGINEERING_SUBJECTS, ACADEMIC_LEVELS, DIFFICULTY_LEVELS, NIGERIAN_UNIVERSITIES } from "@/lib/constants"
import Link from "next/link"

// Mock data for questions
const mockQuestions = [
  {
    id: "1",
    title: "How to calculate deflection in simply supported beams?",
    content:
      "I'm working on a structural analysis problem involving a simply supported beam with a point load at the center. I need help understanding the formula for maximum deflection and how to apply it in different scenarios.",
    author: {
      name: "Adebayo Johnson",
      avatar: "/placeholder-user.jpg",
      level: "300 Level",
      university: "University of Lagos (UNILAG)",
      points: 245,
      verified: false,
    },
    subject: "Civil Engineering",
    difficulty: "Intermediate",
    status: "open",
    votes: 12,
    answers: 3,
    views: 156,
    createdAt: new Date("2024-01-15T10:30:00"),
    tags: ["structural-analysis", "beams", "deflection", "mechanics"],
    featured: true,
    hasAcceptedAnswer: false,
  },
  {
    id: "2",
    title: "Thermodynamic cycle efficiency calculations",
    content:
      "Can someone explain the step-by-step process for calculating the efficiency of a Carnot cycle? I'm particularly confused about the temperature relationships and entropy changes.",
    author: {
      name: "Fatima Abdullahi",
      avatar: "/placeholder-user.jpg",
      level: "400 Level",
      university: "Ahmadu Bello University (ABU)",
      points: 389,
      verified: true,
    },
    subject: "Mechanical Engineering",
    difficulty: "Advanced",
    status: "answered",
    votes: 18,
    answers: 5,
    views: 234,
    createdAt: new Date("2024-01-20T14:15:00"),
    tags: ["thermodynamics", "carnot-cycle", "efficiency", "entropy"],
    featured: false,
    hasAcceptedAnswer: true,
  },
  {
    id: "3",
    title: "Circuit analysis using nodal method",
    content:
      "I'm struggling with applying the nodal analysis method to solve complex circuits. Could someone provide a clear example with multiple voltage sources and resistors?",
    author: {
      name: "Chinedu Okafor",
      avatar: "/placeholder-user.jpg",
      level: "200 Level",
      university: "University of Nigeria, Nsukka (UNN)",
      points: 156,
      verified: false,
    },
    subject: "Electrical Engineering",
    difficulty: "Beginner",
    status: "open",
    votes: 8,
    answers: 2,
    views: 89,
    createdAt: new Date("2024-01-25T09:45:00"),
    tags: ["circuit-analysis", "nodal-method", "voltage", "resistors"],
    featured: false,
    hasAcceptedAnswer: false,
  },
  {
    id: "4",
    title: "Mass balance in chemical reactors",
    content:
      "How do I set up mass balance equations for a continuous stirred tank reactor (CSTR) with multiple reactions occurring simultaneously?",
    author: {
      name: "Kemi Adeyemi",
      avatar: "/placeholder-user.jpg",
      level: "500 Level",
      university: "Obafemi Awolowo University (OAU)",
      points: 567,
      verified: true,
    },
    subject: "Chemical Engineering",
    difficulty: "Advanced",
    status: "answered",
    votes: 15,
    answers: 4,
    views: 178,
    createdAt: new Date("2024-02-01T16:20:00"),
    tags: ["mass-balance", "cstr", "chemical-reactors", "process-engineering"],
    featured: true,
    hasAcceptedAnswer: true,
  },
  {
    id: "5",
    title: "Algorithm complexity analysis - Big O notation",
    content:
      "I need help understanding how to analyze the time complexity of recursive algorithms, especially when dealing with divide-and-conquer approaches like merge sort.",
    author: {
      name: "Ibrahim Musa",
      avatar: "/placeholder-user.jpg",
      level: "300 Level",
      university: "Federal University of Technology, Owerri (FUTO)",
      points: 298,
      verified: false,
    },
    subject: "Computer Engineering",
    difficulty: "Intermediate",
    status: "open",
    votes: 22,
    answers: 6,
    views: 312,
    createdAt: new Date("2024-02-05T11:10:00"),
    tags: ["algorithms", "complexity", "big-o", "recursion", "merge-sort"],
    featured: false,
    hasAcceptedAnswer: false,
  },
]

// Generate more mock questions to reach 50+
const generateMoreQuestions = () => {
  const additionalQuestions = []
  const subjects = ENGINEERING_SUBJECTS.slice(0, 15)
  const levels = ACADEMIC_LEVELS.slice(0, 6)
  const difficulties = DIFFICULTY_LEVELS
  const statuses = ["open", "answered", "closed"]
  const universities = NIGERIAN_UNIVERSITIES.slice(0, 20)

  const authorNames = [
    "Olumide Adebayo",
    "Ngozi Okafor",
    "Yusuf Mohammed",
    "Grace Eze",
    "Tunde Bakare",
    "Amina Garba",
    "Emeka Nwankwo",
    "Folake Adeyemi",
    "Sani Abubakar",
    "Chioma Okonkwo",
    "Rasheed Lawal",
    "Bisi Ogundipe",
    "Kabir Yusuf",
    "Funmi Adeleke",
    "Godwin Okeke",
    "Zainab Aliyu",
  ]

  const questionTitles = [
    "Understanding fluid mechanics principles",
    "Structural steel design calculations",
    "Power system analysis methods",
    "Chemical process optimization",
    "Database design and normalization",
    "Heat transfer coefficient calculations",
    "Concrete mix design procedures",
    "Digital signal processing techniques",
    "Reaction kinetics modeling",
    "Software testing methodologies",
    "Soil mechanics and foundation design",
    "Control system stability analysis",
    "Electromagnetic field theory",
    "Distillation column design",
    "Network security protocols",
  ]

  for (let i = 6; i <= 50; i++) {
    const subject = subjects[Math.floor(Math.random() * subjects.length)]
    const level = levels[Math.floor(Math.random() * levels.length)]
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const university = universities[Math.floor(Math.random() * universities.length)]
    const author = authorNames[Math.floor(Math.random() * authorNames.length)]
    const title = questionTitles[Math.floor(Math.random() * questionTitles.length)]

    additionalQuestions.push({
      id: i.toString(),
      title: `${title} - ${subject}`,
      content: `I need help understanding ${title.toLowerCase()} in the context of ${subject.toLowerCase()}. This is for my ${level} coursework.`,
      author: {
        name: author,
        avatar: "/placeholder-user.jpg",
        level: level,
        university: university,
        points: Math.floor(Math.random() * 500) + 50,
        verified: Math.random() > 0.4,
      },
      subject,
      difficulty,
      status,
      votes: Math.floor(Math.random() * 30),
      answers: Math.floor(Math.random() * 8),
      views: Math.floor(Math.random() * 500) + 20,
      createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      tags: [
        subject.toLowerCase().replace(/\s+/g, "-"),
        difficulty.toLowerCase(),
        level.toLowerCase().replace(/\s+/g, "-"),
      ],
      featured: Math.random() > 0.85,
      hasAcceptedAnswer: status === "answered" ? Math.random() > 0.3 : false,
    })
  }

  return additionalQuestions
}

const allQuestions = [...mockQuestions, ...generateMoreQuestions()]

export default function QuestionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [activeTab, setActiveTab] = useState("all")

  const filteredAndSortedQuestions = useMemo(() => {
    const filtered = allQuestions.filter((question) => {
      const matchesSearch =
        question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesSubject = selectedSubject === "all" || question.subject === selectedSubject
      const matchesStatus = selectedStatus === "all" || question.status === selectedStatus
      const matchesDifficulty = selectedDifficulty === "all" || question.difficulty === selectedDifficulty

      // Tab filtering
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "featured" && question.featured) ||
        (activeTab === "unanswered" && question.answers === 0) ||
        (activeTab === "recent" && new Date(question.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)

      return matchesSearch && matchesSubject && matchesStatus && matchesDifficulty && matchesTab
    })

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
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, selectedSubject, selectedStatus, selectedDifficulty, sortBy, activeTab])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "answered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "closed":
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800"
      case "answered":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-orange-100 text-orange-800"
      case "Expert":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`

    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths}mo ago`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Engineering Q&A</h1>
              <p className="text-gray-600">
                Get answers to your engineering questions from certified lecturers and peers
              </p>
            </div>
            <Button asChild>
              <Link href="/ask">
                <Plus className="h-4 w-4 mr-2" />
                Ask Question
              </Link>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search questions, topics, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" className="lg:w-auto bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
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

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="answered">Answered</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                {DIFFICULTY_LEVELS.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="votes">Most Votes</SelectItem>
                <SelectItem value="answers">Most Answers</SelectItem>
                <SelectItem value="views">Most Views</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              All Questions
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="unanswered" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Unanswered
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {filteredAndSortedQuestions.length} question{filteredAndSortedQuestions.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {filteredAndSortedQuestions.map((question) => (
                <Card key={question.id} className="hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center gap-1 min-w-0">
                        <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">{question.votes}</span>
                        <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Question Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <CardTitle className="text-lg line-clamp-2 hover:text-blue-600 cursor-pointer">
                            {question.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {question.featured && (
                              <Badge className="bg-yellow-500 hover:bg-yellow-600">
                                <Award className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            <Badge className={getStatusColor(question.status)}>
                              {getStatusIcon(question.status)}
                              <span className="ml-1 capitalize">{question.status}</span>
                            </Badge>
                          </div>
                        </div>

                        <CardDescription className="line-clamp-2 mb-3">{question.content}</CardDescription>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline">{question.subject}</Badge>
                          <Badge className={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
                          {question.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Author and Stats */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={question.author.avatar || "/placeholder.svg"}
                                alt={question.author.name}
                              />
                              <AvatarFallback>
                                {question.author.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{question.author.name}</p>
                                {question.author.verified && (
                                  <Badge variant="outline" className="text-xs px-1 py-0">
                                    ✓
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-gray-500">{question.author.points} pts</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{question.author.level}</span>
                                <span>•</span>
                                <span className="truncate max-w-48">{question.author.university}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>{question.answers}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{question.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatTimeAgo(question.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredAndSortedQuestions.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search criteria or filters to find more questions.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedSubject("all")
                      setSelectedStatus("all")
                      setSelectedDifficulty("all")
                      setActiveTab("all")
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                  <Button asChild>
                    <Link href="/ask">
                      <Plus className="h-4 w-4 mr-2" />
                      Ask Question
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
