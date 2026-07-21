export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { requireOnboarding } from "@/lib/checkOnboarding"
import { MonitoringTableClient } from "./MonitoringTableClient"

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
        <MonitoringTableClient records={records} />
      )}
    </div>
  )
}
