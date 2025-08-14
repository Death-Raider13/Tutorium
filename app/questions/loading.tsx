import { Card, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function QuestionsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Search and Filters Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <Skeleton className="flex-1 h-10" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-6">
          <div className="flex gap-2 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-32" />
            ))}
          </div>

          <Skeleton className="h-4 w-32 mb-4" />

          {/* Questions List Skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    {/* Vote Section Skeleton */}
                    <div className="flex flex-col items-center gap-1">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-4 w-6" />
                      <Skeleton className="h-8 w-8" />
                    </div>

                    {/* Question Content Skeleton */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <Skeleton className="h-6 flex-1" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </div>

                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4 mb-3" />

                      {/* Tags Skeleton */}
                      <div className="flex gap-2 mb-3">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-24" />
                      </div>

                      {/* Author and Stats Skeleton */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <Skeleton className="h-4 w-8" />
                          <Skeleton className="h-4 w-8" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
