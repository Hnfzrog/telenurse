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

    const body = await req.json()
    const { patientId, name, dosage, frequency, instructions, reminderTimes, endDate } = body

    if (!patientId || !name || !dosage || !frequency) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const medication = await prisma.medication.create({
      data: {
        patientId: parseInt(patientId),
        nurseId: parseInt(session.user.id),
        name,
        dosage,
        frequency,
        instructions,
        startDate: new Date(),
        endDate: endDate ? new Date(endDate) : null,
        isActive: true
      }
    })

    if (reminderTimes) {
      const times = reminderTimes.split(",").map((t: string) => t.trim()).filter((t: string) => t)
      for (const t of times) {
        await prisma.medicationReminder.create({
          data: {
            medicationId: medication.id,
            reminderTime: t
          }
        })
        
        await prisma.notification.create({
          data: {
            userId: parseInt(patientId),
            type: "MEDICATION_REMINDER",
            title: "Jadwal Minum Obat Baru",
            message: `Perawat meresepkan ${name} (${dosage}). Diminum setiap jam ${t}.`
          }
        })
      }
    }

    return NextResponse.json(medication, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
