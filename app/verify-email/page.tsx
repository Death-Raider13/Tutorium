"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { sendEmailVerification, reload } from "firebase/auth"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { EmailVerificationFlow } from "@/components/email-verification/verification-flow"

export default function VerifyEmailPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [checking, setChecking] = useState(false)
  const [lastSent, setLastSent] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    // If user is already verified, redirect to dashboard
    if (user?.emailVerified) {
      router.push("/dashboard")
      return
    }

    // If no user, redirect to login
    if (!loading && !user) {
      router.push("/login")
      return
    }
  }, [user, loading, router])

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendVerification = async () => {
    if (!user || sending) return

    try {
      setSending(true)
      await sendEmailVerification(user)
      setLastSent(new Date())
      setCountdown(60) // 60 second cooldown
      toast.success("Verification email sent! Check your inbox.")
    } catch (error: any) {
      console.error("Error sending verification email:", error)
      if (error.code === "auth/too-many-requests") {
        toast.error("Too many requests. Please wait before trying again.")
        setCountdown(120) // 2 minute cooldown for rate limiting
      } else {
        toast.error("Failed to send verification email. Please try again.")
      }
    } finally {
      setSending(false)
    }
  }

  const handleCheckVerification = async () => {
    if (!user || checking) return

    try {
      setChecking(true)
      await reload(user)

      // Force a refresh of the auth state
      if (user.emailVerified) {
        toast.success("Email verified successfully!")
        router.push("/dashboard")
      } else {
        toast.error("Email not verified yet. Please check your inbox and click the verification link.")
      }
    } catch (error) {
      console.error("Error checking verification status:", error)
      toast.error("Failed to check verification status. Please try again.")
    } finally {
      setChecking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (user.emailVerified) {
    return null // Will redirect to dashboard
  }

  const canResend = countdown === 0

  return (
    <EmailVerificationFlow
      user={user}
      sending={sending}
      setSending={setSending}
      checking={checking}
      setChecking={setChecking}
      lastSent={lastSent}
      setLastSent={setLastSent}
      countdown={countdown}
      setCountdown={setCountdown}
      handleSendVerification={handleSendVerification}
      handleCheckVerification={handleCheckVerification}
      router={router}
    />
  )
}
