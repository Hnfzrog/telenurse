import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ScheduleClient } from "./ScheduleClient"

export const dynamic = "force-dynamic"

export default async function SchedulePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")
  if (session.user.role === "PASIEN") {
    const { requireOnboarding } = await import("@/lib/checkOnboarding")
    await requireOnboarding()
  } else {
    redirect("/auth/login")
  }

  const schedules = await prisma.controlSchedule.findMany({
    where: { patientId: parseInt(session.user.id) },
    include: {
      patient: {
        select: {
          healthRecords: {
            orderBy: { recordedAt: "desc" },
            take: 1
          }
        }
      }
    },
    orderBy: { scheduledDate: "desc" },
  })

  return <ScheduleClient initialSchedules={schedules} />
}
