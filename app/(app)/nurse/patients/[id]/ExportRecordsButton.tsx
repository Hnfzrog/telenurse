"use client"

import { Button } from "@/components/ui/button"
import { FileDown, FileSpreadsheet } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

export function ExportRecordsButton({ records, assessments = [], patientName }: { records: any[], assessments?: any[], patientName: string }) {
  
  // Helper to merge records and assessments by Date (YYYY-MM-DD)
  const getMergedData = () => {
    const map = new Map<string, { dateObj: Date, dateStr: string, monitoring: any[], soap: any[] }>()
    
    records.forEach(r => {
      const d = new Date(r.recordedAt)
      const key = d.toLocaleDateString("id-ID")
      if (!map.has(key)) map.set(key, { dateObj: d, dateStr: key, monitoring: [], soap: [] })
      map.get(key)!.monitoring.push(r)
    })
    
    assessments.forEach(a => {
      const d = new Date(a.assessmentDate)
      const key = d.toLocaleDateString("id-ID")
      if (!map.has(key)) map.set(key, { dateObj: d, dateStr: key, monitoring: [], soap: [] })
      map.get(key)!.soap.push(a)
    })
    
    return Array.from(map.values())
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()) // Descending
  }

  const generateRows = () => {
    const merged = getMergedData()
    return merged.map(item => {
      // Format Monitoring
      const monitoringText = item.monitoring.map(m => {
        const parts = []
        if (m.systolicBp && m.diastolicBp) parts.push(`TD: ${m.systolicBp}/${m.diastolicBp} mmHg`)
        if (m.heartRate) parts.push(`Nadi: ${m.heartRate} bpm`)
        if (m.bodyTemperature) parts.push(`Suhu: ${m.bodyTemperature}°C`)
        if (m.oxygenSaturation) parts.push(`SpO2: ${m.oxygenSaturation}%`)
        if (m.bloodSugar) parts.push(`Gula: ${m.bloodSugar} mg/dL`)
        if (m.complaints) parts.push(`Keluhan: ${m.complaints}`)
        return parts.join(" | ")
      }).join("\n") || "-"
      
      // Format SOAP
      const soapText = item.soap.map(s => {
        return `S: ${s.subjective || "-"}\nO: ${s.objective || "-"}\nA: ${s.diagnosis || "-"}\nP: ${s.plan || "-"}`
      }).join("\n\n") || "-"
      
      return {
        nama: patientName,
        tanggal: item.dateStr,
        monitoring: monitoringText,
        soap: soapText
      }
    })
  }

  const exportPDF = () => {
    const doc = new jsPDF("landscape")
    doc.text(`Riwayat Kesehatan (Monitoring & S.O.A.P) - ${patientName}`, 14, 15)
    
    const rows = generateRows()
    
    autoTable(doc, {
      startY: 25,
      head: [["Nama Pasien", "Tanggal", "Data Monitoring (TTV & Keluhan)", "Hasil S.O.A.P"]],
      body: rows.map(r => [r.nama, r.tanggal, r.monitoring, r.soap]),
      styles: { fontSize: 9, cellPadding: 3, valign: 'middle' },
      headStyles: { fillColor: [25, 118, 210] },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 25 },
        2: { cellWidth: 100 },
        3: { cellWidth: 100 }
      }
    })
    
    doc.save(`Riwayat_${patientName.replace(/\s+/g, '_')}.pdf`)
  }

  const exportExcel = () => {
    const rows = generateRows()
    const ws = XLSX.utils.json_to_sheet(rows.map(r => ({
      "Nama Pasien": r.nama,
      "Tanggal": r.tanggal,
      "Data Monitoring (TTV & Keluhan)": r.monitoring,
      "Hasil S.O.A.P": r.soap
    })))
    
    // Auto adjust column widths for Excel
    const colWidths = [{ wch: 20 }, { wch: 15 }, { wch: 60 }, { wch: 60 }]
    ws['!cols'] = colWidths

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Riwayat Kesehatan")
    XLSX.writeFile(wb, `Riwayat_${patientName.replace(/\s+/g, '_')}.xlsx`)
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" className="gap-2 text-red-600 border-red-200 hover:bg-red-50" onClick={exportPDF}>
        <FileDown className="h-4 w-4" /> PDF
      </Button>
      <Button size="sm" variant="outline" className="gap-2 text-green-600 border-green-200 hover:bg-green-50" onClick={exportExcel}>
        <FileSpreadsheet className="h-4 w-4" /> Excel
      </Button>
    </div>
  )
}
