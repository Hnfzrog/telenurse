"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { SharedDataTable } from "@/components/ui/SharedDataTable"

export function NursePatientsTableClient({ patients }: { patients: any[] }) {
  return (
    <SharedDataTable
      data={patients}
      searchKeys={["name", "email", "phone"]}
      emptyMessage="Belum ada data pasien"
      columns={[
        {
          header: "Nama Pasien",
          render: (p) => {
            const hasActiveControl = p.controlSchedules?.length > 0
            return (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#1976d2]/10 flex items-center justify-center text-[#1976d2] font-bold text-sm shrink-0">
                  {p.name[0]?.toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">{p.name}</span>
                  {hasActiveControl && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded w-fit mt-0.5">Kontrol Aktif</span>
                  )}
                </div>
              </div>
            )
          },
        },
        {
          header: "Email",
          render: (p) => <span className="text-gray-600">{p.email}</span>,
        },
        {
          header: "No. Telepon",
          render: (p) => <span className="text-gray-600">{p.phone || "-"}</span>,
        },
        {
          header: "Monitoring Terakhir",
          render: (p) => {
            const lastRecord = p.healthRecords?.[0]
            return (
              <span className="text-gray-500 text-xs">
                {lastRecord ? new Date(lastRecord.recordedAt).toLocaleDateString("id-ID") : "Belum ada"}
              </span>
            )
          },
        },
        {
          header: "Status",
          render: (p) => {
            const lastRecord = p.healthRecords?.[0]
            if (lastRecord?.isAbnormal) {
              return <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Abnormal</span>
            }
            if (lastRecord) {
              return <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Normal</span>
            }
            return <span className="text-xs text-gray-400">-</span>
          },
        },
        {
          header: "Aksi",
          className: "text-right",
          render: (p) => (
            <Link href={`/nurse/patients/${p.id}`} className="inline-flex items-center gap-1 text-xs text-[#1976d2] hover:underline font-medium">
              Detail <ChevronRight className="h-3 w-3" />
            </Link>
          ),
        },
      ]}
    />
  )
}
