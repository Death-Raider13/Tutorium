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
import { Search, Filter, Play, Users, Star, BookOpen, Grid3X3, List } from "lucide-react"

// Mock data
const lessons = [
  {
    id: 1,
    title: "Fundamentals of Structural Analysis",
    description:
      "Learn the basic principles of structural analysis including force equilibrium, moment distribution, and deflection calculations.",
    category: "Civil Engineering",
    subcategory: "Structural Engineering",
    instructor: {
      name: "Dr. Adebayo Ogundimu",
      avatar: "/placeholder-user.jpg",
      title: "Professor of Structural Engineering",
      university: "University of Ibadan",
      rating: 4.9,
    },
    duration: "2h 45m",
    students: 1234,
    rating: 4.8,
    reviews: 156,
    level: "Intermediate",
    thumbnail: "/placeholder.jpg",
    price: "Free",
    tags: ["structural-analysis", "engineering-mechanics", "beam-theory"],
    lastUpdated: "2 weeks ago",
    chapters: 12,
    isEnrolled: false,
  },
  {
    id: 2,
    title: "Thermodynamics for Mechanical Engineers",
    description:
      "Comprehensive course covering the laws of thermodynamics, heat engines, refrigeration cycles, and energy systems.",
    category: "Mechanical Engineering",
    subcategory: "Thermodynamics",
    instructor: {
      name: "Prof. Amina Hassan",
      avatar: "/placeholder-user.jpg",
      title: "Mechanical Engineering Professor",
      university: "Ahmadu Bello University",
      rating: 4.7,
    },
    duration: "3h 20m",
    students: 987,
    rating: 4.6,
    reviews: 89,
    level: "Beginner",
    thumbnail: "/placeholder.jpg",
    price: "₦15,000",
    tags: ["thermodynamics", "heat-transfer", "energy-systems"],
    lastUpdated: "1 week ago",
    chapters: 15,
    isEnrolled: true,
  },
  {
    id: 3,
    title: "Circuit Analysis and Design",
    description:
      "Master the fundamentals of electrical circuits, including AC/DC analysis, network theorems, and circuit design principles.",
    category: "Electrical Engineering",
    subcategory: "Circuit Analysis",
    instructor: {
      name: "Dr. Chukwuma Okafor",
      avatar: "/placeholder-user.jpg",
      title: "Electrical Engineering Lecturer",
      university: "University of Nigeria, Nsukka",
      rating: 4.8,
    },
    duration: "4h 15m",
    students: 756,
    rating: 4.9,
    reviews: 124,
    level: "Intermediate",
    thumbnail: "/placeholder.jpg",
    price: "₦20,000",
    tags: ["circuit-analysis", "electrical-networks", "ac-dc"],
    lastUpdated: "3 days ago",
    chapters: 18,
    isEnrolled: false,
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

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"]

export default function LessonsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedLevel, setSelectedLevel] = useState("All Levels")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("popular")

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All Categories" || lesson.category === selectedCategory
    const matchesLevel = selectedLevel === "All Levels" || lesson.level === selectedLevel
    return matchesSearch && matchesCategory && matchesLevel
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredLessons.map((lesson) => (
        <Card key={lesson.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative">
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              <Play className="h-12 w-12 text-gray-400" />
            </div>
            <div className="absolute top-2 right-2">
              <Badge className={getLevelColor(lesson.level)}>{lesson.level}</Badge>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
              {lesson.duration}
            </div>
          </div>

          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg line-clamp-2 hover:text-blue-600 transition-colors">
                  <Link href={`/lessons/${lesson.id}`}>{lesson.title}</Link>
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mt-1">{lesson.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={lesson.instructor.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {lesson.instructor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{lesson.instructor.name}</p>
                  <p className="text-gray-500 text-xs truncate">{lesson.instructor.university}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{lesson.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{lesson.students}</span>
                  </div>
                </div>
                <div className="font-semibold text-blue-600">{lesson.price}</div>
              </div>

              <div className="flex flex-wrap gap-1">
                {lesson.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {lesson.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{lesson.tags.length - 2}
                  </Badge>
                )}
              </div>

              <Button className="w-full" variant={lesson.isEnrolled ? "outline" : "default"}>
                {lesson.isEnrolled ? "Continue Learning" : "Enroll Now"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderListView = () => (
    <div className="space-y-4">
      {filteredLessons.map((lesson) => (
        <Card key={lesson.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Play className="h-8 w-8 text-gray-400" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  {lesson.duration}
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getLevelColor(lesson.level)}>{lesson.level}</Badge>
                      <Badge variant="outline">{lesson.category}</Badge>
                    </div>
                    <h3 className="text-xl font-semibold hover:text-blue-600 transition-colors">
                      <Link href={`/lessons/${lesson.id}`}>{lesson.title}</Link>
                    </h3>
                    <p className="text-gray-600 mt-1 line-clamp-2">{lesson.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg text-blue-600 mb-1">{lesson.price}</div>
                    <Button variant={lesson.isEnrolled ? "outline" : "default"} size="sm">
                      {lesson.isEnrolled ? "Continue" : "Enroll"}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={lesson.instructor.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {lesson.instructor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{lesson.instructor.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{lesson.rating}</span>
                    <span>({lesson.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{lesson.students} students</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <BookOpen className="h-4 w-4" />
                    <span>{lesson.chapters} chapters</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {lesson.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Video Lessons</h1>
              <p className="text-gray-600 mt-1">Learn from certified engineering professionals</p>
            </div>
            <div className="flex items-center gap-2">
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search lessons..."
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
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Level</label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
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
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Learning Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Learning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Enrolled Courses</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="font-semibold text-blue-600">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Hours</span>
                  <span className="font-semibold">24.5h</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="all" className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="all">All Lessons</TabsTrigger>
                  <TabsTrigger value="enrolled">My Courses</TabsTrigger>
                  <TabsTrigger value="free">Free</TabsTrigger>
                  <TabsTrigger value="premium">Premium</TabsTrigger>
                </TabsList>

                <p className="text-gray-600 text-sm">
                  {filteredLessons.length} lesson{filteredLessons.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <TabsContent value="all">{viewMode === "grid" ? renderGridView() : renderListView()}</TabsContent>

              <TabsContent value="enrolled">
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No enrolled courses yet</h3>
                  <p className="text-gray-500 mb-4">Start learning by enrolling in your first course!</p>
                  <Button>Browse All Lessons</Button>
                </div>
              </TabsContent>

              <TabsContent value="free">{viewMode === "grid" ? renderGridView() : renderListView()}</TabsContent>

              <TabsContent value="premium">{viewMode === "grid" ? renderGridView() : renderListView()}</TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
