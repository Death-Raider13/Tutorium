"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HelpCircle, Upload, X, AlertCircle, CheckCircle, Lightbulb, BookOpen, MessageSquare, Tag } from "lucide-react"

export default function AskQuestionPage() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    subject: "",
    tags: [] as string[],
    urgency: "normal",
    attachments: [] as File[],
  })
  const [currentTag, setCurrentTag] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const subjects = [
    "Civil Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Chemical Engineering",
    "Computer Engineering",
    "Petroleum Engineering",
  ]

  const suggestedTags = [
    "structural-analysis",
    "thermodynamics",
    "circuits",
    "fluid-mechanics",
    "programming",
    "design",
    "calculations",
    "theory",
    "practical",
    "homework-help",
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length + formData.attachments.length <= 3) {
      setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...files] }))
    }
  }

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    else if (formData.title.length < 10) newErrors.title = "Title must be at least 10 characters"

    if (!formData.content.trim()) newErrors.content = "Question content is required"
    else if (formData.content.length < 20) newErrors.content = "Please provide more details (at least 20 characters)"

    if (!formData.subject) newErrors.subject = "Please select a subject"

    if (formData.tags.length === 0) newErrors.tags = "Please add at least one tag"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log("Question submitted:", formData)
      // Redirect to question page or show success message
    } catch (error) {
      console.error("Submit error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
          <p className="text-gray-600">Get expert answers from certified engineering professionals</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  <span>Your Question</span>
                </CardTitle>
                <CardDescription>Provide clear details to help our experts give you the best answer</CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Question Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., How to calculate beam deflection with distributed load?"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    <p className="text-xs text-gray-500">
                      Be specific and descriptive. Good titles get better answers.
                    </p>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                      <SelectTrigger className={errors.subject ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select engineering subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <Label htmlFor="content">Question Details *</Label>
                    <Textarea
                      id="content"
                      placeholder="Describe your question in detail. Include what you've tried, what you're expecting, and any relevant context..."
                      value={formData.content}
                      onChange={(e) => handleInputChange("content", e.target.value)}
                      className={`min-h-[150px] ${errors.content ? "border-red-500" : ""}`}
                    />
                    {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                    <p className="text-xs text-gray-500">
                      Include formulas, calculations, or specific problems you're facing.
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags * (up to 5)</Label>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add a tag..."
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addTag(currentTag)
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addTag(currentTag)}
                          disabled={!currentTag || formData.tags.length >= 5}
                        >
                          <Tag className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Current Tags */}
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                              <span>{tag}</span>
                              <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-600">
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Suggested Tags */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Suggested tags:</p>
                        <div className="flex flex-wrap gap-2">
                          {suggestedTags
                            .filter((tag) => !formData.tags.includes(tag))
                            .slice(0, 6)
                            .map((tag) => (
                              <Button
                                key={tag}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addTag(tag)}
                                disabled={formData.tags.length >= 5}
                                className="text-xs"
                              >
                                {tag}
                              </Button>
                            ))}
                        </div>
                      </div>
                    </div>
                    {errors.tags && <p className="text-sm text-red-500">{errors.tags}</p>}
                  </div>

                  {/* Urgency */}
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select value={formData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - General inquiry</SelectItem>
                        <SelectItem value="normal">Normal - Regular question</SelectItem>
                        <SelectItem value="high">High - Assignment due soon</SelectItem>
                        <SelectItem value="urgent">Urgent - Exam preparation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* File Attachments */}
                  <div className="space-y-2">
                    <Label htmlFor="attachments">Attachments (optional)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          Upload images, diagrams, or documents (max 3 files, 10MB each)
                        </p>
                        <input
                          type="file"
                          id="attachments"
                          multiple
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("attachments")?.click()}
                          disabled={formData.attachments.length >= 3}
                        >
                          Choose Files
                        </Button>
                      </div>

                      {/* Uploaded Files */}
                      {formData.attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {formData.attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeAttachment(index)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting Question...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Submit Question
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <span>Tips for Great Questions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">Be specific and descriptive in your title</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">Include what you've already tried</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">Add relevant diagrams or images</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">Use appropriate tags for better visibility</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">Show your work and calculations</p>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span>Community Guidelines</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Please ensure your question is related to engineering topics and follows academic integrity
                    guidelines.
                  </AlertDescription>
                </Alert>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Be respectful and professional</p>
                  <p>• Don't ask for complete homework solutions</p>
                  <p>• Search existing questions before posting</p>
                  <p>• Provide context and show your effort</p>
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Expected Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Normal questions:</span>
                    <span className="font-medium">2-6 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>High priority:</span>
                    <span className="font-medium">1-3 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Urgent questions:</span>
                    <span className="font-medium">30-60 minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
