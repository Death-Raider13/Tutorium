"use client"

import { useState, useEffect } from "react"
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  where,
  orderBy,
  serverTimestamp,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, Plus, Search, MapPin, MessageSquare, Calendar, UserPlus, UserMinus } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import toast from "react-hot-toast"

interface StudyGroup {
  id: string
  name: string
  description: string
  subject: string
  level: "beginner" | "intermediate" | "advanced"
  maxMembers: number
  members: string[]
  createdBy: string
  createdAt: Date
  isActive: boolean
  meetingSchedule?: string
  location?: string
  tags: string[]
  lastActivity: Date
}

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Engineering",
  "Economics",
  "Literature",
  "History",
  "Psychology",
  "Other",
]

const LEVELS = [
  { value: "beginner", label: "Beginner", color: "bg-green-100 text-green-800" },
  { value: "intermediate", label: "Intermediate", color: "bg-yellow-100 text-yellow-800" },
  { value: "advanced", label: "Advanced", color: "bg-red-100 text-red-800" },
]

export default function StudyGroupsPage() {
  const { user, isStudent, isLecturer } = useAuth()
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([])
  const [filteredGroups, setFilteredGroups] = useState<StudyGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    subject: "",
    level: "beginner" as const,
    maxMembers: 10,
    meetingSchedule: "",
    location: "",
    tags: "",
  })

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const studyGroupsQuery = query(
      collection(db, "studyGroups"),
      where("isActive", "==", true),
      orderBy("lastActivity", "desc"),
    )

    const unsubscribe = onSnapshot(
      studyGroupsQuery,
      (snapshot) => {
        const groupsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          lastActivity: doc.data().lastActivity?.toDate() || new Date(),
        })) as StudyGroup[]

        setStudyGroups(groupsData)
        setFilteredGroups(groupsData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching study groups:", error)
        setLoading(false)
        toast.error("Failed to load study groups")
      },
    )

    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    let filtered = studyGroups

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (group) =>
          group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by subject
    if (selectedSubject !== "all") {
      filtered = filtered.filter((group) => group.subject === selectedSubject)
    }

    // Filter by level
    if (selectedLevel !== "all") {
      filtered = filtered.filter((group) => group.level === selectedLevel)
    }

    setFilteredGroups(filtered)
  }, [studyGroups, searchTerm, selectedSubject, selectedLevel])

  const handleCreateGroup = async () => {
    if (!user) return

    if (!newGroup.name.trim() || !newGroup.description.trim() || !newGroup.subject) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const groupData = {
        ...newGroup,
        members: [user.uid],
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        isActive: true,
        tags: newGroup.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      }

      await addDoc(collection(db, "studyGroups"), groupData)
      toast.success("Study group created successfully!")
      setShowCreateDialog(false)
      setNewGroup({
        name: "",
        description: "",
        subject: "",
        level: "beginner",
        maxMembers: 10,
        meetingSchedule: "",
        location: "",
        tags: "",
      })
    } catch (error) {
      console.error("Error creating study group:", error)
      toast.error("Failed to create study group")
    }
  }

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return

    try {
      const groupRef = doc(db, "studyGroups", groupId)
      await updateDoc(groupRef, {
        members: arrayUnion(user.uid),
        lastActivity: serverTimestamp(),
      })
      toast.success("Successfully joined the study group!")
    } catch (error) {
      console.error("Error joining group:", error)
      toast.error("Failed to join study group")
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    if (!user) return

    if (!confirm("Are you sure you want to leave this study group?")) {
      return
    }

    try {
      const groupRef = doc(db, "studyGroups", groupId)
      await updateDoc(groupRef, {
        members: arrayRemove(user.uid),
        lastActivity: serverTimestamp(),
      })
      toast.success("Successfully left the study group")
    } catch (error) {
      console.error("Error leaving group:", error)
      toast.error("Failed to leave study group")
    }
  }

  const getLevelBadge = (level: string) => {
    const levelConfig = LEVELS.find((l) => l.value === level)
    return levelConfig || LEVELS[0]
  }

  const isUserInGroup = (group: StudyGroup) => {
    return user && group.members.includes(user.uid)
  }

  const canJoinGroup = (group: StudyGroup) => {
    return user && !isUserInGroup(group) && group.members.length < group.maxMembers
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading study groups..." />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in required</h3>
            <p className="text-gray-600 mb-6">Please sign in to view and join study groups</p>
            <Button asChild>
              <a href="/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="h-8 w-8 text-blue-600" />
                  Study Groups
                </h1>
                <p className="text-gray-600 mt-1">Join study groups and collaborate with fellow learners</p>
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Study Group</DialogTitle>
                    <DialogDescription>Start a new study group and invite others to join</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Group Name *</Label>
                      <Input
                        id="name"
                        value={newGroup.name}
                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                        placeholder="e.g., Calculus Study Group"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={newGroup.description}
                        onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                        placeholder="Describe what your group will focus on..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="subject">Subject *</Label>
                        <Select
                          value={newGroup.subject}
                          onValueChange={(value) => setNewGroup({ ...newGroup, subject: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
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
                      <div>
                        <Label htmlFor="level">Level</Label>
                        <Select
                          value={newGroup.level}
                          onValueChange={(value: any) => setNewGroup({ ...newGroup, level: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LEVELS.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="maxMembers">Max Members</Label>
                      <Input
                        id="maxMembers"
                        type="number"
                        value={newGroup.maxMembers}
                        onChange={(e) =>
                          setNewGroup({ ...newGroup, maxMembers: Number.parseInt(e.target.value) || 10 })
                        }
                        min="2"
                        max="50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="schedule">Meeting Schedule (Optional)</Label>
                      <Input
                        id="schedule"
                        value={newGroup.meetingSchedule}
                        onChange={(e) => setNewGroup({ ...newGroup, meetingSchedule: e.target.value })}
                        placeholder="e.g., Tuesdays 7PM"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location (Optional)</Label>
                      <Input
                        id="location"
                        value={newGroup.location}
                        onChange={(e) => setNewGroup({ ...newGroup, location: e.target.value })}
                        placeholder="e.g., Library Room 201 or Online"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags (Optional)</Label>
                      <Input
                        id="tags"
                        value={newGroup.tags}
                        onChange={(e) => setNewGroup({ ...newGroup, tags: e.target.value })}
                        placeholder="e.g., exam prep, homework help"
                      />
                      <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                    </div>
                    <Button onClick={handleCreateGroup} className="w-full">
                      Create Study Group
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {SUBJECTS.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  {filteredGroups.length} groups found
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Study Groups Grid */}
          {filteredGroups.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No study groups found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || selectedSubject !== "all" || selectedLevel !== "all"
                      ? "Try adjusting your filters to find more groups"
                      : "Be the first to create a study group!"}
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Group
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => {
                const levelBadge = getLevelBadge(group.level)
                const isMember = isUserInGroup(group)
                const canJoin = canJoinGroup(group)
                const isFull = group.members.length >= group.maxMembers

                return (
                  <Card key={group.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{group.name}</CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{group.subject}</Badge>
                            <Badge className={levelBadge.color}>{levelBadge.label}</Badge>
                            {isFull && <Badge variant="destructive">Full</Badge>}
                          </div>
                        </div>
                        {isMember && (
                          <Badge className="bg-green-100 text-green-800">
                            <UserPlus className="h-3 w-3 mr-1" />
                            Member
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">{group.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-gray-600">
                            <Users className="h-4 w-4 mr-1" />
                            {group.members.length}/{group.maxMembers} members
                          </span>
                          <span className="text-gray-500">{formatDate(group.lastActivity)}</span>
                        </div>

                        {group.meetingSchedule && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            {group.meetingSchedule}
                          </div>
                        )}

                        {group.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            {group.location}
                          </div>
                        )}

                        {group.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {group.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {group.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{group.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="pt-2">
                          {isMember ? (
                            <div className="flex gap-2">
                              <Button variant="outline" className="flex-1 bg-transparent">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                View Group
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleLeaveGroup(group.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : canJoin ? (
                            <Button onClick={() => handleJoinGroup(group.id)} className="w-full">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Join Group
                            </Button>
                          ) : (
                            <Button disabled className="w-full">
                              {isFull ? "Group Full" : "Cannot Join"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
