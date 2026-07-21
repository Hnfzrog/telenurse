export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse p-4">
      {/* Header Skeleton */}
      <div className="h-32 bg-gray-100 rounded-2xl w-full"></div>
      
      {/* Content Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="h-40 bg-gray-100 rounded-2xl w-full"></div>
        <div className="h-40 bg-gray-100 rounded-2xl w-full"></div>
        <div className="h-40 bg-gray-100 rounded-2xl w-full"></div>
      </div>
      
      {/* Large Block Skeleton */}
      <div className="h-96 bg-gray-100 rounded-2xl w-full mt-6"></div>
    </div>
  )
}
