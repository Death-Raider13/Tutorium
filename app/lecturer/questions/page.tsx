"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Search, MessageSquare, Clock, CheckCircle, User, Calendar, Send } from "lucide-react"
import { collection, query, getDocs, doc, updateDoc, addDoc, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"
import RoleBasedRoute from "@/components/RoleBasedRoute"

interface Question {
  id: string
  title: string
  content: string
  subject: string
  userId: string
  userEmail: string
  userName: string
  createdAt: any
  answered: boolean
  answeredBy?: string
  answeredAt?: any
  answer?: string
  priority: "low" | "medium" | "high"
  tags: string[]
}

export default function LecturerQuestionsPage() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const questionsRef = collection(db, "questions")
      const q = query(questionsRef, orderBy("createdAt", "desc"), limit(50))
      const querySnapshot = await getDocs(q)

      const questionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Question[]

      setQuestions(questionsData)
    } catch (error) {
      console.error("Error fetching questions:", error)
      toast({
        title: "Error",
        description: "Failed to load questions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSubmit = async (questionId: string) => {
    if (!answer.trim() || !user) return

    try {
      setSubmitting(true)

      // Update the question with the answer
      const questionRef = doc(db, "questions", questionId)
      await updateDoc(questionRef, {
        answered: true,
        answer: answer.trim(),
        answeredBy: user.email,
        answeredAt: new Date(),
      })

      // Create a notification for the student
      await addDoc(collection(db, "notifications"), {
        userId: selectedQuestion?.userId,
        type: "question_answered",
        title: "Your question has been answered!",
        message: `${user.displayName || user.email} answered your question: "${selectedQuestion?.title}"`,
        questionId: questionId,
        createdAt: new Date(),
        read: false,
      })

      // Update local state
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, answered: true, answer: answer.trim(), answeredBy: user.email, answeredAt: new Date() }
            : q,
        ),
      )

      setAnswer("")
      setSelectedQuestion(null)

      toast({
        title: "Success",
        description: "Answer submitted successfully!",
      })
    } catch (error) {
      console.error("Error submitting answer:", error)
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.subject.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && !question.answered) ||
      (activeTab === "answered" && question.answered)

    return matchesSearch && matchesTab
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading questions..." />
      </div>
    )
  }

  return (
    <RoleBasedRoute allowedRoles={["lecturer", "admin"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Answer Questions</h1>
            <p className="text-gray-600 mt-2">Help students by answering their questions</p>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending ({questions.filter((q) => !q.answered).length})
              </TabsTrigger>
              <TabsTrigger value="answered" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Answered ({questions.filter((q) => q.answered).length})
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                All ({questions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredQuestions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                    <p className="text-gray-500">
                      {searchTerm ? "Try adjusting your search terms" : "No questions match the current filter"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {filteredQuestions.map((question) => (
                    <Card key={question.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{question.title}</CardTitle>
                            <CardDescription className="text-sm text-gray-600 mb-3">{question.content}</CardDescription>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {question.userName || question.userEmail}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {question.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                              </div>
                              <Badge variant="outline">{question.subject}</Badge>
                              {question.priority && (
                                <Badge className={getPriorityColor(question.priority)}>{question.priority}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {question.answered ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Answered
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        {question.answered && question.answer ? (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2">Answer:</h4>
                            <p className="text-green-800">{question.answer}</p>
                            <p className="text-xs text-green-600 mt-2">
                              Answered by {question.answeredBy} on{" "}
                              {question.answeredAt?.toDate?.()?.toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {selectedQuestion?.id === question.id ? (
                              <div className="space-y-4">
                                <Textarea
                                  placeholder="Write your answer here..."
                                  value={answer}
                                  onChange={(e) => setAnswer(e.target.value)}
                                  rows={4}
                                  className="resize-none"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleAnswerSubmit(question.id)}
                                    disabled={!answer.trim() || submitting}
                                    className="flex items-center gap-2"
                                  >
                                    {submitting ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}
                                    Submit Answer
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedQuestion(null)
                                      setAnswer("")
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button onClick={() => setSelectedQuestion(question)} className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Answer Question
                              </Button>
                            )}
                          </div>
                        )}
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
