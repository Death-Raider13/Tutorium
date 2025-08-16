"use client"

import { useState, useEffect } from "react"
import { sendEmailVerification, reload } from "firebase/auth"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Mail, CheckCircle, Clock, RefreshCw, ArrowLeft, Shield, AlertTriangle, Inbox, Smartphone } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { getErrorMessage } from "@/lib/errors"

interface VerificationStep {
  id: string
  title: string
  description: string
  completed: boolean
  current: boolean
}

export function EmailVerificationFlow() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [checking, setChecking] = useState(false)
  const [lastSent, setLastSent] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const steps: VerificationStep[] = [
    {
      id: "email-sent",
      title: "Email Sent",
      description: "Verification email has been sent to your inbox",
      completed: !!lastSent,
      current: !lastSent,
    },
    {
      id: "check-email",
      title: "Check Your Email",
      description: "Click the verification link in your email",
      completed: false,
      current: !!lastSent && !user?.emailVerified,
    },
    {
      id: "verified",
      title: "Email Verified",
      description: "Your email has been successfully verified",
      completed: !!user?.emailVerified,
      current: false,
    },
  ]

  useEffect(() => {
    if (user?.emailVerified) {
      setCurrentStep(2)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } else if (lastSent) {
      setCurrentStep(1)
    }
  }, [user?.emailVerified, lastSent, router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleSendVerification = async () => {
    if (!user || sending) return

    try {
      setSending(true)
      await sendEmailVerification(user)
      setLastSent(new Date())
      setCountdown(60)
      setCurrentStep(1)
      toast.success("Verification email sent successfully!")
    } catch (error: any) {
      console.error("Error sending verification email:", error)
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage)

      if (error.code === "auth/too-many-requests") {
        setCountdown(120)
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

      if (user.emailVerified) {
        setCurrentStep(2)
        toast.success("Email verified successfully!")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
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

  if (!user) return null

  if (user.emailVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Email Verified!</CardTitle>
            <CardDescription>Your email has been successfully verified. Redirecting to dashboard...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const canResend = countdown === 0 && !sending
  const progressValue = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            We sent a verification link to <strong className="text-blue-600">{user.email}</strong>
          </p>
        </div>

        {/* Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-lg">Verification Progress</CardTitle>
              <Badge variant="outline">
                {currentStep + 1} of {steps.length}
              </Badge>
            </div>
            <Progress value={progressValue} className="h-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    step.completed
                      ? "bg-green-50 border border-green-200"
                      : step.current
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div
                    className={`p-1 rounded-full ${
                      step.completed ? "bg-green-100" : step.current ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : step.current ? (
                      <Clock className="h-4 w-4 text-blue-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-medium ${
                        step.completed ? "text-green-700" : step.current ? "text-blue-700" : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Action Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Email Verification Required
            </CardTitle>
            <CardDescription>
              Please check your email and click the verification link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Alert>
                <Inbox className="h-4 w-4" />
                <AlertDescription>
                  <strong>Check your inbox</strong>
                  <br />
                  Look for an email from Tutorium with the subject "Verify your email address"
                </AlertDescription>
              </Alert>
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  <strong>Check spam folder</strong>
                  <br />
                  Sometimes verification emails end up in spam or promotions folder
                </AlertDescription>
              </Alert>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button onClick={handleCheckVerification} disabled={checking} className="w-full" size="lg">
                {checking ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Checking Verification Status...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    I've Verified My Email
                  </>
                )}
              </Button>

              <Button
                onClick={handleSendVerification}
                disabled={sending || !canResend}
                variant="outline"
                className="w-full bg-transparent"
                size="lg"
              >
                {sending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending Verification Email...
                  </>
                ) : canResend ? (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Verification Email
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Resend Available in {countdown}s
                  </>
                )}
              </Button>
            </div>

            {/* Additional Info */}
            {lastSent && (
              <div className="text-center">
                <p className="text-sm text-gray-600">Last verification email sent: {lastSent.toLocaleTimeString()}</p>
              </div>
            )}

            {/* Help Section */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Still having trouble?</strong>
                <br />
                The verification link expires in 24 hours. If you're still having issues, please contact our support
                team.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
