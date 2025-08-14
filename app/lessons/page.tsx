"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  Play,
  Download,
  Heart,
  Star,
  Eye,
  Clock,
  BookOpen,
  Video,
  FileText,
  Headphones,
  Calendar,
  TrendingUp,
  Award,
} from "lucide-react"
import { ENGINEERING_SUBJECTS, ACADEMIC_LEVELS, DIFFICULTY_LEVELS, NIGERIAN_UNIVERSITIES } from "@/lib/constants"

// Mock data for lessons
const mockLessons = [
  {
    id: "1",
    title: "Introduction to Structural Analysis",
    description:
      "Learn the fundamentals of structural analysis including force systems, equilibrium, and basic structural elements.",
    instructor: {
      name: "Dr. Adebayo Ogundimu",
      avatar: "/placeholder-user.jpg",
      university: "University of Lagos (UNILAG)",
      department: "Civil Engineering",
      verified: true,
    },
    subject: "Civil Engineering",
    level: "200 Level",
    difficulty: "Beginner",
    type: "video",
    duration: "45 mins",
    rating: 4.8,
    views: 1250,
    likes: 89,
    downloads: 156,
    createdAt: new Date("2024-01-15"),
    thumbnail: "/placeholder.jpg",
    featured: true,
    popular: true,
  },
  {
    id: "2",
    title: "Thermodynamics: First Law Applications",
    description:
      "Comprehensive coverage of the first law of thermodynamics with practical engineering applications and problem-solving techniques.",
    instructor: {
      name: "Prof. Kemi Adeyemi",
      avatar: "/placeholder-user.jpg",
      university: "Obafemi Awolowo University (OAU)",
      department: "Mechanical Engineering",
      verified: true,
    },
    subject: "Mechanical Engineering",
    level: "300 Level",
    difficulty: "Intermediate",
    type: "video",
    duration: "1h 20mins",
    rating: 4.9,
    views: 2100,
    likes: 145,
    downloads: 234,
    createdAt: new Date("2024-01-20"),
    thumbnail: "/placeholder.jpg",
    featured: true,
    popular: true,
  },
  {
    id: "3",
    title: "Circuit Analysis Fundamentals",
    description:
      "Master the basics of electrical circuit analysis including Ohm's law, Kirchhoff's laws, and network theorems.",
    instructor: {
      name: "Dr. Ibrahim Musa",
      avatar: "/placeholder-user.jpg",
      university: "Ahmadu Bello University (ABU)",
      department: "Electrical Engineering",
      verified: true,
    },
    subject: "Electrical Engineering",
    level: "200 Level",
    difficulty: "Beginner",
    type: "document",
    duration: "30 mins read",
    rating: 4.7,
    views: 890,
    likes: 67,
    downloads: 123,
    createdAt: new Date("2024-01-25"),
    thumbnail: "/placeholder.jpg",
    featured: false,
    popular: true,
  },
  {
    id: "4",
    title: "Chemical Process Design Principles",
    description:
      "Advanced concepts in chemical process design including mass and energy balances, reactor design, and separation processes.",
    instructor: {
      name: "Dr. Fatima Al-Hassan",
      avatar: "/placeholder-user.jpg",
      university: "University of Nigeria, Nsukka (UNN)",
      department: "Chemical Engineering",
      verified: true,
    },
    subject: "Chemical Engineering",
    level: "400 Level",
    difficulty: "Advanced",
    type: "video",
    duration: "2h 15mins",
    rating: 4.6,
    views: 756,
    likes: 52,
    downloads: 89,
    createdAt: new Date("2024-02-01"),
    thumbnail: "/placeholder.jpg",
    featured: false,
    popular: false,
  },
  {
    id: "5",
    title: "Data Structures and Algorithms",
    description:
      "Essential data structures and algorithms for computer engineering students with practical coding examples.",
    instructor: {
      name: "Eng. Chinedu Okoro",
      avatar: "/placeholder-user.jpg",
      university: "Federal University of Technology, Owerri (FUTO)",
      department: "Computer Engineering",
      verified: true,
    },
    subject: "Computer Engineering",
    level: "300 Level",
    difficulty: "Intermediate",
    type: "interactive",
    duration: "3h 30mins",
    rating: 4.8,
    views: 1890,
    likes: 134,
    downloads: 201,
    createdAt: new Date("2024-02-05"),
    thumbnail: "/placeholder.jpg",
    featured: true,
    popular: true,
  },
]

// Generate more mock lessons to reach 50+
const generateMoreLessons = () => {
  const additionalLessons = []
  const subjects = ENGINEERING_SUBJECTS.slice(0, 15)
  const levels = ACADEMIC_LEVELS.slice(0, 6)
  const difficulties = DIFFICULTY_LEVELS
  const types = ["video", "document", "audio", "interactive"]
  const universities = NIGERIAN_UNIVERSITIES.slice(0, 20)

  const instructorNames = [
    "Dr. Olumide Adebayo",
    "Prof. Ngozi Okafor",
    "Dr. Yusuf Mohammed",
    "Dr. Grace Eze",
    "Prof. Tunde Bakare",
    "Dr. Amina Garba",
    "Eng. Emeka Nwankwo",
    "Dr. Folake Adeyemi",
    "Prof. Sani Abubakar",
    "Dr. Chioma Okonkwo",
    "Dr. Rasheed Lawal",
    "Prof. Bisi Ogundipe",
    "Dr. Kabir Yusuf",
    "Dr. Funmi Adeleke",
    "Prof. Godwin Okeke",
    "Dr. Zainab Aliyu",
  ]

  for (let i = 6; i <= 50; i++) {
    const subject = subjects[Math.floor(Math.random() * subjects.length)]
    const level = levels[Math.floor(Math.random() * levels.length)]
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
    const type = types[Math.floor(Math.random() * types.length)]
    const university = universities[Math.floor(Math.random() * universities.length)]
    const instructor = instructorNames[Math.floor(Math.random() * instructorNames.length)]

    additionalLessons.push({
      id: i.toString(),
      title: `${subject} - ${level} Course ${i}`,
      description: `Comprehensive ${difficulty.toLowerCase()} level course covering essential concepts in ${subject.toLowerCase()}.`,
      instructor: {
        name: instructor,
        avatar: "/placeholder-user.jpg",
        university: university,
        department: subject,
        verified: Math.random() > 0.3,
      },
      subject,
      level,
      difficulty,
      type,
      duration:
        type === "video"
          ? `${Math.floor(Math.random() * 120) + 30} mins`
          : type === "document"
            ? `${Math.floor(Math.random() * 60) + 15} mins read`
            : type === "audio"
              ? `${Math.floor(Math.random() * 90) + 20} mins`
              : `${Math.floor(Math.random() * 180) + 60} mins`,
      rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
      views: Math.floor(Math.random() * 3000) + 100,
      likes: Math.floor(Math.random() * 200) + 10,
      downloads: Math.floor(Math.random() * 300) + 20,
      createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      thumbnail: "/placeholder.jpg",
      featured: Math.random() > 0.8,
      popular: Math.random() > 0.6,
    })
  }

  return additionalLessons
}

const allLessons = [...mockLessons, ...generateMoreLessons()]

export default function LessonsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [activeTab, setActiveTab] = useState("all")

  const filteredAndSortedLessons = useMemo(() => {
    const filtered = allLessons.filter((lesson) => {
      const matchesSearch =
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSubject = selectedSubject === "all" || lesson.subject === selectedSubject
      const matchesLevel = selectedLevel === "all" || lesson.level === selectedLevel
      const matchesDifficulty = selectedDifficulty === "all" || lesson.difficulty === selectedDifficulty
      const matchesType = selectedType === "all" || lesson.type === selectedType

      // Tab filtering
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "featured" && lesson.featured) ||
        (activeTab === "popular" && lesson.popular) ||
        (activeTab === "recent" && new Date(lesson.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)

      return matchesSearch && matchesSubject && matchesLevel && matchesDifficulty && matchesType && matchesTab
    })

    // Sort lessons
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "popular":
          return b.views - a.views
        case "rating":
          return b.rating - a.rating
        case "alphabetical":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, selectedSubject, selectedLevel, selectedDifficulty, selectedType, sortBy, activeTab])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      case "audio":
        return <Headphones className="h-4 w-4" />
      case "interactive":
        return <BookOpen className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Engineering Lessons</h1>
          <p className="text-gray-600">
            Explore our comprehensive library of engineering courses and tutorials from certified lecturers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search lessons, instructors, or topics..."
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
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

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="interactive">Interactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="alphabetical">A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              All Lessons
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Popular
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
                Showing {filteredAndSortedLessons.length} lesson{filteredAndSortedLessons.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Lessons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedLessons.map((lesson) => (
                <Card key={lesson.id} className="hover:shadow-lg transition-shadow duration-200">
                  <div className="relative">
                    <img
                      src={lesson.thumbnail || "/placeholder.svg"}
                      alt={lesson.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 left-2 flex gap-2">
                      {lesson.featured && (
                        <Badge className="bg-yellow-500 hover:bg-yellow-600">
                          <Award className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {getTypeIcon(lesson.type)}
                        {lesson.type}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className={getDifficultyColor(lesson.difficulty)}>{lesson.difficulty}</Badge>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {lesson.duration}
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{lesson.title}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-yellow-600">
                        <Star className="h-4 w-4 fill-current" />
                        {lesson.rating}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">{lesson.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Instructor Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={lesson.instructor.avatar || "/placeholder.svg"}
                          alt={lesson.instructor.name}
                        />
                        <AvatarFallback>
                          {lesson.instructor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium truncate">{lesson.instructor.name}</p>
                          {lesson.instructor.verified && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              ✓
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{lesson.instructor.university}</p>
                      </div>
                    </div>

                    {/* Subject and Level */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">{lesson.subject}</Badge>
                      <Badge variant="outline">{lesson.level}</Badge>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {lesson.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {lesson.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {lesson.downloads}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        {lesson.type === "video" ? "Watch" : lesson.type === "audio" ? "Listen" : "View"}
                      </Button>
                      <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredAndSortedLessons.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search criteria or filters to find more lessons.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedSubject("all")
                    setSelectedLevel("all")
                    setSelectedDifficulty("all")
                    setSelectedType("all")
                    setActiveTab("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
