import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendNotification } from "@/lib/notifications"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = new Date()
    const options = { timeZone: 'Asia/Jakarta', hour12: false, hour: '2-digit', minute: '2-digit' } as const
    const currentHHMM = new Intl.DateTimeFormat('en-US', options).format(now)

    // Check MedicationReminder table for current time
    const reminders = await prisma.medicationReminder.findMany({
      where: { 
        isActive: true,
        reminderTime: currentHHMM,
        medication: { isActive: true }
      },
      include: {
        medication: true
      }
    })

    let sentCount = 0

    for (const reminder of reminders) {
      // Create DB notification
      await prisma.notification.create({
        data: {
          userId: reminder.medication.patientId,
          type: "MEDICATION_REMINDER",
          title: "Pengingat Minum Obat 💊",
          message: `Saatnya meminum obat ${reminder.medication.name} (${reminder.medication.dosage}).`,
          referenceType: "MEDICATION",
          referenceId: reminder.medicationId
        }
      })
      
      // Send Firebase Push Notification
      await sendNotification({
        userId: reminder.medication.patientId,
        type: "MEDICATION_REMINDER",
        title: "Waktunya Minum Obat 💊",
        message: `Saatnya minum obat ${reminder.medication.name} (${reminder.medication.dosage}). Buka aplikasi untuk konfirmasi.`,
        url: "/medications",
        sendEmail: false
      })
      
      // Update lastSentAt
      await prisma.medicationReminder.update({
        where: { id: reminder.id },
        data: { lastSentAt: new Date() }
      })

      sentCount++
    }

    return NextResponse.json({ success: true, sentCount, currentHHMM })
  } catch (err: any) {
    console.error("Cron Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
