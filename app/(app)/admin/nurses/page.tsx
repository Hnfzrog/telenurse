export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { NursesClient } from "./NursesClient"

export default async function AdminNursesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login")

  const nurses = await prisma.user.findMany({
    where: { role: "PERAWAT" },
    orderBy: { createdAt: "desc" },
  })

  return <NursesClient initialNurses={nurses} />
}
