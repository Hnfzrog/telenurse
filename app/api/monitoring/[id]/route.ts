import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "PASIEN" && session.user.role !== "PERAWAT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const recordId = parseInt(params.id)
    if (isNaN(recordId)) {
      return NextResponse.json({ error: "Invalid record ID" }, { status: 400 })
    }

    // Optional: Verify ownership if role is PASIEN
    if (session.user.role === "PASIEN") {
      const existing = await prisma.healthRecord.findUnique({
        where: { id: recordId }
      })
      if (!existing || existing.patientId !== parseInt(session.user.id)) {
        return NextResponse.json({ error: "Forbidden: You can only delete your own records" }, { status: 403 })
      }
    }

    await prisma.healthRecord.delete({
      where: { id: recordId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
