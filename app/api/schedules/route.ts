import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "PASIEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { scheduledDate, notes } = await req.json()

    if (!scheduledDate) {
      return NextResponse.json({ error: "Tanggal jadwal harus diisi" }, { status: 400 })
    }

    const dateStr = scheduledDate as string;
    const dateObj = new Date(dateStr);
    const timePart = dateStr.includes("T") ? dateStr.split("T")[1] : null;

    const schedule = await prisma.controlSchedule.create({
      data: {
        patientId: parseInt(session.user.id),
        scheduledDate: dateObj,
        scheduledTime: timePart,
        notes,
        status: "PENDING"
      }
    })

    const { sendNotification } = await import("@/lib/notifications")
    
    // Notify Patient
    await sendNotification({
      userId: parseInt(session.user.id),
      type: "SCHEDULE_REMINDER",
      title: "Pengajuan Jadwal",
      message: `Pengajuan jadwal kontrol Anda pada ${new Date(scheduledDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} telah dikirim dan menunggu konfirmasi perawat.`,
      url: "/schedule"
    })

    // Notify Nurses
    const nurses = await prisma.user.findMany({ where: { role: "PERAWAT" } })
    for (const nurse of nurses) {
      await sendNotification({
        userId: nurse.id,
        type: "SCHEDULE_REMINDER",
        title: "Pengajuan Kontrol Baru",
        message: `Pasien ${session.user.name || "ID " + session.user.id} mengajukan jadwal kontrol baru pada ${new Date(scheduledDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}.`,
        url: "/nurse/schedules"
      })
    }

    return NextResponse.json(schedule, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
