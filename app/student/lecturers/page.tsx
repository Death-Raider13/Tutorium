"use client"

import { useState, useEffect } from "react"
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import AuthGuard from "@/components/AuthGuard"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Search,
  Star,
  Users,
  BookOpen,
  MessageSquare,
  MapPin,
  GraduationCap,
  Clock,
  Filter,
  SortAsc,
  UserPlus,
  UserMinus,
  Verified,
  Circle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { NIGERIAN_UNIVERSITIES, ENGINEERING_DEPARTMENTS } from "@/lib/constants"

interface Lecturer {
  uid: string
  displayName: string
  email: string
  bio?: string
  university?: string
  department?: string
  specializations?: string[]
  rating?: number
  totalStudents?: number
  totalLessons?: number
  totalQuestions?: number
  isVerified?: boolean
  isOnline?: boolean
  lastSeen?: Date
  profileImage?: string
  yearsOfExperience?: number
  subscribers?: string[]
  createdAt?: Date
}

interface Subscription {
  lecturerId: string
  studentId: string
  subscribedAt: Date
}

export default function FindLecturersPage() {
  const { user } = useAuth()
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [subscriptions, setSubscriptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [selectedUniversity, setSelectedUniversity] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("rating")
  const [subscribingTo, setSubscribingTo] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    // Fetch lecturers with real-time updates
    const lecturersQuery = query(collection(db, "users"), where("role", "==", "lecturer"), orderBy("createdAt", "desc"))

    const unsubscribeLecturers = onSnapshot(lecturersQuery, (snapshot) => {
      const lecturersData = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
        lastSeen: doc.data().lastSeen?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Lecturer[]

      setLecturers(lecturersData)
      setLoading(false)
    })

    // Fetch user's subscriptions with real-time updates
    const subscriptionsQuery = query(collection(db, "subscriptions"), where("studentId", "==", user.uid))

    const unsubscribeSubscriptions = onSnapshot(subscriptionsQuery, (snapshot) => {
      const subscriptionIds = snapshot.docs.map((doc) => doc.data().lecturerId)
      setSubscriptions(subscriptionIds)
    })

    return () => {
      unsubscribeLecturers()
      unsubscribeSubscriptions()
    }
  }, [user])

  const handleSubscribe = async (lecturerId: string) => {
    if (!user || subscribingTo) return

    setSubscribingTo(lecturerId)

    try {
      const isSubscribed = subscriptions.includes(lecturerId)

      if (isSubscribed) {
        // Unsubscribe
        const subscriptionQuery = query(
          collection(db, "subscriptions"),
          where("studentId", "==", user.uid),
          where("lecturerId", "==", lecturerId),
        )

        const subscriptionSnapshot = await getDocs(subscriptionQuery)
        if (!subscriptionSnapshot.empty) {
          await deleteDoc(subscriptionSnapshot.docs[0].ref)
        }

        // Update lecturer's subscriber count
        const lecturerRef = doc(db, "users", lecturerId)
        await updateDoc(lecturerRef, {
          subscribers: arrayRemove(user.uid),
          totalStudents: Math.max(0, (lecturers.find((l) => l.uid === lecturerId)?.totalStudents || 1) - 1),
        })

        toast({
          title: "Unsubscribed",
          description: "You have unsubscribed from this lecturer",
        })
      } else {
        // Subscribe
        await addDoc(collection(db, "subscriptions"), {
          studentId: user.uid,
          lecturerId: lecturerId,
          subscribedAt: new Date(),
        })

        // Update lecturer's subscriber count
        const lecturerRef = doc(db, "users", lecturerId)
        await updateDoc(lecturerRef, {
          subscribers: arrayUnion(user.uid),
          totalStudents: (lecturers.find((l) => l.uid === lecturerId)?.totalStudents || 0) + 1,
        })

        // Send notification to lecturer
        await addDoc(collection(db, "notifications"), {
          userId: lecturerId,
          type: "new_subscriber",
          title: "New Subscriber",
          message: `${user.displayName || user.email} has subscribed to your content`,
          isRead: false,
          createdAt: new Date(),
          data: {
            studentId: user.uid,
            studentName: user.displayName || user.email,
          },
        })

        toast({
          title: "Subscribed",
          description: "You have successfully subscribed to this lecturer",
        })
      }
    } catch (error) {
      console.error("Error updating subscription:", error)
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubscribingTo(null)
    }
  }

  const filteredAndSortedLecturers = lecturers
    .filter((lecturer) => {
      const matchesSearch =
        lecturer.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecturer.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecturer.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecturer.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecturer.specializations?.some((spec) => spec.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesDepartment = selectedDepartment === "all" || lecturer.department === selectedDepartment
      const matchesUniversity = selectedUniversity === "all" || lecturer.university === selectedUniversity

      return matchesSearch && matchesDepartment && matchesUniversity
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "students":
          return (b.totalStudents || 0) - (a.totalStudents || 0)
        case "lessons":
          return (b.totalLessons || 0) - (a.totalLessons || 0)
        case "activity":
          return new Date(b.lastSeen || 0).getTime() - new Date(a.lastSeen || 0).getTime()
        case "name":
          return (a.displayName || "").localeCompare(b.displayName || "")
        default:
          return 0
      }
    })

  const subscribedLecturers = filteredAndSortedLecturers.filter((lecturer) => subscriptions.includes(lecturer.uid))

  const topRatedLecturers = [...filteredAndSortedLecturers]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 10)

  const newLecturers = [...filteredAndSortedLecturers]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 10)

  const formatLastSeen = (lastSeen: Date | undefined) => {
    if (!lastSeen) return "Never"

    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60))

    if (diffInMinutes < 5) return "Online"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const LecturerCard = ({ lecturer }: { lecturer: Lecturer }) => {
    const isSubscribed = subscriptions.includes(lecturer.uid)
    const isLoading = subscribingTo === lecturer.uid

    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={lecturer.profileImage || "/placeholder.svg"} alt={lecturer.displayName} />
                  <AvatarFallback>
                    {lecturer.displayName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "L"}
                  </AvatarFallback>
                </Avatar>
                {lecturer.isOnline && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{lecturer.displayName}</h3>
                  {lecturer.isVerified && (
                    <Badge variant="secondary" className="text-xs">
                      <Verified className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{lecturer.rating?.toFixed(1) || "0.0"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{lecturer.totalStudents || 0} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{lecturer.totalLessons || 0} lessons</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                <Circle
                  className={`h-2 w-2 ${lecturer.isOnline ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400"}`}
                />
                <span>{formatLastSeen(lecturer.lastSeen)}</span>
              </div>
              <Button
                size="sm"
                variant={isSubscribed ? "outline" : "default"}
                onClick={() => handleSubscribe(lecturer.uid)}
                disabled={isLoading}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : isSubscribed ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-1" />
                    Unsubscribe
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Subscribe
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{lecturer.university || "University not specified"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-gray-500" />
              <span>{lecturer.department || "Department not specified"}</span>
            </div>
            {lecturer.bio && <p className="text-sm text-gray-600 line-clamp-2">{lecturer.bio}</p>}
            {lecturer.specializations && lecturer.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {lecturer.specializations.slice(0, 3).map((spec, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
                {lecturer.specializations.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{lecturer.specializations.length - 3} more
                  </Badge>
                )}
              </div>
            )}
            <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{lecturer.totalQuestions || 0} answered</span>
              </div>
              {lecturer.yearsOfExperience && <span>{lecturer.yearsOfExperience} years exp.</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading lecturers..." />
      </div>
    )
  }

  return (
    <AuthGuard requireAuth={true} allowedRoles={["student"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Engineering Lecturers</h1>
            <p className="text-gray-600">Discover and connect with engineering lecturers from Nigerian universities</p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search lecturers, universities, specializations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {ENGINEERING_DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                  <SelectTrigger>
                    <GraduationCap className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Universities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Universities</SelectItem>
                    {NIGERIAN_UNIVERSITIES.map((uni) => (
                      <SelectItem key={uni} value={uni}>
                        {uni}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SortAsc className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="students">Most Students</SelectItem>
                    <SelectItem value="lessons">Most Lessons</SelectItem>
                    <SelectItem value="activity">Most Active</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="discover" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="discover">Discover ({filteredAndSortedLecturers.length})</TabsTrigger>
              <TabsTrigger value="subscribed">Subscribed ({subscribedLecturers.length})</TabsTrigger>
              <TabsTrigger value="top-rated">Top Rated ({topRatedLecturers.length})</TabsTrigger>
              <TabsTrigger value="new">New Lecturers ({newLecturers.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="discover">
              <div className="space-y-6">
                {filteredAndSortedLecturers.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No lecturers found</h3>
                        <p className="text-gray-600">
                          Try adjusting your search criteria or filters to find more lecturers.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedLecturers.map((lecturer) => (
                      <LecturerCard key={lecturer.uid} lecturer={lecturer} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="subscribed">
              <div className="space-y-6">
                {subscribedLecturers.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions yet</h3>
                        <p className="text-gray-600">Subscribe to lecturers to see their content and get updates.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subscribedLecturers.map((lecturer) => (
                      <LecturerCard key={lecturer.uid} lecturer={lecturer} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="top-rated">
              <div className="space-y-6">
                {topRatedLecturers.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No rated lecturers yet</h3>
                        <p className="text-gray-600">
                          Lecturers will appear here once they receive ratings from students.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topRatedLecturers.map((lecturer, index) => (
                      <div key={lecturer.uid} className="relative">
                        {index < 3 && (
                          <Badge
                            className={`absolute -top-2 -right-2 z-10 ${
                              index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-amber-600"
                            }`}
                          >
                            #{index + 1}
                          </Badge>
                        )}
                        <LecturerCard lecturer={lecturer} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="new">
              <div className="space-y-6">
                {newLecturers.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No new lecturers</h3>
                        <p className="text-gray-600">New lecturers will appear here when they join the platform.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {newLecturers.map((lecturer) => (
                      <div key={lecturer.uid} className="relative">
                        <Badge className="absolute -top-2 -right-2 z-10 bg-green-500">New</Badge>
                        <LecturerCard lecturer={lecturer} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
