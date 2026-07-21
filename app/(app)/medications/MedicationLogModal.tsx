"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, X, Check } from "lucide-react"

export function MedicationLogModal({ medicationId, medicationName }: { medicationId: number, medicationName: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const notes = formData.get("notes") as string
    
    try {
      const res = await fetch(`/api/medications/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          medicationId, 
          notes,
          reportedIssue: true
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast({ title: "Laporan Terkirim", description: "Perawat telah diberitahu mengenai masalah Anda." })
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
        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 mt-2"
        onClick={() => setOpen(true)}
      >
        Laporkan Masalah
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Laporkan Masalah
              </h2>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Ada keluhan setelah minum <strong>{medicationName}</strong>? Obat habis atau gejala memburuk? Ceritakan di sini.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm">Jelaskan Masalah</Label>
                <Textarea 
                  name="notes" 
                  required 
                  placeholder="Misal: Saya sudah minum 3 hari tapi batuk makin parah, atau obat sudah habis..." 
                  className="mt-1.5 resize-none h-24" 
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 gap-1.5">
                  {loading ? "Mengirim..." : <><Check className="h-4 w-4"/> Kirim Laporan</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
