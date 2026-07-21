import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "PASIEN" && session.user.role !== "PERAWAT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { complaints, nurseNotes } = body
    
    // Determine patient ID based on role
    let targetPatientId = session.user.role === "PASIEN" ? parseInt(session.user.id) : parseInt(body.patientId)

    if (!targetPatientId || isNaN(targetPatientId)) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 })
    }

    let isAbnormal = false
    let abnormalNotes: string[] = []
    let dynamicData: Record<string, any> = {}

    const knownKeys = ['systolicBp', 'diastolicBp', 'bodyTemperature', 'heartRate', 'oxygenSaturation', 'bloodSugar', 'bodyWeight']

    const indicators = await prisma.monitoringIndicator.findMany()

    for (const [key, value] of Object.entries(body)) {
      if (key === 'patientId' || key === 'nurseNotes' || key === 'complaints') continue
      
      const ind = indicators.find(i => i.name === key)
      if (value !== undefined && value !== null && value !== "") {
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

    const record = await prisma.healthRecord.create({
      data: {
        patientId: targetPatientId,
        systolicBp: body.systolicBp ? Number(body.systolicBp) : null,
        diastolicBp: body.diastolicBp ? Number(body.diastolicBp) : null,
        bodyTemperature: body.bodyTemperature ? Number(body.bodyTemperature) : null,
        heartRate: body.heartRate ? Number(body.heartRate) : null,
        oxygenSaturation: body.oxygenSaturation ? Number(body.oxygenSaturation) : null,
        bloodSugar: body.bloodSugar ? Number(body.bloodSugar) : null,
        bodyWeight: body.bodyWeight ? Number(body.bodyWeight) : null,
        complaints,
        nurseNotes: nurseNotes || null,
        dynamicData: Object.keys(dynamicData).length > 0 ? dynamicData : undefined,
        isAbnormal,
        abnormalNotes: isAbnormal ? abnormalNotes.join(", ") : null
      }
    })

    if (isAbnormal) {
      const { sendNotification } = await import("@/lib/notifications")
      
      // Notify the patient
      await sendNotification({
        userId: targetPatientId,
        title: "Peringatan Medis ⚠️",
        message: `Kondisi Anda memerlukan perhatian. ${abnormalNotes.join(", ")}. Mohon segera hubungi tenaga kesehatan.`,
        type: "ABNORMAL_ALERT",
        url: "/history"
      })

      // Notify all nurses
      const nurses = await prisma.user.findMany({ where: { role: "PERAWAT" } })
      const patient = await prisma.user.findUnique({ where: { id: targetPatientId }, select: { name: true } })
      for (const nurse of nurses) {
        await sendNotification({
          userId: nurse.id,
          title: `Peringatan: Kondisi Abnormal Pasien`,
          message: `Pasien ${patient?.name || "ID " + targetPatientId} melaporkan kondisi abnormal: ${abnormalNotes.join(", ")}.`,
          type: "ABNORMAL_ALERT",
          url: `/nurse/patients/${targetPatientId}`
        })
      }
    }

    return NextResponse.json(record, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
