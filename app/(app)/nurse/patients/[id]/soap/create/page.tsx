"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"

export default function SoapCreatePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch("/api/nurse/soap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: params.id,
          subjective: fd.get("subjective"),
          objective: fd.get("objective"),
          diagnosis: fd.get("diagnosis"),
          plan: fd.get("plan"),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast({ title: "Berhasil", description: "Pengkajian S.O.A.P berhasil disimpan." })
      router.push(`/nurse/patients/${params.id}`)
      router.refresh()
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: "subjective", label: "Subjective (S)", sublabel: "Keluhan yang dirasakan pasien secara langsung", placeholder: "Pasien mengeluh pusing dan tekanan darah tinggi..." },
    { name: "objective", label: "Objective (O)", sublabel: "Data hasil pemeriksaan dan observasi perawat", placeholder: "TD: 160/100 mmHg, N: 88x/m, RR: 20x/m, Suhu 37.0°C..." },
    { name: "diagnosis", label: "Assessment (A)", sublabel: "Diagnosis keperawatan berdasarkan data S dan O", placeholder: "Risiko perfusi jaringan serebral tidak efektif b.d hipertensi..." },
    { name: "plan", label: "Plan (P)", sublabel: "Rencana intervensi keperawatan", placeholder: "1. Monitor TD tiap 2 jam\n2. Edukasi diet rendah garam\n3. Anjurkan istirahat cukup..." },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/nurse/patients/${params.id}`}>
          <Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pengkajian S.O.A.P</h1>
          <p className="text-sm text-gray-500">Dokumentasi asuhan keperawatan digital</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(f => (
          <div key={f.name} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <Label htmlFor={f.name} className="text-base font-semibold text-gray-800">{f.label}</Label>
            <p className="text-xs text-gray-500 mt-0.5 mb-3">{f.sublabel}</p>
            <Textarea id={f.name} name={f.name} required placeholder={f.placeholder} className="min-h-[100px] resize-none" />
          </div>
        ))}
        <div className="flex justify-end gap-3 pt-2">
          <Link href={`/nurse/patients/${params.id}`}>
            <Button variant="outline">Batal</Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-[#1976d2] hover:bg-[#1565c0] min-w-[140px]">
            {loading ? "Menyimpan..." : "Simpan S.O.A.P"}
          </Button>
        </div>
      </form>
    </div>
  )
}
