"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

export function AddScheduleModal({ patientId }: { patientId: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [time, setTime] = useState("08:00")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/schedules/monitoring`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, reminderTime: time })
      })
      if (!res.ok) throw new Error("Gagal menyimpan jadwal")
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2 border-brand-teal text-brand-teal hover:bg-brand-teal/10">
          <Clock className="h-4 w-4" /> Atur Jadwal Cek
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Atur Jadwal Cek Kesehatan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Jam Cek Kesehatan</label>
            <input 
              type="time" 
              required
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <p className="text-xs text-gray-500">Pasien akan diminta menginput kondisi kesehatannya pada jam ini.</p>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading} className="bg-brand-blue text-white">
              {loading ? "Menyimpan..." : "Simpan Jadwal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
