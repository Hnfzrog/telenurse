"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function DeleteArticleButton({ id }: { id: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Gagal menghapus artikel")
      toast({ title: "Berhasil", description: "Artikel berhasil dihapus." })
      setIsOpen(false)
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
        size="icon" 
        variant="ghost" 
        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Artikel?</h3>
            <p className="text-sm text-gray-500 mb-6">Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full">Batal</Button>
              <Button onClick={handleDelete} disabled={loading} className="bg-red-600 hover:bg-red-700 w-full text-white">
                {loading ? "Menghapus..." : "Ya, Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
