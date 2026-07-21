import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, all } = await req.json()
    const userId = parseInt(session.user.id)

    if (all) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: new Date() }
      })
    } else if (id) {
      // Make sure the notification belongs to this user
      const notif = await prisma.notification.findUnique({ where: { id } })
      if (!notif || notif.userId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      await prisma.notification.update({
        where: { id },
        data: { isRead: true, readAt: new Date() }
      })
    } else {
      return NextResponse.json({ error: "Bad request" }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
