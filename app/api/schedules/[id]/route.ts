import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "PERAWAT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status, notes, needsFollowUp, followUpDate } = await req.json()
    const id = parseInt(params.id)

    if (!["APPROVED", "REJECTED", "COMPLETED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const dataToUpdate: any = { status }
    if (status === "APPROVED" || status === "COMPLETED") {
      dataToUpdate.nurseId = parseInt(session.user.id)
    }
    if (status === "COMPLETED") {
      if (notes) {
        dataToUpdate.completionNotes = notes
      }
      if (needsFollowUp) {
        dataToUpdate.needsFollowUp = true
        dataToUpdate.followUpDate = new Date(followUpDate)
      }
    }

    const schedule = await prisma.controlSchedule.update({
      where: { id },
      data: dataToUpdate,
      include: { patient: true }
    })

    if (status === "COMPLETED" && needsFollowUp && followUpDate) {
      const followUpStr = followUpDate as string;
      const followUpDateObj = new Date(followUpStr);
      const followUpTimePart = followUpStr.includes("T") ? followUpStr.split("T")[1] : null;

      await prisma.controlSchedule.create({
        data: {
          patientId: schedule.patientId,
          nurseId: parseInt(session.user.id),
          scheduledDate: followUpDateObj,
          scheduledTime: followUpTimePart,
          status: "APPROVED",
          requestedBy: "perawat",
          notes: "Jadwal kontrol lanjutan (Disarankan oleh perawat)"
        }
      })
    }

    // Create Notification for Patient
    let title = ""
    let message = ""
    if (status === "APPROVED") {
      title = "Jadwal Disetujui"
      message = `Pengajuan jadwal kontrol Anda pada ${new Date(schedule.scheduledDate).toLocaleDateString("id-ID")} telah disetujui perawat.`
    } else if (status === "REJECTED") {
      title = "Jadwal Ditolak"
      message = `Pengajuan jadwal kontrol Anda pada ${new Date(schedule.scheduledDate).toLocaleDateString("id-ID")} ditolak perawat.`
    } else if (status === "COMPLETED") {
      title = "Kunjungan Selesai"
      message = `Sesi kontrol/kunjungan Anda telah ditandai selesai.`
      if (needsFollowUp && followUpDate) {
        message += ` Perawat menyarankan kontrol lanjutan pada ${new Date(followUpDate).toLocaleDateString("id-ID")}.`
      }
    }

    const { sendNotification } = await import("@/lib/notifications")

    await sendNotification({
      userId: schedule.patientId,
      type: "GENERAL",
      title,
      message,
      url: "/schedule",
      sendEmail: false, // Kita sudah handle email sendiri di bawah (opsional, tapi saya ubah jadi true jika ingin pakai email bawaan)
    })

    // Send email for critical events (Split strategy to save limits)
    if ((status === "APPROVED" || status === "REJECTED") && schedule.patient.email) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-w: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #1976d2; margin-top: 0;">TeleNurse - ${title}</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">${message}</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px; margin-bottom: 0;">Pesan otomatis dari sistem TeleNurse. Mohon tidak membalas email ini.</p>
        </div>
      `
      await sendEmail({
        to: schedule.patient.email,
        subject: `[TeleNurse] ${title}`,
        html: emailHtml
      })
    }

    return NextResponse.json(schedule, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "PASIEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = parseInt(params.id)

    // Check if the schedule belongs to the user
    const schedule = await prisma.controlSchedule.findUnique({ where: { id } })
    
    if (!schedule || schedule.patientId !== parseInt(session.user.id)) {
      return NextResponse.json({ error: "Unauthorized or not found" }, { status: 403 })
    }

    if (schedule.status !== "PENDING") {
      return NextResponse.json({ error: "Hanya jadwal pending yang bisa dibatalkan" }, { status: 400 })
    }

    await prisma.controlSchedule.delete({ where: { id } })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
