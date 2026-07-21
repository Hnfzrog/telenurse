"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SharedDataTable } from "@/components/ui/SharedDataTable"
import { Activity, Plus, Save, Trash2, Edit2, X } from "lucide-react"

export function IndicatorsClient({ initialIndicators }: { initialIndicators: any[] }) {
  const [indicators, setIndicators] = useState(initialIndicators)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const startEdit = (ind: any) => {
    setEditingId(ind.id)
    setIsAdding(false)
    setForm({ ...ind })
  }

  const startAdd = () => {
    setIsAdding(true)
    setEditingId(null)
    setForm({ name: "", label: "", unit: "", minValue: "", maxValue: "" })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      if (isAdding) {
        const res = await fetch(`/api/admin/indicators`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        })
        if (res.ok) {
          const newInd = await res.json()
          setIndicators([newInd, ...indicators])
          setIsAdding(false)
          router.refresh()
        }
      } else {
        const res = await fetch(`/api/admin/indicators/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        })
        if (res.ok) {
          setIndicators(indicators.map(i => i.id === editingId ? { ...i, ...form } : i))
          setEditingId(null)
          router.refresh()
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus indikator ini?")) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/indicators/${id}`, { method: "DELETE" })
      if (res.ok) {
        setIndicators(indicators.filter(i => i.id !== id))
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Data Indikator</h1>
          <p className="text-sm text-gray-500 mt-1">Atur ambang batas normal untuk indikator kesehatan.</p>
        </div>
        <Button onClick={startAdd} className="bg-[#1976d2] hover:bg-[#1565c0] gap-2">
          <Plus className="h-4 w-4" /> Tambah Indikator
        </Button>
      </div>

      {isAdding && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
          <div className="grid gap-3 md:grid-cols-5">
            <Input placeholder="Kode (e.g. heartRate)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-9 font-mono text-xs" />
            <Input placeholder="Label (e.g. Denyut Nadi)" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className="h-9" />
            <Input placeholder="Satuan" value={form.unit || ""} onChange={e => setForm({ ...form, unit: e.target.value })} className="h-9" />
            <Input type="number" step="any" placeholder="Min" value={form.minValue || ""} onChange={e => setForm({ ...form, minValue: e.target.value })} className="h-9" />
            <Input type="number" step="any" placeholder="Max" value={form.maxValue || ""} onChange={e => setForm({ ...form, maxValue: e.target.value })} className="h-9" />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button size="sm" variant="ghost" className="text-gray-500" onClick={() => setIsAdding(false)}><X className="h-4 w-4" /></Button>
            <Button size="sm" className="bg-[#1976d2] hover:bg-[#1565c0]" onClick={handleSave} disabled={loading}><Save className="h-4 w-4 mr-1" /> Simpan</Button>
          </div>
        </div>
      )}

      <SharedDataTable
        data={indicators}
        searchKeys={["name", "label", "unit"]}
        emptyMessage="Belum ada indikator"
        columns={[
          {
            header: "Kode Indikator",
            render: (ind) => <span className="text-gray-700 font-mono text-xs">{ind.name}</span>,
          },
          {
            header: "Label UI",
            render: (ind) => editingId === ind.id ? <Input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className="h-8" /> : <span className="font-medium text-gray-800">{ind.label}</span>,
          },
          {
            header: "Satuan",
            render: (ind) => editingId === ind.id ? <Input value={form.unit || ""} onChange={e => setForm({ ...form, unit: e.target.value })} className="h-8 w-20" /> : <span className="text-gray-600">{ind.unit || "-"}</span>,
          },
          {
            header: "Batas Bawah (Normal)",
            render: (ind) => editingId === ind.id ? <Input type="number" step="any" value={form.minValue || ""} onChange={e => setForm({ ...form, minValue: parseFloat(e.target.value) })} className="h-8 w-24" /> : <span className="font-medium text-emerald-600">{ind.minValue?.toString() || "-"}</span>,
          },
          {
            header: "Batas Atas (Normal)",
            render: (ind) => editingId === ind.id ? <Input type="number" step="any" value={form.maxValue || ""} onChange={e => setForm({ ...form, maxValue: parseFloat(e.target.value) })} className="h-8 w-24" /> : <span className="font-medium text-red-600">{ind.maxValue?.toString() || "-"}</span>,
          },
          {
            header: "Aksi",
            className: "text-right",
            render: (ind) => (
              <div className="flex justify-end gap-1">
                {editingId === ind.id ? (
                  <>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600" onClick={handleSave} disabled={loading}><Save className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#1976d2]" onClick={() => startEdit(ind)}><Edit2 className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500" onClick={() => handleDelete(ind.id)} disabled={loading}><Trash2 className="h-4 w-4" /></Button>
                  </>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
