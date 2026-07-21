import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sendNotification } from "@/lib/notifications"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Anda belum login. Silakan login terlebih dahulu." })
  }

  // Lihat berapa banyak token yang terdaftar untuk user ini di database
  const subs = await prisma.pushSubscription.findMany({
    where: { userId: parseInt(session.user.id) }
  })

  // Kirim push notification ke diri sendiri
  await sendNotification({
    userId: parseInt(session.user.id),
    type: "GENERAL",
    title: "Test Notifikasi Berhasil! 🎉",
    message: `Halo ${session.user.name}, browser Anda berhasil menerima notifikasi.`,
    url: "/",
    sendEmail: false
  })

  return NextResponse.json({ 
    status: "Triggered",
    user: session.user.name,
    activeTokensInDatabase: subs.length,
    tokenPreviews: subs.map(s => s.token.substring(0, 20) + '... (cek terminal server untuk detail error jika gagal)')
  })
}
