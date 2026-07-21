import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "PASIEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { medicationId, notes, reportedIssue } = await req.json()

    if (!medicationId) {
      return NextResponse.json({ error: "medicationId is required" }, { status: 400 })
    }

    // Cek medication dan nurse terkait
    const medication = await prisma.medication.findUnique({
      where: { id: parseInt(medicationId) },
      select: { nurseId: true, name: true, patient: { select: { name: true } } }
    })

    if (!medication) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 })
    }

    const log = await prisma.medicationLog.create({
      data: {
        patientId: parseInt(session.user.id),
        medicationId: parseInt(medicationId),
        notes: notes || null,
        reportedIssue: !!reportedIssue,
        takenAt: new Date()
      }
    })

    // Jika pasien melaporkan masalah, beri notifikasi ke perawat
    if (reportedIssue && medication.nurseId) {
      const { sendNotification } = await import("@/lib/notifications")
      await sendNotification({
        userId: medication.nurseId,
        type: "MEDICATION_REMINDER",
        title: "Laporan Masalah Obat",
        message: `Pasien ${medication.patient.name} melaporkan keluhan terkait obat ${medication.name}: ${notes}`,
        url: `/nurse/patients/${session.user.id}`
      })
    }

    return NextResponse.json(log, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
