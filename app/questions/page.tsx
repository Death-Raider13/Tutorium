"use client"

import AuthGuard from "@/components/AuthGuard"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function QuestionsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900">All Questions</h1>
            <Link href="/ask">
              <Button className="bg-blue-700 text-white hover:bg-blue-800">Ask New Question</Button>
            </Link>
          </div>

          <div className="space-y-6">
            {/* Sample questions */}
            <div className="bg-white p-6 rounded-xl shadow-md border">
              <h3 className="font-semibold text-lg text-blue-700 mb-2">
                How does a cantilever beam work in real-world structures?
              </h3>
              <p className="text-gray-600 text-sm mb-3">Asked by Musa A. • Civil Engineering • 2 days ago</p>
              <p className="text-gray-700 mb-4">
                I'm trying to understand the practical applications of cantilever beams in construction. Can someone
                explain how they distribute loads and what makes them stable?
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-green-600 font-medium">✓ Answered by Engr. Kola Akinwale</div>
                <Button variant="outline" size="sm">
                  View Answer
                </Button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border">
              <h3 className="font-semibold text-lg text-blue-700 mb-2">
                What is the purpose of a flywheel in a mechanical system?
              </h3>
              <p className="text-gray-600 text-sm mb-3">Asked by Ngozi O. • Mechanical Engineering • 1 week ago</p>
              <p className="text-gray-700 mb-4">
                I've been studying mechanical systems and keep seeing flywheels mentioned. What exactly do they do and
                why are they important?
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-green-600 font-medium">✓ Answered by Prof. Danladi Umar</div>
                <Button variant="outline" size="sm">
                  View Answer
                </Button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border">
              <h3 className="font-semibold text-lg text-blue-700 mb-2">
                How do I calculate the efficiency of a heat engine?
              </h3>
              <p className="text-gray-600 text-sm mb-3">Asked by Ahmed K. • Mechanical Engineering • 3 days ago</p>
              <p className="text-gray-700 mb-4">
                I'm working on a thermodynamics problem and need help understanding how to calculate the efficiency of
                different types of heat engines.
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-orange-600 font-medium">⏳ Waiting for answer</div>
                <Button variant="outline" size="sm">
                  Answer Question
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Have a question that hasn't been asked?</p>
            <Link href="/ask">
              <Button className="bg-green-600 text-white hover:bg-green-700">Ask Your Question</Button>
            </Link>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
