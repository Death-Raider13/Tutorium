"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import AuthGuard from "@/components/AuthGuard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  Award,
  Star,
  Target,
  BookOpen,
  MessageSquare,
  Users,
  Zap,
  Crown,
  Medal,
  Gift,
  Calendar,
  Lock,
  CheckCircle,
} from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: "learning" | "social" | "milestone" | "special"
  points: number
  rarity: "common" | "rare" | "epic" | "legendary"
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
  isUnlocked: boolean
}

interface UserStats {
  totalPoints: number
  level: number
  questionsAsked: number
  questionsAnswered: number
  lessonsCompleted: number
  studyGroupsJoined: number
  streakDays: number
  totalAchievements: number
  unlockedAchievements: number
}

export default function AchievementsPage() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    level: 1,
    questionsAsked: 0,
    questionsAnswered: 0,
    lessonsCompleted: 0,
    studyGroupsJoined: 0,
    streakDays: 0,
    totalAchievements: 0,
    unlockedAchievements: 0,
  })
  const [loading, setLoading] = useState(true)

  // Mock achievements data
  const mockAchievements: Achievement[] = [
    {
      id: "first_question",
      title: "First Steps",
      description: "Ask your first question",
      icon: "MessageSquare",
      category: "learning",
      points: 10,
      rarity: "common",
      isUnlocked: true,
      unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: "helpful_answer",
      title: "Helpful Helper",
      description: "Receive 5 upvotes on your answers",
      icon: "Star",
      category: "social",
      points: 25,
      rarity: "rare",
      isUnlocked: true,
      unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: "lesson_master",
      title: "Lesson Master",
      description: "Complete 10 lessons",
      icon: "BookOpen",
      category: "learning",
      points: 50,
      rarity: "rare",
      isUnlocked: false,
      progress: 7,
      maxProgress: 10,
    },
    {
      id: "social_butterfly",
      title: "Social Butterfly",
      description: "Join 3 study groups",
      icon: "Users",
      category: "social",
      points: 30,
      rarity: "common",
      isUnlocked: false,
      progress: 1,
      maxProgress: 3,
    },
    {
      id: "streak_warrior",
      title: "Streak Warrior",
      description: "Maintain a 7-day learning streak",
      icon: "Zap",
      category: "milestone",
      points: 75,
      rarity: "epic",
      isUnlocked: false,
      progress: 3,
      maxProgress: 7,
    },
    {
      id: "knowledge_seeker",
      title: "Knowledge Seeker",
      description: "Ask 25 questions",
      icon: "Target",
      category: "learning",
      points: 40,
      rarity: "common",
      isUnlocked: false,
      progress: 12,
      maxProgress: 25,
    },
    {
      id: "engineering_expert",
      title: "Engineering Expert",
      description: "Reach level 10",
      icon: "Crown",
      category: "milestone",
      points: 200,
      rarity: "legendary",
      isUnlocked: false,
      progress: 3,
      maxProgress: 10,
    },
    {
      id: "mentor",
      title: "Mentor",
      description: "Help 50 students with answers",
      icon: "Award",
      category: "social",
      points: 100,
      rarity: "epic",
      isUnlocked: false,
      progress: 0,
      maxProgress: 50,
    },
  ]

  useEffect(() => {
    if (!user) return

    // Set mock data
    setAchievements(mockAchievements)

    // Calculate user stats
    const unlockedCount = mockAchievements.filter((a) => a.isUnlocked).length
    const totalPoints = mockAchievements.filter((a) => a.isUnlocked).reduce((sum, a) => sum + a.points, 0)

    setUserStats({
      totalPoints: totalPoints + (user.points || 0),
      level: user.level || Math.floor(totalPoints / 100) + 1,
      questionsAsked: 12,
      questionsAnswered: 8,
      lessonsCompleted: 7,
      studyGroupsJoined: 1,
      streakDays: 3,
      totalAchievements: mockAchievements.length,
      unlockedAchievements: unlockedCount,
    })

    setLoading(false)
  }, [user])

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Trophy,
      Award,
      Star,
      Target,
      BookOpen,
      MessageSquare,
      Users,
      Zap,
      Crown,
      Medal,
    }
    const IconComponent = iconMap[iconName] || Trophy
    return <IconComponent className="h-6 w-6" />
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "rare":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "epic":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "legendary":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "learning":
        return <BookOpen className="h-4 w-4" />
      case "social":
        return <Users className="h-4 w-4" />
      case "milestone":
        return <Target className="h-4 w-4" />
      case "special":
        return <Gift className="h-4 w-4" />
      default:
        return <Trophy className="h-4 w-4" />
    }
  }

  const getAchievementsByCategory = (category: string) => {
    return achievements.filter((achievement) => achievement.category === category)
  }

  const getUnlockedAchievements = () => {
    return achievements.filter((achievement) => achievement.isUnlocked)
  }

  const getInProgressAchievements = () => {
    return achievements.filter((achievement) => !achievement.isUnlocked && achievement.progress !== undefined)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading achievements...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Achievements
            </h1>
            <p className="text-gray-600 mt-1">Track your progress and unlock rewards as you learn</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Points</p>
                    <p className="text-2xl font-bold text-yellow-600">{userStats.totalPoints}</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Level</p>
                    <p className="text-2xl font-bold text-blue-600">{userStats.level}</p>
                  </div>
                  <Crown className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-2">
                  <Progress value={userStats.totalPoints % 100} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {100 - (userStats.totalPoints % 100)} points to next level
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Achievements</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {userStats.unlockedAchievements}/{userStats.totalAchievements}
                    </p>
                  </div>
                  <Medal className="h-8 w-8 text-purple-500" />
                </div>
                <div className="mt-2">
                  <Progress
                    value={(userStats.unlockedAchievements / userStats.totalAchievements) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((userStats.unlockedAchievements / userStats.totalAchievements) * 100)}% complete
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Streak</p>
                    <p className="text-2xl font-bold text-orange-600">{userStats.streakDays} days</p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
              <TabsTrigger value="progress">In Progress</TabsTrigger>
              <TabsTrigger value="learning">Learning</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="milestone">Milestones</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={`relative overflow-hidden ${
                      achievement.isUnlocked ? "border-green-200 bg-green-50" : "border-gray-200"
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`p-3 rounded-full ${
                            achievement.isUnlocked ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {achievement.isUnlocked ? getIconComponent(achievement.icon) : <Lock className="h-6 w-6" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRarityColor(achievement.rarity)} variant="outline">
                            {achievement.rarity}
                          </Badge>
                          {achievement.isUnlocked && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                      </div>

                      <h3
                        className={`font-semibold mb-2 ${achievement.isUnlocked ? "text-gray-900" : "text-gray-500"}`}
                      >
                        {achievement.title}
                      </h3>
                      <p className={`text-sm mb-4 ${achievement.isUnlocked ? "text-gray-600" : "text-gray-400"}`}>
                        {achievement.description}
                      </p>

                      {achievement.progress !== undefined && !achievement.isUnlocked && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-gray-600">
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          <Progress
                            value={((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100}
                            className="h-2"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(achievement.category)}
                          <span className="text-sm text-gray-600 capitalize">{achievement.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{achievement.points} pts</span>
                        </div>
                      </div>

                      {achievement.unlockedAt && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <Calendar className="h-3 w-3" />
                            Unlocked {achievement.unlockedAt.toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="unlocked" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getUnlockedAchievements().map((achievement) => (
                  <Card key={achievement.id} className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                          {getIconComponent(achievement.icon)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRarityColor(achievement.rarity)} variant="outline">
                            {achievement.rarity}
                          </Badge>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      </div>

                      <h3 className="font-semibold mb-2 text-gray-900">{achievement.title}</h3>
                      <p className="text-sm mb-4 text-gray-600">{achievement.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(achievement.category)}
                          <span className="text-sm text-gray-600 capitalize">{achievement.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{achievement.points} pts</span>
                        </div>
                      </div>

                      {achievement.unlockedAt && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <Calendar className="h-3 w-3" />
                            Unlocked {achievement.unlockedAt.toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getInProgressAchievements().map((achievement) => (
                  <Card key={achievement.id} className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                          {getIconComponent(achievement.icon)}
                        </div>
                        <Badge className={getRarityColor(achievement.rarity)} variant="outline">
                          {achievement.rarity}
                        </Badge>
                      </div>

                      <h3 className="font-semibold mb-2 text-gray-900">{achievement.title}</h3>
                      <p className="text-sm mb-4 text-gray-600">{achievement.description}</p>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="text-gray-600">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                        <Progress
                          value={((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100}
                          className="h-2"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(achievement.category)}
                          <span className="text-sm text-gray-600 capitalize">{achievement.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{achievement.points} pts</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="learning" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getAchievementsByCategory("learning").map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={`relative overflow-hidden ${
                      achievement.isUnlocked ? "border-green-200 bg-green-50" : "border-gray-200"
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`p-3 rounded-full ${
                            achievement.isUnlocked ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {achievement.isUnlocked ? getIconComponent(achievement.icon) : <Lock className="h-6 w-6" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRarityColor(achievement.rarity)} variant="outline">
                            {achievement.rarity}
                          </Badge>
                          {achievement.isUnlocked && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                      </div>

                      <h3
                        className={`font-semibold mb-2 ${achievement.isUnlocked ? "text-gray-900" : "text-gray-500"}`}
                      >
                        {achievement.title}
                      </h3>
                      <p className={`text-sm mb-4 ${achievement.isUnlocked ? "text-gray-600" : "text-gray-400"}`}>
                        {achievement.description}
                      </p>

                      {achievement.progress !== undefined && !achievement.isUnlocked && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-gray-600">
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          <Progress
                            value={((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100}
                            className="h-2"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span className="text-sm text-gray-600">Learning</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{achievement.points} pts</span>
                        </div>
                      </div>

                      {achievement.unlockedAt && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <Calendar className="h-3 w-3" />
                            Unlocked {achievement.unlockedAt.toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getAchievementsByCategory("social").map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={`relative overflow-hidden ${
                      achievement.isUnlocked ? "border-green-200 bg-green-50" : "border-gray-200"
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`p-3 rounded-full ${
                            achievement.isUnlocked ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {achievement.isUnlocked ? getIconComponent(achievement.icon) : <Lock className="h-6 w-6" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRarityColor(achievement.rarity)} variant="outline">
                            {achievement.rarity}
                          </Badge>
                          {achievement.isUnlocked && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                      </div>

                      <h3
                        className={`font-semibold mb-2 ${achievement.isUnlocked ? "text-gray-900" : "text-gray-500"}`}
                      >
                        {achievement.title}
                      </h3>
                      <p className={`text-sm mb-4 ${achievement.isUnlocked ? "text-gray-600" : "text-gray-400"}`}>
                        {achievement.description}
                      </p>

                      {achievement.progress !== undefined && !achievement.isUnlocked && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-gray-600">
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          <Progress
                            value={((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100}
                            className="h-2"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span className="text-sm text-gray-600">Social</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{achievement.points} pts</span>
                        </div>
                      </div>

                      {achievement.unlockedAt && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <Calendar className="h-3 w-3" />
                            Unlocked {achievement.unlockedAt.toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="milestone" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getAchievementsByCategory("milestone").map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={`relative overflow-hidden ${
                      achievement.isUnlocked ? "border-green-200 bg-green-50" : "border-gray-200"
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`p-3 rounded-full ${
                            achievement.isUnlocked ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {achievement.isUnlocked ? getIconComponent(achievement.icon) : <Lock className="h-6 w-6" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRarityColor(achievement.rarity)} variant="outline">
                            {achievement.rarity}
                          </Badge>
                          {achievement.isUnlocked && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                      </div>

                      <h3
                        className={`font-semibold mb-2 ${achievement.isUnlocked ? "text-gray-900" : "text-gray-500"}`}
                      >
                        {achievement.title}
                      </h3>
                      <p className={`text-sm mb-4 ${achievement.isUnlocked ? "text-gray-600" : "text-gray-400"}`}>
                        {achievement.description}
                      </p>

                      {achievement.progress !== undefined && !achievement.isUnlocked && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-gray-600">
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          <Progress
                            value={((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100}
                            className="h-2"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          <span className="text-sm text-gray-600">Milestone</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">{achievement.points} pts</span>
                        </div>
                      </div>

                      {achievement.unlockedAt && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <Calendar className="h-3 w-3" />
                            Unlocked {achievement.unlockedAt.toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
