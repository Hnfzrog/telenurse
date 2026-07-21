import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "PASIEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const body = await req.json()
    const { 
      bloodType, allergies, medicalHistory, currentMedications,
      systolicBp, diastolicBp, bloodSugar, bodyWeight, height 
    } = body

    if (!bloodType || !medicalHistory) {
      return NextResponse.json({ error: "Golongan Darah dan Riwayat Penyakit wajib diisi" }, { status: 400 })
    }

    // Update or create patient profile
    const profile = await prisma.patientProfile.upsert({
      where: { userId },
      update: {
        bloodType,
        allergies,
        medicalHistory,
        currentMedications,
      },
      create: {
        userId,
        bloodType,
        allergies,
        medicalHistory,
        currentMedications,
      }
    })

    // If vital signs were provided, save them as the first HealthRecord
    const indicators = await prisma.monitoringIndicator.findMany()
    const knownKeys = ['systolicBp', 'diastolicBp', 'bodyTemperature', 'heartRate', 'oxygenSaturation', 'bloodSugar', 'bodyWeight', 'height']
    
    let hasVitals = false
    let isAbnormal = false
    let abnormalNotes: string[] = []
    let dynamicData: Record<string, any> = {}

    for (const [key, value] of Object.entries(body)) {
      if (['bloodType', 'allergies', 'medicalHistory', 'currentMedications'].includes(key)) continue
      
      const ind = indicators.find(i => i.name === key)
      if (value !== undefined && value !== null && value !== "") {
        hasVitals = true
        const valNum = Number(value)
        
        if (!knownKeys.includes(key)) {
          dynamicData[key] = valNum
        }

        if (ind) {
          const min = ind.minValue !== null ? Number(ind.minValue) : null
          const max = ind.maxValue !== null ? Number(ind.maxValue) : null
          
          if ((min !== null && valNum < min) || (max !== null && valNum > max)) {
            isAbnormal = true
            abnormalNotes.push(`${ind.label} abnormal (${valNum})`)
          }
        }
      }
    }

    if (hasVitals) {
      await prisma.healthRecord.create({
        data: {
          patientId: userId,
          systolicBp: body.systolicBp ? Number(body.systolicBp) : null,
          diastolicBp: body.diastolicBp ? Number(body.diastolicBp) : null,
          bodyTemperature: body.bodyTemperature ? Number(body.bodyTemperature) : null,
          heartRate: body.heartRate ? Number(body.heartRate) : null,
          oxygenSaturation: body.oxygenSaturation ? Number(body.oxygenSaturation) : null,
          bloodSugar: body.bloodSugar ? Number(body.bloodSugar) : null,
          bodyWeight: body.bodyWeight ? Number(body.bodyWeight) : null,
          height: body.height ? Number(body.height) : null,
          complaints: "Pengkajian Awal (Onboarding)",
          dynamicData: Object.keys(dynamicData).length > 0 ? dynamicData : undefined,
          isAbnormal,
          abnormalNotes: isAbnormal ? abnormalNotes.join(", ") : null
        }
      })
    }

    return NextResponse.json({ success: true, profile })
  } catch (error: any) {
    console.error("Onboarding error:", error)
    return NextResponse.json({ error: "Terjadi kesalahan internal peladen" }, { status: 500 })
  }
}
