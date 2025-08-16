"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import AuthGuard from "@/components/AuthGuard"
import Link from "next/link"

export default function StudentDashboard() {
  const [questions, setQuestions] = useState<any[]>([])

  useEffect(() => {
    const fetch = async () => {
      const user = auth.currentUser
      if (!user) return
      const q = query(collection(db, "questions"), where("userId", "==", user.uid))
      const snap = await getDocs(q)
      setQuestions(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    }
    fetch()
  }, [])

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-xl font-bold mb-4">Your Questions</h1>
        <Link href="/ask" className="text-blue-600 underline mb-6 block">Ask New Question</Link>
        {questions.map((q) => (
          <div key={q.id} className="mb-4 p-4 border rounded bg-white">
            <h2 className="font-semibold">{q.title}</h2>
            <p className="text-gray-700">{q.description}</p>
            <p className="text-sm text-gray-500">Status: {q.answered ? "Answered" : "Pending"}</p>
          </div>
        ))}
      </div>
    </AuthGuard>
  )
}
