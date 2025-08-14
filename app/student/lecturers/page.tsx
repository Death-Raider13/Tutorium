"use client"

import { useState, useEffect } from "react"
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  limit,
  getDocs,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import AuthGuard from "@/components/AuthGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  GraduationCap,
  Search,
  Star,
  BookOpen,
  Users,
  MessageSquare,
  Bell,
  BellOff,
  Filter,
  MapPin,
  Award,
  Clock,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { SUBJECTS as ENGINEERING_DEPARTMENTS, NIGERIAN_UNIVERSITIES } from "@/lib/constants"
import { toast } from "@/hooks/use-toast"

interface Lecturer {
  id: string
  displayName: string
  email: string
  profileImage?: string
  bio?: string
  university?: string
  department?: string
  specializations: string[]
  experience?: string
  education?: string
  researchInterests?: string
  rating: number
  totalLessons: number
  totalStudents: number
  questionsAnswered: number
  joinedAt: Date
  lastActive: Date
  isVerified: boolean
  staffId?: string
  isOnline?: boolean
  role: string
}

interface Subscription {
  id: string
  studentId: string
  lecturerId: string
  lecturerEmail: string
  createdAt: Date
  notificationsEnabled: boolean
}

export default function FindLecturersPage() {
  const { user } = useAuth()
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [filteredLecturers, setFilteredLecturers] = useState<Lecturer[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedUniversity, setSelectedUniversity] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [subscribing, setSubscribing] = useState<string | null>(null)

  const formatDistanceToNow = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  useEffect(() => {
    if (!user) return

    console.log("Starting to fetch lecturers...")
    setError(null)

    // Fetch all lecturers with real-time updates - removed orderBy to avoid index requirement
    const lecturersQuery = query(collection(db, "users"), where("role", "==", "lecturer"), limit(50))

    const unsubscribeLecturers = onSnapshot(
      lecturersQuery,
      async (snapshot) => {
        console.log("Lecturers snapshot received:", snapshot.size, "documents")

        try {
          const lecturersData = await Promise.all(
            snapshot.docs.map(async (docSnapshot) => {
              const data = docSnapshot.data()
              console.log("Processing lecturer:", data.email)

              // Generate mock stats for demonstration
              const mockStats = {
                totalLessons: Math.floor(Math.random() * 20) + 1,
                questionsAnswered: Math.floor(Math.random() * 50) + 1,
                totalStudents: Math.floor(Math.random() * 100) + 1,
                rating: 3.5 + Math.random() * 1.5, // Rating between 3.5-5.0
                isVerified: Math.random() > 0.3, // 70% verified
                isOnline: Math.random() > 0.5, // 50% online
              }

              return {
                id: docSnapshot.id,
                displayName:
                  data.displayName || data.firstName + " " + data.lastName || data.email?.split("@")[0] || "Unknown",
                email: data.email,
                profileImage: data.profileImage,
                bio:
                  data.bio ||
                  `Experienced ${data.department || "Engineering"} lecturer passionate about teaching and research.`,
                university:
                  data.university || NIGERIAN_UNIVERSITIES[Math.floor(Math.random() * NIGERIAN_UNIVERSITIES.length)],
                department:
                  data.department ||
                  ENGINEERING_DEPARTMENTS[Math.floor(Math.random() * ENGINEERING_DEPARTMENTS.length)],
                specializations: data.specializations || [
                  ENGINEERING_DEPARTMENTS[Math.floor(Math.random() * ENGINEERING_DEPARTMENTS.length)],
                  ENGINEERING_DEPARTMENTS[Math.floor(Math.random() * ENGINEERING_DEPARTMENTS.length)],
                ],
                experience: data.experience,
                education: data.education,
                researchInterests: data.researchInterests,
                joinedAt: data.createdAt?.toDate() || new Date(),
                lastActive: data.lastActive?.toDate() || new Date(),
                staffId: data.staffId,
                role: data.role,
                ...mockStats,
              } as Lecturer
            }),
          )

          console.log("Processed lecturers:", lecturersData.length)

          // Sort lecturers by creation date (newest first) on client side
          lecturersData.sort((a, b) => b.joinedAt.getTime() - a.joinedAt.getTime())

          setLecturers(lecturersData)
          setLoading(false)
        } catch (err) {
          console.error("Error processing lecturers:", err)
          setError("Failed to load lecturer data")
          setLoading(false)
        }
      },
      (err) => {
        console.error("Error fetching lecturers:", err)
        setError("Failed to connect to database. Please check your connection.")
        setLoading(false)
      },
    )

    return () => {
      console.log("Cleaning up lecturers listener")
      unsubscribeLecturers()
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    console.log("Starting to fetch subscriptions...")

    // Try to fetch user's subscriptions with better error handling
    const fetchSubscriptions = async () => {
      try {
        // First, try to check if the subscriptions collection exists and we have access
        const subscriptionsRef = collection(db, "subscriptions")
        const subscriptionsQuery = query(subscriptionsRef, where("studentId", "==", user.uid), limit(1))

        // Test access with a simple query first
        const testSnapshot = await getDocs(subscriptionsQuery)
        console.log("Subscriptions access test successful")

        // If test succeeds, fetch all subscriptions
        const fullQuery = query(subscriptionsRef, where("studentId", "==", user.uid))
        const snapshot = await getDocs(fullQuery)
        console.log("Subscriptions snapshot received:", snapshot.size, "documents")

        const subscriptionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Subscription[]

        setSubscriptions(subscriptionsData)

        // Set up real-time listener only if initial fetch succeeds
        const unsubscribeSubscriptions = onSnapshot(
          fullQuery,
          (snapshot) => {
            const subscriptionsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
            })) as Subscription[]
            setSubscriptions(subscriptionsData)
          },
          (err) => {
            console.error("Error in subscriptions listener:", err)
            // Silently handle listener errors, keep existing data
          },
        )

        return unsubscribeSubscriptions
      } catch (err) {
        console.error("Error fetching subscriptions:", err)

        // Check if it's a permissions error
        if (err instanceof Error && err.message.includes("permissions")) {
          console.log("Permissions error detected, initializing empty subscriptions")
          // Initialize subscriptions collection for this user if it doesn't exist
          try {
            // Create a dummy subscription document to initialize the collection
            // This will be immediately deleted but ensures the collection exists
            const dummyDoc = await addDoc(collection(db, "subscriptions"), {
              studentId: user.uid,
              lecturerId: "dummy",
              createdAt: serverTimestamp(),
              _temp: true,
            })

            // Delete the dummy document
            await deleteDoc(doc(db, "subscriptions", dummyDoc.id))
            console.log("Subscriptions collection initialized")

            // Retry fetching after initialization
            setTimeout(() => {
              fetchSubscriptions()
            }, 1000)
          } catch (initError) {
            console.error("Error initializing subscriptions collection:", initError)
            // If we can't initialize, just use empty subscriptions
            setSubscriptions([])
          }
        } else {
          // For other errors, just use empty subscriptions
          setSubscriptions([])
        }

        return null
      }
    }

    let unsubscribeSubscriptions: (() => void) | null = null

    fetchSubscriptions().then((unsub) => {
      unsubscribeSubscriptions = unsub
    })

    return () => {
      if (unsubscribeSubscriptions) {
        console.log("Cleaning up subscriptions listener")
        unsubscribeSubscriptions()
      }
    }
  }, [user])

  useEffect(() => {
    let filtered = lecturers

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (lecturer) =>
          lecturer.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lecturer.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lecturer.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lecturer.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lecturer.specializations.some((spec) => spec.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by department
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(
        (lecturer) =>
          lecturer.department === selectedDepartment || lecturer.specializations.includes(selectedDepartment),
      )
    }

    // Filter by university
    if (selectedUniversity !== "all") {
      filtered = filtered.filter((lecturer) => lecturer.university === selectedUniversity)
    }

    // Sort lecturers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "students":
          return b.totalStudents - a.totalStudents
        case "lessons":
          return b.totalLessons - a.totalLessons
        case "recent":
          return b.lastActive.getTime() - a.lastActive.getTime()
        case "name":
          return a.displayName.localeCompare(b.displayName)
        default:
          return 0
      }
    })

    setFilteredLecturers(filtered)
  }, [lecturers, searchTerm, selectedDepartment, selectedUniversity, sortBy])

  const handleSubscribe = async (lecturerId: string) => {
    if (!user) return

    setSubscribing(lecturerId)

    try {
      // Check if already subscribed
      const existingSubscription = subscriptions.find((sub) => sub.lecturerId === lecturerId)

      if (existingSubscription) {
        // Unsubscribe
        await deleteDoc(doc(db, "subscriptions", existingSubscription.id))
        toast({
          title: "Unsubscribed",
          description: "You have unsubscribed from this lecturer",
        })
      } else {
        // Subscribe
        const lecturer = lecturers.find((l) => l.id === lecturerId)
        if (!lecturer) return

        try {
          await addDoc(collection(db, "subscriptions"), {
            studentId: user.uid,
            studentEmail: user.email,
            studentName: user.displayName || user.email,
            lecturerId: lecturerId,
            lecturerEmail: lecturer.email,
            lecturerName: lecturer.displayName,
            createdAt: serverTimestamp(),
            notificationsEnabled: true,
          })

          // Create notification for lecturer (optional, don't fail if this fails)
          try {
            await addDoc(collection(db, "notifications"), {
              userId: lecturerId,
              type: "subscription",
              title: "New student subscription",
              message: `${user.displayName || user.email} subscribed to your content`,
              data: {
                studentId: user.uid,
                studentName: user.displayName || user.email,
              },
              priority: "medium",
              isRead: false,
              createdAt: serverTimestamp(),
            })
          } catch (notificationError) {
            console.error("Error creating notification:", notificationError)
            // Don't fail the subscription if notification fails
          }

          toast({
            title: "Subscribed!",
            description: `You are now subscribed to ${lecturer.displayName}`,
          })
        } catch (subscribeError) {
          console.error("Error creating subscription:", subscribeError)

          if (subscribeError instanceof Error && subscribeError.message.includes("permissions")) {
            toast({
              title: "Permission Error",
              description: "Unable to create subscription. Please try refreshing the page.",
              variant: "destructive",
            })
          } else {
            throw subscribeError // Re-throw other errors
          }
        }
      }
    } catch (error) {
      console.error("Error managing subscription:", error)
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubscribing(null)
    }
  }

  const isSubscribed = (lecturerId: string) => {
    return subscriptions.some((sub) => sub.lecturerId === lecturerId)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getSubscribedLecturers = () => {
    const subscribedIds = subscriptions.map((sub) => sub.lecturerId)
    return lecturers.filter((lecturer) => subscribedIds.includes(lecturer.id))
  }

  const getTopLecturers = () => {
    return [...lecturers].sort((a, b) => b.rating - a.rating).slice(0, 10)
  }

  const getRecentlyJoined = () => {
    return [...lecturers].sort((a, b) => b.joinedAt.getTime() - a.joinedAt.getTime()).slice(0, 10)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading engineering lecturers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full bg-transparent"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <AuthGuard requireAuth={true} allowedRoles={["student"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              Find Engineering Lecturers
            </h1>
            <p className="text-gray-600 mt-1">
              Discover and subscribe to expert engineering lecturers from Nigerian universities
            </p>
          </div>

          <Tabs defaultValue="discover" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="discover">Discover ({filteredLecturers.length})</TabsTrigger>
              <TabsTrigger value="subscribed">Subscribed ({getSubscribedLecturers().length})</TabsTrigger>
              <TabsTrigger value="top-rated">Top Rated ({getTopLecturers().length})</TabsTrigger>
              <TabsTrigger value="new">New Lecturers ({getRecentlyJoined().length})</TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search lecturers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger>
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
                        <SelectValue placeholder="All Universities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Universities</SelectItem>
                        {NIGERIAN_UNIVERSITIES.map((university) => (
                          <SelectItem key={university} value={university}>
                            {university}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="students">Most Students</SelectItem>
                        <SelectItem value="lessons">Most Lessons</SelectItem>
                        <SelectItem value="recent">Recently Active</SelectItem>
                        <SelectItem value="name">Name A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center text-sm text-gray-600">
                      <Filter className="h-4 w-4 mr-1" />
                      {filteredLecturers.length} found
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lecturers Grid */}
              {filteredLecturers.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No lecturers found</h3>
                      <p className="text-gray-600">
                        {lecturers.length === 0
                          ? "No lecturers have joined the platform yet. Check back later!"
                          : "Try adjusting your search filters to find more lecturers."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLecturers.map((lecturer) => (
                    <Card key={lecturer.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Avatar className="h-16 w-16">
                              <AvatarImage
                                src={lecturer.profileImage || "/placeholder.svg"}
                                alt={lecturer.displayName}
                              />
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                                {getInitials(lecturer.displayName)}
                              </AvatarFallback>
                            </Avatar>
                            {lecturer.isOnline && (
                              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg truncate">{lecturer.displayName}</CardTitle>
                              {lecturer.isVerified && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  <Award className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{lecturer.rating.toFixed(1)}</span>
                              <span className="text-sm text-gray-500">({lecturer.totalStudents} students)</span>
                            </div>
                            {lecturer.university && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{lecturer.university}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <Clock className="h-3 w-3" />
                              <span className={lecturer.isOnline ? "text-green-600" : "text-gray-500"}>
                                {lecturer.isOnline
                                  ? "Online now"
                                  : `Last seen ${formatDistanceToNow(lecturer.lastActive)}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {lecturer.department && (
                            <Badge variant="outline" className="text-xs">
                              {lecturer.department}
                            </Badge>
                          )}

                          {lecturer.bio && <p className="text-sm text-gray-600 line-clamp-3">{lecturer.bio}</p>}

                          {lecturer.specializations.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-2">Specializations:</p>
                              <div className="flex flex-wrap gap-1">
                                {lecturer.specializations.slice(0, 3).map((spec, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {spec}
                                  </Badge>
                                ))}
                                {lecturer.specializations.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{lecturer.specializations.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4 text-green-500" />
                              <span>{lecturer.totalLessons}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4 text-blue-500" />
                              <span>{lecturer.questionsAnswered}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-purple-500" />
                              <span>{lecturer.totalStudents}</span>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleSubscribe(lecturer.id)}
                            disabled={subscribing === lecturer.id}
                            className={`w-full ${
                              isSubscribed(lecturer.id)
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            {subscribing === lecturer.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {isSubscribed(lecturer.id) ? "Unsubscribing..." : "Subscribing..."}
                              </>
                            ) : (
                              <>
                                {isSubscribed(lecturer.id) ? (
                                  <>
                                    <BellOff className="h-4 w-4 mr-2" />
                                    Unsubscribe
                                  </>
                                ) : (
                                  <>
                                    <Bell className="h-4 w-4 mr-2" />
                                    Subscribe
                                  </>
                                )}
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="subscribed" className="space-y-6">
              {getSubscribedLecturers().length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions yet</h3>
                      <p className="text-gray-600 mb-6">
                        Subscribe to engineering lecturers to get notified about their new content and live streams
                      </p>
                      <Button
                        onClick={() => {
                          const discoverTab = document.querySelector('[value="discover"]') as HTMLElement
                          discoverTab?.click()
                        }}
                      >
                        Discover Lecturers
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {getSubscribedLecturers().map((lecturer) => {
                    const subscription = subscriptions.find((sub) => sub.lecturerId === lecturer.id)
                    return (
                      <Card key={lecturer.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage
                                    src={lecturer.profileImage || "/placeholder.svg"}
                                    alt={lecturer.displayName}
                                  />
                                  <AvatarFallback className="bg-blue-100 text-blue-600">
                                    {getInitials(lecturer.displayName)}
                                  </AvatarFallback>
                                </Avatar>
                                {lecturer.isOnline && (
                                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{lecturer.displayName}</h3>
                                  {lecturer.isVerified && (
                                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                                      <Award className="h-3 w-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{lecturer.department}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                    {lecturer.rating.toFixed(1)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    {lecturer.totalLessons} lessons
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {lecturer.university}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Subscribed {formatDistanceToNow(subscription?.createdAt || new Date())}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-800">
                                <Bell className="h-3 w-3 mr-1" />
                                Subscribed
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSubscribe(lecturer.id)}
                                disabled={subscribing === lecturer.id}
                              >
                                {subscribing === lecturer.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Unsubscribe"
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="top-rated" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-yellow-500" />
                    Top Rated Engineering Lecturers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getTopLecturers().map((lecturer, index) => (
                      <div key={lecturer.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full font-bold">
                            #{index + 1}
                          </div>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={lecturer.profileImage || "/placeholder.svg"} alt={lecturer.displayName} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {getInitials(lecturer.displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{lecturer.displayName}</h3>
                              {lecturer.isVerified && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                  <Award className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{lecturer.department}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{lecturer.rating.toFixed(1)}</span>
                              <span className="text-sm text-gray-500">({lecturer.totalStudents} students)</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleSubscribe(lecturer.id)}
                          disabled={subscribing === lecturer.id}
                          variant={isSubscribed(lecturer.id) ? "destructive" : "default"}
                          size="sm"
                        >
                          {subscribing === lecturer.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isSubscribed(lecturer.id) ? (
                            "Unsubscribe"
                          ) : (
                            "Subscribe"
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="new" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    Recently Joined Lecturers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getRecentlyJoined().map((lecturer) => (
                      <div key={lecturer.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={lecturer.profileImage || "/placeholder.svg"} alt={lecturer.displayName} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {getInitials(lecturer.displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-sm">{lecturer.displayName}</h3>
                              {lecturer.isVerified && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                  <Award className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600">{lecturer.department}</p>
                            <p className="text-xs text-gray-500">Joined {formatDistanceToNow(lecturer.joinedAt)}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleSubscribe(lecturer.id)}
                          disabled={subscribing === lecturer.id}
                          variant={isSubscribed(lecturer.id) ? "destructive" : "default"}
                          size="sm"
                        >
                          {subscribing === lecturer.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isSubscribed(lecturer.id) ? (
                            "Unsubscribe"
                          ) : (
                            "Subscribe"
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
