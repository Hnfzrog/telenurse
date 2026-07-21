import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 text-[#1976d2] animate-spin" />
        <p className="text-gray-600 font-medium animate-pulse">Memuat data...</p>
      </div>
    </div>
  )
}
