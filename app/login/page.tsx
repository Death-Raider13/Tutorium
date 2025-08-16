"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db, googleProvider } from "@/lib/firebase"
import { isAdminEmail, getAdminAccountInfo, ADMIN_PASSWORD } from "@/lib/adminConfig"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { FormField } from "@/components/ui/form-field"
import { PasswordInput } from "@/components/ui/password-input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Mail, Shield, Chrome, GraduationCap, ArrowRight } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { loginSchema, type LoginFormData } from "@/lib/validations"
import { getErrorMessage } from "@/lib/errors"

export default function LoginPage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)

  // Check if email is admin email and switch to admin mode
  useEffect(() => {
    const adminMode = isAdminEmail(formData.email)
    setIsAdminMode(adminMode)
    if (adminMode) {
      setFormData((prev) => ({ ...prev, password: ADMIN_PASSWORD }))
    } else if (isAdminMode && !adminMode) {
      setFormData((prev) => ({ ...prev, password: "" }))
    }
  }, [formData.email, isAdminMode])

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard")
    }
  }, [currentUser, router])

  const validateField = (name: keyof LoginFormData, value: string) => {
    try {
      const fieldSchema = loginSchema.shape[name]
      fieldSchema.parse(value)
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, [name]: error.message }))
    }
  }

  const handleInputChange = (name: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Real-time validation
    if (value !== "") {
      validateField(name, value)
    } else {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formData)
      setErrors({})
      return true
    } catch (error: any) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {}
      error.errors?.forEach((err: any) => {
        if (err.path?.[0]) {
          fieldErrors[err.path[0] as keyof LoginFormData] = err.message
        }
      })
      setErrors(fieldErrors)
      return false
    }
  }

  const handleAdminLogin = async (email: string, password: string) => {
    const adminInfo = getAdminAccountInfo(email)
    if (!adminInfo || password !== ADMIN_PASSWORD) {
      throw new Error("Invalid admin credentials")
    }

    try {
      // Try to sign in first
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential
    } catch (error: any) {
      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
        // Create admin account if it doesn't exist
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password)

          // Create admin user document
          await setDoc(doc(db, "users", userCredential.user.uid), {
            email: email,
            displayName: adminInfo.displayName,
            role: "admin",
            isHardcodedAdmin: true,
            emailVerified: true,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            points: 0,
            level: 1,
            achievements: [],
            studyGroups: [],
            certificates: [],
          })

          return userCredential
        } catch (createError) {
          console.error("Error creating admin account:", createError)
          throw new Error("Failed to create admin account")
        }
      }
      throw error
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    const loadingToast = toast.loading("Signing you in...")

    try {
      let userCredential

      if (isAdminMode) {
        userCredential = await handleAdminLogin(formData.email, formData.password)
        toast.dismiss(loadingToast)
        toast.success("Admin login successful!")
      } else {
        userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
        toast.dismiss(loadingToast)
        toast.success("Login successful!")
      }

      // Update last login time
      if (userCredential.user) {
        const userRef = doc(db, "users", userCredential.user.uid)
        await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true })
      }

      router.push("/dashboard")
    } catch (error: any) {
      toast.dismiss(loadingToast)
      console.error("Login error:", error)
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    const loadingToast = toast.loading("Signing in with Google...")

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Check if user document exists
      const userRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          role: "pending",
          emailVerified: user.emailVerified,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          points: 0,
          level: 1,
          achievements: [],
          studyGroups: [],
          certificates: [],
        })
      } else {
        // Update last login time
        await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true })
      }

      toast.dismiss(loadingToast)
      toast.success("Google login successful!")
      router.push("/dashboard")
    } catch (error: any) {
      toast.dismiss(loadingToast)
      console.error("Google login error:", error)
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className={`mx-auto mb-4 p-3 rounded-full w-fit ${isAdminMode ? "bg-red-100" : "bg-blue-100"}`}>
              {isAdminMode ? (
                <Shield className="h-8 w-8 text-red-600" />
              ) : (
                <GraduationCap className="h-8 w-8 text-blue-600" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isAdminMode ? "Admin Access" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isAdminMode ? "Sign in to your administrator account" : "Sign in to your Tutorium account"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {isAdminMode && (
              <Alert className="border-red-200 bg-red-50">
                <Shield className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Administrator Mode</strong>
                  <br />
                  You are signing in with elevated privileges.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-4">
              {/* Email */}
              <FormField label="Email Address" error={errors.email} required>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={loading}
                  />
                </div>
              </FormField>

              {/* Password */}
              <FormField label="Password" error={errors.password} required>
                <PasswordInput
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  disabled={loading || isAdminMode}
                />
              </FormField>

              {/* Submit Button */}
              <Button
                type="submit"
                className={`w-full h-11 ${
                  isAdminMode ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing In...
                  </>
                ) : (
                  <>
                    {isAdminMode ? <Shield className="h-4 w-4 mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {!isAdminMode && (
              <>
                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                {/* Google Login */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 bg-transparent"
                  onClick={handleGoogleLogin}
                  disabled={loading || googleLoading}
                >
                  {googleLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Chrome className="h-4 w-4 mr-2" />
                      Continue with Google
                    </>
                  )}
                </Button>

                {/* Links */}
                <div className="space-y-4 text-center text-sm">
                  <Link href="/forgot-password" className="text-blue-600 hover:text-blue-500 underline block">
                    Forgot your password?
                  </Link>
                  <div className="text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-blue-600 hover:text-blue-500 font-medium underline">
                      Sign up
                    </Link>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
