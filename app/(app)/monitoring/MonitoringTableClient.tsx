"use client"

import { SharedDataTable } from "@/components/ui/SharedDataTable"

function StatusBadge({ isAbnormal }: { isAbnormal: boolean }) {
  return isAbnormal
    ? <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">Abnormal</span>
    : <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">Normal</span>
}

export function MonitoringTableClient({ records }: { records: any[] }) {
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  )

  return (
    <SharedDataTable
      data={sortedRecords}
      searchKeys={["complaints", "nurseNotes", "patient.name"]}
      emptyMessage="Belum ada data monitoring"
      columns={[
        {
          header: "Tanggal & Waktu",
          render: (r) => (
            <span className="text-gray-700 whitespace-nowrap">
              {new Date(r.recordedAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          ),
        },
        {
          header: "TD (mmHg)",
          render: (r) => <span className="font-semibold text-gray-800">{r.systolicBp && r.diastolicBp ? `${r.systolicBp}/${r.diastolicBp}` : "-"}</span>,
        },
        {
          header: "Suhu (°C)",
          render: (r) => <span className="text-gray-700">{r.bodyTemperature ? `${r.bodyTemperature}` : "-"}</span>,
        },
        {
          header: "Nadi (bpm)",
          render: (r) => <span className="text-gray-700">{r.heartRate ?? "-"}</span>,
        },
        {
          header: "SpO₂ (%)",
          render: (r) => <span className="text-gray-700">{r.oxygenSaturation ?? "-"}</span>,
        },
        {
          header: "Keluhan",
          render: (r) => <span className="text-gray-600 max-w-[180px] truncate block">{r.complaints || "-"}</span>,
        },
        {
          header: "Status",
          render: (r) => <StatusBadge isAbnormal={r.isAbnormal} />,
        },
      ]}
    />
  )
}
