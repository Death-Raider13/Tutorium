"use client"

import { useState, useEffect } from "react"
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import AuthGuard from "@/components/AuthGuard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Video, Calendar, Users, Clock, Play, Square, Send, MessageSquare } from "lucide-react"
import { SUBJECTS } from "@/lib/constants"
import toast from "react-hot-toast"

interface LiveStream {
  id: string
  title: string
  description: string
  subject: string
  scheduledAt: Date
  duration: number
  lecturerId: string
  lecturerName: string
  status: "scheduled" | "live" | "ended"
  viewers: string[]
  maxViewers: number
  streamUrl?: string
  chatEnabled: boolean
  recordingEnabled: boolean
  createdAt: Date
}

interface ChatMessage {
  id: string
  streamId: string
  userId: string
  userName: string
  message: string
  timestamp: Date
  type: "message" | "question" | "system"
}

export default function LiveStreamPage() {
  const { user } = useAuth()
  const [streams, setStreams] = useState<LiveStream[]>([])
  const [currentStream, setCurrentStream] = useState<LiveStream | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newStream, setNewStream] = useState({
    title: "",
    description: "",
    subject: "",
    scheduledAt: "",
    duration: 60,
    maxViewers: 100,
    chatEnabled: true,
    recordingEnabled: false,
  })

  useEffect(() => {
    if (!user) return

    // Fetch lecturer's streams
    const streamsQuery = query(collection(db, "livestreams"), where("lecturerId", "==", user.uid))

    const unsubscribe = onSnapshot(streamsQuery, (snapshot) => {
      const streamsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        scheduledAt: doc.data().scheduledAt?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as LiveStream[]

      setStreams(streamsData.sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime()))
    })

    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    if (!currentStream) return

    // Fetch chat messages for current stream
    const chatQuery = query(collection(db, "streamChats"), where("streamId", "==", currentStream.id))

    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as ChatMessage[]

      setChatMessages(messagesData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()))
    })

    return () => unsubscribe()
  }, [currentStream])

  const createStream = async () => {
    if (!user || !newStream.title || !newStream.subject || !newStream.scheduledAt) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const streamData = {
        ...newStream,
        lecturerId: user.uid,
        lecturerName: user.displayName || user.email,
        scheduledAt: new Date(newStream.scheduledAt),
        status: "scheduled",
        viewers: [],
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "livestreams"), streamData)

      // Create notifications for students
      await createStreamNotifications(docRef.id, streamData)

      toast.success("Live stream scheduled successfully!")
      setShowCreateDialog(false)
      setNewStream({
        title: "",
        description: "",
        subject: "",
        scheduledAt: "",
        duration: 60,
        maxViewers: 100,
        chatEnabled: true,
        recordingEnabled: false,
      })
    } catch (error) {
      console.error("Error creating stream:", error)
      toast.error("Failed to schedule live stream")
    }
  }

  const createStreamNotifications = async (streamId: string, streamData: any) => {
    try {
      // Get all students (you might want to filter by subject interest)
      const studentsQuery = query(collection(db, "users"), where("role", "==", "student"))

      // This would typically be done server-side to avoid exposing all user data
      // For now, we'll create a general notification
      await addDoc(collection(db, "notifications"), {
        type: "livestream",
        title: "New Live Stream Scheduled",
        message: `${streamData.lecturerName} has scheduled a live stream: ${streamData.title}`,
        data: {
          streamId,
          subject: streamData.subject,
          scheduledAt: streamData.scheduledAt,
        },
        priority: "medium",
        createdAt: serverTimestamp(),
        // In a real app, you'd create individual notifications for each student
        broadcast: true,
      })
    } catch (error) {
      console.error("Error creating notifications:", error)
    }
  }

  const startStream = async (streamId: string) => {
    try {
      await updateDoc(doc(db, "livestreams", streamId), {
        status: "live",
        streamUrl: `https://stream.tutorium.com/${streamId}`, // Mock URL
      })
      toast.success("Live stream started!")
    } catch (error) {
      console.error("Error starting stream:", error)
      toast.error("Failed to start stream")
    }
  }

  const endStream = async (streamId: string) => {
    try {
      await updateDoc(doc(db, "livestreams", streamId), {
        status: "ended",
      })
      toast.success("Live stream ended")
    } catch (error) {
      console.error("Error ending stream:", error)
      toast.error("Failed to end stream")
    }
  }

  const sendChatMessage = async () => {
    if (!currentStream || !newMessage.trim()) return

    try {
      await addDoc(collection(db, "streamChats"), {
        streamId: currentStream.id,
        userId: user?.uid,
        userName: user?.displayName || user?.email,
        message: newMessage.trim(),
        timestamp: serverTimestamp(),
        type: "message",
      })
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge className="bg-red-500 text-white animate-pulse">🔴 LIVE</Badge>
      case "scheduled":
        return <Badge className="bg-blue-500 text-white">📅 Scheduled</Badge>
      case "ended":
        return <Badge variant="outline">⏹️ Ended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <AuthGuard requireAuth={true} allowedRoles={["lecturer"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Video className="h-8 w-8 text-red-600" />
                  Live Streaming
                </h1>
                <p className="text-gray-600 mt-1">Host live lessons and interact with students in real-time</p>
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Stream
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Schedule Live Stream</DialogTitle>
                    <DialogDescription>Create a new live streaming session for your students</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Stream Title *</Label>
                      <Input
                        id="title"
                        value={newStream.title}
                        onChange={(e) => setNewStream({ ...newStream, title: e.target.value })}
                        placeholder="e.g., Advanced Calculus - Integration Techniques"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newStream.description}
                        onChange={(e) => setNewStream({ ...newStream, description: e.target.value })}
                        placeholder="What will you cover in this session?"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="subject">Subject *</Label>
                        <Select
                          value={newStream.subject}
                          onValueChange={(value) => setNewStream({ ...newStream, subject: value })}
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
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={newStream.duration}
                          onChange={(e) =>
                            setNewStream({ ...newStream, duration: Number.parseInt(e.target.value) || 60 })
                          }
                          min="15"
                          max="180"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="scheduledAt">Scheduled Date & Time *</Label>
                      <Input
                        id="scheduledAt"
                        type="datetime-local"
                        value={newStream.scheduledAt}
                        onChange={(e) => setNewStream({ ...newStream, scheduledAt: e.target.value })}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxViewers">Max Viewers</Label>
                      <Input
                        id="maxViewers"
                        type="number"
                        value={newStream.maxViewers}
                        onChange={(e) =>
                          setNewStream({ ...newStream, maxViewers: Number.parseInt(e.target.value) || 100 })
                        }
                        min="10"
                        max="1000"
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newStream.chatEnabled}
                          onChange={(e) => setNewStream({ ...newStream, chatEnabled: e.target.checked })}
                        />
                        <span className="text-sm">Enable Chat</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newStream.recordingEnabled}
                          onChange={(e) => setNewStream({ ...newStream, recordingEnabled: e.target.checked })}
                        />
                        <span className="text-sm">Record Session</span>
                      </label>
                    </div>
                    <Button onClick={createStream} className="w-full">
                      Schedule Live Stream
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Streams List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Your Live Streams</CardTitle>
                  <CardDescription>Manage your scheduled and past streams</CardDescription>
                </CardHeader>
                <CardContent>
                  {streams.length === 0 ? (
                    <div className="text-center py-8">
                      <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No streams yet</h3>
                      <p className="text-gray-600 mb-6">Schedule your first live stream to start teaching</p>
                      <Button onClick={() => setShowCreateDialog(true)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule First Stream
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {streams.map((stream) => (
                        <div key={stream.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900">{stream.title}</h3>
                                {getStatusBadge(stream.status)}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{stream.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDateTime(stream.scheduledAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {stream.duration} min
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {stream.viewers.length}/{stream.maxViewers}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {stream.status === "scheduled" && (
                                <Button size="sm" onClick={() => startStream(stream.id)}>
                                  <Play className="h-4 w-4 mr-1" />
                                  Start
                                </Button>
                              )}
                              {stream.status === "live" && (
                                <Button size="sm" variant="destructive" onClick={() => endStream(stream.id)}>
                                  <Square className="h-4 w-4 mr-1" />
                                  End
                                </Button>
                              )}
                              <Button size="sm" variant="outline" onClick={() => setCurrentStream(stream)}>
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Chat
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{stream.subject}</Badge>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {stream.chatEnabled && <span>💬 Chat</span>}
                              {stream.recordingEnabled && <span>🎥 Recording</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Live Chat */}
            <div>
              {currentStream ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Live Chat</CardTitle>
                    <CardDescription>{currentStream.title}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-64 border rounded-lg p-3 overflow-y-auto bg-gray-50">
                      {chatMessages.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center mt-8">No messages yet</p>
                      ) : (
                        <div className="space-y-2">
                          {chatMessages.map((message) => (
                            <div key={message.id} className="text-sm">
                              <span className="font-medium text-blue-600">{message.userName}:</span>
                              <span className="ml-2 text-gray-700">{message.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {currentStream.status === "live" && (
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                        />
                        <Button size="sm" onClick={sendChatMessage}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Select a stream to view chat</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
