import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/auth/login")
  }
  
  if (session.user.role === "PERAWAT") {
    redirect("/nurse/dashboard")
  } else if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard")
  } else {
    redirect("/dashboard/patient")
  }
}
