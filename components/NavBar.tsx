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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  GraduationCap,
  User,
  Settings,
  LogOut,
  Bell,
  MessageSquare,
  Users,
  Award,
  BarChart3,
  Upload,
  Shield,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

// Define user roles as constants to avoid dependency issues
const USER_ROLES = {
  ADMIN: "admin",
  LECTURER: "lecturer",
  STUDENT: "student",
  PENDING: "pending",
} as const

export default function NavBar() {
  const { user, isAuthenticated, signOut } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Safe function to get initials with proper null checks
  const getInitials = (name?: string | null) => {
    if (!name || typeof name !== "string") {
      return "U"
    }

    try {
      return (
        name
          .trim()
          .split(" ")
          .filter((word) => word.length > 0)
          .map((word) => word.charAt(0))
          .join("")
          .toUpperCase()
          .slice(0, 2) || "U"
      )
    } catch (error) {
      console.error("Error generating initials:", error)
      return "U"
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Safe role checking functions
  const isAdmin = user?.role === USER_ROLES.ADMIN
  const isLecturer = user?.role === USER_ROLES.LECTURER
  const isStudent = user?.role === USER_ROLES.STUDENT

  const navigationItems = [
    { href: "/", label: "Home", public: true },
    { href: "/questions", label: "Questions", public: true },
    { href: "/lessons", label: "Lessons", public: true },
    { href: "/ask", label: "Ask Question", requireAuth: true },
    { href: "/study-groups", label: "Study Groups", requireAuth: true },
  ]

  const studentItems = [
    { href: "/student/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/student/lecturers", label: "Find Lecturers", icon: Users },
    { href: "/achievements", label: "Achievements", icon: Award },
    { href: "/profile", label: "Profile", icon: User },
  ]

  const lecturerItems = [
    { href: "/lecturer/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/lecturer/upload", label: "Upload Content", icon: Upload },
    { href: "/lecturer/questions", label: "Answer Questions", icon: MessageSquare },
    { href: "/lecturer/students", label: "My Students", icon: Users },
    { href: "/lecturer/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/profile", label: "Profile", icon: User },
  ]

  const adminItems = [
    { href: "/admin", label: "Admin Dashboard", icon: Shield },
    { href: "/profile", label: "Profile", icon: User },
  ]

  const getRoleItems = () => {
    if (isAdmin) return adminItems
    if (isLecturer) return lecturerItems
    if (isStudent) return studentItems
    return []
  }

  const isActivePath = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname?.startsWith(href) || false
  }

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return "destructive"
      case USER_ROLES.LECTURER:
        return "default"
      case USER_ROLES.STUDENT:
        return "secondary"
      default:
        return "outline"
    }
  }

  // Safe display name with fallbacks
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User"
  const userEmail = user?.email || ""
  const userRole = user?.role || USER_ROLES.PENDING

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Tutorium</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              if (item.requireAuth && !isAuthenticated) return null
              if (!item.public && !item.requireAuth && !isAuthenticated) return null

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActivePath(item.href)
                      ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {isAuthenticated && (
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                  3
                </Badge>
              </Button>
            )}

            {/* User Menu or Auth Buttons */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImage || "/placeholder-user.jpg"} alt={displayName} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">{getInitials(displayName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getRoleBadgeVariant(userRole)} className="text-xs">
                          {userRole}
                        </Badge>
                        {user.emailVerified && (
                          <Badge variant="outline" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Role-specific menu items */}
                  {getRoleItems().map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-4">
                  {/* User Info */}
                  {isAuthenticated && user && (
                    <div className="flex items-center space-x-3 pb-4 border-b">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.profileImage || "/placeholder-user.jpg"} alt={displayName} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{displayName}</p>
                        <p className="text-sm text-gray-500">{userEmail}</p>
                        <Badge variant={getRoleBadgeVariant(userRole)} className="text-xs mt-1">
                          {userRole}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Navigation Items */}
                  {navigationItems.map((item) => {
                    if (item.requireAuth && !isAuthenticated) return null
                    if (!item.public && !item.requireAuth && !isAuthenticated) return null

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`text-sm font-medium py-2 px-3 rounded-md transition-colors ${
                          isActivePath(item.href) ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* Role-specific items */}
                  {isAuthenticated && (
                    <>
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Dashboard</p>
                        {getRoleItems().map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-2 text-sm py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100"
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>

                      <div className="border-t pt-4">
                        <Link
                          href="/settings"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-2 text-sm py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                        <button
                          onClick={() => {
                            handleSignOut()
                            setIsOpen(false)
                          }}
                          className="flex items-center space-x-2 text-sm py-2 px-3 rounded-md text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </>
                  )}

                  {/* Auth buttons for non-authenticated users */}
                  {!isAuthenticated && (
                    <div className="border-t pt-4 space-y-2">
                      <Button variant="ghost" asChild className="w-full justify-start">
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link href="/signup" onClick={() => setIsOpen(false)}>
                          Sign Up
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
