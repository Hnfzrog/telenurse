import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function requireOnboarding() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")
  
  if (session.user.role === "PASIEN") {
    const profile = await prisma.patientProfile.findUnique({
      where: { userId: parseInt(session.user.id) }
    })
    
    // Jika belum punya profil ATAU riwayat penyakit / gol darah belum diisi
    if (!profile || !profile.bloodType || !profile.medicalHistory) {
      redirect("/onboarding")
    }
    return profile
  }
  
  return null
}
