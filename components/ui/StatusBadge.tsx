"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function StatusBadge({ 
  recordId, 
  initialStatus 
}: { 
  recordId: number; 
  initialStatus: boolean 
}) {
  const router = useRouter()
  const [isAbnormal, setIsAbnormal] = useState(initialStatus)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/health-records/${recordId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAbnormal: !isAbnormal })
      })

      if (res.ok) {
        setIsAbnormal(!isAbnormal)
        setIsModalOpen(false)
        router.refresh()
      } else {
        alert("Gagal mengupdate status.")
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all shadow-sm hover:scale-105 active:scale-95 ${
          isAbnormal 
            ? "text-red-600 bg-red-50 border border-red-100 hover:bg-red-100" 
            : "text-green-600 bg-green-50 border border-green-100 hover:bg-green-100"
        }`}
      >
        {isAbnormal ? "Abnormal" : "Normal"}
      </button>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-2xl p-6 shadow-2xl z-10 max-w-sm w-full mx-4 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Perubahan</h3>
            <p className="text-gray-600 text-sm mb-6">
              Apakah Anda yakin ingin mengubah status dari <span className="font-semibold">{isAbnormal ? "Abnormal" : "Normal"}</span> menjadi <span className="font-semibold">{!isAbnormal ? "Abnormal" : "Normal"}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                onClick={handleToggle}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-blue hover:bg-brand-dark rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Ya, Ubah Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
