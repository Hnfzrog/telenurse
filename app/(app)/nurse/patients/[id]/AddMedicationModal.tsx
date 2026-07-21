"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus, X, Pill, Clock, Trash2 } from "lucide-react"

export function AddMedicationModal({ patientId }: { patientId: number }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [times, setTimes] = useState<string[]>(["08:00"])
  const router = useRouter()
  const { toast } = useToast()

  const addTime = () => setTimes([...times, "12:00"])
  const removeTime = (idx: number) => setTimes(times.filter((_, i) => i !== idx))
  const updateTime = (idx: number, val: string) => {
    const newTimes = [...times]
    newTimes[idx] = val
    setTimes(newTimes)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const payload = { 
      patientId, 
      name: formData.get("name"),
      dosage: formData.get("dosage"),
      frequency: `${times.length}x sehari`,
      instructions: formData.get("instructions"),
      reminderTimes: times.join(","),
      endDate: formData.get("endDate"),
    }

    try {
      const res = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast({ title: "Berhasil", description: "Resep obat berhasil ditambahkan." })
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
      <Button size="sm" variant="outline" className="gap-1 text-xs text-teal-600 border-teal-200 hover:bg-teal-50" onClick={() => setOpen(true)}>
        <Plus className="h-3 w-3" /> Tambah Obat
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Pill className="h-4 w-4 text-teal-500" />
                Tambah Resep Obat
              </h2>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-xs">Nama Obat</Label>
                <Input name="name" required placeholder="Contoh: Amlodipine" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Dosis</Label>
                  <Input name="dosage" required placeholder="Contoh: 5mg" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Tanggal Berakhir</Label>
                  <Input type="date" name="endDate" required className="mt-1" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Jam Minum Obat (Untuk Notifikasi)</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={addTime} className="h-6 px-2 text-xs text-teal-600">
                    <Plus className="h-3 w-3 mr-1" /> Tambah Jam
                  </Button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {times.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input 
                          type="time" 
                          value={t} 
                          onChange={(e) => updateTime(i, e.target.value)} 
                          className="pl-9" 
                          required 
                        />
                      </div>
                      {times.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeTime(i)} className="text-red-500 hover:text-red-700 h-9 w-9">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">Keterangan / Instruksi Khusus</Label>
                <Textarea name="instructions" placeholder="Diminum setelah makan pagi..." className="mt-1 resize-none h-20" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700">
                  {loading ? "Menyimpan..." : "Simpan Resep"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
