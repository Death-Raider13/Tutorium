import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  GraduationCap,
  Users,
  MessageSquare,
  BookOpen,
  Award,
  TrendingUp,
  Star,
  Play,
  ArrowRight,
  Clock,
} from "lucide-react"

export default function HomePage() {
  const featuredLecturers = [
    {
      id: 1,
      name: "Dr. Adebayo Ogundimu",
      title: "Structural Engineering Expert",
      university: "University of Lagos",
      rating: 4.9,
      students: 1250,
      image: "/placeholder-user.jpg",
      specialties: ["Structural Analysis", "Concrete Design", "Steel Structures"],
    },
    {
      id: 2,
      name: "Prof. Fatima Al-Rashid",
      title: "Mechanical Engineering Professor",
      university: "Ahmadu Bello University",
      rating: 4.8,
      students: 980,
      image: "/placeholder-user.jpg",
      specialties: ["Thermodynamics", "Fluid Mechanics", "Heat Transfer"],
    },
    {
      id: 3,
      name: "Dr. Chinedu Okwu",
      title: "Electrical Engineering Specialist",
      university: "University of Nigeria, Nsukka",
      rating: 4.9,
      students: 1100,
      image: "/placeholder-user.jpg",
      specialties: ["Power Systems", "Control Systems", "Electronics"],
    },
  ]

  const recentQuestions = [
    {
      id: 1,
      title: "How to calculate the deflection of a simply supported beam?",
      subject: "Structural Engineering",
      author: "Kemi Adebayo",
      answers: 5,
      votes: 12,
      timeAgo: "2 hours ago",
      tags: ["beam-analysis", "deflection", "structural"],
    },
    {
      id: 2,
      title: "What's the difference between AC and DC motor control?",
      subject: "Electrical Engineering",
      author: "Ibrahim Musa",
      answers: 3,
      votes: 8,
      timeAgo: "4 hours ago",
      tags: ["motors", "control-systems", "electrical"],
    },
    {
      id: 3,
      title: "How to design a heat exchanger for optimal efficiency?",
      subject: "Mechanical Engineering",
      author: "Grace Okafor",
      answers: 7,
      votes: 15,
      timeAgo: "6 hours ago",
      tags: ["heat-transfer", "design", "mechanical"],
    },
  ]

  const popularLessons = [
    {
      id: 1,
      title: "Introduction to Structural Analysis",
      instructor: "Dr. Adebayo Ogundimu",
      duration: "45 min",
      students: 2340,
      rating: 4.8,
      thumbnail: "/placeholder.jpg",
      level: "Beginner",
      subject: "Civil Engineering",
    },
    {
      id: 2,
      title: "Thermodynamics Fundamentals",
      instructor: "Prof. Fatima Al-Rashid",
      duration: "38 min",
      students: 1890,
      rating: 4.9,
      thumbnail: "/placeholder.jpg",
      level: "Intermediate",
      subject: "Mechanical Engineering",
    },
    {
      id: 3,
      title: "Circuit Analysis Techniques",
      instructor: "Dr. Chinedu Okwu",
      duration: "52 min",
      students: 1650,
      rating: 4.7,
      thumbnail: "/placeholder.jpg",
      level: "Beginner",
      subject: "Electrical Engineering",
    },
  ]

  const stats = [
    { label: "Active Students", value: "25,000+", icon: Users },
    { label: "Expert Lecturers", value: "500+", icon: GraduationCap },
    { label: "Questions Answered", value: "100,000+", icon: MessageSquare },
    { label: "Video Lessons", value: "2,500+", icon: BookOpen },
  ]

  const features = [
    {
      icon: MessageSquare,
      title: "Expert Q&A",
      description: "Get your engineering questions answered by certified professionals from top Nigerian universities.",
    },
    {
      icon: BookOpen,
      title: "Video Lessons",
      description: "Access comprehensive video tutorials covering all major engineering disciplines and topics.",
    },
    {
      icon: Users,
      title: "Study Groups",
      description: "Join collaborative study groups with peers and participate in guided learning sessions.",
    },
    {
      icon: Award,
      title: "Achievements",
      description: "Earn badges and certificates as you progress through your engineering education journey.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Master Engineering with
              <span className="text-blue-600 block">Expert Guidance</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with certified lecturers from top Nigerian universities. Get your questions answered, learn
              through interactive lessons, and excel in your engineering studies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/questions">
                  Browse Questions
                  <MessageSquare className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Excel</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides comprehensive tools and resources to support your engineering education journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Lecturers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Lecturers</h2>
              <p className="text-gray-600">Learn from certified experts at top Nigerian universities</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/student/lecturers">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredLecturers.map((lecturer) => (
              <Card key={lecturer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={lecturer.image || "/placeholder.svg"} alt={lecturer.name} />
                    <AvatarFallback>
                      {lecturer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{lecturer.name}</CardTitle>
                  <CardDescription>{lecturer.title}</CardDescription>
                  <p className="text-sm text-blue-600 font-medium">{lecturer.university}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="font-medium">{lecturer.rating}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{lecturer.students.toLocaleString()} students</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lecturer.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  <Button className="w-full bg-transparent" variant="outline">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Questions */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Questions</h2>
              <p className="text-gray-600">See what students are asking and learning about</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/questions">
                View All Questions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-6">
            {recentQuestions.map((question) => (
              <Card key={question.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                        {question.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <span className="font-medium">{question.author}</span>
                        <span className="mx-2">•</span>
                        <Badge variant="outline" className="text-xs">
                          {question.subject}
                        </Badge>
                        <span className="mx-2">•</span>
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{question.timeAgo}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {question.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>{question.votes} votes</span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span>{question.answers} answers</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Lessons */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Lessons</h2>
              <p className="text-gray-600">Top-rated video lessons from expert instructors</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/lessons">
                View All Lessons
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularLessons.map((lesson) => (
              <Card key={lesson.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative">
                  <img
                    src={lesson.thumbnail || "/placeholder.svg"}
                    alt={lesson.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                      <Play className="h-5 w-5 mr-2" />
                      Play Lesson
                    </Button>
                  </div>
                  <Badge className="absolute top-3 left-3 bg-blue-600">{lesson.level}</Badge>
                </div>
                <CardContent className="p-6">
                  <div className="mb-3">
                    <Badge variant="outline" className="text-xs mb-2">
                      {lesson.subject}
                    </Badge>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{lesson.title}</h3>
                    <p className="text-sm text-gray-600">by {lesson.instructor}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{lesson.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{lesson.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span>{lesson.rating}</span>
                    </div>
                  </div>
                  <Button className="w-full bg-transparent" variant="outline">
                    Start Learning
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Excel in Engineering?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who are already learning from Nigeria's top engineering experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/signup">
                Start Learning Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              asChild
            >
              <Link href="/ask">
                Ask Your First Question
                <MessageSquare className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
