"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Activity, AlertTriangle } from "lucide-react"

export function AddMonitoringModal({ patientId, nurseMode }: { patientId: number; nurseMode?: boolean }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})
  const [indicators, setIndicators] = useState<any[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetch("/api/admin/indicators").then(res => res.json()).then(data => setIndicators(data || []))
    }
  }, [open])

  const getAbnormality = (name: string, value: string) => {
    if (!value) return null
    const val = parseFloat(value)
    const ind = indicators.find(i => i.name === name)
    if (!ind) return null
    
    if (val < Number(ind.minValue)) return "Rendah"
    if (val > Number(ind.maxValue)) return "Tinggi"
    return "Normal"
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const payload: Record<string, any> = { 
      patientId, 
      complaints: formData.get("complaints"),
      nurseNotes: nurseMode ? formData.get("nurseNotes") : undefined
    }
    indicators.forEach(ind => {
      const v = formData.get(ind.name) as string
      if (v) payload[ind.name] = parseFloat(v)
    })

    try {
      const res = await fetch("/api/monitoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast({ title: "Berhasil", description: "Data monitoring berhasil disimpan." })
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
      <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setOpen(true)}>
        <Activity className="h-3 w-3" /> Input Monitoring
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Input Monitoring Pasien</h2>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {indicators.map(f => {
                  const status = getAbnormality(f.name, values[f.name])
                  const indDef = f
                  const unit = indDef.unit ? `(${indDef.unit})` : ""
                  
                  return (
                    <div key={f.name}>
                      <div className="flex justify-between items-center">
                        <Label className="text-xs text-gray-700 font-semibold">{f.label} <span className="text-gray-400 font-normal">{unit}</span></Label>
                        {status && (
                          <span className={`text-[10px] flex items-center gap-1 font-bold px-1.5 py-0.5 rounded ${status === 'Normal' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                            <AlertTriangle className="h-3 w-3" /> {status}
                          </span>
                        )}
                      </div>
                      <Input 
                        name={f.name} 
                        type="number" 
                        step="any" 
                        className={`mt-1 transition-colors ${status === 'Normal' ? 'border-green-300 bg-green-50/30 focus-visible:ring-green-200' : status ? 'border-red-300 bg-red-50/30 focus-visible:ring-red-200' : ''}`} 
                        placeholder="—" 
                        value={values[f.name] || ""}
                        onChange={(e) => setValues({...values, [f.name]: e.target.value})}
                      />
                      <div className="text-[10px] text-gray-400 mt-1">
                        Batas Normal: {f.minValue ?? '0'} - {f.maxValue ?? '∞'}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">Keluhan Pasien</Label>
                <Input name="complaints" placeholder="Pusing, lemas, dll." className="mt-1" />
              </div>
              
              {nurseMode && (
                <div>
                  <Label className="text-xs font-semibold text-gray-700">Catatan Klinis Perawat (Opsional)</Label>
                  <Textarea name="nurseNotes" placeholder="Tambahkan catatan hasil observasi..." className="mt-1 text-sm min-h-[60px]" />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                <Button type="submit" disabled={loading} className="bg-[#1976d2] hover:bg-[#1565c0]">
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
