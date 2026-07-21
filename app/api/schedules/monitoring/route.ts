import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "PERAWAT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { patientId, reminderTime } = await req.json()

    if (!patientId || !reminderTime) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const schedule = await prisma.monitoringSchedule.create({
      data: {
        patientId: parseInt(patientId),
        nurseId: parseInt(session.user.id),
        reminderTime,
      }
    })

    return NextResponse.json(schedule, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
