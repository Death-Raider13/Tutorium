"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { updateProfile, updatePassword } from "firebase/auth"
import { db, storage, auth } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import AuthGuard from "@/components/AuthGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  User,
  Camera,
  Save,
  Lock,
  Bell,
  Shield,
  Award,
  BookOpen,
  Trophy,
  Calendar,
  MapPin,
  GraduationCap,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { SUBJECTS, NIGERIAN_UNIVERSITIES, NIGERIAN_STATES } from "@/lib/constants"
import { toast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    displayName: "",
    firstName: "",
    lastName: "",
    bio: "",
    university: "",
    department: "",
    state: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    interests: "",
    website: "",
    linkedin: "",
    twitter: "",
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    newLessons: true,
    questionAnswers: true,
    studyGroupUpdates: true,
    achievementAlerts: true,
  })

  useEffect(() => {
    if (user) {
      setProfileForm({
        displayName: user.displayName || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
        university: user.university || "",
        department: user.department || "",
        state: user.state || "",
        phoneNumber: user.phoneNumber || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        interests: user.interests || "",
        website: user.website || "",
        linkedin: user.linkedin || "",
        twitter: user.twitter || "",
      })

      // Load notification preferences
      setNotifications({
        emailNotifications: user.emailNotifications ?? true,
        pushNotifications: user.pushNotifications ?? true,
        weeklyDigest: user.weeklyDigest ?? true,
        newLessons: user.newLessons ?? true,
        questionAnswers: user.questionAnswers ?? true,
        studyGroupUpdates: user.studyGroupUpdates ?? true,
        achievementAlerts: user.achievementAlerts ?? true,
      })
    }
  }, [user])

  const handleProfileUpdate = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Update Firestore document
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        ...profileForm,
        updatedAt: serverTimestamp(),
      })

      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: profileForm.displayName,
        })
      }

      await refreshUser()
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (!auth.currentUser) return

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await updatePassword(auth.currentUser, passwordForm.newPassword)
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated",
      })
    } catch (error: any) {
      console.error("Error updating password:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationUpdate = async () => {
    if (!user) return

    setLoading(true)
    try {
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        ...notifications,
        updatedAt: serverTimestamp(),
      })

      await refreshUser()
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved",
      })
    } catch (error) {
      console.error("Error updating notifications:", error)
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const storageRef = ref(storage, `profile-images/${user.uid}/${Date.now()}_${file.name}`)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
        },
        (error) => {
          console.error("Upload error:", error)
          toast({
            title: "Upload failed",
            description: "Failed to upload image. Please try again.",
            variant: "destructive",
          })
          setUploading(false)
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

          // Update user profile with new image
          const userRef = doc(db, "users", user.uid)
          await updateDoc(userRef, {
            profileImage: downloadURL,
            updatedAt: serverTimestamp(),
          })

          // Update Firebase Auth profile
          if (auth.currentUser) {
            await updateProfile(auth.currentUser, {
              photoURL: downloadURL,
            })
          }

          await refreshUser()
          toast({
            title: "Profile image updated",
            description: "Your profile image has been successfully updated",
          })
          setUploading(false)
          setUploadProgress(0)
        },
      )
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
      setUploading(false)
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "lecturer":
        return "bg-blue-100 text-blue-800"
      case "student":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-8 w-8 text-blue-600" />
              Profile Settings
            </h1>
            <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
          </div>

          {/* Profile Overview Card */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.displayName || "Profile"} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                      {getInitials(user.displayName || user.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2">
                    <label htmlFor="profile-image" className="cursor-pointer">
                      <div className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors">
                        <Camera className="h-4 w-4" />
                      </div>
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="text-white text-xs">{Math.round(uploadProgress)}%</div>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email}
                    </h2>
                    <Badge className={getRoleBadgeColor(user.role || "student")}>
                      {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                    </Badge>
                    {user.isVerified && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{user.email}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    {user.university && (
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {user.university}
                      </div>
                    )}
                    {user.department && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {user.department}
                      </div>
                    )}
                    {user.state && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {user.state}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                  {user.points !== undefined && (
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{user.points} points</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Award className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">Level {user.level || 1}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {uploading && (
                <div className="mt-4">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-gray-600 mt-1">Uploading image... {Math.round(uploadProgress)}%</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={profileForm.displayName}
                        onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                        placeholder="How you want to be known"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" value={user.email} disabled className="bg-gray-50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="university">University</Label>
                      <Select
                        value={profileForm.university}
                        onValueChange={(value) => setProfileForm({ ...profileForm, university: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your university" />
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
                        value={profileForm.department}
                        onValueChange={(value) => setProfileForm({ ...profileForm, department: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your department" />
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select
                        value={profileForm.state}
                        onValueChange={(value) => setProfileForm({ ...profileForm, state: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
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
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={profileForm.phoneNumber}
                        onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                        placeholder="+234..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={profileForm.gender}
                        onValueChange={(value) => setProfileForm({ ...profileForm, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="interests">Interests & Specializations</Label>
                    <Input
                      id="interests"
                      value={profileForm.interests}
                      onChange={(e) => setProfileForm({ ...profileForm, interests: e.target.value })}
                      placeholder="e.g., Structural Engineering, Renewable Energy, AI"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={profileForm.website}
                        onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={profileForm.linkedin}
                        onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                        placeholder="linkedin.com/in/..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={profileForm.twitter}
                        onChange={(e) => setProfileForm({ ...profileForm, twitter: e.target.value })}
                        placeholder="@username"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleProfileUpdate} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handlePasswordUpdate} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Login Sessions</h3>
                        <p className="text-sm text-gray-600">Manage your active login sessions</p>
                      </div>
                      <Button variant="outline">View Sessions</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-gray-600">Receive notifications via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.emailNotifications}
                        onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Push Notifications</h3>
                        <p className="text-sm text-gray-600">Receive push notifications in your browser</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.pushNotifications}
                        onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Weekly Digest</h3>
                        <p className="text-sm text-gray-600">Get a weekly summary of platform activity</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.weeklyDigest}
                        onChange={(e) => setNotifications({ ...notifications, weeklyDigest: e.target.checked })}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">New Lessons</h3>
                        <p className="text-sm text-gray-600">Get notified when new lessons are published</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.newLessons}
                        onChange={(e) => setNotifications({ ...notifications, newLessons: e.target.checked })}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Question Answers</h3>
                        <p className="text-sm text-gray-600">Get notified when your questions are answered</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.questionAnswers}
                        onChange={(e) => setNotifications({ ...notifications, questionAnswers: e.target.checked })}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Study Group Updates</h3>
                        <p className="text-sm text-gray-600">Get notified about study group activities</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.studyGroupUpdates}
                        onChange={(e) => setNotifications({ ...notifications, studyGroupUpdates: e.target.checked })}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Achievement Alerts</h3>
                        <p className="text-sm text-gray-600">Get notified when you earn new achievements</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.achievementAlerts}
                        onChange={(e) => setNotifications({ ...notifications, achievementAlerts: e.target.checked })}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleNotificationUpdate} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Preferences"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Profile Visibility</h3>
                        <p className="text-sm text-gray-600">Control who can see your profile information</p>
                      </div>
                      <Select defaultValue="public">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="students">Students Only</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Activity Status</h3>
                        <p className="text-sm text-gray-600">Show when you're online or last active</p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Search Engine Indexing</h3>
                        <p className="text-sm text-gray-600">Allow search engines to index your public profile</p>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        These actions are permanent and cannot be undone. Please proceed with caution.
                      </AlertDescription>
                    </Alert>

                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-red-600">Delete Account</h3>
                        <p className="text-sm text-gray-600">Permanently delete your account and all associated data</p>
                      </div>
                      <Button variant="destructive">Delete Account</Button>
                    </div>
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
