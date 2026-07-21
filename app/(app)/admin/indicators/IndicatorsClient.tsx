"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
          setIndicators([...indicators, newInd])
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

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Kode Indikator</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Label UI</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Satuan</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Batas Bawah (Normal)</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Batas Atas (Normal)</th>
                <th className="text-right px-5 py-3 font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isAdding && (
                <tr className="bg-blue-50/50">
                  <td className="px-5 py-3"><Input placeholder="Kode (e.g. heartRate)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-8 font-mono text-xs w-full" /></td>
                  <td className="px-5 py-3"><Input placeholder="Label (e.g. Denyut Nadi)" value={form.label} onChange={e => setForm({...form, label: e.target.value})} className="h-8 w-full" /></td>
                  <td className="px-5 py-3"><Input placeholder="Satuan" value={form.unit || ""} onChange={e => setForm({...form, unit: e.target.value})} className="h-8 w-20" /></td>
                  <td className="px-5 py-3"><Input type="number" step="any" placeholder="Min" value={form.minValue || ""} onChange={e => setForm({...form, minValue: e.target.value})} className="h-8 w-24" /></td>
                  <td className="px-5 py-3"><Input type="number" step="any" placeholder="Max" value={form.maxValue || ""} onChange={e => setForm({...form, maxValue: e.target.value})} className="h-8 w-24" /></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600" onClick={handleSave} disabled={loading}><Save className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400" onClick={() => setIsAdding(false)}><X className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              )}
              {indicators.map((ind) => (
                <tr key={ind.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-700 font-mono text-xs">{ind.name}</td>
                  {editingId === ind.id ? (
                    <>
                      <td className="px-5 py-3"><Input value={form.label} onChange={e => setForm({...form, label: e.target.value})} className="h-8" /></td>
                      <td className="px-5 py-3"><Input value={form.unit || ""} onChange={e => setForm({...form, unit: e.target.value})} className="h-8 w-20" /></td>
                      <td className="px-5 py-3"><Input type="number" step="any" value={form.minValue || ""} onChange={e => setForm({...form, minValue: parseFloat(e.target.value)})} className="h-8 w-24" /></td>
                      <td className="px-5 py-3"><Input type="number" step="any" value={form.maxValue || ""} onChange={e => setForm({...form, maxValue: parseFloat(e.target.value)})} className="h-8 w-24" /></td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600" onClick={handleSave} disabled={loading}><Save className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3 font-medium text-gray-800">{ind.label}</td>
                      <td className="px-5 py-3 text-gray-600">{ind.unit || "-"}</td>
                      <td className="px-5 py-3 font-medium text-emerald-600">{ind.minValue?.toString() || "-"}</td>
                      <td className="px-5 py-3 font-medium text-red-600">{ind.maxValue?.toString() || "-"}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#1976d2]" onClick={() => startEdit(ind)}><Edit2 className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500" onClick={() => handleDelete(ind.id)} disabled={loading}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
