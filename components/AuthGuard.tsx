"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, Mail, Clock } from 'lucide-react'
import Link from "next/link"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: string[]
  requireEmailVerification?: boolean
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  allowedRoles = [], 
  requireEmailVerification = false 
}: AuthGuardProps) {
  const { user, loading, isAdmin, isLecturer, isStudent, isPending } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    // If authentication is required but user is not logged in
    if (requireAuth && !user) {
      router.push("/login")
      return
    }

    // If specific roles are required
    if (allowedRoles.length > 0 && user) {
      const userRole = user.role || "pending"
      if (!allowedRoles.includes(userRole)) {
        router.push("/dashboard")
        return
      }
    }

    // If email verification is required
    if (requireEmailVerification && user && !user.emailVerified) {
      router.push("/verify-email")
      return
    }
  }, [user, loading, requireAuth, allowedRoles, requireEmailVerification, router])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <Shield className="mx-auto h-12 w-12 text-red-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access this page.</p>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  // If specific roles are required and user doesn't have permission
  if (allowedRoles.length > 0 && user) {
    const userRole = user.role || "pending"
    if (!allowedRoles.includes(userRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-orange-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page. Required role: {allowedRoles.join(" or ")}.
              Your current role: {userRole}.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      )
    }
  }

  // If email verification is required but user hasn't verified
  if (requireEmailVerification && user && !user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <Mail className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verification Required</h2>
          <p className="text-gray-600 mb-6">
            Please verify your email address to access this page.
          </p>
          <Button asChild>
            <Link href="/verify-email">Verify Email</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Show pending approval message for pending users
  if (user && isPending && !allowedRoles.includes("pending")) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Alert className="max-w-2xl mx-auto">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your account is pending approval. You'll receive an email once an administrator reviews your request.
              In the meantime, you can browse available content with limited access.
            </AlertDescription>
          </Alert>
          <div className="mt-8">
            {children}
          </div>
        </div>
      </div>
    )
  }

  // If all checks pass, render the protected content
  return <>{children}</>
}
