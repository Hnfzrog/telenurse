"use client"

import { useState, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

export function DynamicIndicatorsChart({ 
  records, 
  indicators 
}: { 
  records: any[], 
  indicators: any[] 
}) {
  const [activeTab, setActiveTab] = useState(indicators[0]?.name || "systolicBp")

  const activeIndicator = indicators.find(i => i.name === activeTab)

  const chartData = useMemo(() => {
    // Reverse records to show chronological order (oldest to newest)
    const chronological = [...records].reverse()
    
    return chronological.map(r => {
      let val = null
      if (r[activeTab] !== undefined && r[activeTab] !== null) {
        val = Number(r[activeTab])
      } else if (r.dynamicData && r.dynamicData[activeTab] !== undefined) {
        val = Number(r.dynamicData[activeTab])
      }

      return {
        date: new Date(r.recordedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        fullDate: new Date(r.recordedAt).toLocaleString("id-ID"),
        value: val
      }
    }).filter(item => item.value !== null)
  }, [records, activeTab])

  if (indicators.length === 0) return null

  return (
    <div className="bg-white/50 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl shadow-blue-900/5 p-6 md:p-8 mt-6">
      <h2 className="text-xl font-jakarta font-bold text-gray-900 mb-6">Grafik Perkembangan Kesehatan</h2>
      
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        {indicators.map(ind => (
          <button
            key={ind.name}
            onClick={() => setActiveTab(ind.name)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === ind.name 
                ? "bg-brand-blue text-white shadow-md" 
                : "bg-white/60 text-gray-600 hover:bg-gray-50 border border-gray-100"
            }`}
          >
            {ind.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                name={`${activeIndicator?.label} (${activeIndicator?.unit || ''})`} 
                stroke="#1976d2" 
                strokeWidth={3}
                dot={{ r: 4, fill: "#1976d2", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, fill: "#1976d2", stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-72 w-full flex items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm font-medium">Belum ada data untuk grafik ini.</p>
        </div>
      )}
    </div>
  )
}
