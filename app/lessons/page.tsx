"use client"

import AuthGuard from "@/components/AuthGuard"
import { Button } from "@/components/ui/button"

export default function LessonsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">Video Lessons</h1>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample lesson cards */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <video controls className="w-full h-48 object-cover">
                <source src="/videos/thermodynamics-intro.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="p-4">
                <h3 className="text-blue-700 font-semibold text-lg">Thermodynamics 101</h3>
                <p className="text-sm text-gray-600 mb-2">By Dr. Abiola Ajayi</p>
                <p className="text-gray-700 text-sm">Introduction to the fundamental principles of thermodynamics.</p>
                <Button className="mt-3 w-full bg-blue-700 text-white hover:bg-blue-800">Watch Lesson</Button>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <video controls className="w-full h-48 object-cover">
                <source src="/videos/structural-analysis-basics.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="p-4">
                <h3 className="text-blue-700 font-semibold text-lg">Structural Analysis Basics</h3>
                <p className="text-sm text-gray-600 mb-2">By Engr. Fatima Yakubu</p>
                <p className="text-gray-700 text-sm">
                  Learn the fundamentals of structural analysis in civil engineering.
                </p>
                <Button className="mt-3 w-full bg-blue-700 text-white hover:bg-blue-800">Watch Lesson</Button>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">More lessons coming soon...</p>
              </div>
              <div className="p-4">
                <h3 className="text-blue-700 font-semibold text-lg">Advanced Topics</h3>
                <p className="text-sm text-gray-600 mb-2">Various Instructors</p>
                <p className="text-gray-700 text-sm">Advanced engineering topics and specialized courses.</p>
                <Button disabled className="mt-3 w-full bg-gray-400 text-white">
                  Coming Soon
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
