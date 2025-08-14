"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { updateProfile } from "firebase/auth"
import { db, storage } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import AuthGuard from "@/components/AuthGuard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  User,
  Camera,
  Save,
  Trophy,
  BookOpen,
  Users,
  MessageSquare,
  GraduationCap,
  Shield,
  Settings,
} from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { SUBJECTS, NIGERIAN_UNIVERSITIES, NIGERIAN_STATES } from "@/lib/constants"
import { toast } from "@/hooks/use-toast"

interface ProfileData {
  firstName: string
  lastName: string
  bio: string
  university: string
  department: string
  level?: string // For students
  staffId?: string // For lecturers
  phoneNumber: string
  state: string
  specializations: string[]
  experience?: string // For lecturers
  education: string
  researchInterests?: string // For lecturers
  profileImage?: string
}

interface UserStats {
  questionsAsked: number
  questionsAnswered: number
  lessonsWatched: number
  lessonsCreated: number
  studyGroupsJoined: number
  achievementsEarned: number
  totalPoints: number
  level: number
  studentsCount?: number // For lecturers
  assignmentsCreated?: number // For lecturers
  totalUsers?: number // For admins
  systemUptime?: string // For admins
}

export default function ProfilePage() {
  const { user, firebaseUser } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    bio: "",
    university: "",
    department: "",
    level: "",
    staffId: "",
    phoneNumber: "",
    state: "",
    specializations: [],
    experience: "",
    education: "",
    researchInterests: "",
  })
  const [userStats, setUserStats] = useState<UserStats>({
    questionsAsked: 0,
    questionsAnswered: 0,
    lessonsWatched: 0,
    lessonsCreated: 0,
    studyGroupsJoined: 0,
    achievementsEarned: 0,
    totalPoints: 0,
    level: 1,
    studentsCount: 0,
    assignmentsCreated: 0,
    totalUsers: 0,
    systemUptime: "99.9%",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    assignments: true,
    livestreams: true,
    newContent: true,
  })
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    showUniversity: true,
    showStats: true,
  })

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setProfileData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            bio: data.bio || "",
            university: data.university || "",
            department: data.department || "",
            level: data.level || "",
            staffId: data.staffId || "",
            phoneNumber: data.phoneNumber || "",
            state: data.state || "",
            specializations: data.specializations || [],
            experience: data.experience || "",
            education: data.education || "",
            researchInterests: data.researchInterests || "",
            profileImage: data.profileImage || "",
          })
          setNotifications(data.preferences?.notifications || notifications)
          setPrivacy(data.preferences?.privacy || privacy)
        }

        // Fetch user statistics based on role
        const baseStats = {
          questionsAsked: user.questionsAsked || 0,
          questionsAnswered: user.questionsAnswered || 0,
          lessonsWatched: user.lessonsWatched || 0,
          lessonsCreated: user.lessonsCreated || 0,
          studyGroupsJoined: user.studyGroups?.length || 0,
          achievementsEarned: user.achievements?.length || 0,
          totalPoints: user.points || 0,
          level: user.level || 1,
        }

        if (user.role === "lecturer") {
          setUserStats({
            ...baseStats,
            studentsCount: user.studentsCount || 0,
            assignmentsCreated: user.assignmentsCreated || 0,
          })
        } else if (user.role === "admin") {
          setUserStats({
            ...baseStats,
            totalUsers: user.totalUsers || 0,
            systemUptime: "99.9%",
          })
        } else {
          setUserStats(baseStats)
        }
      } catch (error) {
        console.error("Error fetching profile data:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [user])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setUploadingImage(true)

    try {
      const imageRef = ref(storage, `profile-images/${user.uid}`)
      await uploadBytes(imageRef, file)
      const downloadURL = await getDownloadURL(imageRef)

      // Update Firebase Auth profile
      if (firebaseUser) {
        await updateProfile(firebaseUser, { photoURL: downloadURL })
      }

      // Update Firestore document
      await updateDoc(doc(db, "users", user.uid), {
        profileImage: downloadURL,
      })

      setProfileData((prev) => ({ ...prev, profileImage: downloadURL }))
      toast({
        title: "Success",
        description: "Profile image updated successfully!",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setSaving(true)

    try {
      const updateData = {
        ...profileData,
        displayName: `${profileData.firstName} ${profileData.lastName}`.trim(),
        preferences: {
          notifications,
          privacy,
        },
        updatedAt: new Date(),
      }

      await updateDoc(doc(db, "users", user.uid), updateData)

      // Update Firebase Auth display name
      if (firebaseUser && updateData.displayName) {
        await updateProfile(firebaseUser, { displayName: updateData.displayName })
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "lecturer":
        return "bg-green-100 text-green-800"
      case "student":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />
      case "lecturer":
        return <GraduationCap className="h-4 w-4" />
      case "student":
        return <BookOpen className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    )
  }

  const tabsConfig = {
    student: ["personal", "academic", "preferences", "privacy"],
    lecturer: ["personal", "professional", "academic", "preferences", "privacy"],
    admin: ["personal", "system", "preferences", "privacy"],
  }

  const userTabs = tabsConfig[user?.role as keyof typeof tabsConfig] || tabsConfig.student

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-8 w-8 text-blue-600" />
              Profile Settings
            </h1>
            <p className="text-gray-600 mt-1">Manage your engineering education profile and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <Avatar className="h-24 w-24 mx-auto">
                        <AvatarImage
                          src={
                            profileData.profileImage ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${user?.displayName || user?.email}`
                          }
                          alt={user?.displayName || "User"}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-medium">
                          {getInitials(user?.displayName || user?.email || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <label
                        htmlFor="profile-image"
                        className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                        <input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <LoadingSpinner size="sm" />
                        </div>
                      )}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">
                      {profileData.firstName || profileData.lastName
                        ? `${profileData.firstName} ${profileData.lastName}`.trim()
                        : user?.displayName || "User"}
                    </h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <Badge className={getRoleColor(user?.role || "pending")}>
                        {getRoleIcon(user?.role || "pending")}
                        <span className="ml-1">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</span>
                      </Badge>
                    </div>
                    {profileData.university && <p className="text-xs text-gray-500 mt-2">{profileData.university}</p>}
                    {profileData.department && <p className="text-xs text-gray-500">{profileData.department}</p>}

                    {/* Role-specific progress */}
                    {user?.role === "student" && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Level {userStats.level}</span>
                          <span>{userStats.totalPoints} pts</span>
                        </div>
                        <Progress value={(userStats.totalPoints % 1000) / 10} className="h-2" />
                        <p className="text-xs text-gray-500">
                          {1000 - (userStats.totalPoints % 1000)} points to next level
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {user?.role === "student" && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          Questions Asked
                        </span>
                        <span className="font-medium">{userStats.questionsAsked}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-green-500" />
                          Lessons Watched
                        </span>
                        <span className="font-medium">{userStats.lessonsWatched}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-purple-500" />
                          Study Groups
                        </span>
                        <span className="font-medium">{userStats.studyGroupsJoined}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          Achievements
                        </span>
                        <span className="font-medium">{userStats.achievementsEarned}</span>
                      </div>
                    </>
                  )}
                  {user?.role === "lecturer" && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-green-500" />
                          Lessons Created
                        </span>
                        <span className="font-medium">{userStats.lessonsCreated}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          Questions Answered
                        </span>
                        <span className="font-medium">{userStats.questionsAnswered}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-purple-500" />
                          Students
                        </span>
                        <span className="font-medium">{userStats.studentsCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm">
                          <Settings className="h-4 w-4 text-gray-500" />
                          Assignments
                        </span>
                        <span className="font-medium">{userStats.assignmentsCreated}</span>
                      </div>
                    </>
                  )}
                  {user?.role === "admin" && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-blue-500" />
                          Total Users
                        </span>
                        <span className="font-medium">{userStats.totalUsers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm">
                          <Settings className="h-4 w-4 text-green-500" />
                          System Uptime
                        </span>
                        <span className="font-medium">{userStats.systemUptime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-purple-500" />
                          Content Items
                        </span>
                        <span className="font-medium">{userStats.lessonsCreated + userStats.questionsAnswered}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="personal" className="space-y-6">
                <TabsList className={`grid w-full grid-cols-${userTabs.length}`}>
                  {userTabs.includes("personal") && <TabsTrigger value="personal">Personal</TabsTrigger>}
                  {userTabs.includes("academic") && <TabsTrigger value="academic">Academic</TabsTrigger>}
                  {userTabs.includes("professional") && <TabsTrigger value="professional">Professional</TabsTrigger>}
                  {userTabs.includes("system") && <TabsTrigger value="system">System</TabsTrigger>}
                  {userTabs.includes("preferences") && <TabsTrigger value="preferences">Preferences</TabsTrigger>}
                  {userTabs.includes("privacy") && <TabsTrigger value="privacy">Privacy</TabsTrigger>}
                </TabsList>

                <TabsContent value="personal">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details and contact information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                            placeholder="Enter your first name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                            placeholder="Enter your last name"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          placeholder="Tell us about yourself and your engineering interests..."
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          <Input
                            id="phoneNumber"
                            value={profileData.phoneNumber}
                            onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                            placeholder="+234 xxx xxx xxxx"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State of Origin</Label>
                          <Select
                            value={profileData.state}
                            onValueChange={(value) => setProfileData({ ...profileData, state: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select your state" />
                            </SelectTrigger>
                            <SelectContent>
                              {NIGERIAN_STATES.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="academic">
                  <Card>
                    <CardHeader>
                      <CardTitle>Academic Information</CardTitle>
                      <CardDescription>Your university and academic details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="university">University</Label>
                        <Select
                          value={profileData.university}
                          onValueChange={(value) => setProfileData({ ...profileData, university: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your university" />
                          </SelectTrigger>
                          <SelectContent>
                            {NIGERIAN_UNIVERSITIES.map((university) => (
                              <SelectItem key={university} value={university}>
                                {university}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="department">Engineering Department</Label>
                        <Select
                          value={profileData.department}
                          onValueChange={(value) => setProfileData({ ...profileData, department: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your department" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUBJECTS.map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {user?.role === "student" && (
                        <div>
                          <Label htmlFor="level">Current Level</Label>
                          <Select
                            value={profileData.level}
                            onValueChange={(value) => setProfileData({ ...profileData, level: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select your level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100">100 Level (Year 1)</SelectItem>
                              <SelectItem value="200">200 Level (Year 2)</SelectItem>
                              <SelectItem value="300">300 Level (Year 3)</SelectItem>
                              <SelectItem value="400">400 Level (Year 4)</SelectItem>
                              <SelectItem value="500">500 Level (Year 5)</SelectItem>
                              <SelectItem value="postgraduate">Postgraduate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {user?.role === "lecturer" && (
                        <div>
                          <Label htmlFor="staffId">Staff ID</Label>
                          <Input
                            id="staffId"
                            value={profileData.staffId}
                            onChange={(e) => setProfileData({ ...profileData, staffId: e.target.value })}
                            placeholder="Your university staff ID"
                          />
                        </div>
                      )}
                      <div>
                        <Label htmlFor="education">Educational Background</Label>
                        <Textarea
                          id="education"
                          value={profileData.education}
                          onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                          placeholder="Your educational qualifications and background..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {user?.role === "lecturer" && (
                  <TabsContent value="professional">
                    <Card>
                      <CardHeader>
                        <CardTitle>Professional Information</CardTitle>
                        <CardDescription>Your teaching and research experience</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="experience">Teaching Experience</Label>
                          <Textarea
                            id="experience"
                            value={profileData.experience}
                            onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                            placeholder="Describe your teaching and professional experience..."
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="researchInterests">Research Interests</Label>
                          <Textarea
                            id="researchInterests"
                            value={profileData.researchInterests}
                            onChange={(e) => setProfileData({ ...profileData, researchInterests: e.target.value })}
                            placeholder="Your research areas and interests..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="specializations">Specializations</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your specializations" />
                            </SelectTrigger>
                            <SelectContent>
                              {SUBJECTS.map((subject) => (
                                <SelectItem key={subject} value={subject}>
                                  {subject}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-1">You can select multiple specializations</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {user?.role === "admin" && (
                  <TabsContent value="system">
                    <Card>
                      <CardHeader>
                        <CardTitle>System Information</CardTitle>
                        <CardDescription>Platform administration details</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900">Total Users</h4>
                            <p className="text-2xl font-bold text-blue-600">{userStats.totalUsers}</p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-medium text-green-900">System Uptime</h4>
                            <p className="text-2xl font-bold text-green-600">{userStats.systemUptime}</p>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="adminNotes">Administrative Notes</Label>
                          <Textarea id="adminNotes" placeholder="Internal notes and reminders..." rows={4} />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                <TabsContent value="preferences">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>Choose how you want to be notified</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <p className="text-sm text-gray-600">Receive notifications via email</p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={notifications.email}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="push-notifications">Push Notifications</Label>
                          <p className="text-sm text-gray-600">Receive push notifications in browser</p>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={notifications.push}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="assignment-notifications">Assignment Notifications</Label>
                          <p className="text-sm text-gray-600">Get notified about new assignments</p>
                        </div>
                        <Switch
                          id="assignment-notifications"
                          checked={notifications.assignments}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, assignments: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="livestream-notifications">Live Stream Notifications</Label>
                          <p className="text-sm text-gray-600">Get notified when lecturers go live</p>
                        </div>
                        <Switch
                          id="livestream-notifications"
                          checked={notifications.livestreams}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, livestreams: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="content-notifications">New Content Notifications</Label>
                          <p className="text-sm text-gray-600">Get notified about new lessons and resources</p>
                        </div>
                        <Switch
                          id="content-notifications"
                          checked={notifications.newContent}
                          onCheckedChange={(checked) => setNotifications({ ...notifications, newContent: checked })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="privacy">
                  <Card>
                    <CardHeader>
                      <CardTitle>Privacy Settings</CardTitle>
                      <CardDescription>Control who can see your information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="profile-visible">Public Profile</Label>
                          <p className="text-sm text-gray-600">Make your profile visible to other users</p>
                        </div>
                        <Switch
                          id="profile-visible"
                          checked={privacy.profileVisible}
                          onCheckedChange={(checked) => setPrivacy({ ...privacy, profileVisible: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="show-email">Show Email</Label>
                          <p className="text-sm text-gray-600">Display your email on your public profile</p>
                        </div>
                        <Switch
                          id="show-email"
                          checked={privacy.showEmail}
                          onCheckedChange={(checked) => setPrivacy({ ...privacy, showEmail: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="show-phone">Show Phone Number</Label>
                          <p className="text-sm text-gray-600">Display your phone number on your profile</p>
                        </div>
                        <Switch
                          id="show-phone"
                          checked={privacy.showPhone}
                          onCheckedChange={(checked) => setPrivacy({ ...privacy, showPhone: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="show-university">Show University</Label>
                          <p className="text-sm text-gray-600">Display your university information</p>
                        </div>
                        <Switch
                          id="show-university"
                          checked={privacy.showUniversity}
                          onCheckedChange={(checked) => setPrivacy({ ...privacy, showUniversity: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="show-stats">Show Statistics</Label>
                          <p className="text-sm text-gray-600">Display your learning/teaching statistics publicly</p>
                        </div>
                        <Switch
                          id="show-stats"
                          checked={privacy.showStats}
                          onCheckedChange={(checked) => setPrivacy({ ...privacy, showStats: checked })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Save Button */}
              <div className="mt-6">
                <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
