"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Activity, Thermometer, Heart, Droplets, Weight, Droplet, Plus, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

import { useEffect } from "react"

const fieldStyles: Record<string, any> = {
  systolicBp: { icon: <Activity className="h-5 w-5" />, color: "text-teal-600 bg-teal-50", placeholder: "120" },
  diastolicBp: { icon: <Activity className="h-5 w-5" />, color: "text-teal-600 bg-teal-50", placeholder: "80" },
  bodyTemperature: { icon: <Thermometer className="h-5 w-5" />, color: "text-yellow-600 bg-yellow-50", placeholder: "36.5" },
  heartRate: { icon: <Heart className="h-5 w-5" />, color: "text-red-600 bg-red-50", placeholder: "80" },
  oxygenSaturation: { icon: <Droplets className="h-5 w-5" />, color: "text-blue-600 bg-blue-50", placeholder: "98" },
  bodyWeight: { icon: <Weight className="h-5 w-5" />, color: "text-purple-600 bg-purple-50", placeholder: "60" },
  bloodSugar: { icon: <Droplet className="h-5 w-5" />, color: "text-pink-600 bg-pink-50", placeholder: "100" },
}

export default function MonitoringCreatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})
  const [complaints, setComplaints] = useState("")
  const [indicators, setIndicators] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/admin/indicators").then(res => res.json()).then(data => setIndicators(data || []))
  }, [])

  const getAbnormality = (name: string, value: string) => {
    if (!value) return null
    const val = parseFloat(value)
    const ind = indicators.find(i => i.name === name)
    if (!ind) return null
    if (val < Number(ind.minValue) || val > Number(ind.maxValue)) return "abnormal"
    return "normal"
  }

  const handleChange = (key: string, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload: Record<string, any> = { complaints }
    indicators.forEach(ind => {
      if (values[ind.name]) payload[ind.name] = parseFloat(values[ind.name])
    })

    try {
      const res = await fetch("/api/monitoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Gagal menyimpan data")
      }
      toast({ title: "Berhasil!", description: "Data kesehatan berhasil disimpan." })
      router.push("/monitoring")
      router.refresh()
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Catat Data Monitoring</h1>
        <p className="text-sm text-gray-500 mt-1">Isi parameter yang tersedia. Minimal isi tekanan darah atau satu parameter lainnya.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          {indicators.map((ind) => {
            const val = parseFloat(values[ind.name] || "")
            const status = getAbnormality(ind.name, values[ind.name])
            const style = fieldStyles[ind.name] || { icon: <Activity className="h-5 w-5" />, color: "text-gray-600 bg-gray-50", placeholder: "..." }
            
            return (
              <div key={ind.name} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`rounded-lg p-2 ${style.color}`}>{style.icon}</div>
                  <Label htmlFor={ind.name} className="font-medium text-gray-700 text-sm">{ind.label}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id={ind.name}
                    type="number"
                    step="any"
                    placeholder={style.placeholder}
                    value={values[ind.name] || ""}
                    onChange={(e) => handleChange(ind.name, e.target.value)}
                    className={`text-lg font-semibold border-0 border-b rounded-none focus-visible:ring-0 px-0 pb-1 transition-colors ${status === 'normal' ? 'border-green-300 bg-green-50/10' : status === 'abnormal' ? 'border-red-300 bg-red-50/10' : ''}`}
                  />
                  <span className="text-sm text-gray-400 shrink-0">{ind.unit}</span>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] text-gray-400">
                    Batas Normal: {ind.minValue ?? '0'} - {ind.maxValue ?? '∞'}
                  </span>
                  {status && (
                    <div className={cn("flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded", status === "normal" ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50")}>
                      <AlertCircle className="h-3 w-3" />
                      {status === "normal" ? "Normal" : "Abnormal"}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Keluhan */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <Label htmlFor="complaints" className="font-medium text-gray-700 mb-2 block">Keluhan / Catatan Tambahan</Label>
          <Textarea
            id="complaints"
            placeholder="Contoh: kepala pusing, badan lemas sejak pagi..."
            value={complaints}
            onChange={(e) => setComplaints(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={loading} className="bg-[#1976d2] hover:bg-[#1565c0] min-w-[140px]">
            {loading ? "Menyimpan..." : "Simpan Data"}
          </Button>
        </div>
      </form>
    </div>
  )
}
