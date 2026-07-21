import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "health_records" ADD COLUMN "dynamic_data" JSONB;`)
    } catch(e) {}
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "health_records" ADD COLUMN "nurse_notes" TEXT;`)
    } catch(e) {}

    let indicators = await prisma.monitoringIndicator.findMany({
      orderBy: { id: 'desc' }
    })

    if (indicators.length === 0) {
      const defaultIndicators = [
        { name: "systolicBp", label: "Sistolik", unit: "mmHg", minValue: 90, maxValue: 120 },
        { name: "diastolicBp", label: "Diastolik", unit: "mmHg", minValue: 60, maxValue: 80 },
        { name: "bodyTemperature", label: "Suhu Tubuh", unit: "°C", minValue: 36.5, maxValue: 37.5 },
        { name: "heartRate", label: "Detak Jantung", unit: "bpm", minValue: 60, maxValue: 100 },
        { name: "oxygenSaturation", label: "SpO2", unit: "%", minValue: 95, maxValue: 100 },
        { name: "bloodSugar", label: "Gula Darah", unit: "mg/dL", minValue: 70, maxValue: 140 },
        { name: "bodyWeight", label: "Berat Badan", unit: "kg", minValue: null, maxValue: null },
      ]
      await prisma.monitoringIndicator.createMany({ data: defaultIndicators })
      indicators = await prisma.monitoringIndicator.findMany({ orderBy: { id: 'desc' } })
    }

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
