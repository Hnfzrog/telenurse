import prisma from "./prisma"
import { firebaseAdmin } from "./firebase-admin"
import { Resend } from "resend"
import { NotificationType } from "@prisma/client"

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789")

export async function sendNotification({
  userId,
  title,
  message,
  type,
  url = "/",
  sendEmail = true,
  sendWebPush = true,
}: {
  userId: number
  title: string
  message: string
  type: NotificationType
  url?: string
  sendEmail?: boolean
  sendWebPush?: boolean
}) {
  // 1. Save to database
  await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
    },
  })

  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { pushSubscriptions: true },
  })

  if (!user) return

  // 2. Send FCM Push Notification
  if (sendWebPush && user.pushSubscriptions.length > 0) {
    const tokens = user.pushSubscriptions.map(sub => sub.token);
    
    console.log(`🚀 [DEBUG] SENDING NOTIF TO USER ${userId}. TOKENS FOUND: ${tokens.length}`)

    if (tokens.length > 0) {
      try {
        const response = await firebaseAdmin.messaging().sendEachForMulticast({
          tokens,
          notification: {
            title,
            body: message,
          },
          data: {
            url,
          },
        });
        
        console.log(`✅ [DEBUG] FCM RESPONSE: success=${response.successCount}, failure=${response.failureCount}`)

        // Cleanup invalid tokens
        if (response.failureCount > 0) {
          const failedTokens: string[] = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              const errCode = resp.error?.code;
              console.log(`❌ [DEBUG] Token failed for user ${userId}: ${errCode} - ${resp.error?.message}`)
              if (
                errCode === 'messaging/invalid-registration-token' ||
                errCode === 'messaging/registration-token-not-registered'
              ) {
                failedTokens.push(tokens[idx]);
              }
            }
          });

          if (failedTokens.length > 0) {
            await prisma.pushSubscription.deleteMany({
              where: {
                token: {
                  in: failedTokens,
                },
              },
            });
          }
        }
      } catch (err: any) {
        console.error("FCM push error:", err.message);
      }
    }
  }

  // 3. Send Email
  if (sendEmail && user.email) {
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "TeleNurse <onboarding@resend.dev>",
        to: user.email,
        subject: title,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #0c4a6e;">${title}</h2>
            <p>${message}</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Notifikasi otomatis dari sistem TeleNurse.</p>
          </div>
        `,
      })
    } catch (e) {
      console.error("Email send error:", e)
    }
  }
}
