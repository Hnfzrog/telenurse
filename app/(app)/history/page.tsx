export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { HistoryClient } from "./HistoryClient"

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")
  if (session.user.role === "PASIEN") {
    const { requireOnboarding } = await import("@/lib/checkOnboarding")
    await requireOnboarding()
  }

  const patientId = session.user.role === "PASIEN" ? parseInt(session.user.id) : undefined

  // 1. Ambil Semua Sesi Kontrol
  const schedules = await prisma.controlSchedule.findMany({
    where: patientId ? { patientId } : {},
    include: {
      nurse: { select: { name: true } },
      patient: { select: { name: true } },
    },
    orderBy: { scheduledDate: "desc" },
  })

  // 2. Ambil data SOAP terkait
  const soapAssessments = await prisma.nursingAssessment.findMany({
    where: patientId ? { patientId } : {},
    include: { nurse: { select: { name: true } } },
    orderBy: { assessmentDate: "desc" },
  })

  // 3. Ambil data Peresepan Obat
  const medications = await prisma.medication.findMany({
    where: patientId ? { patientId } : {},
    orderBy: { createdAt: "desc" },
  })

  // 4. Ambil history Monitor Kesehatan
  const healthRecords = await prisma.healthRecord.findMany({
    where: patientId ? { patientId } : {},
    orderBy: { recordedAt: "desc" },
  })

  return (
    <HistoryClient 
      schedules={schedules} 
      soapAssessments={soapAssessments} 
      medications={medications} 
      healthRecords={healthRecords} 
      isPatient={session.user.role === "PASIEN"}
    />
  )
}
