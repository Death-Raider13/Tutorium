"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Play, Heart, Star, Eye, Users, BookOpen, Award, Bookmark, Share2, Grid3X3, List } from "lucide-react"
import { ENGINEERING_SUBJECTS, ACADEMIC_LEVELS, DIFFICULTY_LEVELS, SORT_OPTIONS } from "@/lib/constants"

interface Lesson {
  id: string
  title: string
  description: string
  instructor: {
    name: string
    avatar: string
    university: string
    rating: number
    verified: boolean
  }
  subject: string
  level: string
  difficulty: string
  duration: string
  views: number
  likes: number
  rating: number
  totalRatings: number
  thumbnail: string
  tags: string[]
  createdAt: string
  featured: boolean
  popular: boolean
  recent: boolean
  type: "video" | "live" | "tutorial" | "workshop"
  price: number
  enrolled: number
  language: string
  prerequisites: string[]
  learningOutcomes: string[]
}

// Mock data for lessons
const mockLessons: Lesson[] = [
  {
    id: "1",
    title: "Introduction to Structural Analysis",
    description:
      "Learn the fundamentals of structural analysis including force systems, equilibrium, and basic structural elements.",
    instructor: {
      name: "Dr. Adebayo Ogundimu",
      avatar: "/placeholder-user.jpg",
      university: "University of Lagos",
      rating: 4.8,
      verified: true,
    },
    subject: "Civil Engineering",
    level: "200 Level",
    difficulty: "Beginner",
    duration: "2h 30m",
    views: 1250,
    likes: 89,
    rating: 4.7,
    totalRatings: 156,
    thumbnail: "/placeholder.jpg",
    tags: ["Structures", "Analysis", "Fundamentals"],
    createdAt: "2024-01-15",
    featured: true,
    popular: true,
    recent: false,
    type: "video",
    price: 0,
    enrolled: 234,
    language: "English",
    prerequisites: ["Engineering Mathematics", "Physics"],
    learningOutcomes: ["Understand force systems", "Apply equilibrium principles", "Analyze simple structures"],
  },
  {
    id: "2",
    title: "Advanced Circuit Analysis Techniques",
    description: "Master complex circuit analysis using nodal analysis, mesh analysis, and network theorems.",
    instructor: {
      name: "Prof. Fatima Yakubu",
      avatar: "/placeholder-user.jpg",
      university: "Ahmadu Bello University",
      rating: 4.9,
      verified: true,
    },
    subject: "Electrical Engineering",
    level: "300 Level",
    difficulty: "Advanced",
    duration: "3h 15m",
    views: 890,
    likes: 67,
    rating: 4.8,
    totalRatings: 98,
    thumbnail: "/placeholder.jpg",
    tags: ["Circuits", "Analysis", "Network Theorems"],
    createdAt: "2024-01-20",
    featured: false,
    popular: true,
    recent: true,
    type: "video",
    price: 2500,
    enrolled: 156,
    language: "English",
    prerequisites: ["Basic Circuit Analysis", "Linear Algebra"],
    learningOutcomes: ["Master nodal analysis", "Apply mesh analysis", "Use network theorems"],
  },
  {
    id: "3",
    title: "Thermodynamics: First and Second Laws",
    description: "Comprehensive coverage of the first and second laws of thermodynamics with practical applications.",
    instructor: {
      name: "Engr. Kola Akinwale",
      avatar: "/placeholder-user.jpg",
      university: "Federal University of Technology, Akure",
      rating: 4.6,
      verified: true,
    },
    subject: "Mechanical Engineering",
    level: "200 Level",
    difficulty: "Intermediate",
    duration: "4h 00m",
    views: 2100,
    likes: 145,
    rating: 4.5,
    totalRatings: 287,
    thumbnail: "/placeholder.jpg",
    tags: ["Thermodynamics", "Energy", "Heat Transfer"],
    createdAt: "2024-01-10",
    featured: true,
    popular: true,
    recent: false,
    type: "video",
    price: 3000,
    enrolled: 412,
    language: "English",
    prerequisites: ["Physics", "Calculus"],
    learningOutcomes: ["Understand energy conservation", "Apply thermodynamic laws", "Solve practical problems"],
  },
  {
    id: "4",
    title: "Digital Signal Processing Fundamentals",
    description: "Introduction to digital signal processing concepts, transforms, and filtering techniques.",
    instructor: {
      name: "Dr. Chioma Okwu",
      avatar: "/placeholder-user.jpg",
      university: "University of Nigeria, Nsukka",
      rating: 4.7,
      verified: true,
    },
    subject: "Computer Engineering",
    level: "400 Level",
    difficulty: "Advanced",
    duration: "5h 30m",
    views: 756,
    likes: 52,
    rating: 4.6,
    totalRatings: 89,
    thumbnail: "/placeholder.jpg",
    tags: ["DSP", "Signals", "Filtering", "Transforms"],
    createdAt: "2024-01-25",
    featured: false,
    popular: false,
    recent: true,
    type: "tutorial",
    price: 4000,
    enrolled: 98,
    language: "English",
    prerequisites: ["Signals and Systems", "Linear Algebra", "Complex Analysis"],
    learningOutcomes: ["Understand DSP concepts", "Apply transforms", "Design digital filters"],
  },
  {
    id: "5",
    title: "Petroleum Reservoir Engineering",
    description: "Study of reservoir rock and fluid properties, material balance, and reservoir performance.",
    instructor: {
      name: "Prof. Ibrahim Musa",
      avatar: "/placeholder-user.jpg",
      university: "University of Port Harcourt",
      rating: 4.8,
      verified: true,
    },
    subject: "Petroleum Engineering",
    level: "400 Level",
    difficulty: "Expert",
    duration: "6h 15m",
    views: 445,
    likes: 38,
    rating: 4.9,
    totalRatings: 67,
    thumbnail: "/placeholder.jpg",
    tags: ["Reservoir", "Petroleum", "Fluid Properties"],
    createdAt: "2024-01-08",
    featured: true,
    popular: false,
    recent: false,
    type: "workshop",
    price: 5500,
    enrolled: 78,
    language: "English",
    prerequisites: ["Geology", "Fluid Mechanics", "Thermodynamics"],
    learningOutcomes: ["Analyze reservoir properties", "Perform material balance", "Predict reservoir performance"],
  },
]

export default function LessonsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  const filteredLessons = useMemo(() => {
    let filtered = mockLessons

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (lesson) =>
          lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lesson.instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lesson.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by subject
    if (selectedSubject !== "all") {
      filtered = filtered.filter((lesson) => lesson.subject === selectedSubject)
    }

    // Filter by level
    if (selectedLevel !== "all") {
      filtered = filtered.filter((lesson) => lesson.level === selectedLevel)
    }

    // Filter by difficulty
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter((lesson) => lesson.difficulty === selectedDifficulty)
    }

    // Filter by tab
    if (activeTab === "featured") {
      filtered = filtered.filter((lesson) => lesson.featured)
    } else if (activeTab === "popular") {
      filtered = filtered.filter((lesson) => lesson.popular)
    } else if (activeTab === "recent") {
      filtered = filtered.filter((lesson) => lesson.recent)
    }

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
        case "views":
          return b.views - a.views
        case "alphabetical":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, selectedSubject, selectedLevel, selectedDifficulty, sortBy, activeTab])

  const LessonCard = ({ lesson }: { lesson: Lesson }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
      <div className="relative">
        <img
          src={lesson.thumbnail || "/placeholder.svg"}
          alt={lesson.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-lg flex items-center justify-center">
          <Button size="sm" className="bg-white/20 backdrop-blur-sm border-white/30">
            <Play className="h-4 w-4 mr-2" />
            Watch Now
          </Button>
        </div>
        <div className="absolute top-2 left-2 flex gap-1">
          {lesson.featured && <Badge className="bg-yellow-500">Featured</Badge>}
          {lesson.popular && <Badge className="bg-red-500">Popular</Badge>}
          {lesson.recent && <Badge className="bg-green-500">New</Badge>}
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-black/50 text-white">
            {lesson.duration}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
            {lesson.title}
          </CardTitle>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="line-clamp-2">{lesson.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center space-x-2 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={lesson.instructor.avatar || "/placeholder.svg"} alt={lesson.instructor.name} />
            <AvatarFallback>{lesson.instructor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{lesson.instructor.name}</p>
            <p className="text-xs text-muted-foreground truncate">{lesson.instructor.university}</p>
          </div>
          {lesson.instructor.verified && <Award className="h-4 w-4 text-blue-500 flex-shrink-0" />}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{lesson.rating}</span>
              <span>({lesson.totalRatings})</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{lesson.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{lesson.enrolled}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          <Badge variant="outline" className="text-xs">
            {lesson.subject}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {lesson.level}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {lesson.difficulty}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button size="sm" className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              {lesson.price === 0 ? "Watch Free" : `₦${lesson.price.toLocaleString()}`}
            </Button>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const LessonListItem = ({ lesson }: { lesson: Lesson }) => (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <div className="relative flex-shrink-0">
            <img
              src={lesson.thumbnail || "/placeholder.svg"}
              alt={lesson.title}
              className="w-32 h-20 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
              <Play className="h-6 w-6 text-white" />
            </div>
            <Badge variant="secondary" className="absolute bottom-1 right-1 text-xs bg-black/50 text-white">
              {lesson.duration}
            </Badge>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-blue-600 transition-colors">
                {lesson.title}
              </h3>
              <div className="flex items-center space-x-1 ml-2">
                {lesson.featured && <Badge className="bg-yellow-500 text-xs">Featured</Badge>}
                {lesson.popular && <Badge className="bg-red-500 text-xs">Popular</Badge>}
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{lesson.description}</p>

            <div className="flex items-center space-x-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={lesson.instructor.avatar || "/placeholder.svg"} alt={lesson.instructor.name} />
                <AvatarFallback className="text-xs">{lesson.instructor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{lesson.instructor.name}</span>
              {lesson.instructor.verified && <Award className="h-3 w-3 text-blue-500" />}
              <span className="text-xs text-muted-foreground">• {lesson.instructor.university}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{lesson.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{lesson.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{lesson.enrolled}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {lesson.level}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {lesson.difficulty}
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <Button size="sm">{lesson.price === 0 ? "Watch Free" : `₦${lesson.price.toLocaleString()}`}</Button>
                <Button variant="ghost" size="sm">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Lessons</h1>
          <p className="text-gray-600">
            Learn from certified Nigerian engineering lecturers with comprehensive video lessons
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
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

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {DIFFICULTY_LEVELS.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-1 border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="all">All Lessons</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Showing {filteredLessons.length} lesson{filteredLessons.length !== 1 ? "s" : ""}
              </p>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLessons.map((lesson) => (
                    <LessonCard key={lesson.id} lesson={lesson} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLessons.map((lesson) => (
                    <LessonListItem key={lesson.id} lesson={lesson} />
                  ))}
                </div>
              )}

              {filteredLessons.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or browse all available lessons.</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
