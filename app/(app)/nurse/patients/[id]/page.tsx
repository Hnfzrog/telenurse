import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Activity, FileText, Pill, Calendar } from "lucide-react"
import { AddMonitoringModal } from "./AddMonitoringModal"
import { AddMedicationModal } from "./AddMedicationModal"
import { AddScheduleModal } from "./AddScheduleModal"
import { ExportRecordsButton } from "./ExportRecordsButton"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { DynamicIndicatorsChart } from "@/components/dashboard/DynamicIndicatorsChart"
import { SharedDataTable } from "@/components/ui/SharedDataTable"

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "PERAWAT") redirect("/auth/login")

  const patientId = parseInt(params.id)
  if (isNaN(patientId)) notFound()

  const patient = await prisma.user.findUnique({
    where: { id: patientId, role: "PASIEN" },
    include: {
      patientProfile: true,
      monitoringSchedules: { where: { isActive: true } },
      healthRecords: { orderBy: { recordedAt: "desc" }, take: 20 },
      medications: { where: { isActive: true }, orderBy: { createdAt: "desc" } },
      assessmentsAsPatient: {
        include: { nurse: { select: { name: true } } },
        orderBy: { assessmentDate: "desc" },
        take: 10,
      },
      controlSchedules: { orderBy: { scheduledDate: "desc" }, take: 5 },
    },
  })

  if (!patient) notFound()

  const indicators = await prisma.monitoringIndicator.findMany({
    orderBy: { id: "asc" }
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/nurse/patients">
          <Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800">{patient.name}</h1>
          <p className="text-sm text-gray-500">{patient.email} • {patient.phone || "No telepon"}</p>
        </div>
        <Link href={`/nurse/patients/${patient.id}/soap/create`}>
          <Button size="sm" className="bg-[#1976d2] hover:bg-[#1565c0] gap-2">
            <Plus className="h-4 w-4" /> Tambah Pengkajian
          </Button>
        </Link>
      </div>

      {/* Info Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Data Medis</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Gol. Darah</span><span className="font-medium">{patient.patientProfile?.bloodType || "-"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Alergi</span><span className="font-medium text-right max-w-[120px]">{patient.patientProfile?.allergies || "-"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Riwayat Penyakit</span><span className="font-medium text-right max-w-[120px]">{patient.patientProfile?.medicalHistory || "-"}</span></div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Monitoring Terakhir</h2>
          {patient.healthRecords[0] ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Tekanan Darah</span><span className="font-medium">{patient.healthRecords[0].systolicBp}/{patient.healthRecords[0].diastolicBp} mmHg</span></div>
              <div className="flex justify-between"><span className="text-gray-500">SpO₂</span><span className="font-medium">{patient.healthRecords[0].oxygenSaturation ?? "-"}%</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span>
                {patient.healthRecords[0].isAbnormal
                  ? <span className="text-red-600 font-bold text-xs">Abnormal</span>
                  : <span className="text-green-600 font-bold text-xs">Normal</span>}
              </div>
              {patient.healthRecords[0].complaints && (
                <div><span className="text-gray-500">Keluhan: </span><span className="font-medium">{patient.healthRecords[0].complaints}</span></div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Belum ada data monitoring</p>
          )}
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
            <AddScheduleModal patientId={patient.id} />
            <AddMonitoringModal patientId={patient.id} nurseMode={true} />
          </div>
          {patient.monitoringSchedules && patient.monitoringSchedules.length > 0 && (
            <div className="mt-3">
              <span className="text-xs font-semibold text-gray-500 uppercase">Jadwal Input Cek:</span>
              <div className="flex gap-1 mt-1 flex-wrap">
                {patient.monitoringSchedules.map(sch => (
                  <span key={sch.id} className="text-xs bg-blue-50 text-brand-blue px-2 py-1 rounded-md font-bold">{sch.reminderTime}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Obat Aktif</h2>
            <AddMedicationModal patientId={patient.id} />
          </div>
          {patient.medications.length === 0 ? (
            <p className="text-sm text-gray-400">Belum ada obat</p>
          ) : (
            <div className="space-y-2">
              {patient.medications.map(m => (
                <div key={m.id} className="text-sm">
                  <p className="font-medium text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.dosage} • {m.frequency}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart Section */}
      <DynamicIndicatorsChart records={patient.healthRecords} indicators={indicators} />

      {/* SOAP Assessments Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2"><FileText className="h-4 w-4 text-purple-600" /> Riwayat Pengkajian S.O.A.P</h2>
          <Link href={`/nurse/patients/${patient.id}/soap/create`}>
            <Button size="sm" variant="outline" className="gap-1 text-xs">
              <Plus className="h-3 w-3" /> Tambah
            </Button>
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {patient.assessmentsAsPatient.map(a => (
            <div key={a.id} className="px-5 py-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-400">{new Date(a.assessmentDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} oleh {a.nurse.name}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                {a.subjective && <div><span className="font-semibold text-gray-700">S: </span><span className="text-gray-600">{a.subjective}</span></div>}
                {a.objective && <div><span className="font-semibold text-gray-700">O: </span><span className="text-gray-600">{a.objective}</span></div>}
                {a.diagnosis && <div><span className="font-semibold text-gray-700">A: </span><span className="text-gray-600">{a.diagnosis}</span></div>}
                {a.plan && <div><span className="font-semibold text-gray-700">P: </span><span className="text-gray-600">{a.plan}</span></div>}
              </div>
            </div>
          ))}
          {patient.assessmentsAsPatient.length === 0 && (
            <div className="px-5 py-8 text-center text-gray-400 text-sm">Belum ada pengkajian S.O.A.P.</div>
          )}
        </div>
      </div>
    </div>
  )
}
