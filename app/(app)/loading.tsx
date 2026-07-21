export default function Loading() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1976d2] border-t-transparent"></div>
        <p className="text-sm font-medium text-gray-500 animate-pulse">Memuat data...</p>
      </div>
    </div>
  )
}
