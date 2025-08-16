"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth"
import { setDoc, doc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, db, googleProvider } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { FormField } from "@/components/ui/form-field"
import { PasswordInput } from "@/components/ui/password-input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Mail, User, AlertCircle, Chrome, GraduationCap } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { signupSchema, type SignupFormData } from "@/lib/validations"
import { getErrorMessage } from "@/lib/errors"
import { USER_ROLES } from "@/lib/constants"

export default function SignupPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()

  const [formData, setFormData] = useState<SignupFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [authLoading, isAuthenticated, router])

  const validateField = (name: keyof SignupFormData, value: any) => {
    try {
      const fieldSchema = signupSchema.shape[name]
      if (name === "confirmPassword") {
        // Special validation for confirm password
        if (value !== formData.password) {
          throw new Error("Passwords don't match")
        }
      } else {
        fieldSchema.parse(value)
      }
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, [name]: error.message }))
    }
  }

  const handleInputChange = (name: keyof SignupFormData, value: any) => {
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
      signupSchema.parse(formData)
      setErrors({})
      return true
    } catch (error: any) {
      const fieldErrors: Partial<Record<keyof SignupFormData, string>> = {}
      error.errors?.forEach((err: any) => {
        if (err.path?.[0]) {
          fieldErrors[err.path[0] as keyof SignupFormData] = err.message
        }
      })
      setErrors(fieldErrors)
      return false
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    const loadingToast = toast.loading("Creating your account...")

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      // Update user profile
      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      })

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: user.email,
        displayName: `${formData.firstName} ${formData.lastName}`,
        requestedRole: formData.role,
        role: USER_ROLES.PENDING,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        emailVerified: false,
        isActive: true,
        points: 0,
        level: 1,
        achievements: [],
        studyGroups: [],
        certificates: [],
        preferences: {
          notifications: {
            email: true,
            push: true,
            marketing: false,
          },
          privacy: {
            profileVisible: true,
            showEmail: false,
          },
        },
      })

      toast.dismiss(loadingToast)
      toast.success("Account created successfully! Please verify your email.")
      router.push("/verify-email")
    } catch (error: any) {
      toast.dismiss(loadingToast)
      console.error("Signup error:", error)
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    if (!formData.role) {
      toast.error("Please select your account type first.")
      return
    }

    setGoogleLoading(true)
    const loadingToast = toast.loading("Signing up with Google...")

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Check if user document already exists
      const userDocRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        // Create new user document
        const nameParts = user.displayName?.split(" ") || ["", ""]
        await setDoc(userDocRef, {
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: user.email,
          displayName: user.displayName || "",
          requestedRole: formData.role,
          role: USER_ROLES.PENDING,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          emailVerified: user.emailVerified,
          isActive: true,
          points: 0,
          level: 1,
          achievements: [],
          studyGroups: [],
          certificates: [],
          preferences: {
            notifications: {
              email: true,
              push: true,
              marketing: false,
            },
            privacy: {
              profileVisible: true,
              showEmail: false,
            },
          },
        })
      }

      toast.dismiss(loadingToast)
      toast.success("Account created with Google!")
      router.push("/dashboard")
    } catch (error: any) {
      toast.dismiss(loadingToast)
      console.error("Google signup error:", error)
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage)
    } finally {
      setGoogleLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Join Tutorium</CardTitle>
            <CardDescription className="text-gray-600">
              Create your account and start learning with certified professionals
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleEmailSignup} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label="First Name" error={errors.firstName} required>
                  <Input
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    disabled={loading}
                  />
                </FormField>
                <FormField label="Last Name" error={errors.lastName} required>
                  <Input
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    disabled={loading}
                  />
                </FormField>
              </div>

              {/* Email */}
              <FormField label="Email Address" error={errors.email} required>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={loading}
                  />
                </div>
              </FormField>

              {/* Role Selection */}
              <FormField label="I am a" error={errors.role} required>
                <Select
                  value={formData.role}
                  onValueChange={(value: "student" | "lecturer") => handleInputChange("role", value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Student - I want to learn
                      </div>
                    </SelectItem>
                    <SelectItem value="lecturer">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Lecturer - I want to teach
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              {/* Password */}
              <FormField
                label="Password"
                error={errors.password}
                required
                description="Must be at least 8 characters with uppercase, lowercase, number, and special character"
              >
                <PasswordInput
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  disabled={loading}
                  showStrength
                />
              </FormField>

              {/* Confirm Password */}
              <FormField
                label="Confirm Password"
                error={errors.confirmPassword}
                success={
                  formData.confirmPassword && formData.password === formData.confirmPassword
                    ? "Passwords match"
                    : undefined
                }
                required
              >
                <PasswordInput
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  disabled={loading}
                />
              </FormField>

              {/* Terms Agreement */}
              <FormField error={errors.agreeToTerms}>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                    disabled={loading}
                  />
                  <label htmlFor="agreeToTerms" className="text-sm leading-5 text-gray-700">
                    I agree to the{" "}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-500 underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-500 underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </FormField>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Signup */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 bg-transparent"
              onClick={handleGoogleSignup}
              disabled={loading || googleLoading || !formData.role}
            >
              {googleLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing up...
                </>
              ) : (
                <>
                  <Chrome className="h-4 w-4 mr-2" />
                  Continue with Google
                </>
              )}
            </Button>

            {!formData.role && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Please select your account type before using Google signup.</AlertDescription>
              </Alert>
            )}

            {/* Sign In Link */}
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
