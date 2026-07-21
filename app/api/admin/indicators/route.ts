import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "health_records" ADD COLUMN "dynamic_data" JSONB;`)
    } catch(e) {}
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "health_records" ADD COLUMN "nurse_notes" TEXT;`)
    } catch(e) {}

    const indicators = await prisma.monitoringIndicator.findMany({
      orderBy: { id: 'desc' }
    })
    return NextResponse.json(indicators)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, label, unit, minValue, maxValue } = body

    if (!name || !label) {
      return NextResponse.json({ error: "Name and label are required" }, { status: 400 })
    }

    const indicator = await prisma.monitoringIndicator.create({
      data: {
        name,
        label,
        unit,
        minValue: minValue !== undefined && minValue !== "" ? parseFloat(minValue) : null,
        maxValue: maxValue !== undefined && maxValue !== "" ? parseFloat(maxValue) : null,
      }
    })

    return NextResponse.json(indicator, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
