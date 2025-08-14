"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users, Calendar, Clock, MapPin, Plus, MessageSquare, Video, Globe, Lock } from "lucide-react"

export default function StudyGroupsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedType, setSelectedType] = useState("all")

  const studyGroups = [
    {
      id: 1,
      name: "Structural Analysis Study Group",
      description: "Weekly sessions focusing on beam analysis, moment diagrams, and structural design principles.",
      subject: "Civil Engineering",
      type: "Online",
      members: 24,
      maxMembers: 30,
      meetingTime: "Saturdays 2:00 PM",
      nextMeeting: "Tomorrow",
      moderator: {
        name: "Dr. Adebayo Ogundimu",
        avatar: "/placeholder-user.jpg",
        title: "Professor",
      },
      tags: ["structural-analysis", "beams", "design"],
      isPrivate: false,
      difficulty: "Intermediate",
      language: "English",
    },
    {
      id: 2,
      name: "Thermodynamics Problem Solving",
      description: "Collaborative problem-solving sessions for thermodynamics concepts and applications.",
      subject: "Mechanical Engineering",
      type: "Hybrid",
      members: 18,
      maxMembers: 25,
      meetingTime: "Wednesdays 4:00 PM",
      nextMeeting: "In 3 days",
      moderator: {
        name: "Prof. Fatima Al-Rashid",
        avatar: "/placeholder-user.jpg",
        title: "Professor",
      },
      tags: ["thermodynamics", "problem-solving", "heat-transfer"],
      isPrivate: false,
      difficulty: "Advanced",
      language: "English",
    },
    {
      id: 3,
      name: "Circuit Design Workshop",
      description: "Hands-on circuit design and analysis with practical applications and simulations.",
      subject: "Electrical Engineering",
      type: "In-Person",
      members: 15,
      maxMembers: 20,
      meetingTime: "Fridays 3:00 PM",
      nextMeeting: "This Friday",
      location: "Engineering Lab 204",
      moderator: {
        name: "Dr. Chinedu Okwu",
        avatar: "/placeholder-user.jpg",
        title: "Lecturer",
      },
      tags: ["circuits", "design", "simulation"],
      isPrivate: false,
      difficulty: "Beginner",
      language: "English",
    },
    {
      id: 4,
      name: "Chemical Process Design",
      description: "Advanced study group for chemical process design, optimization, and safety considerations.",
      subject: "Chemical Engineering",
      type: "Online",
      members: 12,
      maxMembers: 15,
      meetingTime: "Tuesdays 6:00 PM",
      nextMeeting: "Next week",
      moderator: {
        name: "Dr. Amina Hassan",
        avatar: "/placeholder-user.jpg",
        title: "Associate Professor",
      },
      tags: ["process-design", "optimization", "safety"],
      isPrivate: true,
      difficulty: "Advanced",
      language: "English",
    },
    {
      id: 5,
      name: "Programming for Engineers",
      description: "Learn programming fundamentals with applications in engineering problem-solving.",
      subject: "Computer Engineering",
      type: "Online",
      members: 32,
      maxMembers: 40,
      meetingTime: "Sundays 1:00 PM",
      nextMeeting: "This Sunday",
      moderator: {
        name: "Dr. Kola Akinwale",
        avatar: "/placeholder-user.jpg",
        title: "Senior Lecturer",
      },
      tags: ["programming", "python", "matlab", "problem-solving"],
      isPrivate: false,
      difficulty: "Beginner",
      language: "English",
    },
    {
      id: 6,
      name: "Petroleum Reservoir Modeling",
      description: "Advanced reservoir modeling techniques and simulation software training.",
      subject: "Petroleum Engineering",
      type: "Hybrid",
      members: 8,
      maxMembers: 12,
      meetingTime: "Thursdays 5:00 PM",
      nextMeeting: "Next Thursday",
      moderator: {
        name: "Dr. Musa Abdullahi",
        avatar: "/placeholder-user.jpg",
        title: "Professor",
      },
      tags: ["reservoir", "modeling", "simulation"],
      isPrivate: true,
      difficulty: "Advanced",
      language: "English",
    },
  ]

  const subjects = [
    "All Subjects",
    "Civil Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Chemical Engineering",
    "Computer Engineering",
    "Petroleum Engineering",
  ]

  const types = ["All Types", "Online", "In-Person", "Hybrid"]

  const filteredGroups = studyGroups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesSubject = selectedSubject === "all" || group.subject === selectedSubject
    const matchesType = selectedType === "all" || group.type === selectedType

    return matchesSearch && matchesSubject && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Online":
        return <Globe className="h-4 w-4" />
      case "In-Person":
        return <MapPin className="h-4 w-4" />
      case "Hybrid":
        return <Video className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Groups</h1>
            <p className="text-gray-600">Join collaborative learning sessions with peers and expert guidance</p>
          </div>
          <Button className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search study groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.slice(1).map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={type === "All Types" ? "all" : type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{studyGroups.length}</div>
              <div className="text-sm text-gray-600">Active Groups</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {studyGroups.reduce((sum, group) => sum + group.members, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Members</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {studyGroups.filter((group) => group.type === "Online").length}
              </div>
              <div className="text-sm text-gray-600">Online Groups</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {studyGroups.filter((group) => !group.isPrivate).length}
              </div>
              <div className="text-sm text-gray-600">Open Groups</div>
            </CardContent>
          </Card>
        </div>

        {/* Study Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(group.type)}
                    <Badge variant="outline" className="text-xs">
                      {group.type}
                    </Badge>
                    {group.isPrivate && <Lock className="h-4 w-4 text-gray-400" />}
                  </div>
                  <Badge className={`text-xs ${getDifficultyColor(group.difficulty)}`}>{group.difficulty}</Badge>
                </div>
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <CardDescription className="line-clamp-2">{group.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Subject and Tags */}
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {group.subject}
                  </Badge>
                  <div className="flex flex-wrap gap-1">
                    {group.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {group.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{group.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Moderator */}
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={group.moderator.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {group.moderator.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{group.moderator.name}</p>
                    <p className="text-xs text-gray-500">{group.moderator.title}</p>
                  </div>
                </div>

                {/* Meeting Info */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{group.meetingTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Next: {group.nextMeeting}</span>
                  </div>
                  {group.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{group.location}</span>
                    </div>
                  )}
                </div>

                {/* Members */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>
                      {group.members}/{group.maxMembers} members
                    </span>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(group.members / group.maxMembers) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button className="flex-1" size="sm" asChild>
                    <Link href={`/study-groups/${group.id}`}>{group.isPrivate ? "Request to Join" : "Join Group"}</Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Groups
          </Button>
        </div>
      </div>
    </div>
  )
}
