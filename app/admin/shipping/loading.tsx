import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="relative w-full mb-6">
        <Skeleton className="h-10 w-full" />
      </div>

      <Card className="rounded-lg border border-gray-100">
        <CardHeader className="py-4 px-6 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <CardTitle className="text-xl font-semibold text-gray-900">Wilayas</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 bg-white">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
