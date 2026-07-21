import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Search } from "lucide-react"

export default async function NursePatientsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "PERAWAT") redirect("/auth/login")

  const patients = await prisma.user.findMany({
    where: { role: "PASIEN" },
    include: {
      healthRecords: { orderBy: { recordedAt: "desc" }, take: 1 },
      controlSchedules: { where: { status: "APPROVED" }, take: 1 },
    },
    orderBy: { name: "asc" },
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Daftar Pasien</h1>
        <p className="text-sm text-gray-500 mt-1">{patients.length} pasien terdaftar</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Nama Pasien</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">No. Telepon</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Monitoring Terakhir</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patients.map((p) => {
                const lastRecord = p.healthRecords[0]
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#1976d2]/10 flex items-center justify-center text-[#1976d2] font-bold text-sm shrink-0">
                          {p.name[0]?.toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800">{p.name}</span>
                          {p.controlSchedules?.length > 0 && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded w-fit mt-0.5">Kontrol Aktif</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{p.email}</td>
                    <td className="px-5 py-3 text-gray-600">{p.phone || "-"}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {lastRecord ? new Date(lastRecord.recordedAt).toLocaleDateString("id-ID") : "Belum ada"}
                    </td>
                    <td className="px-5 py-3">
                      {lastRecord?.isAbnormal ? (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Abnormal</span>
                      ) : lastRecord ? (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Normal</span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/nurse/patients/${p.id}`} className="inline-flex items-center gap-1 text-xs text-[#1976d2] hover:underline font-medium">
                        Detail <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
