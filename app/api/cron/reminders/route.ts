import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

// This endpoint should be called every minute by a cron job (e.g., Vercel Cron)
export async function GET() {
  try {
    // Get current time in Jakarta timezone
    const now = new Date()
    const options = { timeZone: 'Asia/Jakarta', hour12: false, hour: '2-digit', minute: '2-digit' } as const
    const currentJakartaTime = new Intl.DateTimeFormat('en-US', options).format(now) // "08:00"

    // Calculate time 5 minutes from now
    const futureTime = new Date(now.getTime() + 5 * 60000)
    const targetReminderTime = new Intl.DateTimeFormat('en-US', options).format(futureTime)

    // Find all active medication reminders for that specific time
    const reminders = await prisma.medicationReminder.findMany({
      where: {
        isActive: true,
        reminderTime: targetReminderTime,
        medication: {
          isActive: true
        }
      },
      include: {
        medication: true
      }
    })

    const notificationsCreated = []

    for (const reminder of reminders) {
      // Create a DB Notification
      const notif = await prisma.notification.create({
        data: {
          userId: reminder.medication.patientId,
          type: "MEDICATION_REMINDER",
          title: "Pengingat Minum Obat",
          message: `Dalam 5 menit (pukul ${reminder.reminderTime}), saatnya meminum obat ${reminder.medication.name} (${reminder.medication.dosage}).`,
          referenceType: "MEDICATION",
          referenceId: reminder.medicationId
        }
      })
      notificationsCreated.push(notif)
      
      // Update lastSentAt
      await prisma.medicationReminder.update({
        where: { id: reminder.id },
        data: { lastSentAt: new Date() }
      })

      // NOTE: For actual device Push Notifications (Web Push / FCM), 
      // you would integrate the 'web-push' library here, fetch the user's PushSubscription 
      // from the database, and send the payload directly to their device.
    }

    return NextResponse.json({ 
      success: true, 
      currentTime: currentJakartaTime,
      targetTime: targetReminderTime,
      notificationsSent: notificationsCreated.length 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
