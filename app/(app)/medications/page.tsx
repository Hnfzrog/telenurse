import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Pill } from "lucide-react"
import { MedicationsClient } from "./MedicationsClient"

export default async function MedicationsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "PASIEN") redirect("/auth/login")
  
  const { requireOnboarding } = await import("@/lib/checkOnboarding")
  await requireOnboarding()

  const medications = await prisma.medication.findMany({
    where: { patientId: parseInt(session.user.id), isActive: true },
    include: {
      reminders: true,
      medicationLogs: {
        where: {
          takenAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Pengingat Obat</h1>
          <p className="text-teal-100 max-w-lg">Daftar obat yang diresepkan dan diatur oleh perawat. Pastikan Anda meminumnya sesuai jadwal.</p>
        </div>
        <Pill className="absolute -right-6 -bottom-10 h-64 w-64 text-white opacity-10 -rotate-12" />
      </div>

      <MedicationsClient medications={medications} />
    </div>
  )
}

export const dynamic = "force-dynamic";
