import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { NurseSchedulesClient } from "./NurseSchedulesClient"

export const dynamic = "force-dynamic"

export default async function NurseSchedulesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "PERAWAT") redirect("/auth/login")

  const schedules = await prisma.controlSchedule.findMany({
    include: { 
      patient: { 
        select: { 
          name: true, 
          id: true,
          healthRecords: {
            orderBy: { recordedAt: "desc" },
            take: 1
          }
        } 
      } 
    },
    orderBy: { scheduledDate: "desc" },
  })

  return <NurseSchedulesClient initialSchedules={schedules} />
}
