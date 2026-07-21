import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { requireOnboarding } from "@/lib/checkOnboarding"

function StatusBadge({ isAbnormal }: { isAbnormal: boolean }) {
  return isAbnormal
    ? <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">Abnormal</span>
    : <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">Normal</span>
}

export default async function MonitoringPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "PASIEN") redirect("/auth/login")

  await requireOnboarding()

  const patientId = session.user.role === "PASIEN" ? parseInt(session.user.id) : undefined

  const records = await prisma.healthRecord.findMany({
    where: patientId ? { patientId } : {},
    include: { patient: { select: { name: true } } },
    orderBy: { recordedAt: "desc" },
    take: 50,
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Monitoring Kesehatan</h1>
          <p className="text-sm text-gray-500 mt-1">Riwayat catatan kondisi kesehatan</p>
        </div>
        <Link href="/monitoring/create">
          <Button className="bg-[#1976d2] hover:bg-[#1565c0] gap-2">
            <Plus className="h-4 w-4" />
            Catat Baru
          </Button>
        </Link>
      </div>

      {records.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <Activity className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Belum ada data monitoring</p>
          <p className="text-sm text-gray-400 mt-1">Klik tombol "Catat Baru" untuk mulai mencatat.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Tanggal & Waktu</th>
                  {session.user.role !== "PASIEN" && <th className="text-left px-4 py-3 font-medium text-gray-600">Pasien</th>}
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">TD (mmHg)</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Suhu (°C)</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Nadi (bpm)</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">SpO₂ (%)</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Keluhan</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((r) => (
                  <tr key={r.id} className={r.isAbnormal ? "bg-red-50/40" : "hover:bg-gray-50"}>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {new Date(r.recordedAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    {session.user.role !== "PASIEN" && <td className="px-4 py-3 font-medium text-gray-800">{r.patient.name}</td>}
                    <td className="px-4 py-3 font-semibold text-gray-800">{r.systolicBp && r.diastolicBp ? `${r.systolicBp}/${r.diastolicBp}` : "-"}</td>
                    <td className="px-4 py-3 text-gray-700">{r.bodyTemperature ? `${r.bodyTemperature}` : "-"}</td>
                    <td className="px-4 py-3 text-gray-700">{r.heartRate ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-700">{r.oxygenSaturation ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{r.complaints || "-"}</td>
                    <td className="px-4 py-3"><StatusBadge isAbnormal={r.isAbnormal} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
