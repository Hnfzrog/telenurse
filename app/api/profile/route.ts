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

    const { name, phone, address, bloodType, allergies, medicalHistory } = await req.json()

    // Update user base info
    const user = await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: { name, phone }
    })

    // If PASIEN, also update profile
    if (session.user.role === "PASIEN") {
      await prisma.patientProfile.upsert({
        where: { userId: parseInt(session.user.id) },
        update: {
          address,
          bloodType,
          allergies,
          medicalHistory
        },
        create: {
          userId: parseInt(session.user.id),
          address,
          bloodType,
          allergies,
          medicalHistory
        }
      })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
