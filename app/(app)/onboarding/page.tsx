"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ClipboardList, AlertCircle, Droplets, HeartPulse } from "lucide-react"
import { IndicatorInput } from "@/components/ui/IndicatorInput"

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [indicators, setIndicators] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/admin/indicators").then(res => res.json()).then(data => setIndicators(data || []))
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const payload: Record<string, any> = {
      bloodType: formData.get("bloodType"),
      allergies: formData.get("allergies"),
      medicalHistory: formData.get("medicalHistory"),
      currentMedications: formData.get("currentMedications"),
    }
    
    indicators.forEach(ind => {
      payload[ind.name] = formData.get(ind.name)
    })

    try {
      const res = await fetch("/api/profile/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error((await res.json()).error)
      }

      toast({
        title: "Berhasil",
        description: "Data kesehatan awal Anda telah tersimpan.",
      })
      router.push("/dashboard/patient")
      router.refresh()
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Gagal menyimpan data",
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-blue-50 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-center">
          <div className="bg-white/20 p-4 rounded-full inline-block mb-4 backdrop-blur-sm">
            <ClipboardList className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-jakarta">Pengkajian Kesehatan Awal</h1>
          <p className="mt-2 text-blue-100 max-w-lg mx-auto">
            Selamat datang di TeleNurse! Sebelum mulai, silakan lengkapi profil medis Anda agar perawat dapat memberikan pelayanan yang optimal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Bagian 1: Profil Fisik & Medis Dasar */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
              <Droplets className="h-5 w-5 text-red-500" /> Profil Dasar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Golongan Darah *</Label>
                <select name="bloodType" required className="w-full mt-1 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">Pilih Golongan Darah</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <Label>Alergi (Opsional)</Label>
                <Input name="allergies" placeholder="Contoh: Alergi kacang, paracetamol" className="mt-1" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Riwayat Penyakit *</Label>
                <Textarea name="medicalHistory" required placeholder="Contoh: Hipertensi, Asma, Diabetes..." className="mt-1 h-24" />
              </div>
              <div>
                <Label>Obat yang Sedang Dikonsumsi (Opsional)</Label>
                <Textarea name="currentMedications" placeholder="Contoh: Amlodipine 5mg tiap pagi" className="mt-1 h-24" />
                <p className="text-xs text-gray-500 mt-1">Obat bawaan Anda sebelum menggunakan TeleNurse.</p>
              </div>
            </div>
          </div>

          {/* Bagian 2: Tanda-tanda Vital Awal */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
              <HeartPulse className="h-5 w-5 text-brand-teal" /> Tanda-tanda Vital Saat Ini (Opsional)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {indicators.map(ind => (
                <IndicatorInput key={ind.name} indicator={ind} />
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 items-start">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm">
              <strong>Penting:</strong> Pastikan data yang Anda masukkan adalah akurat. Data ini akan menjadi acuan utama bagi Perawat dalam memberikan saran dan edukasi kesehatan.
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-[#1976d2] hover:bg-[#1565c0] text-white py-6 text-lg font-bold rounded-xl shadow-lg shadow-blue-600/30">
            {loading ? "Menyimpan Data..." : "Simpan & Lanjutkan ke Dashboard"}
          </Button>
        </form>
      </div>
    </div>
  )
}
