import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function LessonsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Search and Filters Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <Skeleton className="flex-1 h-10" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-6">
          <div className="flex gap-2 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>

          <Skeleton className="h-4 w-32 mb-4" />

          {/* Lessons Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="w-full h-48 rounded-t-lg" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Skeleton className="h-6 flex-1" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Instructor Info Skeleton */}
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>

                  {/* Badges Skeleton */}
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>

                  {/* Stats Skeleton */}
                  <div className="flex gap-4 mb-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-10" />
                  </div>

                  {/* Buttons Skeleton */}
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
