import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardRouter() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")

  if (session.user.role === "ADMIN") redirect("/admin/dashboard")
  if (session.user.role === "PERAWAT") redirect("/nurse/dashboard")
  redirect("/dashboard/patient")
}

export const dynamic = "force-dynamic";
