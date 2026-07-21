import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { IndicatorsClient } from "./IndicatorsClient"

export default async function AdminIndicatorsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login")

  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "health_records" ADD COLUMN IF NOT EXISTS "dynamic_data" JSONB;`)
  } catch(err) {}

  let indicators = []
  try {
    indicators = await prisma.monitoringIndicator.findMany({
      orderBy: { id: "desc" }
    })
  } catch (e) {
    // Run Raw SQL to create MonitoringIndicator table if it doesn't exist
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "monitoring_indicators" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(50) UNIQUE NOT NULL,
        "label" VARCHAR(100) NOT NULL,
        "unit" VARCHAR(20),
        "min_value" DECIMAL(8,2),
        "max_value" DECIMAL(8,2),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)


    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "health_records" ADD COLUMN "nurse_notes" TEXT;`)
    } catch(err) {}
    
    indicators = await prisma.monitoringIndicator.findMany({ orderBy: { id: "desc" } })
  }

  // Seed default indicators if empty
  if (indicators.length === 0) {
    await prisma.monitoringIndicator.createMany({
      data: [
        { name: "systolicBp", label: "Sistolik", unit: "mmHg", minValue: 90, maxValue: 140 },
        { name: "diastolicBp", label: "Diastolik", unit: "mmHg", minValue: 60, maxValue: 90 },
        { name: "bodyTemperature", label: "Suhu", unit: "°C", minValue: 36.0, maxValue: 37.5 },
        { name: "heartRate", label: "Nadi", unit: "bpm", minValue: 60, maxValue: 100 },
        { name: "oxygenSaturation", label: "SpO₂", unit: "%", minValue: 95, maxValue: 100 },
        { name: "bloodSugar", label: "Gula Darah", unit: "mg/dL", minValue: 70, maxValue: 140 },
      ]
    })
    redirect("/admin/indicators") // Reload to fetch seeded
  }

  return <IndicatorsClient initialIndicators={indicators} />
}

export const dynamic = "force-dynamic";
