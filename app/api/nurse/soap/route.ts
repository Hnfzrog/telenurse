import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "PERAWAT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { patientId, subjective, objective, diagnosis, plan } = body

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 })
    }

    const assessment = await prisma.nursingAssessment.create({
      data: {
        nurseId: parseInt(session.user.id),
        patientId: parseInt(patientId),
        subjective,
        objective,
        diagnosis,
        plan
      }
    })

    return NextResponse.json(assessment, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
