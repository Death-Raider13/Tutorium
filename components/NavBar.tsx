"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Menu, Bell, Search, BookOpen, MessageSquare, Users, GraduationCap, Settings, LogOut, User } from "lucide-react"

// Mock user data for development
const mockUser = {
  uid: "mock-user-id",
  email: "john.doe@example.com",
  displayName: "John Doe",
  profileImage: null,
  role: "student" as const,
  emailVerified: true,
  points: 1250,
  level: 3,
}

// Mock auth hook for development
const useAuth = () => {
  return {
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    isAdmin: false,
    isLecturer: false,
    isStudent: true,
    signOut: async () => {
      console.log("Sign out clicked")
    },
  }
}

const getInitials = (name: string | null | undefined): string => {
  if (!name || typeof name !== "string") return "U"

  try {
    const parts = name.trim().split(" ")
    if (parts.length === 0) return "U"

    const initials = parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("")

    return initials || "U"
  } catch (error) {
    console.error("Error generating initials:", error)
    return "U"
  }
}

const USER_ROLES = {
  ADMIN: "admin",
  LECTURER: "lecturer",
  STUDENT: "student",
  PENDING: "pending",
} as const

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading, isAdmin, isLecturer, isStudent, signOut } = useAuth()

  const navigation = [
    { name: "Home", href: "/", icon: null },
    { name: "Lessons", href: "/lessons", icon: BookOpen },
    { name: "Questions", href: "/questions", icon: MessageSquare },
    { name: "Study Groups", href: "/study-groups", icon: Users },
  ]

  const userNavigation = isAuthenticated
    ? [
        ...(isStudent
          ? [
              { name: "Dashboard", href: "/student/dashboard", icon: User },
              { name: "Find Lecturers", href: "/student/lecturers", icon: GraduationCap },
            ]
          : []),
        ...(isLecturer
          ? [
              { name: "Dashboard", href: "/lecturer/dashboard", icon: User },
              { name: "Upload Content", href: "/lecturer/upload", icon: BookOpen },
              { name: "My Students", href: "/lecturer/students", icon: Users },
              { name: "Analytics", href: "/lecturer/analytics", icon: Settings },
            ]
          : []),
        ...(isAdmin ? [{ name: "Admin Panel", href: "/admin", icon: Settings }] : []),
        { name: "Profile", href: "/profile", icon: User },
        { name: "Achievements", href: "/achievements", icon: GraduationCap },
      ]
    : []

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  if (isLoading) {
    return (
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="ml-2 w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Tutorium</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            {isAuthenticated && (
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  3
                </Badge>
              </Button>
            )}

            {/* User Menu or Auth Buttons */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImage || undefined} alt={user.displayName || "User"} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.displayName || "User"}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {(user.role || "pending").charAt(0).toUpperCase() + (user.role || "pending").slice(1)}
                        </Badge>
                        {user.points && (
                          <Badge variant="outline" className="text-xs">
                            {user.points} pts
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {userNavigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link href={item.href} className="flex items-center space-x-2">
                          {Icon && <Icon className="h-4 w-4" />}
                          <span>{item.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-4">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          pathname === item.href
                            ? "text-blue-600 bg-blue-50"
                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                        }`}
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}

                  {isAuthenticated && userNavigation.length > 0 && (
                    <>
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Account</p>
                        {userNavigation.map((item) => {
                          const Icon = item.icon
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                            >
                              {Icon && <Icon className="h-4 w-4" />}
                              <span>{item.name}</span>
                            </Link>
                          )
                        })}
                        <Button
                          variant="ghost"
                          onClick={handleSignOut}
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 mt-2"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign out
                        </Button>
                      </div>
                    </>
                  )}

                  {!isAuthenticated && (
                    <div className="border-t pt-4 space-y-2">
                      <Button variant="outline" className="w-full bg-transparent" asChild>
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          Sign in
                        </Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link href="/signup" onClick={() => setIsOpen(false)}>
                          Sign up
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
