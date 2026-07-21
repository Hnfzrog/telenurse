import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const lastId = parseInt(searchParams.get("lastId") || "0")
    const userId = parseInt(session.user.id)

    // Dapatkan notifikasi yang belum dibaca
    const unreadCount = await prisma.notification.count({
      where: { 
        userId: userId,
        isRead: false
      }
    })

    // Dapatkan notifikasi BARU sejak lastId
    let newNotifications: any[] = []
    if (lastId > 0) {
      newNotifications = await prisma.notification.findMany({
        where: {
          userId: userId,
          id: { gt: lastId }
        },
        orderBy: { id: 'asc' }
      })
    } else {
      // Jika first load, ambil ID notifikasi terakhir saja agar polling berikutnya jalan
      const lastNotif = await prisma.notification.findFirst({
        where: { userId: userId },
        orderBy: { id: 'desc' }
      })
      if (lastNotif) {
        // Kita masukan satu elemen dummy hanya untuk mengeset lastId di client tanpa memunculkan toast
        newNotifications = [{ id: lastNotif.id, _isInit: true }] 
      }
    }

    return NextResponse.json({ unreadCount, newNotifications }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
