import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "PERAWAT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const recordId = parseInt(params.id)
    if (isNaN(recordId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const body = await request.json()
    const { isAbnormal } = body

    if (typeof isAbnormal !== "boolean") {
      return NextResponse.json({ error: "isAbnormal must be a boolean" }, { status: 400 })
    }

    const updatedRecord = await prisma.healthRecord.update({
      where: { id: recordId },
      data: { isAbnormal },
    })

    return NextResponse.json(updatedRecord)
  } catch (error) {
    console.error("Error updating health record status:", error)
    return NextResponse.json(
      { error: "Gagal mengupdate status" },
      { status: 500 }
    )
  }
}
