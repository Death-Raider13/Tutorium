"use client"

import { useState, useEffect } from "react"
import {
  collection,
  query,
  doc,
  updateDoc,
  arrayUnion,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import AuthGuard from "@/components/AuthGuard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trophy, Star, Award, Target, BookOpen, Users, CheckCircle, Lock, Zap, Crown, Medal, Gift } from "lucide-react"
import toast from "react-hot-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface Achievement {
  id: string
  title: string
  description: string
  category: "learning" | "community" | "milestone" | "special"
  type: "progress" | "milestone" | "streak" | "collection"
  rarity: "common" | "rare" | "epic" | "legendary"
  icon: string
  points: number
  requirements: {
    type: string
    target: number
    current?: number
  }
  unlockedBy: string[]
  createdAt: Date
  isActive: boolean
}

interface UserProgress {
  questionsAsked: number
  questionsAnswered: number
  lessonsWatched: number
  studyGroupsJoined: number
  streakDays: number
  totalPoints: number
  level: number
  achievements: string[]
  certificates: string[]
}

const ACHIEVEMENT_CATEGORIES = [
  { id: "all", label: "All", icon: Trophy },
  { id: "learning", label: "Learning", icon: BookOpen },
  { id: "community", label: "Community", icon: Users },
  { id: "milestone", label: "Milestones", icon: Target },
  { id: "special", label: "Special", icon: Crown },
]

const RARITY_CONFIG = {
  common: { color: "bg-gray-100 text-gray-800", icon: Medal },
  rare: { color: "bg-blue-100 text-blue-800", icon: Star },
  epic: { color: "bg-purple-100 text-purple-800", icon: Award },
  legendary: { color: "bg-yellow-100 text-yellow-800", icon: Crown },
}

export default function AchievementsPage() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress>({
    questionsAsked: 0,
    questionsAnswered: 0,
    lessonsWatched: 0,
    studyGroupsJoined: 0,
    streakDays: 0,
    totalPoints: 0,
    level: 1,
    achievements: [],
    certificates: [],
  })
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchRealData = async () => {
      try {
        // Fetch real achievements from Firestore
        const achievementsQuery = query(
          collection(db, "achievements"),
          where("isActive", "==", true),
          orderBy("createdAt", "desc"),
        )
        const achievementsSnap = await getDocs(achievementsQuery)

        let achievementsData = achievementsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Achievement[]

        // If no achievements exist, create default ones
        if (achievementsData.length === 0) {
          await createDefaultAchievements()
          // Refetch after creating
          const newAchievementsSnap = await getDocs(achievementsQuery)
          achievementsData = newAchievementsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          })) as Achievement[]
        }

        setAchievements(achievementsData)

        // Fetch real user progress
        const userProgressData = await fetchUserProgress()
        setUserProgress(userProgressData)

        // Check for new achievements
        await checkAndUnlockAchievements(achievementsData, userProgressData)
      } catch (error) {
        console.error("Error fetching achievements data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRealData()
  }, [user])

  const createDefaultAchievements = async () => {
    const defaultAchievements = [
      {
        title: "First Steps",
        description: "Ask your first question",
        category: "learning",
        type: "milestone",
        rarity: "common",
        icon: "❓",
        points: 10,
        requirements: { type: "questionsAsked", target: 1 },
        unlockedBy: [],
        isActive: true,
        createdAt: serverTimestamp(),
      },
      {
        title: "Curious Mind",
        description: "Ask 10 questions",
        category: "learning",
        type: "progress",
        rarity: "common",
        icon: "🤔",
        points: 50,
        requirements: { type: "questionsAsked", target: 10 },
        unlockedBy: [],
        isActive: true,
        createdAt: serverTimestamp(),
      },
      {
        title: "Helper",
        description: "Answer 5 questions",
        category: "community",
        type: "progress",
        rarity: "rare",
        icon: "🤝",
        points: 75,
        requirements: { type: "questionsAnswered", target: 5 },
        unlockedBy: [],
        isActive: true,
        createdAt: serverTimestamp(),
      },
      {
        title: "Knowledge Seeker",
        description: "Watch 20 lessons",
        category: "learning",
        type: "progress",
        rarity: "rare",
        icon: "📚",
        points: 100,
        requirements: { type: "lessonsWatched", target: 20 },
        unlockedBy: [],
        isActive: true,
        createdAt: serverTimestamp(),
      },
      {
        title: "Social Learner",
        description: "Join 3 study groups",
        category: "community",
        type: "progress",
        rarity: "epic",
        icon: "👥",
        points: 150,
        requirements: { type: "studyGroupsJoined", target: 3 },
        unlockedBy: [],
        isActive: true,
        createdAt: serverTimestamp(),
      },
      {
        title: "Dedicated Student",
        description: "Maintain a 7-day learning streak",
        category: "milestone",
        type: "streak",
        rarity: "epic",
        icon: "🔥",
        points: 200,
        requirements: { type: "streakDays", target: 7 },
        unlockedBy: [],
        isActive: true,
        createdAt: serverTimestamp(),
      },
      {
        title: "Scholar",
        description: "Reach level 10",
        category: "milestone",
        type: "milestone",
        rarity: "legendary",
        icon: "🎓",
        points: 500,
        requirements: { type: "level", target: 10 },
        unlockedBy: [],
        isActive: true,
        createdAt: serverTimestamp(),
      },
      {
        title: "Point Master",
        description: "Earn 1000 points",
        category: "milestone",
        type: "milestone",
        rarity: "legendary",
        icon: "💎",
        points: 300,
        requirements: { type: "totalPoints", target: 1000 },
        unlockedBy: [],
        isActive: true,
        createdAt: serverTimestamp(),
      },
    ]

    // Add achievements to Firestore
    for (const achievement of defaultAchievements) {
      await addDoc(collection(db, "achievements"), achievement)
    }
  }

  const fetchUserProgress = async (): Promise<UserProgress> => {
    if (!user) return userProgress

    try {
      // Fetch user's questions
      const questionsQuery = query(collection(db, "questions"), where("userId", "==", user.uid))
      const questionsSnap = await getDocs(questionsQuery)
      const questions = questionsSnap.docs.map((doc) => doc.data())
      const answeredCount = questions.filter((q) => q.answered).length

      // Fetch user's answered questions (as lecturer)
      const answeredQuestionsQuery = query(collection(db, "questions"), where("answeredBy", "==", user.uid))
      const answeredQuestionsSnap = await getDocs(answeredQuestionsQuery)

      // Fetch user's study groups
      const studyGroupsQuery = query(collection(db, "studyGroups"), where("members", "array-contains", user.uid))
      const studyGroupsSnap = await getDocs(studyGroupsQuery)

      // Fetch user's lesson progress
      const lessonsQuery = query(collection(db, "lessons"))
      const lessonsSnap = await getDocs(lessonsQuery)
      const lessonsWatched = lessonsSnap.docs.filter((doc) => doc.data().viewedBy?.includes(user.uid)).length

      // Fetch user achievements
      const userAchievementsQuery = query(collection(db, "userAchievements"), where("userId", "==", user.uid))
      const userAchievementsSnap = await getDocs(userAchievementsQuery)
      const userAchievements = userAchievementsSnap.docs.map((doc) => doc.data().achievementId)

      return {
        questionsAsked: questions.length,
        questionsAnswered: answeredQuestionsSnap.size,
        lessonsWatched,
        studyGroupsJoined: studyGroupsSnap.size,
        streakDays: 0, // This would need a more complex calculation
        totalPoints: user.points || 0,
        level: user.level || 1,
        achievements: userAchievements,
        certificates: user.certificates || [],
      }
    } catch (error) {
      console.error("Error fetching user progress:", error)
      return userProgress
    }
  }

  const checkAndUnlockAchievements = async (achievementsList: Achievement[], progressData: UserProgress) => {
    if (!user) return

    const newlyUnlocked: Achievement[] = []

    for (const achievement of achievementsList) {
      const isAlreadyUnlocked = progressData.achievements.includes(achievement.id)
      if (isAlreadyUnlocked) continue

      const { type, target } = achievement.requirements
      const currentValue = (progressData[type as keyof UserProgress] as number) || 0

      if (currentValue >= target) {
        newlyUnlocked.push(achievement)
      }
    }

    if (newlyUnlocked.length > 0) {
      try {
        // Add achievements to user's collection
        for (const achievement of newlyUnlocked) {
          await addDoc(collection(db, "userAchievements"), {
            userId: user.uid,
            achievementId: achievement.id,
            unlockedAt: serverTimestamp(),
          })
        }

        // Update user's points and achievements
        const userRef = doc(db, "users", user.uid)
        const newPoints = newlyUnlocked.reduce((sum, a) => sum + a.points, 0)

        await updateDoc(userRef, {
          points: (user.points || 0) + newPoints,
          achievements: arrayUnion(...newlyUnlocked.map((a) => a.id)),
        })

        // Show notifications
        newlyUnlocked.forEach((achievement) => {
          toast.success(`🎉 Achievement Unlocked: ${achievement.title}!`)
        })

        // Update local state
        setUserProgress((prev) => ({
          ...prev,
          achievements: [...prev.achievements, ...newlyUnlocked.map((a) => a.id)],
          totalPoints: prev.totalPoints + newPoints,
        }))
      } catch (error) {
        console.error("Error updating achievements:", error)
      }
    }
  }

  const getFilteredAchievements = () => {
    if (selectedCategory === "all") return achievements
    return achievements.filter((achievement) => achievement.category === selectedCategory)
  }

  const getAchievementProgress = (achievement: Achievement) => {
    const { type, target } = achievement.requirements
    const current = (userProgress[type as keyof UserProgress] as number) || 0
    return Math.min((current / target) * 100, 100)
  }

  const isAchievementUnlocked = (achievementId: string) => {
    return userProgress.achievements.includes(achievementId)
  }

  const getUnlockedCount = () => {
    return achievements.filter((a) => isAchievementUnlocked(a.id)).length
  }

  const getTotalPoints = () => {
    return achievements.filter((a) => isAchievementUnlocked(a.id)).reduce((sum, a) => sum + a.points, 0)
  }

  const getRarityStats = () => {
    const stats = { common: 0, rare: 0, epic: 0, legendary: 0 }
    achievements.filter((a) => isAchievementUnlocked(a.id)).forEach((a) => stats[a.rarity]++)
    return stats
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading achievements..." />
      </div>
    )
  }

  const filteredAchievements = getFilteredAchievements()
  const unlockedCount = getUnlockedCount()
  const totalPoints = getTotalPoints()
  const rarityStats = getRarityStats()

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                  Achievements
                </h1>
                <p className="text-gray-600 mt-1">Track your learning progress and unlock rewards</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">{totalPoints}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {unlockedCount}/{achievements.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((unlockedCount / Math.max(achievements.length, 1)) * 100)}% complete
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Level</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userProgress.level}</div>
                <p className="text-xs text-muted-foreground">{userProgress.totalPoints} total points</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userProgress.streakDays}</div>
                <p className="text-xs text-muted-foreground">Days in a row</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rare Achievements</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rarityStats.epic + rarityStats.legendary}</div>
                <p className="text-xs text-muted-foreground">Epic & Legendary</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>Track your learning journey across different activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Questions Asked</span>
                      <span>{userProgress.questionsAsked}</span>
                    </div>
                    <Progress value={(userProgress.questionsAsked / 20) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Questions Answered</span>
                      <span>{userProgress.questionsAnswered}</span>
                    </div>
                    <Progress value={(userProgress.questionsAnswered / 15) * 100} className="h-2" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Lessons Watched</span>
                      <span>{userProgress.lessonsWatched}</span>
                    </div>
                    <Progress value={(userProgress.lessonsWatched / 30) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Study Groups Joined</span>
                      <span>{userProgress.studyGroupsJoined}</span>
                    </div>
                    <Progress value={(userProgress.studyGroupsJoined / 5) * 100} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              {ACHIEVEMENT_CATEGORIES.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                  <category.icon className="h-4 w-4" />
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory}>
              {filteredAchievements.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements in this category</h3>
                      <p className="text-gray-600">Keep learning to unlock new achievements!</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAchievements.map((achievement) => {
                    const isUnlocked = isAchievementUnlocked(achievement.id)
                    const progress = getAchievementProgress(achievement)
                    const rarityConfig = RARITY_CONFIG[achievement.rarity]
                    const current = (userProgress[achievement.requirements.type as keyof UserProgress] as number) || 0

                    return (
                      <Card
                        key={achievement.id}
                        className={`relative overflow-hidden ${isUnlocked ? "ring-2 ring-yellow-400" : ""}`}
                      >
                        {isUnlocked && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`text-2xl p-2 rounded-lg ${isUnlocked ? "bg-yellow-100" : "bg-gray-100"}`}
                              >
                                {isUnlocked ? achievement.icon : <Lock className="h-6 w-6 text-gray-400" />}
                              </div>
                              <div>
                                <CardTitle className={`text-lg ${!isUnlocked ? "text-gray-500" : ""}`}>
                                  {achievement.title}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={rarityConfig.color}>
                                    <rarityConfig.icon className="h-3 w-3 mr-1" />
                                    {achievement.rarity}
                                  </Badge>
                                  <Badge variant="outline">{achievement.points} pts</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          <CardDescription className={!isUnlocked ? "text-gray-400" : ""}>
                            {achievement.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>
                                  {Math.min(current, achievement.requirements.target)}/{achievement.requirements.target}
                                </span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                            {isUnlocked && (
                              <Alert>
                                <Gift className="h-4 w-4" />
                                <AlertDescription>
                                  🎉 Achievement unlocked! You earned {achievement.points} points.
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
