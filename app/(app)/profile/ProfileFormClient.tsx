"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export function ProfileFormClient({ user }: { user: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    
    const payload: any = {
      name: fd.get("name"),
      phone: fd.get("phone"),
    }

    if (user.role === "PASIEN") {
      payload.address = fd.get("address")
      payload.bloodType = fd.get("bloodType")
      payload.allergies = fd.get("allergies")
      payload.medicalHistory = fd.get("medicalHistory")
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast({ title: "Berhasil", description: "Profil berhasil diperbarui." })
      router.refresh()
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label>Nama Lengkap</Label>
          <Input name="name" required defaultValue={user.name} className="mt-1.5" />
        </div>
        <div>
          <Label>Nomor Telepon</Label>
          <Input name="phone" defaultValue={user.phone || ""} placeholder="081234567890" className="mt-1.5" />
        </div>
        
        {user.role === "PASIEN" && (
          <>
            <div className="sm:col-span-2">
              <Label>Alamat Lengkap</Label>
              <Textarea name="address" defaultValue={user.patientProfile?.address || ""} placeholder="Contoh: Jl. Sudirman No.123, RT 01/RW 02..." className="mt-1.5 resize-none min-h-[60px]" />
            </div>
            <div>
              <Label>Golongan Darah</Label>
              <select 
                name="bloodType" 
                defaultValue={user.patientProfile?.bloodType || ""}
                className="mt-1.5 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
              >
                <option value="">Pilih Golongan Darah</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label>Alergi Obat/Makanan (Opsional)</Label>
              <Input name="allergies" defaultValue={user.patientProfile?.allergies || ""} placeholder="Contoh: Amoxicillin, Seafood" className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label>Riwayat Penyakit (Opsional)</Label>
              <Textarea name="medicalHistory" defaultValue={user.patientProfile?.medicalHistory || ""} placeholder="Contoh: Hipertensi sejak 2020, Asma" className="mt-1.5 resize-none min-h-[80px]" />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading} className="bg-[#1976d2] hover:bg-[#1565c0] min-w-[140px]">
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  )
}
