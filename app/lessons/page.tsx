"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Play, Clock, Users, Star, Grid3X3, List, Heart, Share2 } from "lucide-react"

export default function LessonsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedDuration, setSelectedDuration] = useState("all")
  const [sortBy, setSortBy] = useState("popular")
  const [viewMode, setViewMode] = useState("grid")

  const lessons = [
    {
      id: 1,
      title: "Introduction to Structural Analysis",
      description:
        "Learn the fundamentals of structural analysis including force diagrams, moment calculations, and basic beam theory.",
      instructor: {
        name: "Dr. Adebayo Ogundimu",
        avatar: "/placeholder-user.jpg",
        title: "Professor of Structural Engineering",
        university: "University of Ibadan",
      },
      subject: "Civil Engineering",
      level: "Beginner",
      duration: "45 min",
      students: 2340,
      rating: 4.8,
      reviews: 156,
      thumbnail: "/placeholder.jpg",
      tags: ["structural-analysis", "beams", "forces", "moments"],
      price: "Free",
      isBookmarked: false,
      completionRate: 89,
    },
    {
      id: 2,
      title: "Thermodynamics Fundamentals",
      description:
        "Master the basic principles of thermodynamics including the first and second laws, entropy, and heat engines.",
      instructor: {
        name: "Prof. Fatima Al-Rashid",
        avatar: "/placeholder-user.jpg",
        title: "Chemical Engineering Professor",
        university: "Ahmadu Bello University",
      },
      subject: "Chemical Engineering",
      level: "Intermediate",
      duration: "38 min",
      students: 1890,
      rating: 4.9,
      reviews: 203,
      thumbnail: "/placeholder.jpg",
      tags: ["thermodynamics", "heat-engines", "entropy", "energy"],
      price: "₦2,500",
      isBookmarked: true,
      completionRate: 92,
    },
    {
      id: 3,
      title: "Circuit Analysis Techniques",
      description:
        "Learn various methods for analyzing electrical circuits including nodal analysis, mesh analysis, and Thevenin's theorem.",
      instructor: {
        name: "Dr. Chinedu Okwu",
        avatar: "/placeholder-user.jpg",
        title: "Electrical Engineering Specialist",
        university: "University of Nigeria, Nsukka",
      },
      subject: "Electrical Engineering",
      level: "Beginner",
      duration: "52 min",
      students: 1650,
      rating: 4.7,
      reviews: 134,
      thumbnail: "/placeholder.jpg",
      tags: ["circuits", "analysis", "thevenin", "nodal"],
      price: "₦3,000",
      isBookmarked: false,
      completionRate: 85,
    },
    {
      id: 4,
      title: "Fluid Mechanics and Flow Analysis",
      description: "Understand fluid properties, flow types, and the fundamental equations governing fluid motion.",
      instructor: {
        name: "Dr. Amina Hassan",
        avatar: "/placeholder-user.jpg",
        title: "Mechanical Engineering Professor",
        university: "University of Lagos",
      },
      subject: "Mechanical Engineering",
      level: "Intermediate",
      duration: "41 min",
      students: 1420,
      rating: 4.6,
      reviews: 98,
      thumbnail: "/placeholder.jpg",
      tags: ["fluid-mechanics", "flow", "bernoulli", "viscosity"],
      price: "₦2,800",
      isBookmarked: false,
      completionRate: 78,
    },
    {
      id: 5,
      title: "Digital Logic Design",
      description:
        "Learn the basics of digital logic including Boolean algebra, logic gates, and combinational circuits.",
      instructor: {
        name: "Dr. Kola Akinwale",
        avatar: "/placeholder-user.jpg",
        title: "Computer Engineering Lecturer",
        university: "Obafemi Awolowo University",
      },
      subject: "Computer Engineering",
      level: "Beginner",
      duration: "35 min",
      students: 1980,
      rating: 4.8,
      reviews: 167,
      thumbnail: "/placeholder.jpg",
      tags: ["digital-logic", "boolean", "gates", "circuits"],
      price: "Free",
      isBookmarked: true,
      completionRate: 91,
    },
    {
      id: 6,
      title: "Petroleum Reservoir Engineering",
      description: "Introduction to reservoir characterization, fluid properties, and production forecasting methods.",
      instructor: {
        name: "Dr. Musa Abdullahi",
        avatar: "/placeholder-user.jpg",
        title: "Petroleum Engineering Expert",
        university: "University of Port Harcourt",
      },
      subject: "Petroleum Engineering",
      level: "Advanced",
      duration: "58 min",
      students: 890,
      rating: 4.9,
      reviews: 76,
      thumbnail: "/placeholder.jpg",
      tags: ["reservoir", "petroleum", "production", "forecasting"],
      price: "₦4,500",
      isBookmarked: false,
      completionRate: 94,
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

  const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"]
  const durations = ["All Durations", "Under 30 min", "30-60 min", "Over 60 min"]

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesSubject = selectedSubject === "all" || lesson.subject === selectedSubject
    const matchesLevel = selectedLevel === "all" || lesson.level === selectedLevel

    const matchesDuration = (() => {
      if (selectedDuration === "all") return true
      const duration = Number.parseInt(lesson.duration)
      if (selectedDuration === "Under 30 min") return duration < 30
      if (selectedDuration === "30-60 min") return duration >= 30 && duration <= 60
      if (selectedDuration === "Over 60 min") return duration > 60
      return true
    })()

    return matchesSearch && matchesSubject && matchesLevel && matchesDuration
  })

  const sortedLessons = [...filteredLessons].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating
      case "students":
        return b.students - a.students
      case "newest":
        return b.id - a.id
      case "price-low":
        const priceA = a.price === "Free" ? 0 : Number.parseInt(a.price.replace(/[₦,]/g, ""))
        const priceB = b.price === "Free" ? 0 : Number.parseInt(b.price.replace(/[₦,]/g, ""))
        return priceA - priceB
      case "price-high":
        const priceA2 = a.price === "Free" ? 0 : Number.parseInt(a.price.replace(/[₦,]/g, ""))
        const priceB2 = b.price === "Free" ? 0 : Number.parseInt(b.price.replace(/[₦,]/g, ""))
        return priceB2 - priceA2
      default:
        return b.students - a.students // Default to popular
    }
  })

  const toggleBookmark = (lessonId: number) => {
    console.log("Toggle bookmark for lesson:", lessonId)
  }

  const shareLesson = (lessonId: number) => {
    console.log("Share lesson:", lessonId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Engineering Lessons</h1>
          <p className="text-gray-600">Learn from expert instructors with comprehensive video lessons</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search lessons, instructors, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-full lg:w-[200px]">
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

                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-full lg:w-[150px]">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level === "All Levels" ? "all" : level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                  <SelectTrigger className="w-full lg:w-[150px]">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((duration) => (
                      <SelectItem key={duration} value={duration === "All Durations" ? "all" : duration}>
                        {duration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full lg:w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2 ml-auto">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {sortedLessons.length} of {lessons.length} lessons
          </p>
        </div>

        {/* Lessons Grid/List */}
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
          {sortedLessons.map((lesson) => (
            <Card key={lesson.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              {viewMode === "grid" ? (
                <>
                  {/* Thumbnail */}
                  <div className="relative">
                    <img
                      src={lesson.thumbnail || "/placeholder.svg"}
                      alt={lesson.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                        <Play className="h-5 w-5 mr-2" />
                        Preview
                      </Button>
                    </div>
                    <Badge className="absolute top-3 left-3 bg-blue-600">{lesson.level}</Badge>
                    <Badge
                      className={`absolute top-3 right-3 ${lesson.price === "Free" ? "bg-green-600" : "bg-orange-600"}`}
                    >
                      {lesson.price}
                    </Badge>
                  </div>

                  <CardContent className="p-6">
                    <div className="mb-3">
                      <Badge variant="outline" className="text-xs mb-2">
                        {lesson.subject}
                      </Badge>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{lesson.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{lesson.description}</p>
                    </div>

                    {/* Instructor */}
                    <div className="flex items-center space-x-2 mb-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={lesson.instructor.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {lesson.instructor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{lesson.instructor.name}</p>
                        <p className="text-xs text-gray-500">{lesson.instructor.university}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{lesson.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{lesson.students.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{lesson.rating}</span>
                        <span className="text-gray-500">({lesson.reviews})</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <Button className="flex-1 mr-2" asChild>
                        <Link href={`/lessons/${lesson.id}`}>
                          <Play className="h-4 w-4 mr-2" />
                          {lesson.price === "Free" ? "Start Learning" : "Enroll Now"}
                        </Link>
                      </Button>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleBookmark(lesson.id)}
                          className={lesson.isBookmarked ? "text-red-600" : ""}
                        >
                          <Heart className={`h-4 w-4 ${lesson.isBookmarked ? "fill-current" : ""}`} />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => shareLesson(lesson.id)}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={lesson.thumbnail || "/placeholder.svg"}
                        alt={lesson.title}
                        className="w-32 h-20 object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {lesson.subject}
                            </Badge>
                            <Badge className="text-xs bg-blue-100 text-blue-800">{lesson.level}</Badge>
                            <Badge
                              className={`text-xs ${
                                lesson.price === "Free"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {lesson.price}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{lesson.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{lesson.description}</p>
                        </div>
                      </div>

                      {/* Instructor and Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={lesson.instructor.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {lesson.instructor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-700">{lesson.instructor.name}</span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{lesson.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{lesson.students.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span>{lesson.rating}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => toggleBookmark(lesson.id)}>
                            <Heart className={`h-4 w-4 ${lesson.isBookmarked ? "fill-current text-red-600" : ""}`} />
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={`/lessons/${lesson.id}`}>
                              {lesson.price === "Free" ? "Start Learning" : "Enroll Now"}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Lessons
          </Button>
        </div>
      </div>
    </div>
  )
}
