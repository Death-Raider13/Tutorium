"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { isAdminEmail } from "@/lib/adminConfig"
import { USER_ROLES } from "@/lib/constants"

export interface UserData {
  uid: string
  email: string
  displayName: string
  firstName?: string
  lastName?: string
  role: "student" | "lecturer" | "admin" | "pending"
  requestedRole?: "student" | "lecturer"
  emailVerified: boolean
  createdAt: Date
  lastLoginAt: Date
  isHardcodedAdmin?: boolean
  achievements?: string[]
  studyGroups?: string[]
  certificates?: string[]
  points?: number
  level?: number
  isActive?: boolean
  preferences?: {
    notifications?: {
      email: boolean
      push: boolean
      marketing: boolean
    }
    privacy?: {
      profileVisible: boolean
      showEmail: boolean
    }
  }
}

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setFirebaseUser(null)
        setUser(null)
        setLoading(false)
        return
      }

      setFirebaseUser(firebaseUser)

      try {
        const userDocRef = doc(db, "users", firebaseUser.uid)
        const userDoc = await getDoc(userDocRef)

        let userData: UserData

        if (userDoc.exists()) {
          const data = userDoc.data()
          userData = {
            uid: firebaseUser.uid,
            ...data,
            emailVerified: firebaseUser.emailVerified,
            createdAt: data.createdAt?.toDate() || new Date(),
            lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
          } as UserData
        } else {
          // Create new user document
          const isAdmin = isAdminEmail(firebaseUser.email || "")
          userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "",
            role: isAdmin ? USER_ROLES.ADMIN : USER_ROLES.PENDING,
            emailVerified: firebaseUser.emailVerified,
            createdAt: new Date(),
            lastLoginAt: new Date(),
            isHardcodedAdmin: isAdmin,
            achievements: [],
            studyGroups: [],
            certificates: [],
            points: 0,
            level: 1,
            isActive: true,
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
          }

          await setDoc(userDocRef, userData)
        }

        // Update last login
        await setDoc(userDocRef, { lastLoginAt: new Date() }, { merge: true })

        setUser(userData)
      } catch (error) {
        console.error("Error fetching user data:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const isAuthenticated = !!firebaseUser
  const isAdmin = user?.role === USER_ROLES.ADMIN || user?.isHardcodedAdmin
  const isLecturer = user?.role === USER_ROLES.LECTURER
  const isStudent = user?.role === USER_ROLES.STUDENT
  const isPending = user?.role === USER_ROLES.PENDING

  const signOut = async () => {
    try {
      await auth.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return {
    firebaseUser,
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isLecturer,
    isStudent,
    isPending,
    signOut,
  }
}
