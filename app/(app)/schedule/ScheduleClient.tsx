"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Plus, X, Clock, Check, XCircle } from "lucide-react"
import { formatDate } from "@/lib/date"
import { SharedDataTable } from "@/components/ui/SharedDataTable"

export function ScheduleClient({ initialSchedules }: { initialSchedules: any[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingCancelId, setLoadingCancelId] = useState<number | null>(null)
  const [detailModalData, setDetailModalData] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledDate: fd.get("scheduledDate"),
          notes: fd.get("notes"),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast({ title: "Berhasil", description: "Permintaan jadwal kontrol berhasil dikirim." })
      setModalOpen(false)
      router.refresh()
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id: number) => {
    if (!confirm("Yakin ingin membatalkan jadwal ini?")) return
    setLoadingCancelId(id)
    try {
      const res = await fetch(`/api/schedules/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast({ title: "Berhasil", description: "Jadwal kontrol dibatalkan." })
      router.refresh()
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    } finally {
      setLoadingCancelId(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Jadwal Kontrol</h1>
            <p className="text-orange-100 max-w-md">Atur jadwal kontrol kesehatan rutin Anda dengan perawat. Ajukan jadwal baru bila diperlukan.</p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="bg-white text-orange-600 hover:bg-orange-50 font-bold gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Ajukan Jadwal
          </Button>
        </div>
        <Calendar className="absolute -right-4 -bottom-8 h-56 w-56 text-white opacity-20 -rotate-6" />
      </div>

      <SharedDataTable
        data={initialSchedules}
        searchKeys={["notes", "status"]}
        emptyMessage="Belum ada jadwal kontrol. Klik 'Ajukan Jadwal' untuk meminta jadwal."
        columns={[
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
              <div className="text-gray-600 max-w-[200px] truncate">
                {s.notes || "-"}
              </div>
            )
          },
          {
            header: "Status",
            render: (s) => (
              <div>
                {s.status === "PENDING" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-100"><Clock className="h-3 w-3" /> Menunggu</span>}
                {s.status === "APPROVED" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100"><Check className="h-3 w-3" /> Disetujui</span>}
                {s.status === "COMPLETED" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100"><Check className="h-3 w-3" /> Selesai</span>}
                {s.status === "REJECTED" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-100"><XCircle className="h-3 w-3" /> Ditolak / Dibatalkan</span>}
              </div>
            )
          },
          {
            header: "Aksi",
            className: "text-center w-24",
            render: (s) => (
              <div className="flex flex-col gap-2 items-center justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7 w-full max-w-[100px]"
                  onClick={() => setDetailModalData(s)}
                >
                  Detail
                </Button>
                {s.status === "PENDING" && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-7 text-red-600 border-red-200 hover:bg-red-50 w-full max-w-[100px]"
                    onClick={() => handleCancel(s.id)}
                    disabled={loadingCancelId === s.id}
                  >
                    Batalkan
                  </Button>
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
                  <p className="text-sm text-gray-800 bg-orange-50 p-3 rounded-lg border border-orange-100">{detailModalData.patient.healthRecords[0].complaints || "Tidak ada keluhan"}</p>
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">Pengajuan Jadwal Baru</h2>
              <button onClick={() => setModalOpen(false)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Tanggal & Waktu</Label>
                <Input type="datetime-local" name="scheduledDate" required className="mt-1.5" />
              </div>
              <div>
                <Label>Tujuan / Keluhan (Opsional)</Label>
                <Textarea name="notes" placeholder="Tuliskan tujuan kontrol atau keluhan yang ingin disampaikan..." className="mt-1.5 resize-none min-h-[100px]" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
                  {loading ? "Memproses..." : "Kirim Pengajuan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
