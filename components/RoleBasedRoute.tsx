"use client"

import type React from "react"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ROLE_REDIRECTS } from "@/lib/constants"

interface RoleBasedRouteProps {
  allowedRoles: string[]
  children: React.ReactNode
  redirectTo?: string
}

export default function RoleBasedRoute({ allowedRoles, children, redirectTo }: RoleBasedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user && !allowedRoles.includes(user.role)) {
      const defaultRedirect = ROLE_REDIRECTS[user.role as keyof typeof ROLE_REDIRECTS]
      router.push(redirectTo || defaultRedirect || "/dashboard")
      return
    }
  }, [user, loading, isAuthenticated, allowedRoles, redirectTo, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Redirecting..." />
      </div>
    )
  }

  return <>{children}</>
}
