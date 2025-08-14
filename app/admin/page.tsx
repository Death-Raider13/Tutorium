"use client"

import { useState, useEffect } from "react"
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  addDoc,
  getDocs,
  setDoc,
  getDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import AuthGuard from "@/components/AuthGuard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import {
  Users,
  BookOpen,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  Trophy,
  Bell,
  FileText,
  Download,
  Eye,
  EyeOff,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface User {
  uid: string
  email: string
  displayName: string
  role: "student" | "lecturer" | "admin" | "pending"
  requestedRole?: "student" | "lecturer"
  emailVerified: boolean
  createdAt: any
  lastLoginAt: any
  isHardcodedAdmin?: boolean
  points?: number
  level?: number
  achievements?: string[]
  university?: string
  department?: string
}

interface SystemStats {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  students: number
  lecturers: number
  admins: number
  totalQuestions: number
  answeredQuestions: number
  totalLessons: number
  totalStudyGroups: number
  totalAchievements: number
  totalCertificates: number
}

interface Announcement {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  targetAudience: "all" | "students" | "lecturers"
  isActive: boolean
  createdAt: Date
  expiresAt?: Date
  createdBy: string
}

interface SystemSettings {
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailNotifications: boolean
  maxStudyGroupSize: number
  pointsPerQuestion: number
  pointsPerAnswer: number
  achievementNotifications: boolean
}

export default function AdminPage() {
  const { user, isAdmin } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    students: 0,
    lecturers: 0,
    admins: 0,
    totalQuestions: 0,
    answeredQuestions: 0,
    totalLessons: 0,
    totalStudyGroups: 0,
    totalAchievements: 0,
    totalCertificates: 0,
  })
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    maxStudyGroupSize: 20,
    pointsPerQuestion: 10,
    pointsPerAnswer: 15,
    achievementNotifications: true,
  })
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    type: "info" as const,
    targetAudience: "all" as const,
    expiresAt: "",
  })

  useEffect(() => {
    if (!isAdmin) return

    // Fetch users
    const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"))
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastLoginAt: doc.data().lastLoginAt?.toDate() || new Date(),
      })) as User[]

      setUsers(usersData)
      calculateStats(usersData)
    })

    // Fetch announcements
    const announcementsQuery = query(collection(db, "announcements"), orderBy("createdAt", "desc"))
    const unsubscribeAnnouncements = onSnapshot(announcementsQuery, (snapshot) => {
      const announcementsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        expiresAt: doc.data().expiresAt?.toDate(),
      })) as Announcement[]

      setAnnouncements(announcementsData)
    })

    // Fetch system settings
    const fetchSettings = async () => {
      try {
        const settingsDoc = doc(db, "systemSettings", "main")
        const settingsSnap = await getDoc(settingsDoc)

        if (settingsSnap.exists()) {
          const settingsData = settingsSnap.data() as SystemSettings
          setSystemSettings(settingsData)
        } else {
          // Create default settings if they don't exist
          const defaultSettings = {
            maintenanceMode: false,
            registrationEnabled: true,
            emailNotifications: true,
            maxStudyGroupSize: 20,
            pointsPerQuestion: 10,
            pointsPerAnswer: 15,
            achievementNotifications: true,
          }
          await setDoc(settingsDoc, defaultSettings)
          setSystemSettings(defaultSettings)
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
        // Use default settings if there's an error
        setSystemSettings({
          maintenanceMode: false,
          registrationEnabled: true,
          emailNotifications: true,
          maxStudyGroupSize: 20,
          pointsPerQuestion: 10,
          pointsPerAnswer: 15,
          achievementNotifications: true,
        })
      }
    }

    fetchSettings()
    setLoading(false)

    return () => {
      unsubscribeUsers()
      unsubscribeAnnouncements()
    }
  }, [isAdmin])

  const calculateStats = async (usersData: User[]) => {
    try {
      // Calculate user stats
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const activeUsers = usersData.filter((u) => u.lastLoginAt && new Date(u.lastLoginAt) > thirtyDaysAgo).length

      const pendingUsers = usersData.filter((u) => u.role === "pending").length
      const students = usersData.filter((u) => u.role === "student").length
      const lecturers = usersData.filter((u) => u.role === "lecturer").length
      const admins = usersData.filter((u) => u.role === "admin").length

      // Fetch other stats with error handling
      let totalQuestions = 0
      let answeredQuestions = 0
      let totalLessons = 0
      let totalStudyGroups = 0

      try {
        const questionsSnap = await getDocs(collection(db, "questions"))
        totalQuestions = questionsSnap.size
        answeredQuestions = questionsSnap.docs.filter(
          (doc) => doc.data().answers && doc.data().answers.length > 0,
        ).length
      } catch (error) {
        console.log("Questions collection not found, using default values")
      }

      try {
        const lessonsSnap = await getDocs(collection(db, "lessons"))
        totalLessons = lessonsSnap.size
      } catch (error) {
        console.log("Lessons collection not found, using default values")
      }

      try {
        const studyGroupsSnap = await getDocs(collection(db, "studyGroups"))
        totalStudyGroups = studyGroupsSnap.size
      } catch (error) {
        console.log("Study groups collection not found, using default values")
      }

      setStats({
        totalUsers: usersData.length,
        activeUsers,
        pendingUsers,
        students,
        lecturers,
        admins,
        totalQuestions,
        answeredQuestions,
        totalLessons,
        totalStudyGroups,
        totalAchievements: usersData.reduce((sum, u) => sum + (u.achievements?.length || 0), 0),
        totalCertificates: 0, // This would be calculated from certificates collection
      })
    } catch (error) {
      console.error("Error calculating stats:", error)
    }
  }

  const handleUserRoleUpdate = async (userId: string, newRole: string) => {
    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date(),
      })
      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      })
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      await deleteDoc(doc(db, "users", userId))
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const announcementData = {
        ...newAnnouncement,
        isActive: true,
        createdAt: new Date(),
        createdBy: user?.uid,
        expiresAt: newAnnouncement.expiresAt ? new Date(newAnnouncement.expiresAt) : null,
      }

      await addDoc(collection(db, "announcements"), announcementData)
      toast({
        title: "Success",
        description: "Announcement created successfully",
      })
      setShowCreateAnnouncement(false)
      setNewAnnouncement({
        title: "",
        message: "",
        type: "info",
        targetAudience: "all",
        expiresAt: "",
      })
    } catch (error) {
      console.error("Error creating announcement:", error)
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive",
      })
    }
  }

  const handleToggleAnnouncement = async (announcementId: string, isActive: boolean) => {
    try {
      const announcementRef = doc(db, "announcements", announcementId)
      await updateDoc(announcementRef, { isActive: !isActive })
      toast({
        title: "Success",
        description: `Announcement ${!isActive ? "activated" : "deactivated"}`,
      })
    } catch (error) {
      console.error("Error toggling announcement:", error)
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      })
    }
  }

  const handleUpdateSettings = async (newSettings: Partial<SystemSettings>) => {
    try {
      const settingsRef = doc(db, "systemSettings", "main")
      const updatedSettings = { ...systemSettings, ...newSettings }

      // Validate numeric values to prevent NaN
      if (
        updatedSettings.maxStudyGroupSize &&
        (isNaN(updatedSettings.maxStudyGroupSize) ||
          updatedSettings.maxStudyGroupSize < 5 ||
          updatedSettings.maxStudyGroupSize > 100)
      ) {
        toast({
          title: "Error",
          description: "Max study group size must be between 5 and 100",
          variant: "destructive",
        })
        return
      }

      if (
        updatedSettings.pointsPerQuestion &&
        (isNaN(updatedSettings.pointsPerQuestion) ||
          updatedSettings.pointsPerQuestion < 1 ||
          updatedSettings.pointsPerQuestion > 100)
      ) {
        toast({
          title: "Error",
          description: "Points per question must be between 1 and 100",
          variant: "destructive",
        })
        return
      }

      if (
        updatedSettings.pointsPerAnswer &&
        (isNaN(updatedSettings.pointsPerAnswer) ||
          updatedSettings.pointsPerAnswer < 1 ||
          updatedSettings.pointsPerAnswer > 100)
      ) {
        toast({
          title: "Error",
          description: "Points per answer must be between 1 and 100",
          variant: "destructive",
        })
        return
      }

      // Use setDoc with merge to ensure the document exists and handle permissions
      await setDoc(settingsRef, updatedSettings, { merge: true })

      setSystemSettings(updatedSettings)
      toast({
        title: "Success",
        description: "Settings updated successfully",
      })
    } catch (error) {
      console.error("Error updating settings:", error)

      // Handle specific permission errors
      if (error.code === "permission-denied") {
        toast({
          title: "Permission Error",
          description: "You don't have permission to update system settings. Please contact a system administrator.",
          variant: "destructive",
        })
      } else if (error.code === "unavailable") {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the database. Please check your internet connection and try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update settings. Please try again later.",
          variant: "destructive",
        })
      }
    }
  }

  const exportUserData = () => {
    const csvContent = [
      ["Email", "Display Name", "Role", "University", "Department", "Points", "Level", "Created At", "Last Login"].join(
        ",",
      ),
      ...users.map((user) =>
        [
          user.email,
          user.displayName || "",
          user.role,
          user.university || "",
          user.department || "",
          user.points || 0,
          user.level || 1,
          user.createdAt?.toISOString() || "",
          user.lastLoginAt?.toISOString() || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tutorium-users-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleModerateQuestions = async () => {
    toast({
      title: "Feature Coming Soon",
      description: "Question moderation interface is being developed",
    })
  }

  const handleManageLessons = async () => {
    toast({
      title: "Feature Coming Soon",
      description: "Lesson management interface is being developed",
    })
  }

  const handleReviewStudyGroups = async () => {
    toast({
      title: "Feature Coming Soon",
      description: "Study group review interface is being developed",
    })
  }

  const handleManageAchievements = async () => {
    toast({
      title: "Feature Coming Soon",
      description: "Achievement management interface is being developed",
    })
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "lecturer":
        return "default"
      case "student":
        return "secondary"
      case "pending":
        return "outline"
      default:
        return "outline"
    }
  }

  const getAnnouncementTypeColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A"
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  // Helper function to safely display numbers
  const safeNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return "0"
    }
    return value.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading admin dashboard..." />
      </div>
    )
  }

  return (
    <AuthGuard requireAuth={true} allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="h-8 w-8 text-red-600" />
                  Engineering Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, {user?.displayName}! Manage your engineering education platform.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={exportUserData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Badge className="bg-red-100 text-red-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Administrator
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeNumber(stats.totalUsers)}</div>
                <p className="text-xs text-muted-foreground">{safeNumber(stats.activeUsers)} active this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{safeNumber(stats.pendingUsers)}</div>
                <p className="text-xs text-muted-foreground">Require your attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engineering Questions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeNumber(stats.totalQuestions)}</div>
                <p className="text-xs text-muted-foreground">{safeNumber(stats.answeredQuestions)} answered</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Study Groups</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeNumber(stats.totalStudyGroups)}</div>
                <p className="text-xs text-muted-foreground">Active communities</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage all registered engineering students and lecturers</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>University</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((userData) => (
                        <TableRow key={userData.uid}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{userData.displayName || "No name"}</div>
                              {userData.isHardcodedAdmin && (
                                <Badge variant="destructive" className="text-xs">
                                  System Admin
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{userData.email}</TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(userData.role)}>{userData.role}</Badge>
                          </TableCell>
                          <TableCell className="max-w-32 truncate">{userData.university || "N/A"}</TableCell>
                          <TableCell className="max-w-32 truncate">{userData.department || "N/A"}</TableCell>
                          <TableCell>{safeNumber(userData.points)}</TableCell>
                          <TableCell>
                            <Badge variant={userData.emailVerified ? "default" : "outline"}>
                              {userData.emailVerified ? "Verified" : "Unverified"}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(userData.lastLoginAt)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {!userData.isHardcodedAdmin && (
                                <>
                                  <Select
                                    value={userData.role}
                                    onValueChange={(value) => handleUserRoleUpdate(userData.uid, value)}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="student">Student</SelectItem>
                                      <SelectItem value="lecturer">Lecturer</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedUser(userData)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteUser(userData.uid)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Approvals</CardTitle>
                  <CardDescription>Review and approve user role requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {users.filter((u) => u.role === "pending" && u.requestedRole).length === 0 ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>No pending approvals at this time.</AlertDescription>
                    </Alert>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>University</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Requested Role</TableHead>
                          <TableHead>Requested On</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users
                          .filter((u) => u.role === "pending" && u.requestedRole)
                          .map((userData) => (
                            <TableRow key={userData.uid}>
                              <TableCell>{userData.displayName || "No name"}</TableCell>
                              <TableCell>{userData.email}</TableCell>
                              <TableCell>{userData.university || "N/A"}</TableCell>
                              <TableCell>{userData.department || "N/A"}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{userData.requestedRole}</Badge>
                              </TableCell>
                              <TableCell>{formatDate(userData.createdAt)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleUserRoleUpdate(userData.uid, userData.requestedRole!)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUserRoleUpdate(userData.uid, "pending")}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Engineering Content Overview</CardTitle>
                    <CardDescription>Platform content statistics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Total Questions
                      </span>
                      <span className="font-bold">{safeNumber(stats.totalQuestions)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Answered Questions
                      </span>
                      <span className="font-bold">{safeNumber(stats.answeredQuestions)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Engineering Lessons
                      </span>
                      <span className="font-bold">{safeNumber(stats.totalLessons)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Study Groups
                      </span>
                      <span className="font-bold">{safeNumber(stats.totalStudyGroups)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Achievements Earned
                      </span>
                      <span className="font-bold">{safeNumber(stats.totalAchievements)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Management</CardTitle>
                    <CardDescription>Manage platform content and moderation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full bg-transparent" variant="outline" onClick={handleModerateQuestions}>
                      <FileText className="h-4 w-4 mr-2" />
                      Moderate Engineering Questions
                    </Button>
                    <Button className="w-full bg-transparent" variant="outline" onClick={handleManageLessons}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Manage Engineering Lessons
                    </Button>
                    <Button className="w-full bg-transparent" variant="outline" onClick={handleReviewStudyGroups}>
                      <Users className="h-4 w-4 mr-2" />
                      Review Study Groups
                    </Button>
                    <Button className="w-full bg-transparent" variant="outline" onClick={handleManageAchievements}>
                      <Trophy className="h-4 w-4 mr-2" />
                      Manage Achievements
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="announcements">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">System Announcements</h3>
                    <p className="text-sm text-gray-600">Create and manage platform-wide announcements</p>
                  </div>
                  <Dialog open={showCreateAnnouncement} onOpenChange={setShowCreateAnnouncement}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Announcement
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Announcement</DialogTitle>
                        <DialogDescription>
                          Create a new announcement for your engineering platform users
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={newAnnouncement.title}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                            placeholder="Announcement title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            id="message"
                            value={newAnnouncement.message}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                            placeholder="Announcement message"
                            rows={4}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="type">Type</Label>
                            <Select
                              value={newAnnouncement.type}
                              onValueChange={(value: any) => setNewAnnouncement({ ...newAnnouncement, type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="success">Success</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="audience">Target Audience</Label>
                            <Select
                              value={newAnnouncement.targetAudience}
                              onValueChange={(value: any) =>
                                setNewAnnouncement({ ...newAnnouncement, targetAudience: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                <SelectItem value="students">Engineering Students Only</SelectItem>
                                <SelectItem value="lecturers">Engineering Lecturers Only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="expires">Expires At (Optional)</Label>
                          <Input
                            id="expires"
                            type="datetime-local"
                            value={newAnnouncement.expiresAt}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, expiresAt: e.target.value })}
                          />
                        </div>
                        <Button onClick={handleCreateAnnouncement} className="w-full">
                          Create Announcement
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {announcements.length === 0 ? (
                        <div className="text-center py-8">
                          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements yet</h3>
                          <p className="text-gray-600">Create your first announcement to communicate with users</p>
                        </div>
                      ) : (
                        announcements.map((announcement) => (
                          <div key={announcement.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold">{announcement.title}</h4>
                                  <Badge className={getAnnouncementTypeColor(announcement.type)}>
                                    {announcement.type}
                                  </Badge>
                                  <Badge variant="outline">{announcement.targetAudience}</Badge>
                                  {announcement.isActive ? (
                                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                                  ) : (
                                    <Badge variant="outline">Inactive</Badge>
                                  )}
                                </div>
                                <p className="text-gray-600 mb-2">{announcement.message}</p>
                                <div className="text-xs text-gray-500">
                                  Created: {formatDate(announcement.createdAt)}
                                  {announcement.expiresAt && (
                                    <span> • Expires: {formatDate(announcement.expiresAt)}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleAnnouncement(announcement.id, announcement.isActive)}
                                >
                                  {announcement.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  {announcement.isActive ? "Deactivate" : "Activate"}
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>Engineering platform user registration trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Total Users</span>
                        <span className="font-bold">{safeNumber(stats.totalUsers)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Active Users (30 days)</span>
                        <span className="font-bold">{safeNumber(stats.activeUsers)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Engineering Students</span>
                        <span className="font-bold">{safeNumber(stats.students)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Engineering Lecturers</span>
                        <span className="font-bold">{safeNumber(stats.lecturers)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Metrics</CardTitle>
                    <CardDescription>Platform activity overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Engineering Questions Asked</span>
                        <span className="font-bold">{safeNumber(stats.totalQuestions)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Answer Rate</span>
                        <span className="font-bold">
                          {stats.totalQuestions > 0
                            ? Math.round((stats.answeredQuestions / stats.totalQuestions) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Study Groups</span>
                        <span className="font-bold">{safeNumber(stats.totalStudyGroups)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Achievements Earned</span>
                        <span className="font-bold">{safeNumber(stats.totalAchievements)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Settings</CardTitle>
                    <CardDescription>Configure platform-wide settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="maintenance">Maintenance Mode</Label>
                        <p className="text-sm text-gray-600">Temporarily disable the platform</p>
                      </div>
                      <Switch
                        id="maintenance"
                        checked={systemSettings.maintenanceMode}
                        onCheckedChange={(checked) => handleUpdateSettings({ maintenanceMode: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="registration">User Registration</Label>
                        <p className="text-sm text-gray-600">Allow new user registrations</p>
                      </div>
                      <Switch
                        id="registration"
                        checked={systemSettings.registrationEnabled}
                        onCheckedChange={(checked) => handleUpdateSettings({ registrationEnabled: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications">Email Notifications</Label>
                        <p className="text-sm text-gray-600">Send system email notifications</p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={systemSettings.emailNotifications}
                        onCheckedChange={(checked) => handleUpdateSettings({ emailNotifications: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="achievementNotifs">Achievement Notifications</Label>
                        <p className="text-sm text-gray-600">Notify users of new achievements</p>
                      </div>
                      <Switch
                        id="achievementNotifs"
                        checked={systemSettings.achievementNotifications}
                        onCheckedChange={(checked) => handleUpdateSettings({ achievementNotifications: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Configuration</CardTitle>
                    <CardDescription>Adjust platform parameters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="maxGroupSize">Max Study Group Size</Label>
                      <Input
                        id="maxGroupSize"
                        type="number"
                        value={systemSettings.maxStudyGroupSize || ""}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value)
                          if (!isNaN(value) && value >= 5 && value <= 100) {
                            handleUpdateSettings({ maxStudyGroupSize: value })
                          }
                        }}
                        min="5"
                        max="100"
                        className="mt-1"
                        placeholder="20"
                      />
                      <p className="text-xs text-gray-600 mt-1">Between 5 and 100 members</p>
                    </div>

                    <div>
                      <Label htmlFor="questionPoints">Points per Question</Label>
                      <Input
                        id="questionPoints"
                        type="number"
                        value={systemSettings.pointsPerQuestion || ""}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value)
                          if (!isNaN(value) && value >= 1 && value <= 100) {
                            handleUpdateSettings({ pointsPerQuestion: value })
                          }
                        }}
                        min="1"
                        max="100"
                        className="mt-1"
                        placeholder="10"
                      />
                      <p className="text-xs text-gray-600 mt-1">Points awarded for asking questions</p>
                    </div>

                    <div>
                      <Label htmlFor="answerPoints">Points per Answer</Label>
                      <Input
                        id="answerPoints"
                        type="number"
                        value={systemSettings.pointsPerAnswer || ""}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value)
                          if (!isNaN(value) && value >= 1 && value <= 100) {
                            handleUpdateSettings({ pointsPerAnswer: value })
                          }
                        }}
                        min="1"
                        max="100"
                        className="mt-1"
                        placeholder="15"
                      />
                      <p className="text-xs text-gray-600 mt-1">Points awarded for providing answers</p>
                    </div>

                    <Alert>
                      <Settings className="h-4 w-4" />
                      <AlertDescription>
                        Settings are automatically saved when changed. Changes take effect immediately.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
