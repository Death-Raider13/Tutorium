"use client"

import { useState } from "react"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db, storage } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import AuthGuard from "@/components/AuthGuard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Upload,
  Video,
  FileText,
  ImageIcon,
  Music,
  CheckCircle,
  AlertCircle,
  X,
  CalendarIcon,
  BookOpen,
  FileUp,
  ActivityIcon as Assignment,
} from "lucide-react"
import { SUBJECTS } from "@/lib/constants"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface UploadFile {
  file: File
  type: "video" | "document" | "image" | "audio"
  progress: number
  status: "pending" | "uploading" | "completed" | "error"
  url?: string
  error?: string
}

export default function UploadContentPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("lesson")
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)

  // Lesson Data
  const [lessonData, setLessonData] = useState({
    title: "",
    description: "",
    subject: "",
    level: "100", // Nigerian university level system
    duration: "",
    tags: "",
    isPublic: true,
  })

  // Assignment Data
  const [assignmentData, setAssignmentData] = useState({
    title: "",
    description: "",
    subject: "",
    level: "100",
    dueDate: undefined as Date | undefined,
    maxScore: 100,
    instructions: "",
    submissionType: "file", // file, text, both
    allowLateSubmission: false,
    targetStudents: "all", // all, specific
    isPublic: true,
  })

  // Resource Data
  const [resourceData, setResourceData] = useState({
    title: "",
    description: "",
    subject: "",
    type: "reference", // reference, tool, template, guide
    tags: "",
    isPublic: true,
  })

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: UploadFile[] = Array.from(selectedFiles).map((file) => ({
      file,
      type: getFileType(file),
      progress: 0,
      status: "pending",
    }))

    setFiles((prev) => [...prev, ...newFiles])
  }

  const getFileType = (file: File): "video" | "document" | "image" | "audio" => {
    if (file.type.startsWith("video/")) return "video"
    if (file.type.startsWith("image/")) return "image"
    if (file.type.startsWith("audio/")) return "audio"
    return "document"
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one file",
        variant: "destructive",
      })
      return
    }

    // Validate based on active tab
    let isValid = false
    let collectionName = ""
    let data = {}

    switch (activeTab) {
      case "lesson":
        isValid = lessonData.title && lessonData.description && lessonData.subject
        collectionName = "lessons"
        data = lessonData
        break
      case "assignment":
        isValid = assignmentData.title && assignmentData.description && assignmentData.subject && assignmentData.dueDate
        collectionName = "assignments"
        data = assignmentData
        break
      case "resource":
        isValid = resourceData.title && resourceData.description && resourceData.subject
        collectionName = "resources"
        data = resourceData
        break
    }

    if (!isValid) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const uploadPromises = files.map(async (fileItem, index) => {
        const storageRef = ref(storage, `${activeTab}s/${Date.now()}_${fileItem.file.name}`)
        const uploadTask = uploadBytesResumable(storageRef, fileItem.file)

        return new Promise<string>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, progress, status: "uploading" } : f)))
            },
            (error) => {
              setFiles((prev) =>
                prev.map((f, i) => (i === index ? { ...f, status: "error", error: error.message } : f)),
              )
              reject(error)
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
              setFiles((prev) =>
                prev.map((f, i) => (i === index ? { ...f, status: "completed", url: downloadURL } : f)),
              )
              resolve(downloadURL)
            },
          )
        })
      })

      const uploadedUrls = await Promise.all(uploadPromises)

      // Save content data to Firestore
      await addDoc(collection(db, collectionName), {
        ...data,
        files: uploadedUrls.map((url, index) => ({
          url,
          type: files[index].type,
          name: files[index].file.name,
          size: files[index].file.size,
        })),
        uploadedBy: user?.email,
        uploadedById: user?.uid,
        uploadedByName: user?.displayName || user?.email,
        createdAt: serverTimestamp(),
        views: 0,
        likes: 0,
        downloads: 0,
        tags:
          activeTab === "lesson"
            ? lessonData.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0)
            : activeTab === "resource"
              ? resourceData.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter((tag) => tag.length > 0)
              : [],
        contentType: activeTab,
      })

      toast({
        title: "Success!",
        description: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} uploaded successfully!`,
      })

      // Reset form
      setFiles([])
      if (activeTab === "lesson") {
        setLessonData({
          title: "",
          description: "",
          subject: "",
          level: "100",
          duration: "",
          tags: "",
          isPublic: true,
        })
      } else if (activeTab === "assignment") {
        setAssignmentData({
          title: "",
          description: "",
          subject: "",
          level: "100",
          dueDate: undefined,
          maxScore: 100,
          instructions: "",
          submissionType: "file",
          allowLateSubmission: false,
          targetStudents: "all",
          isPublic: true,
        })
      } else if (activeTab === "resource") {
        setResourceData({
          title: "",
          description: "",
          subject: "",
          type: "reference",
          tags: "",
          isPublic: true,
        })
      }
    } catch (error) {
      console.error("Error uploading content:", error)
      toast({
        title: "Error",
        description: "Failed to upload content",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5 text-red-500" />
      case "image":
        return <ImageIcon className="h-5 w-5 text-green-500" />
      case "audio":
        return <Music className="h-5 w-5 text-purple-500" />
      default:
        return <FileText className="h-5 w-5 text-blue-500" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <AuthGuard requireAuth={true} allowedRoles={["lecturer"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Upload className="h-8 w-8 text-blue-600" />
              Upload Engineering Content
            </h1>
            <p className="text-gray-600 mt-1">
              Share your engineering knowledge with students through lessons, assignments, and resources
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="lesson" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Engineering Lesson
              </TabsTrigger>
              <TabsTrigger value="assignment" className="flex items-center gap-2">
                <Assignment className="h-4 w-4" />
                Assignment
              </TabsTrigger>
              <TabsTrigger value="resource" className="flex items-center gap-2">
                <FileUp className="h-4 w-4" />
                Resource
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lesson" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lesson Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Engineering Lesson Information</CardTitle>
                    <CardDescription>Provide details about your engineering lesson</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="lesson-title">Lesson Title *</Label>
                      <Input
                        id="lesson-title"
                        value={lessonData.title}
                        onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                        placeholder="e.g., Introduction to Structural Analysis"
                      />
                    </div>

                    <div>
                      <Label htmlFor="lesson-description">Description *</Label>
                      <Textarea
                        id="lesson-description"
                        value={lessonData.description}
                        onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
                        placeholder="Describe what students will learn in this engineering lesson..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lesson-subject">Engineering Department *</Label>
                        <Select
                          value={lessonData.subject}
                          onValueChange={(value) => setLessonData({ ...lessonData, subject: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
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
                        <Label htmlFor="lesson-level">Academic Level</Label>
                        <Select
                          value={lessonData.level}
                          onValueChange={(value) => setLessonData({ ...lessonData, level: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                    </div>

                    <div>
                      <Label htmlFor="lesson-duration">Duration (minutes)</Label>
                      <Input
                        id="lesson-duration"
                        type="number"
                        value={lessonData.duration}
                        onChange={(e) => setLessonData({ ...lessonData, duration: e.target.value })}
                        placeholder="e.g., 45"
                      />
                    </div>

                    <div>
                      <Label htmlFor="lesson-tags">Tags</Label>
                      <Input
                        id="lesson-tags"
                        value={lessonData.tags}
                        onChange={(e) => setLessonData({ ...lessonData, tags: e.target.value })}
                        placeholder="e.g., mechanics, statics, dynamics"
                      />
                      <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="lesson-public"
                        checked={lessonData.isPublic}
                        onCheckedChange={(checked) => setLessonData({ ...lessonData, isPublic: checked })}
                      />
                      <Label htmlFor="lesson-public">Make lesson public</Label>
                    </div>
                  </CardContent>
                </Card>

                {/* File Upload Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Files</CardTitle>
                    <CardDescription>Add videos, documents, images, or audio files</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* File Drop Zone */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">Drag and drop files here, or click to select</p>
                      <Input
                        type="file"
                        multiple
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                        id="lesson-file-upload"
                        accept="video/*,image/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx"
                      />
                      <Label htmlFor="lesson-file-upload" className="cursor-pointer">
                        <Button variant="outline" className="mt-2 bg-transparent">
                          Select Files
                        </Button>
                      </Label>
                      <p className="text-xs text-gray-500 mt-2">
                        Supported: Video, Image, Audio, PDF, Word, PowerPoint
                      </p>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Selected Files</h4>
                        {files.map((fileItem, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {getFileIcon(fileItem.type)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{fileItem.file.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(fileItem.file.size)} • {fileItem.type}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(fileItem.status)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  disabled={fileItem.status === "uploading"}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {fileItem.status === "uploading" && (
                              <div className="space-y-1">
                                <Progress value={fileItem.progress} className="h-2" />
                                <p className="text-xs text-gray-500">Uploading... {Math.round(fileItem.progress)}%</p>
                              </div>
                            )}

                            {fileItem.status === "error" && (
                              <Alert className="mt-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                  {fileItem.error || "Upload failed"}
                                </AlertDescription>
                              </Alert>
                            )}

                            {fileItem.status === "completed" && (
                              <div className="flex items-center mt-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <span className="text-sm text-green-600">Upload completed</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Button */}
                    <Button
                      onClick={uploadFiles}
                      disabled={uploading || files.length === 0 || !lessonData.title || !lessonData.description}
                      className="w-full"
                    >
                      {uploading ? "Uploading..." : "Upload Lesson"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="assignment" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assignment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment Details</CardTitle>
                    <CardDescription>Create an engineering assignment for your students</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="assignment-title">Assignment Title *</Label>
                      <Input
                        id="assignment-title"
                        value={assignmentData.title}
                        onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })}
                        placeholder="e.g., Design a Steel Frame Structure"
                      />
                    </div>

                    <div>
                      <Label htmlFor="assignment-description">Description *</Label>
                      <Textarea
                        id="assignment-description"
                        value={assignmentData.description}
                        onChange={(e) => setAssignmentData({ ...assignmentData, description: e.target.value })}
                        placeholder="Describe the assignment objectives and requirements..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="assignment-instructions">Detailed Instructions</Label>
                      <Textarea
                        id="assignment-instructions"
                        value={assignmentData.instructions}
                        onChange={(e) => setAssignmentData({ ...assignmentData, instructions: e.target.value })}
                        placeholder="Provide step-by-step instructions for completing the assignment..."
                        rows={6}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="assignment-subject">Engineering Department *</Label>
                        <Select
                          value={assignmentData.subject}
                          onValueChange={(value) => setAssignmentData({ ...assignmentData, subject: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
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
                        <Label htmlFor="assignment-level">Academic Level</Label>
                        <Select
                          value={assignmentData.level}
                          onValueChange={(value) => setAssignmentData({ ...assignmentData, level: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Due Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !assignmentData.dueDate && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {assignmentData.dueDate ? (
                                format(assignmentData.dueDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={assignmentData.dueDate}
                              onSelect={(date) => setAssignmentData({ ...assignmentData, dueDate: date })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <Label htmlFor="assignment-score">Maximum Score</Label>
                        <Input
                          id="assignment-score"
                          type="number"
                          value={assignmentData.maxScore}
                          onChange={(e) =>
                            setAssignmentData({ ...assignmentData, maxScore: Number.parseInt(e.target.value) })
                          }
                          placeholder="100"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="assignment-submission">Submission Type</Label>
                      <Select
                        value={assignmentData.submissionType}
                        onValueChange={(value) => setAssignmentData({ ...assignmentData, submissionType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="file">File Upload Only</SelectItem>
                          <SelectItem value="text">Text Submission Only</SelectItem>
                          <SelectItem value="both">Both File and Text</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="assignment-target">Target Students</Label>
                      <Select
                        value={assignmentData.targetStudents}
                        onValueChange={(value) => setAssignmentData({ ...assignmentData, targetStudents: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All My Students</SelectItem>
                          <SelectItem value="specific">Specific Students</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="assignment-late"
                          checked={assignmentData.allowLateSubmission}
                          onCheckedChange={(checked) =>
                            setAssignmentData({ ...assignmentData, allowLateSubmission: checked })
                          }
                        />
                        <Label htmlFor="assignment-late">Allow late submissions</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="assignment-public"
                          checked={assignmentData.isPublic}
                          onCheckedChange={(checked) => setAssignmentData({ ...assignmentData, isPublic: checked })}
                        />
                        <Label htmlFor="assignment-public">Make assignment public</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Assignment Files */}
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment Files</CardTitle>
                    <CardDescription>Upload reference materials, templates, or instructions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* File Drop Zone */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">Upload assignment files (optional)</p>
                      <Input
                        type="file"
                        multiple
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                        id="assignment-file-upload"
                        accept="*/*"
                      />
                      <Label htmlFor="assignment-file-upload" className="cursor-pointer">
                        <Button variant="outline" className="mt-2 bg-transparent">
                          Select Files
                        </Button>
                      </Label>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Assignment Files</h4>
                        {files.map((fileItem, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {getFileIcon(fileItem.type)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{fileItem.file.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(fileItem.file.size)} • {fileItem.type}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(fileItem.status)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  disabled={fileItem.status === "uploading"}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {fileItem.status === "uploading" && (
                              <div className="space-y-1">
                                <Progress value={fileItem.progress} className="h-2" />
                                <p className="text-xs text-gray-500">Uploading... {Math.round(fileItem.progress)}%</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Button */}
                    <Button
                      onClick={uploadFiles}
                      disabled={
                        uploading || !assignmentData.title || !assignmentData.description || !assignmentData.dueDate
                      }
                      className="w-full"
                    >
                      {uploading ? "Creating Assignment..." : "Create Assignment"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="resource" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resource Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Engineering Resource Details</CardTitle>
                    <CardDescription>Share engineering resources, tools, and references</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="resource-title">Resource Title *</Label>
                      <Input
                        id="resource-title"
                        value={resourceData.title}
                        onChange={(e) => setResourceData({ ...resourceData, title: e.target.value })}
                        placeholder="e.g., AutoCAD Drawing Templates"
                      />
                    </div>

                    <div>
                      <Label htmlFor="resource-description">Description *</Label>
                      <Textarea
                        id="resource-description"
                        value={resourceData.description}
                        onChange={(e) => setResourceData({ ...resourceData, description: e.target.value })}
                        placeholder="Describe the resource and how students can use it..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="resource-subject">Engineering Department *</Label>
                        <Select
                          value={resourceData.subject}
                          onValueChange={(value) => setResourceData({ ...resourceData, subject: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
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
                        <Label htmlFor="resource-type">Resource Type</Label>
                        <Select
                          value={resourceData.type}
                          onValueChange={(value) => setResourceData({ ...resourceData, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reference">Reference Material</SelectItem>
                            <SelectItem value="tool">Engineering Tool</SelectItem>
                            <SelectItem value="template">Template/Format</SelectItem>
                            <SelectItem value="guide">Study Guide</SelectItem>
                            <SelectItem value="software">Software/App</SelectItem>
                            <SelectItem value="calculator">Calculator/Formula</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="resource-tags">Tags</Label>
                      <Input
                        id="resource-tags"
                        value={resourceData.tags}
                        onChange={(e) => setResourceData({ ...resourceData, tags: e.target.value })}
                        placeholder="e.g., autocad, drawing, template, civil"
                      />
                      <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="resource-public"
                        checked={resourceData.isPublic}
                        onCheckedChange={(checked) => setResourceData({ ...resourceData, isPublic: checked })}
                      />
                      <Label htmlFor="resource-public">Make resource public</Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Resource Files */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Resource Files</CardTitle>
                    <CardDescription>Upload the actual resource files</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* File Drop Zone */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">Upload resource files</p>
                      <Input
                        type="file"
                        multiple
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                        id="resource-file-upload"
                        accept="*/*"
                      />
                      <Label htmlFor="resource-file-upload" className="cursor-pointer">
                        <Button variant="outline" className="mt-2 bg-transparent">
                          Select Files
                        </Button>
                      </Label>
                      <p className="text-xs text-gray-500 mt-2">All file types supported</p>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Resource Files</h4>
                        {files.map((fileItem, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {getFileIcon(fileItem.type)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{fileItem.file.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(fileItem.file.size)} • {fileItem.type}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(fileItem.status)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  disabled={fileItem.status === "uploading"}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {fileItem.status === "uploading" && (
                              <div className="space-y-1">
                                <Progress value={fileItem.progress} className="h-2" />
                                <p className="text-xs text-gray-500">Uploading... {Math.round(fileItem.progress)}%</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Button */}
                    <Button
                      onClick={uploadFiles}
                      disabled={uploading || files.length === 0 || !resourceData.title || !resourceData.description}
                      className="w-full"
                    >
                      {uploading ? "Uploading Resource..." : "Upload Resource"}
                    </Button>
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
