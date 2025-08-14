"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export interface User {
  uid: string
  email: string
  displayName?: string | null
  profileImage?: string | null
  role: "student" | "lecturer" | "admin" | "pending"
  emailVerified: boolean
  createdAt?: Date
  lastLoginAt?: Date
  university?: string
  department?: string
  level?: string
  bio?: string
  specializations?: string[]
  verified?: boolean
  rating?: number
  totalStudents?: number
  totalQuestions?: number
  totalLessons?: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  isLecturer: boolean
  isStudent: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateUserProfile: (data: Partial<User>) => Promise<void>
  sendVerificationEmail: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    // Return mock data for development
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAdmin: false,
      isLecturer: false,
      isStudent: false,
      signIn: async () => {},
      signUp: async () => {},
      signInWithGoogle: async () => {},
      signOut: async () => {},
      updateUserProfile: async () => {},
      sendVerificationEmail: async () => {},
    }
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName,
              profileImage: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
              ...userData,
            } as User)
          } else {
            // Create user document if it doesn't exist
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName,
              profileImage: firebaseUser.photoURL,
              role: "pending",
              emailVerified: firebaseUser.emailVerified,
              createdAt: new Date(),
              lastLoginAt: new Date(),
            }
            await setDoc(doc(db, "users", firebaseUser.uid), newUser)
            setUser(newUser)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      await updateDoc(doc(db, "users", result.user.uid), {
        lastLoginAt: new Date(),
      })
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)

      if (userData.displayName) {
        await updateProfile(result.user, {
          displayName: userData.displayName,
        })
      }

      const newUser: User = {
        uid: result.user.uid,
        email: result.user.email!,
        displayName: userData.displayName || null,
        profileImage: null,
        role: userData.role || "student",
        emailVerified: false,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        ...userData,
      }

      await setDoc(doc(db, "users", result.user.uid), newUser)
      await sendEmailVerification(result.user)
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)

      const userDoc = await getDoc(doc(db, "users", result.user.uid))
      if (!userDoc.exists()) {
        const newUser: User = {
          uid: result.user.uid,
          email: result.user.email!,
          displayName: result.user.displayName,
          profileImage: result.user.photoURL,
          role: "student",
          emailVerified: result.user.emailVerified,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        }
        await setDoc(doc(db, "users", result.user.uid), newUser)
      } else {
        await updateDoc(doc(db, "users", result.user.uid), {
          lastLoginAt: new Date(),
        })
      }
    } catch (error) {
      console.error("Google sign in error:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    }
  }

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) throw new Error("No user logged in")

    try {
      await updateDoc(doc(db, "users", user.uid), data)
      setUser({ ...user, ...data })
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  }

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) throw new Error("No user logged in")

    try {
      await sendEmailVerification(auth.currentUser)
    } catch (error) {
      console.error("Send verification email error:", error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin: user?.role === "admin",
    isLecturer: user?.role === "lecturer",
    isStudent: user?.role === "student",
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateUserProfile,
    sendVerificationEmail,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
