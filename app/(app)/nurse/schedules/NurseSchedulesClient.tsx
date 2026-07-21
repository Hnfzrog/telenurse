"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Check, X, Clock, Calendar } from "lucide-react"
import { CompleteScheduleModal } from "./CompleteScheduleModal"
import { formatDate } from "@/lib/date"
import { SharedDataTable } from "@/components/ui/SharedDataTable"

export function NurseSchedulesClient({ initialSchedules }: { initialSchedules: any[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [detailModalData, setDetailModalData] = useState<any>(null)
  const schedules = initialSchedules

  const handleUpdate = async (id: number, status: "APPROVED" | "REJECTED" | "COMPLETED") => {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/schedules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast({ title: "Berhasil", description: `Jadwal berhasil ${status === "APPROVED" ? "disetujui" : status === "COMPLETED" ? "diselesaikan" : "ditolak"}.` })
      router.refresh()
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Jadwal Kontrol</h1>
        <p className="text-sm text-gray-500">Kelola permintaan jadwal kontrol dari pasien</p>
      </div>

      <SharedDataTable
        data={schedules}
        searchKeys={["patient.name", "notes", "status"]}
        emptyMessage="Tidak ada jadwal kontrol"
        columns={[
          {
            header: "Nama Pasien",
            render: (s) => <span className="font-semibold text-gray-800">{s.patient.name}</span>
          },
          {
            header: "Tanggal & Waktu",
            render: (s) => (
              <div>
                <div className="font-bold text-gray-800">
                  {formatDate(s.scheduledDate)}
                </div>
                <div className="text-gray-500 mt-0.5 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {s.scheduledTime || "00:00"}
                </div>
              </div>
            )
          },
          {
            header: "Tujuan",
            render: (s) => (
              <div className="text-gray-600 max-w-[150px] truncate">
                {s.notes || "-"}
              </div>
            )
          },
          {
            header: "Status",
            render: (s) => (
              <div>
                {s.status === "PENDING" && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">Menunggu</span>}
                {s.status === "APPROVED" && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">Disetujui</span>}
                {s.status === "REJECTED" && <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">Ditolak</span>}
                {s.status === "COMPLETED" && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">Selesai</span>}
              </div>
            )
          },
          {
            header: "Aksi",
            className: "text-center w-32",
            render: (s) => (
              <div className="flex flex-col gap-2 items-center justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200 w-full max-w-[100px]"
                  onClick={() => setDetailModalData(s)}
                >
                  Detail
                </Button>
                {s.status === "PENDING" && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 w-full max-w-[100px]"
                      onClick={() => handleUpdate(s.id, "APPROVED")}
                      disabled={loadingId === s.id}
                    >
                      Setujui
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 w-full max-w-[100px]"
                      onClick={() => handleUpdate(s.id, "REJECTED")}
                      disabled={loadingId === s.id}
                    >
                      Tolak
                    </Button>
                  </>
                )}
                {s.status === "APPROVED" && (
                  <CompleteScheduleModal scheduleId={s.id} />
                )}
              </div>
            )
          }
        ]}
      />

      {detailModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetailModalData(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">Detail Monitoring Terakhir</h2>
              <button onClick={() => setDetailModalData(null)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            {detailModalData.patient?.healthRecords?.[0] ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tanda Vital Terakhir ({formatDate(detailModalData.patient.healthRecords[0].recordedAt)})</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {detailModalData.patient.healthRecords[0].systolicBp && <div><span className="text-gray-500">Tensi:</span> <span className="font-semibold">{detailModalData.patient.healthRecords[0].systolicBp}/{detailModalData.patient.healthRecords[0].diastolicBp}</span></div>}
                    {detailModalData.patient.healthRecords[0].bloodSugar && <div><span className="text-gray-500">Gula Darah:</span> <span className="font-semibold">{detailModalData.patient.healthRecords[0].bloodSugar}</span></div>}
                    {detailModalData.patient.healthRecords[0].bodyTemperature && <div><span className="text-gray-500">Suhu:</span> <span className="font-semibold">{detailModalData.patient.healthRecords[0].bodyTemperature}°C</span></div>}
                    {detailModalData.patient.healthRecords[0].heartRate && <div><span className="text-gray-500">Detak Jantung:</span> <span className="font-semibold">{detailModalData.patient.healthRecords[0].heartRate}</span></div>}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Keluhan Pasien</h3>
                  <p className="text-sm text-gray-800 bg-blue-50 p-3 rounded-lg border border-blue-100">{detailModalData.patient.healthRecords[0].complaints || "Tidak ada keluhan"}</p>
                </div>
                {detailModalData.notes && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tujuan Jadwal</h3>
                    <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">{detailModalData.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Belum ada data monitoring terbaru dari pasien ini.</p>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setDetailModalData(null)}>Tutup</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
