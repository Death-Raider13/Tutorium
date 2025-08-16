"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    const fetchNotifications = async () => {
      const user = auth.currentUser
      if (!user) return

      const q = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid)
      )
      const snap = await getDocs(q)
      setNotifications(snap.docs.map((doc) => doc.data()))
    }

    fetchNotifications()
  }, [])

  if (!notifications.length) {
    return <p className="text-gray-500">No notifications.</p>
  }

  return (
    <div className="bg-white p-4 rounded shadow space-y-3">
      <h2 className="text-lg font-semibold text-blue-700">Notifications</h2>
      {notifications.map((note, idx) => (
        <div key={idx} className="text-sm text-gray-700 border-b pb-2">
          {note.message}
        </div>
      ))}
    </div>
  )
}
