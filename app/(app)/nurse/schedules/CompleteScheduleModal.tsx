"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Check, X, ClipboardCheck } from "lucide-react"

export function CompleteScheduleModal({ scheduleId }: { scheduleId: number }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [needsFollowUp, setNeedsFollowUp] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const notes = formData.get("notes") as string
    const followUpDate = formData.get("followUpDate") as string
    
    try {
      const res = await fetch(`/api/schedules/${scheduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "COMPLETED", 
          notes,
          needsFollowUp,
          followUpDate: needsFollowUp ? followUpDate : undefined
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast({ title: "Berhasil", description: "Sesi kontrol berhasil diselesaikan." })
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 w-full"
        onClick={() => setOpen(true)}
      >
        Tandai Selesai
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-blue-500" />
                Verifikasi Selesai Kontrol
              </h2>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm">Catatan Hasil Kontrol & Tindak Lanjut</Label>
                <Textarea 
                  name="notes" 
                  required 
                  placeholder="Misal: Tekanan darah sudah stabil, perlu kontrol lanjutan 1 bulan lagi..." 
                  className="mt-1.5 resize-none h-24" 
                />
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 text-sm cursor-pointer mb-3 text-gray-700">
                  <input 
                    type="checkbox" 
                    checked={needsFollowUp}
                    onChange={(e) => setNeedsFollowUp(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  Pasien perlu kontrol lanjutan
                </label>

                {needsFollowUp && (
                  <div className="pl-6">
                    <Label className="text-xs text-gray-500">Saran Waktu Kontrol Berikutnya</Label>
                    <input 
                      type="datetime-local" 
                      name="followUpDate" 
                      required={needsFollowUp}
                      className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 gap-1.5">
                  {loading ? "Memproses..." : <><Check className="h-4 w-4"/> Selesaikan</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
