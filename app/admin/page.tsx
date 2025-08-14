"use client"

import { useState, useEffect } from "react"
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import AuthGuard from "@/components/AuthGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  GraduationCap,
  BookOpen,
  MessageSquare,
  Settings,
  Search,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Activity,
  Calendar,
  Loader2,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { SUBJECTS, NIGERIAN_UNIVERSITIES } from "@/lib/constants"

interface User {
  id: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
  role: "student" | "lecturer" | "admin"
  university?: string
  department?: string
  isActive: boolean
  isVerified: boolean
  createdAt: Date
  lastLoginAt?: Date
  profileImage?: string
}

interface SystemSettings {
  siteName: string
  siteDescription: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailNotificationsEnabled: boolean
  maxStudents: number
  maxLecturers: number
  announcement?: string
}

interface Stats {
  totalUsers: number
  totalStudents: number
  totalLecturers: number
  totalAdmins: number
  activeUsers: number
  newUsersThisMonth: number
  totalLessons: number
  totalQuestions: number
}

export default function AdminPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalStudents: 0,
    totalLecturers: 0,
    totalAdmins: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    totalLessons: 0,
    totalQuestions: 0,
  })
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "Tutorium",
    siteDescription: "Engineering Education Platform",
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotificationsEnabled: true,
    maxStudents: 10000,
    maxLecturers: 1000,
    announcement: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState<Partial<User>>({})

  // Helper function to safely convert numbers to strings
  const safeNumber = (value: any): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0"
    }
    return String(value)
  }

  useEffect(() => {
    if (!user) return

    // Fetch users with real-time updates
    const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"))

    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastLoginAt: doc.data().lastLoginAt?.toDate(),
      })) as User[]

      setUsers(usersData)

      // Calculate stats
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const newStats: Stats = {
        totalUsers: usersData.length,
        totalStudents: usersData.filter((u) => u.role === "student").length,
        totalLecturers: usersData.filter((u) => u.role === "lecturer").length,
        totalAdmins: usersData.filter((u) => u.role === "admin").length,
        activeUsers: usersData.filter((u) => u.isActive).length,
        newUsersThisMonth: usersData.filter((u) => u.createdAt >= thisMonth).length,
        totalLessons: Math.floor(Math.random() * 500) + 100, // Mock data
        totalQuestions: Math.floor(Math.random() * 1000) + 200, // Mock data
      }

      setStats(newStats)
      setLoading(false)
    })

    // Load system settings
    const loadSettings = async () => {
      try {
        const settingsQuery = query(collection(db, "settings"))
        const settingsSnapshot = await getDocs(settingsQuery)

        if (!settingsSnapshot.empty) {
          const settingsData = settingsSnapshot.docs[0].data() as SystemSettings
          setSettings(settingsData)
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }

    loadSettings()

    return () => {
      unsubscribeUsers()
    }
  }, [user])

  useEffect(() => {
    let filtered = users

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.department?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    // Filter by status
    if (statusFilter === "active") {
      filtered = filtered.filter((user) => user.isActive)
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((user) => !user.isActive)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter])

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditForm({
      displayName: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      university: user.university,
      department: user.department,
      isActive: user.isActive,
      isVerified: user.isVerified,
    })
  }

  const handleSaveUser = async () => {
    if (!editingUser) return

    setSaving(true)
    try {
      const userRef = doc(db, "users", editingUser.id)
      await updateDoc(userRef, {
        ...editForm,
        updatedAt: serverTimestamp(),
      })

      toast({
        title: "User updated",
        description: "User information has been successfully updated",
      })

      setEditingUser(null)
      setEditForm({})
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      await deleteDoc(doc(db, "users", userId))
      toast({
        title: "User deleted",
        description: "User has been successfully deleted",
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        isActive: !currentStatus,
        updatedAt: serverTimestamp(),
      })

      toast({
        title: currentStatus ? "User deactivated" : "User activated",
        description: `User has been ${currentStatus ? "deactivated" : "activated"} successfully`,
      })
    } catch (error) {
      console.error("Error updating user status:", error)
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      // Validate numeric inputs
      const maxStudents = Number.parseInt(String(settings.maxStudents))
      const maxLecturers = Number.parseInt(String(settings.maxLecturers))

      if (isNaN(maxStudents) || maxStudents < 0) {
        throw new Error("Maximum students must be a valid positive number")
      }

      if (isNaN(maxLecturers) || maxLecturers < 0) {
        throw new Error("Maximum lecturers must be a valid positive number")
      }

      const settingsQuery = query(collection(db, "settings"))
      const settingsSnapshot = await getDocs(settingsQuery)

      const settingsData = {
        ...settings,
        maxStudents,
        maxLecturers,
        updatedAt: serverTimestamp(),
      }

      if (settingsSnapshot.empty) {
        // Create new settings document
        const settingsRef = doc(collection(db, "settings"))
        await updateDoc(settingsRef, settingsData)
      } else {
        // Update existing settings document
        const settingsRef = settingsSnapshot.docs[0].ref
        await updateDoc(settingsRef, settingsData)
      }

      toast({
        title: "Settings saved",
        description: "System settings have been successfully updated",
      })
    } catch (error: any) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Never"
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getInitials = (user: User) => {
    if (user.displayName) {
      return user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (user.firstName && user.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase()
    }
    return user.email[0].toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard requireAuth={true} allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Manage users, content, and system settings</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{safeNumber(stats.totalUsers)}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {safeNumber(stats.newUsersThisMonth)} new this month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Students</p>
                    <p className="text-2xl font-bold text-gray-900">{safeNumber(stats.totalStudents)}</p>
                  </div>
                  <GraduationCap className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <Activity className="h-4 w-4 mr-1" />
                  {safeNumber(stats.activeUsers)} active
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lecturers</p>
                    <p className="text-2xl font-bold text-gray-900">{safeNumber(stats.totalLecturers)}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {safeNumber(stats.totalLessons)} lessons
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Questions</p>
                    <p className="text-2xl font-bold text-gray-900">{safeNumber(stats.totalQuestions)}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  This month
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="settings">System Settings</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="student">Students</SelectItem>
                        <SelectItem value="lecturer">Lecturers</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center text-sm text-gray-600">
                      {safeNumber(filteredUsers.length)} users found
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Users List */}
              <Card>
                <CardHeader>
                  <CardTitle>Users ({safeNumber(filteredUsers.length)})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.displayName} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">{getInitials(user)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">
                                {user.displayName ||
                                  `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                                  user.email}
                              </h3>
                              <Badge
                                variant={
                                  user.role === "admin" ? "default" : user.role === "lecturer" ? "secondary" : "outline"
                                }
                              >
                                {user.role}
                              </Badge>
                              {user.isVerified && (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              {!user.isActive && (
                                <Badge variant="destructive">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              {user.university && <span>{user.university}</span>}
                              {user.department && <span>{user.department}</span>}
                              <span>Joined {formatDate(user.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                          >
                            {user.isActive ? (
                              <>
                                <UserX className="h-4 w-4 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="displayName">Display Name</Label>
                                  <Input
                                    id="displayName"
                                    value={editForm.displayName || ""}
                                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                      id="firstName"
                                      value={editForm.firstName || ""}
                                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                      id="lastName"
                                      value={editForm.lastName || ""}
                                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="role">Role</Label>
                                  <Select
                                    value={editForm.role}
                                    onValueChange={(value) => setEditForm({ ...editForm, role: value as any })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="student">Student</SelectItem>
                                      <SelectItem value="lecturer">Lecturer</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="university">University</Label>
                                  <Select
                                    value={editForm.university}
                                    onValueChange={(value) => setEditForm({ ...editForm, university: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select university" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {NIGERIAN_UNIVERSITIES.map((uni) => (
                                        <SelectItem key={uni} value={uni}>
                                          {uni}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="department">Department</Label>
                                  <Select
                                    value={editForm.department}
                                    onValueChange={(value) => setEditForm({ ...editForm, department: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {SUBJECTS.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                          {dept}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id="isActive"
                                      checked={editForm.isActive}
                                      onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
                                    />
                                    <Label htmlFor="isActive">Active</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id="isVerified"
                                      checked={editForm.isVerified}
                                      onCheckedChange={(checked) => setEditForm({ ...editForm, isVerified: checked })}
                                    />
                                    <Label htmlFor="isVerified">Verified</Label>
                                  </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setEditingUser(null)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleSaveUser} disabled={saving}>
                                    {saving ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                      </>
                                    ) : (
                                      "Save Changes"
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Input
                        id="siteDescription"
                        value={settings.siteDescription}
                        onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="announcement">Site Announcement</Label>
                    <Textarea
                      id="announcement"
                      placeholder="Enter site-wide announcement (optional)"
                      value={settings.announcement || ""}
                      onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="maxStudents">Maximum Students</Label>
                      <Input
                        id="maxStudents"
                        type="number"
                        min="0"
                        value={safeNumber(settings.maxStudents)}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value) || 0
                          setSettings({ ...settings, maxStudents: value })
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxLecturers">Maximum Lecturers</Label>
                      <Input
                        id="maxLecturers"
                        type="number"
                        min="0"
                        value={safeNumber(settings.maxLecturers)}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value) || 0
                          setSettings({ ...settings, maxLecturers: value })
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">System Controls</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <Label htmlFor="maintenanceMode" className="font-medium">
                            Maintenance Mode
                          </Label>
                          <p className="text-sm text-gray-600">Disable site access for maintenance</p>
                        </div>
                        <Switch
                          id="maintenanceMode"
                          checked={settings.maintenanceMode}
                          onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <Label htmlFor="registrationEnabled" className="font-medium">
                            Registration
                          </Label>
                          <p className="text-sm text-gray-600">Allow new user registrations</p>
                        </div>
                        <Switch
                          id="registrationEnabled"
                          checked={settings.registrationEnabled}
                          onCheckedChange={(checked) => setSettings({ ...settings, registrationEnabled: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <Label htmlFor="emailNotifications" className="font-medium">
                            Email Notifications
                          </Label>
                          <p className="text-sm text-gray-600">Send system email notifications</p>
                        </div>
                        <Switch
                          id="emailNotifications"
                          checked={settings.emailNotificationsEnabled}
                          onCheckedChange={(checked) =>
                            setSettings({ ...settings, emailNotificationsEnabled: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveSettings} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Settings"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">User Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Users</span>
                        <span className="font-semibold">{safeNumber(stats.totalUsers)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">New This Month</span>
                        <span className="font-semibold text-green-600">{safeNumber(stats.newUsersThisMonth)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Active Users</span>
                        <span className="font-semibold text-blue-600">{safeNumber(stats.activeUsers)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">User Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Students</span>
                        <span className="font-semibold">{safeNumber(stats.totalStudents)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Lecturers</span>
                        <span className="font-semibold">{safeNumber(stats.totalLecturers)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Admins</span>
                        <span className="font-semibold">{safeNumber(stats.totalAdmins)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Content Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Lessons</span>
                        <span className="font-semibold">{safeNumber(stats.totalLessons)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Questions</span>
                        <span className="font-semibold">{safeNumber(stats.totalQuestions)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Avg. per Lecturer</span>
                        <span className="font-semibold">
                          {stats.totalLecturers > 0 ? Math.round(stats.totalLessons / stats.totalLecturers) : 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {settings.announcement && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Current Announcement:</strong> {settings.announcement}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
