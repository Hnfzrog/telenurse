export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { NursePatientsTableClient } from "./NursePatientsTableClient"

export default async function NursePatientsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "PERAWAT") redirect("/auth/login")

  const patients = await prisma.user.findMany({
    where: { role: "PASIEN" },
    include: {
      healthRecords: { orderBy: { recordedAt: "desc" }, take: 1 },
      controlSchedules: { where: { status: "APPROVED" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Daftar Pasien</h1>
        <p className="text-sm text-gray-500 mt-1">{patients.length} pasien terdaftar</p>
      </div>

      <NursePatientsTableClient patients={patients} />
    </div>
  )
}
