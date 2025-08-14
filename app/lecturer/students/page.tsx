"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Users,
  MessageSquare,
  BookOpen,
  Calendar,
  Search,
  Send,
  Plus,
  GraduationCap,
  Trophy,
  Clock,
  CheckCircle,
} from "lucide-react"
import { collection, query, where, getDocs, addDoc, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"
import RoleBasedRoute from "@/components/RoleBasedRoute"

interface Student {
  id: string
  email: string
  displayName: string
  firstName?: string
  lastName?: string
  subscribedAt: any
  points?: number
  level?: number
  achievements?: string[]
  questionsAsked?: number
  lessonsCompleted?: number
}

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: any
  studentId: string
  studentEmail: string
  status: "pending" | "submitted" | "graded"
  createdAt: any
}

export default function MyStudentsPage() {
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [message, setMessage] = useState("")
  const [assignmentTitle, setAssignmentTitle] = useState("")
  const [assignmentDescription, setAssignmentDescription] = useState("")
  const [assignmentDueDate, setAssignmentDueDate] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchStudents()
      fetchAssignments()
    }
  }, [user])

  const fetchStudents = async () => {
    try {
      const subscriptionsRef = collection(db, "subscriptions")
      const q = query(subscriptionsRef, where("lecturerEmail", "==", user?.email))
      const querySnapshot = await getDocs(q)

      const studentIds = querySnapshot.docs.map((doc) => doc.data().studentId)

      if (studentIds.length > 0) {
        const usersRef = collection(db, "users")
        const usersSnapshot = await getDocs(usersRef)

        const studentsData = usersSnapshot.docs
          .filter((doc) => studentIds.includes(doc.id))
          .map((doc) => {
            const data = doc.data()
            const subscription = querySnapshot.docs.find((sub) => sub.data().studentId === doc.id)
            return {
              id: doc.id,
              ...data,
              subscribedAt: subscription?.data().createdAt,
            }
          }) as Student[]

        setStudents(studentsData)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAssignments = async () => {
    try {
      const assignmentsRef = collection(db, "assignments")
      const q = query(assignmentsRef, where("lecturerEmail", "==", user?.email), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      const assignmentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Assignment[]

      setAssignments(assignmentsData)
    } catch (error) {
      console.error("Error fetching assignments:", error)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || !selectedStudent || !user) return

    try {
      setSubmitting(true)

      await addDoc(collection(db, "messages"), {
        fromId: user.uid,
        fromEmail: user.email,
        fromName: user.displayName || user.email,
        toId: selectedStudent.id,
        toEmail: selectedStudent.email,
        message: message.trim(),
        createdAt: new Date(),
        read: false,
      })

      // Create notification
      await addDoc(collection(db, "notifications"), {
        userId: selectedStudent.id,
        type: "message",
        title: "New message from lecturer",
        message: `${user.displayName || user.email} sent you a message`,
        createdAt: new Date(),
        read: false,
      })

      setMessage("")
      setSelectedStudent(null)

      toast({
        title: "Success",
        description: "Message sent successfully!",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const createAssignment = async () => {
    if (!assignmentTitle.trim() || !assignmentDescription.trim() || !selectedStudent || !user) return

    try {
      setSubmitting(true)

      await addDoc(collection(db, "assignments"), {
        title: assignmentTitle.trim(),
        description: assignmentDescription.trim(),
        dueDate: assignmentDueDate ? new Date(assignmentDueDate) : null,
        studentId: selectedStudent.id,
        studentEmail: selectedStudent.email,
        lecturerEmail: user.email,
        lecturerName: user.displayName || user.email,
        status: "pending",
        createdAt: new Date(),
      })

      // Create notification
      await addDoc(collection(db, "notifications"), {
        userId: selectedStudent.id,
        type: "assignment",
        title: "New assignment assigned",
        message: `${user.displayName || user.email} assigned you: "${assignmentTitle.trim()}"`,
        createdAt: new Date(),
        read: false,
      })

      setAssignmentTitle("")
      setAssignmentDescription("")
      setAssignmentDueDate("")
      setSelectedStudent(null)

      fetchAssignments() // Refresh assignments

      toast({
        title: "Success",
        description: "Assignment created successfully!",
      })
    } catch (error) {
      console.error("Error creating assignment:", error)
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading students..." />
      </div>
    )
  }

  return (
    <RoleBasedRoute allowedRoles={["lecturer", "admin"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
            <p className="text-gray-600 mt-2">Manage your subscribed students and assignments</p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="students" className="space-y-6">
            <TabsList>
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Students ({students.length})
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Assignments ({assignments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students">
              {filteredStudents.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                    <p className="text-gray-500">
                      {searchTerm ? "No students match your search" : "No students have subscribed to you yet"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredStudents.map((student) => (
                    <Card key={student.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.displayName || student.email}`}
                            />
                            <AvatarFallback>
                              {(student.displayName || student.email).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">{student.displayName || "Student"}</CardTitle>
                            <CardDescription className="truncate">{student.email}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span>{student.points || 0} pts</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-blue-500" />
                            <span>Level {student.level || 1}</span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500">
                          Subscribed: {student.subscribedAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                        </div>

                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedStudent(student)}
                                className="flex-1"
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Message
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Send Message to {student.displayName || student.email}</DialogTitle>
                                <DialogDescription>Send a personal message to this student</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  placeholder="Type your message here..."
                                  value={message}
                                  onChange={(e) => setMessage(e.target.value)}
                                  rows={4}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={sendMessage}
                                    disabled={!message.trim() || submitting}
                                    className="flex items-center gap-2"
                                  >
                                    {submitting ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}
                                    Send Message
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" onClick={() => setSelectedStudent(student)} className="flex-1">
                                <Plus className="h-4 w-4 mr-1" />
                                Assign
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Create Assignment for {student.displayName || student.email}</DialogTitle>
                                <DialogDescription>Create a custom assignment for this student</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Input
                                  placeholder="Assignment title"
                                  value={assignmentTitle}
                                  onChange={(e) => setAssignmentTitle(e.target.value)}
                                />
                                <Textarea
                                  placeholder="Assignment description and instructions..."
                                  value={assignmentDescription}
                                  onChange={(e) => setAssignmentDescription(e.target.value)}
                                  rows={4}
                                />
                                <Input
                                  type="date"
                                  value={assignmentDueDate}
                                  onChange={(e) => setAssignmentDueDate(e.target.value)}
                                />
                                <Button
                                  onClick={createAssignment}
                                  disabled={!assignmentTitle.trim() || !assignmentDescription.trim() || submitting}
                                  className="w-full"
                                >
                                  {submitting ? <LoadingSpinner size="sm" /> : <Plus className="h-4 w-4 mr-2" />}
                                  Create Assignment
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="assignments">
              {assignments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments created</h3>
                    <p className="text-gray-500">Create assignments for your students from the Students tab</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <Card key={assignment.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            <CardDescription className="mt-1">Assigned to: {assignment.studentEmail}</CardDescription>
                          </div>
                          <Badge
                            className={
                              assignment.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : assignment.status === "submitted"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                            }
                          >
                            {assignment.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                            {assignment.status === "graded" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{assignment.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Created: {assignment.createdAt?.toDate?.()?.toLocaleDateString()}
                          </div>
                          {assignment.dueDate && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Due: {assignment.dueDate.toDate?.()?.toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RoleBasedRoute>
  )
}
