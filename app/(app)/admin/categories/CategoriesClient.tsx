"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, X, Edit, Trash2 } from "lucide-react"

export function CategoriesClient({ initialCategories }: { initialCategories: any[] }) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // For Editing
  const [editId, setEditId] = useState<number | null>(null)
  
  // For Deleting
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const [formData, setFormData] = useState({ name: "", description: "" })

  const openAddModal = () => {
    setEditId(null)
    setFormData({ name: "", description: "" })
    setModalOpen(true)
  }

  const openEditModal = (cat: any) => {
    setEditId(cat.id)
    setFormData({ name: cat.name, description: cat.description || "" })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = editId ? `/api/admin/categories/${editId}` : "/api/admin/categories"
      const method = editId ? "PUT" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      
      toast({ title: "Berhasil", description: `Kategori berhasil di${editId ? "perbarui" : "tambahkan"}.` })
      setModalOpen(false)
      router.refresh()
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/categories/${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error)
      
      toast({ title: "Berhasil", description: "Kategori berhasil dihapus." })
      setDeleteModalOpen(false)
      router.refresh()
    } catch (err: any) {
      toast({ variant: "destructive", title: "Gagal Menghapus", description: "Kategori mungkin sedang digunakan oleh artikel." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kelola Kategori Artikel</h1>
          <p className="text-sm text-gray-500 mt-1">Total {initialCategories.length} kategori</p>
        </div>
        <Button className="bg-[#1976d2] hover:bg-[#1565c0] gap-2" onClick={openAddModal}>
          <Plus className="h-4 w-4" /> Tambah Kategori
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Nama Kategori</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Slug</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Total Artikel</th>
                <th className="text-center px-5 py-3 font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialCategories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="px-5 py-3 text-gray-600">{c.slug}</td>
                  <td className="px-5 py-3 text-gray-600">{c._count.contents} artikel</td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => openEditModal(c)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-red-600 hover:bg-red-50" 
                        onClick={() => { setDeleteId(c.id); setDeleteModalOpen(true); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {initialCategories.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-500">Belum ada data kategori.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">{editId ? "Edit Kategori" : "Tambah Kategori"}</h2>
              <button onClick={() => setModalOpen(false)}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nama Kategori</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Contoh: Gaya Hidup" className="mt-1.5" />
              </div>
              <div>
                <Label>Deskripsi (Opsional)</Label>
                <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Kumpulan artikel gaya hidup sehat..." className="mt-1.5" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={loading} className="bg-[#1976d2] hover:bg-[#1565c0]">
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Kategori?</h3>
            <p className="text-sm text-gray-500 mb-6">Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.</p>
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
