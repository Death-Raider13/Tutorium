"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export interface User {
  uid: string
  email: string
  displayName?: string | null
  profileImage?: string | null
  role?: string
  emailVerified: boolean
  createdAt?: Date
  lastLoginAt?: Date
  points?: number
  level?: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  isLecturer: boolean
  isStudent: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    // Return a default context when not wrapped in provider
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAdmin: false,
      isLecturer: false,
      isStudent: false,
      signIn: async () => {
        throw new Error("Auth provider not found")
      },
      signUp: async () => {
        throw new Error("Auth provider not found")
      },
      signOut: async () => {
        throw new Error("Auth provider not found")
      },
      refreshUser: async () => {
        throw new Error("Auth provider not found")
      },
    }
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User> => {
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      const userData = userDoc.data()

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName,
        profileImage: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        role: userData?.role || "pending",
        createdAt: userData?.createdAt?.toDate(),
        lastLoginAt: userData?.lastLoginAt?.toDate(),
        points: userData?.points || 0,
        level: userData?.level || 1,
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      // Return basic user data if Firestore fetch fails
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName,
        profileImage: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        role: "pending",
        points: 0,
        level: 1,
      }
    }
  }

  const refreshUser = async () => {
    if (auth.currentUser) {
      const userData = await fetchUserData(auth.currentUser)
      setUser(userData)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true)
      try {
        if (firebaseUser) {
          const userData = await fetchUserData(firebaseUser)
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Auth state change error:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)

      // Update profile
      await updateProfile(firebaseUser, { displayName })

      // Send verification email
      await sendEmailVerification(firebaseUser)

      // Create user document in Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        email,
        displayName,
        role: "pending",
        createdAt: new Date(),
        lastLoginAt: new Date(),
        points: 0,
        level: 1,
      })
    } catch (error) {
      console.error("Sign up error:", error)
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

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin: user?.role === "admin",
    isLecturer: user?.role === "lecturer",
    isStudent: user?.role === "student",
    signIn,
    signUp,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
