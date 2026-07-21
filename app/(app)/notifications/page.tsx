import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { NotificationsClient } from "./NotificationsClient"

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")

  const notifications = await prisma.notification.findMany({
    where: { userId: parseInt(session.user.id) },
    orderBy: { createdAt: "desc" },
    take: 50, // Get last 50 notifications
  })

  return <NotificationsClient initialNotifications={notifications} />
}
