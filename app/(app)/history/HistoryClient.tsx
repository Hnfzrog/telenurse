"use client"

import { useState } from "react"
import { Calendar, Clock, FileText, Pill, Activity, User, Eye, X, Download, Printer, Trash, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HistoryClient({ 
  schedules, 
  soapAssessments, 
  medications, 
  healthRecords,
  isPatient = false
}: { 
  schedules: any[], 
  soapAssessments: any[], 
  medications: any[], 
  healthRecords: any[],
  isPatient?: boolean
}) {
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === schedules.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(schedules.map(s => s.id))
    }
  }

  const exportToCSV = () => {
    if (selectedIds.length === 0) return

    const selectedDates = schedules
      .filter(s => selectedIds.includes(s.id))
      .map(s => new Date(s.scheduledDate).toISOString().split('T')[0])

    const filteredRecords = healthRecords.filter(r => {
      const recDate = new Date(r.recordedAt).toISOString().split('T')[0]
      return selectedDates.includes(recDate)
    })
    const headers = ["Tanggal", "Sistolik", "Diastolik", "Suhu", "Nadi", "SpO2", "Gula Darah", "Berat Badan", "Status"]
    const rows = filteredRecords.map(r => [
      new Date(r.recordedAt).toLocaleString("id-ID"),
      r.systolicBp || "",
      r.diastolicBp || "",
      r.bodyTemperature || "",
      r.heartRate || "",
      r.oxygenSaturation || "",
      r.bloodSugar || "",
      r.bodyWeight || "",
      r.isAbnormal ? "Abnormal" : "Normal"
    ])
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "Riwayat_Kesehatan.csv"
    link.click()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-8 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Riwayat Pelayanan</h1>
          <p className="text-indigo-100 max-w-lg">Semua riwayat interaksi, pengkajian perawat, obat, dan hasil monitoring yang dikelompokkan berdasarkan sesi kontrol.</p>
        </div>
        {!isPatient && (
          <div className="relative z-10 flex flex-wrap gap-2 print:hidden">
            <Button 
              variant="secondary" 
              className="gap-2 text-indigo-700 font-semibold" 
              onClick={() => window.print()}
              disabled={selectedIds.length === 0}
            >
              <Printer className="w-4 h-4" /> Cetak PDF Terpilih
            </Button>
            <Button 
              variant="secondary" 
              className="gap-2 text-indigo-700 font-semibold" 
              onClick={exportToCSV}
              disabled={selectedIds.length === 0}
            >
              <Download className="w-4 h-4" /> Export CSV Terpilih
            </Button>
          </div>
        )}
        <FileText className="absolute -right-6 -bottom-10 h-64 w-64 text-white opacity-10 rotate-12 print:hidden" />
      </div>

      {/* Main UI Table (Hidden in Print) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
              <tr>
                {!isPatient && (
                  <th className="px-5 py-3 font-medium w-12 text-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      checked={selectedIds.length === schedules.length && schedules.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                )}
                <th className="px-5 py-3 font-medium whitespace-nowrap">Tanggal & Waktu</th>
                <th className="px-5 py-3 font-medium whitespace-nowrap">Pasien</th>
                <th className="px-5 py-3 font-medium whitespace-nowrap">Perawat</th>
                <th className="px-5 py-3 font-medium">Status Sesi</th>
                <th className="px-5 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schedules.map((schedule) => {
                return (
                  <tr key={schedule.id} className={`hover:bg-gray-50/50 transition-colors ${!isPatient && selectedIds.includes(schedule.id) ? "bg-indigo-50/30" : ""}`}>
                    {!isPatient && (
                      <td className="px-5 py-3 text-center">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={selectedIds.includes(schedule.id)}
                          onChange={() => toggleSelect(schedule.id)}
                        />
                      </td>
                    )}
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="font-semibold text-gray-800">
                        {new Date(schedule.scheduledDate).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" /> {new Date(schedule.scheduledDate).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {schedule.patient?.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-700">{schedule.patient?.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {schedule.nurse?.name || "-"}
                    </td>
                    <td className="px-5 py-3">
                      {schedule.status === "PENDING" && <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs font-bold">Menunggu</span>}
                      {schedule.status === "APPROVED" && <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">Disetujui</span>}
                      {schedule.status === "COMPLETED" && <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs font-bold">Selesai</span>}
                      {schedule.status === "REJECTED" && <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs font-bold">Dibatalkan</span>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button size="sm" variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 gap-1 h-8 text-xs" onClick={() => setSelectedSchedule(schedule)}>
                        <Eye className="h-3 w-3" /> Detail
                      </Button>
                    </td>
                  </tr>
                )
              })}
              {schedules.length === 0 && (
                <tr>
                  <td colSpan={isPatient ? 5 : 6} className="px-5 py-12 text-center text-gray-400">
                    <Calendar className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    Belum ada riwayat pelayanan yang tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSchedule && (
        <DetailModal 
          schedule={selectedSchedule} 
          onClose={() => setSelectedSchedule(null)} 
          soapAssessments={soapAssessments} 
          medications={medications} 
          healthRecords={healthRecords} 
        />
      )}
      {/* Print Layout (Only visible when printing) */}
      <div className="hidden print:block w-full text-black">
        <h1 className="text-2xl font-bold mb-6 text-center border-b pb-4">Laporan Pelayanan Medis TeleNurse</h1>
        {schedules.filter(s => selectedIds.includes(s.id)).map(schedule => {
          const scheduleDateStr = new Date(schedule.scheduledDate).toISOString().split('T')[0]
          const relatedSoap = soapAssessments.filter(s => new Date(s.assessmentDate).toISOString().split('T')[0] === scheduleDateStr)
          const relatedMeds = medications.filter(m => new Date(m.createdAt).toISOString().split('T')[0] === scheduleDateStr)
          const relatedRecords = healthRecords.filter(h => new Date(h.recordedAt).toISOString().split('T')[0] === scheduleDateStr)

          return (
            <div key={schedule.id} className="mb-10 page-break-after-auto">
              <div className="bg-gray-100 p-3 font-bold text-lg mb-4 rounded border border-gray-300">
                Sesi: {new Date(schedule.scheduledDate).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                <div className="text-sm font-normal text-gray-700 mt-1">
                  Pasien: {schedule.patient?.name} | Perawat: {schedule.nurse?.name || "-"}
                </div>
              </div>

              {/* SOAP Print */}
              <div className="mb-4">
                <h3 className="font-bold border-b border-gray-300 pb-1 mb-2">1. Pengkajian (S.O.A.P)</h3>
                {relatedSoap.length > 0 ? relatedSoap.map((soap, idx) => (
                  <div key={idx} className="text-sm mb-2 pl-4">
                    <div><b>S:</b> {soap.subjective || "-"}</div>
                    <div><b>O:</b> {soap.objective || "-"}</div>
                    <div><b>A:</b> {soap.diagnosis || "-"}</div>
                    <div><b>P:</b> {soap.plan || "-"}</div>
                  </div>
                )) : <div className="text-sm text-gray-500 pl-4 italic">Tidak ada pengkajian.</div>}
              </div>

              {/* Records Print */}
              <div className="mb-4">
                <h3 className="font-bold border-b border-gray-300 pb-1 mb-2">2. Monitoring Kesehatan</h3>
                {relatedRecords.length > 0 ? (
                  <table className="w-full text-sm border-collapse border border-gray-400 mb-2">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-400 px-2 py-1">Jam</th>
                        <th className="border border-gray-400 px-2 py-1">TD</th>
                        <th className="border border-gray-400 px-2 py-1">Suhu</th>
                        <th className="border border-gray-400 px-2 py-1">SpO2</th>
                        <th className="border border-gray-400 px-2 py-1">Catatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatedRecords.map((r, idx) => (
                        <tr key={idx}>
                          <td className="border border-gray-400 px-2 py-1">{new Date(r.recordedAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="border border-gray-400 px-2 py-1">{r.systolicBp}/{r.diastolicBp}</td>
                          <td className="border border-gray-400 px-2 py-1">{r.bodyTemperature ? `${r.bodyTemperature}°C` : "-"}</td>
                          <td className="border border-gray-400 px-2 py-1">{r.oxygenSaturation ? `${r.oxygenSaturation}%` : "-"}</td>
                          <td className="border border-gray-400 px-2 py-1">{r.nurseNotes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <div className="text-sm text-gray-500 pl-4 italic">Tidak ada monitoring.</div>}
              </div>

              {/* Meds Print */}
              <div className="mb-4">
                <h3 className="font-bold border-b border-gray-300 pb-1 mb-2">3. Peresepan Obat</h3>
                {relatedMeds.length > 0 ? (
                  <ul className="list-disc pl-8 text-sm">
                    {relatedMeds.map((m, idx) => (
                      <li key={idx}><b>{m.name}</b> - {m.dosage} ({m.frequency}) {m.instructions ? `Catatan: ${m.instructions}` : ""}</li>
                    ))}
                  </ul>
                ) : <div className="text-sm text-gray-500 pl-4 italic">Tidak ada peresepan obat.</div>}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}

function DetailModal({ schedule, onClose, soapAssessments, medications, healthRecords }: any) {
  const scheduleDateStr = new Date(schedule.scheduledDate).toISOString().split('T')[0]
  
  const relatedSoap = soapAssessments.filter((s: any) => new Date(s.assessmentDate).toISOString().split('T')[0] === scheduleDateStr)
  const relatedMeds = medications.filter((m: any) => new Date(m.createdAt).toISOString().split('T')[0] === scheduleDateStr)
  const relatedRecords = healthRecords.filter((h: any) => new Date(h.recordedAt).toISOString().split('T')[0] === scheduleDateStr)

  const handleDeleteRecord = async (id: number) => {
    if (!confirm("Yakin ingin menghapus data monitoring ini? (Ralat data)")) return
    try {
      const res = await fetch(`/api/monitoring/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(await res.text())
      window.location.reload()
    } catch(err: any) {
      alert("Error: " + err.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0 print:block print:relative print:inset-auto print:bg-white print:z-0">
      <div className="absolute inset-0 bg-black/50 print:hidden" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col z-10 overflow-hidden print:max-h-none print:shadow-none print:rounded-none">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 print:bg-white">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">Detail Pelayanan</h2>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {new Date(schedule.scheduledDate).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors print:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 print:overflow-visible">
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h3 className="text-sm font-bold text-blue-800 mb-2">Tujuan / Catatan Kunjungan</h3>
            <p className="text-sm text-blue-700">{schedule.notes || "Tidak ada catatan."}</p>
            {schedule.completionNotes && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <h3 className="text-sm font-bold text-blue-800 mb-2">Catatan Penutup (Perawat)</h3>
                <p className="text-sm text-blue-700">{schedule.completionNotes}</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-purple-700 flex items-center gap-2 mb-3 border-b border-purple-100 pb-2">
              <FileText className="h-4 w-4" /> Pengkajian Perawat (S.O.A.P)
            </h3>
            {relatedSoap.length > 0 ? (
              <div className="space-y-3">
                {relatedSoap.map((soap: any) => (
                  <div key={soap.id} className="text-sm grid sm:grid-cols-2 gap-4 bg-purple-50/30 p-3 rounded-lg border border-purple-50">
                    <div><span className="font-semibold text-gray-700">S:</span> <span className="text-gray-600">{soap.subjective || "-"}</span></div>
                    <div><span className="font-semibold text-gray-700">O:</span> <span className="text-gray-600">{soap.objective || "-"}</span></div>
                    <div><span className="font-semibold text-gray-700">A:</span> <span className="text-gray-600">{soap.diagnosis || "-"}</span></div>
                    <div><span className="font-semibold text-gray-700">P:</span> <span className="text-gray-600 whitespace-pre-line">{soap.plan || "-"}</span></div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Tidak ada pengkajian perawat pada sesi ini.</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-indigo-700 flex items-center gap-2 mb-3 border-b border-indigo-100 pb-2">
              <Activity className="h-4 w-4" /> Hasil Monitor Kesehatan
            </h3>
            {relatedRecords.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-indigo-50">
                <table className="w-full text-sm text-left">
                  <thead className="text-indigo-600 bg-indigo-50">
                    <tr>
                      <th className="px-3 py-2 font-medium">Waktu</th>
                      <th className="px-3 py-2 font-medium">TD</th>
                      <th className="px-3 py-2 font-medium">Suhu</th>
                      <th className="px-3 py-2 font-medium">Nadi</th>
                      <th className="px-3 py-2 font-medium">SpO₂</th>
                      <th className="px-3 py-2 font-medium">Metrik Lainnya</th>
                      <th className="px-3 py-2 font-medium">Catatan Perawat</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium print:hidden">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-50 bg-white">
                    {relatedRecords.map((r: any) => (
                      <tr key={r.id}>
                        <td className="px-3 py-2 text-gray-600">{new Date(r.recordedAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-3 py-2 font-medium">{r.systolicBp}/{r.diastolicBp}</td>
                        <td className="px-3 py-2">{r.bodyTemperature ? `${r.bodyTemperature}°C` : "-"}</td>
                        <td className="px-3 py-2">{r.heartRate || "-"}</td>
                        <td className="px-3 py-2">{r.oxygenSaturation ? `${r.oxygenSaturation}%` : "-"}</td>
                        <td className="px-3 py-2">
                          {r.dynamicData && Object.keys(r.dynamicData).length > 0 ? (
                            <div className="text-xs space-y-0.5">
                              {Object.entries(r.dynamicData).map(([k, v]) => (
                                <div key={k}><span className="font-semibold text-indigo-700">{k}:</span> {String(v)}</div>
                              ))}
                            </div>
                          ) : "-"}
                        </td>
                        <td className="px-3 py-2 text-gray-500 max-w-[120px] truncate">{r.nurseNotes || "-"}</td>
                        <td className="px-3 py-2">
                          {r.isAbnormal ? <span className="text-red-600 font-bold text-xs bg-red-50 px-2 py-0.5 rounded">Abnormal</span> : <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-0.5 rounded">Normal</span>}
                        </td>
                        <td className="px-3 py-2 print:hidden">
                          <button onClick={() => handleDeleteRecord(r.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Hapus (Ralat)">
                            <Trash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Tidak ada data monitor pada sesi ini.</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-emerald-700 flex items-center gap-2 mb-3 border-b border-emerald-100 pb-2">
              <Pill className="h-4 w-4" /> Obat yang Diresepkan
            </h3>
            {relatedMeds.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {relatedMeds.map((med: any) => (
                  <div key={med.id} className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-lg text-sm">
                    <p className="font-bold text-emerald-800">{med.name}</p>
                    <p className="text-emerald-600 mt-1 font-medium">{med.dosage} • {med.frequency}</p>
                    {med.instructions && <p className="text-emerald-700 text-xs mt-2 border-t border-emerald-100 pt-2">{med.instructions}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Tidak ada peresepan obat baru pada sesi ini.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
