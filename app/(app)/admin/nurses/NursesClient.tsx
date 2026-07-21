"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SharedDataTable } from "@/components/ui/SharedDataTable"
import { useToast } from "@/hooks/use-toast"
import { Plus, X, Power, PowerOff, ShieldCheck, Edit, Trash2 } from "lucide-react"

export function NursesClient({ initialNurses }: { initialNurses: any[] }) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  
  const [editId, setEditId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const [formData, setFormData] = useState({ name: "", email: "", password: "" })

  const openAddModal = () => {
    setEditId(null)
    setFormData({ name: "", email: "", password: "" })
    setModalOpen(true)
  }

  const openEditModal = (nurse: any) => {
    setEditId(nurse.id)
    setFormData({ name: nurse.name, email: nurse.email, password: "" })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editId ? `/api/admin/nurses/${editId}` : "/api/admin/nurses"
      const method = editId ? "PUT" : "POST"
      
      const payload: any = { name: formData.name, email: formData.email }
      if (formData.password) payload.password = formData.password
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      
      if (!res.ok) throw new Error((await res.json()).error)
      
      toast({ title: "Berhasil", description: `Perawat berhasil di${editId ? "perbarui" : "tambahkan"}.` })
      setModalOpen(false)
      router.refresh()
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (id: number, currentStatus: boolean) => {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/nurses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast({ title: "Berhasil", description: `Status perawat diubah menjadi ${!currentStatus ? "Aktif" : "Nonaktif"}.` })
      router.refresh()
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/nurses/${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error)
      
      toast({ title: "Berhasil", description: "Perawat berhasil dihapus." })
      setDeleteModalOpen(false)
      router.refresh()
    } catch (err: any) {
      toast({ variant: "destructive", title: "Gagal Menghapus", description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kelola Perawat</h1>
          <p className="text-sm text-gray-500 mt-1">Total {initialNurses.length} perawat terdaftar</p>
        </div>
        <Button className="bg-[#1976d2] hover:bg-[#1565c0] gap-2" onClick={openAddModal}>
          <Plus className="h-4 w-4" /> Tambah Perawat
        </Button>
      </div>

      <SharedDataTable
        data={initialNurses}
        searchKeys={["name", "email"]}
        emptyMessage="Belum ada data perawat."
        columns={[
          {
            header: "Profil",
            render: (n) => (
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#1976d2]/10 flex items-center justify-center text-[#1976d2] font-bold text-base shrink-0">
                  {n.name[0]?.toUpperCase()}
                </div>
                <span className="font-semibold text-gray-800">{n.name}</span>
              </div>
            ),
          },
          {
            header: "Email",
            render: (n) => <span className="text-gray-600">{n.email}</span>,
          },
          {
            header: "Tanggal Terdaftar",
            render: (n) => <span className="text-gray-600">{new Date(n.createdAt).toLocaleDateString("id-ID")}</span>,
          },
          {
            header: "Status",
            render: (n) => n.isActive ? (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex w-fit items-center gap-1"><ShieldCheck className="h-3 w-3" /> Aktif</span>
            ) : (
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full flex w-fit items-center gap-1"><PowerOff className="h-3 w-3" /> Nonaktif</span>
            ),
          },
          {
            header: "Aksi",
            className: "text-center",
            render: (n) => (
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className={`h-8 w-8 p-0 ${n.isActive ? "text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" : "text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"}`}
                  onClick={() => toggleActive(n.id, n.isActive)}
                  disabled={loadingId === n.id}
                  title={n.isActive ? "Nonaktifkan" : "Aktifkan"}
                >
                  {n.isActive ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => openEditModal(n)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => { setDeleteId(n.id); setDeleteModalOpen(true) }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">{editId ? "Edit Perawat" : "Tambah Perawat Baru"}</h2>
              <button onClick={() => setModalOpen(false)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nama Lengkap</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Siti Aminah, S.Kep" className="mt-1.5" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="siti@telenurse.id" className="mt-1.5" />
              </div>
              <div>
                <Label>{editId ? "Password Baru (Opsional)" : "Password Akun"}</Label>
                <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editId} placeholder="Minimal 6 karakter" className="mt-1.5" minLength={6} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={loading} className="bg-[#1976d2] hover:bg-[#1565c0]">
                  {loading ? "Menyimpan..." : "Simpan Perawat"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Perawat?</h3>
            <p className="text-sm text-gray-500 mb-6">Apakah Anda yakin ingin menghapus perawat ini? Semua data yang terkait mungkin ikut terhapus.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)} className="w-full">Batal</Button>
              <Button onClick={handleDelete} disabled={loading} className="bg-red-600 hover:bg-red-700 w-full text-white">
                {loading ? "Menghapus..." : "Ya, Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
