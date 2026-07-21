"use client"

import { useMemo, useState } from "react"
import { Calendar, Clock, FileText, Pill, Activity, User, Eye, X, Download, Printer, Trash, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SharedDataTable } from "@/components/ui/SharedDataTable"

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
  const sortedSchedules = useMemo(
    () => [...schedules].sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()),
    [schedules]
  )

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedSchedules.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(sortedSchedules.map(s => s.id))
    }
  }

  const exportToCSV = () => {
    if (selectedIds.length === 0) return

    const selectedDates = sortedSchedules
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

  const historyColumns: any[] = []

  if (!isPatient) {
    historyColumns.push({
      header: "Pilih",
      className: "w-20 text-center",
      render: (schedule: any) => (
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          checked={selectedIds.includes(schedule.id)}
          onChange={() => toggleSelect(schedule.id)}
        />
      ),
    })
  }

  historyColumns.push(
    {
      header: "Tanggal & Waktu",
      render: (schedule: any) => (
        <div>
          <div className="font-semibold text-gray-800">
            {new Date(schedule.scheduledDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3" /> {new Date(schedule.scheduledDate).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      )
    },
    {
      header: "Pasien",
      render: (schedule: any) => (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
            {schedule.patient?.name?.[0]?.toUpperCase()}
          </div>
          <span className="font-medium text-gray-700">{schedule.patient?.name}</span>
        </div>
      )
    },
    {
      header: "Perawat",
      render: (schedule: any) => <span className="text-gray-600">{schedule.nurse?.name || "-"}</span>
    },
    {
      header: "Status Sesi",
      render: (schedule: any) => (
        <>
          {schedule.status === "PENDING" && <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs font-bold">Menunggu</span>}
          {schedule.status === "APPROVED" && <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">Disetujui</span>}
          {schedule.status === "COMPLETED" && <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs font-bold">Selesai</span>}
          {schedule.status === "REJECTED" && <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs font-bold">Dibatalkan</span>}
        </>
      )
    },
    {
      header: "Aksi",
      className: "text-right",
      render: (schedule: any) => (
        <Button size="sm" variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 gap-1 h-8 text-xs" onClick={() => setSelectedSchedule(schedule)}>
          <Eye className="h-3 w-3" /> Detail
        </Button>
      )
    }
  )

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
        {!isPatient && (
          <div className="px-5 pt-4">
            <label className="inline-flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                checked={selectedIds.length === sortedSchedules.length && sortedSchedules.length > 0}
                onChange={toggleSelectAll}
              />
              Pilih semua data di halaman ini
            </label>
          </div>
        )}
        <div className="p-5 pt-3">
          <SharedDataTable
            data={sortedSchedules}
            searchKeys={["patient.name", "nurse.name", "status", "notes"]}
            emptyMessage="Belum ada riwayat pelayanan yang tercatat."
            columns={historyColumns}
          />
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
        {sortedSchedules.filter(s => selectedIds.includes(s.id)).map(schedule => {
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
                  <SharedDataTable
                    data={[...relatedRecords].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())}
                    searchable={false}
                    showToolbar={false}
                    enablePagination={false}
                    columns={[
                      {
                        header: "Jam",
                        render: (r) => new Date(r.recordedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                      },
                      {
                        header: "TD",
                        render: (r) => `${r.systolicBp}/${r.diastolicBp}`
                      },
                      {
                        header: "Suhu",
                        render: (r) => r.bodyTemperature ? `${r.bodyTemperature}°C` : "-"
                      },
                      {
                        header: "SpO2",
                        render: (r) => r.oxygenSaturation ? `${r.oxygenSaturation}%` : "-"
                      },
                      {
                        header: "Catatan",
                        render: (r) => r.nurseNotes || "-"
                      },
                    ]}
                  />
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
              <SharedDataTable
                data={[...relatedRecords].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())}
                searchable={false}
                showToolbar={false}
                enablePagination={false}
                columns={[
                  {
                    header: "Waktu",
                    render: (r) => <span className="text-gray-600">{new Date(r.recordedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                  },
                  {
                    header: "TD",
                    render: (r) => <span className="font-medium">{r.systolicBp}/{r.diastolicBp}</span>
                  },
                  {
                    header: "Suhu",
                    render: (r) => r.bodyTemperature ? `${r.bodyTemperature}°C` : "-"
                  },
                  {
                    header: "Nadi",
                    render: (r) => r.heartRate || "-"
                  },
                  {
                    header: "SpO₂",
                    render: (r) => r.oxygenSaturation ? `${r.oxygenSaturation}%` : "-"
                  },
                  {
                    header: "Metrik Lainnya",
                    render: (r) => r.dynamicData && Object.keys(r.dynamicData).length > 0 ? (
                      <div className="text-xs space-y-0.5">
                        {Object.entries(r.dynamicData).map(([k, v]) => (
                          <div key={k}><span className="font-semibold text-indigo-700">{k}:</span> {String(v)}</div>
                        ))}
                      </div>
                    ) : "-"
                  },
                  {
                    header: "Catatan Perawat",
                    render: (r) => <span className="text-gray-500 max-w-[120px] truncate block">{r.nurseNotes || "-"}</span>
                  },
                  {
                    header: "Status",
                    render: (r) => r.isAbnormal ? <span className="text-red-600 font-bold text-xs bg-red-50 px-2 py-0.5 rounded">Abnormal</span> : <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-0.5 rounded">Normal</span>
                  },
                  {
                    header: "Aksi",
                    className: "print:hidden",
                    render: (r) => (
                      <button onClick={() => handleDeleteRecord(r.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Hapus (Ralat)">
                        <Trash className="w-4 h-4" />
                      </button>
                    )
                  }
                ]}
              />
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
