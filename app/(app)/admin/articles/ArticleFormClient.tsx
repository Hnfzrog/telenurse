"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { TiptapEditor } from "@/components/TiptapEditor"

export function ArticleFormClient({ categories, initialData }: { categories: any[]; initialData?: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const isEditing = !!initialData

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.body || "",
    imageUrl: initialData?.thumbnailUrl || "",
    videoUrl: initialData?.videoUrl || "",
    categoryId: initialData?.categoryId || categories[0]?.id || "",
    isPublished: initialData?.isPublished ?? true,
  })

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const uploadData = new FormData()
    uploadData.append("file", file)
    
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      })
      if (!res.ok) throw new Error("Upload gagal")
      const data = await res.json()
      setFormData(prev => ({ ...prev, imageUrl: data.url }))
      toast({ title: "Berhasil", description: "Gambar berhasil diunggah" })
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = isEditing ? `/api/articles/${initialData.id}` : "/api/articles"
      const method = isEditing ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast({ title: "Berhasil", description: `Artikel berhasil di${isEditing ? "perbarui" : "simpan"}.` })
      router.push("/admin/articles")
      router.refresh()
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <Label>Judul Artikel</Label>
          <Input 
            required 
            value={formData.title} 
            onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
            placeholder="Cara Menjaga Tekanan Darah Tetap Normal..." 
            className="mt-1"
          />
        </div>
        <div>
          <Label>Kategori</Label>
          <select 
            required 
            value={formData.categoryId} 
            onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
            className="mt-1 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Gambar Cover (Opsional)</Label>
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Input 
                value={formData.imageUrl} 
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} 
                placeholder="Paste URL gambar..." 
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-500 hidden sm:inline-block">ATAU</span>
              <Input 
                type="file"
                accept="image/*"
                onChange={handleUploadCover} 
                className="sm:w-64"
              />
            </div>
            {formData.imageUrl && (
              <div className="text-xs text-green-600 font-medium">
                URL Gambar Aktif: <span className="font-normal">{formData.imageUrl.substring(0, 60)}{formData.imageUrl.length > 60 ? '...' : ''}</span>
              </div>
            )}
          </div>
        </div>
        <div>
          <Label>URL Video YouTube (Opsional)</Label>
          <Input 
            value={formData.videoUrl} 
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} 
            placeholder="https://youtube.com/watch?v=..." 
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">Video akan di-embed di dalam artikel</p>
        </div>
        <div>
          <Label>Konten Artikel</Label>
          <TiptapEditor 
            content={formData.content} 
            onChange={(val) => setFormData({ ...formData, content: val })} 
          />
        </div>
        <div className="flex items-center gap-3 pt-2 pb-1 border-t border-gray-100 mt-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-700">
            <input 
              type="checkbox" 
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            Publikasikan Langsung?
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Link href="/admin/articles">
          <Button variant="outline" type="button">Batal</Button>
        </Link>
        <Button type="submit" disabled={loading} className="bg-[#1976d2] hover:bg-[#1565c0] min-w-[140px]">
          {loading ? "Menyimpan..." : isEditing ? "Update Artikel" : "Simpan Artikel"}
        </Button>
      </div>
    </form>
  )
}
