export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, Calendar, AlertTriangle, Clock, FileText } from "lucide-react"

const menuItems = [
  { title: "Daftar Pasien", icon: Users, href: "/nurse/patients", color: "bg-blue-50 text-brand-blue border-blue-100", desc: "Kelola data & rekam medis" },
  { title: "Jadwal Kontrol", icon: Calendar, href: "/nurse/schedules", color: "bg-orange-50 text-orange-600 border-orange-100", desc: "Kelola reservasi & konsultasi" },
  { title: "Riwayat Pelayanan", icon: FileText, href: "/history", color: "bg-teal-50 text-teal-600 border-teal-100", desc: "Laporan catatan asuhan (S.O.A.P)" },
]

export default async function NurseDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "PERAWAT") redirect("/auth/login")

  const totalPatients = await prisma.user.count({ where: { role: "PASIEN" } })
  
  const today = new Date()
  today.setHours(0,0,0,0)
  
  const upcomingSchedules = await prisma.controlSchedule.findMany({
    where: { 
      status: { in: ["PENDING", "APPROVED"] },
      scheduledDate: { gte: today }
    },
    include: { patient: true },
    orderBy: { scheduledDate: "asc" },
    take: 3
  })

  const abnormalRecords = await prisma.healthRecord.findMany({
    where: { isAbnormal: true },
    include: { patient: true },
    orderBy: { recordedAt: "desc" },
    take: 3
  })

  const firstName = session.user.name || "Perawat"

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-24">
      {/* Welcome Banner */}
      <div className="rounded-[2rem] bg-gradient-brand p-8 text-white relative overflow-hidden z-10 shadow-xl shadow-brand-blue/20">
        <div className="relative z-10">
          <p className="text-teal-50 text-sm font-medium">Selamat bertugas kembali 👋</p>
          <h1 className="text-3xl font-jakarta font-bold mt-1">Hallo, {firstName}!</h1>
          <p className="text-teal-100 text-sm mt-2 max-w-xl">Ada {abnormalRecords.length} pantauan pasien dengan hasil abnormal yang membutuhkan review Anda hari ini.</p>
        </div>
        <div className="absolute right-[-10%] bottom-[-50%] w-64 h-64 bg-white/20 rounded-full blur-3xl mix-blend-overlay"></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-white/60 bg-white/50 backdrop-blur-xl p-6 shadow-xl shadow-blue-900/5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-medium">
            <Users className="h-5 w-5 text-brand-teal" />
            Total Pasien
          </div>
          <p className="text-4xl font-jakarta font-bold text-gray-800">{totalPatients}</p>
          <p className="text-xs text-gray-500 mt-2">terdaftar di sistem</p>
        </div>
        <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-xl ${abnormalRecords.length > 0 ? "bg-red-50/70 border-red-200/60 shadow-red-900/5" : "bg-white/50 border-white/60 shadow-blue-900/5"}`}>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-medium">
            <AlertTriangle className={`h-5 w-5 ${abnormalRecords.length > 0 ? "text-red-500" : ""}`} />
            Perlu Review
          </div>
          <p className={`text-4xl font-jakarta font-bold ${abnormalRecords.length > 0 ? "text-red-600" : "text-gray-800"}`}>{abnormalRecords.length}</p>
          <p className="text-xs text-gray-500 mt-2">data abnormal baru</p>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="bg-white/50 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl shadow-blue-900/5 p-6 md:p-8">
        <h2 className="text-xl font-jakarta font-bold text-gray-900 mb-6">Akses Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-3xl border border-white/60 bg-white/60 p-5 shadow-sm hover:shadow-lg hover:border-brand-teal/30 hover:bg-white transition-all flex items-start gap-4"
            >
              <div className={`shrink-0 rounded-2xl border p-3.5 ${item.color}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div className="pt-1">
                <h3 className="font-jakarta font-semibold text-gray-800 group-hover:text-brand-blue transition-colors">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Abnormal Records Need Review */}
        <div className="bg-white/50 backdrop-blur-xl rounded-[2rem] border border-red-200/50 shadow-xl shadow-red-900/5 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-jakarta font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              Perlu Review Segera
            </h2>
          </div>
          {abnormalRecords.length > 0 ? (
            <div className="space-y-4">
              {abnormalRecords.map((r) => (
                <div key={r.id} className="rounded-3xl border border-red-100 bg-red-50/50 p-5 shadow-sm transition-all hover:bg-red-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-jakarta font-bold text-gray-800">{r.patient.name}</p>
                      <p className="text-xs text-red-600 font-medium mt-1.5">TD: {r.systolicBp}/{r.diastolicBp} | SpO2: {r.oxygenSaturation}%</p>
                    </div>
                    <Link href={`/nurse/patients/${r.patientId}`} className="text-xs bg-white border border-red-200 text-red-600 px-4 py-2 rounded-full font-bold hover:bg-red-50 shadow-sm transition-colors">
                      Cek Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white/40 rounded-3xl border border-white/60">
              <p className="text-gray-500 text-sm font-medium">Tidak ada data abnormal yang menunggu review.</p>
            </div>
          )}
        </div>

        {/* Upcoming Schedules */}
        <div className="bg-white/50 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl shadow-blue-900/5 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-jakarta font-bold text-gray-900 flex items-center gap-2">
              <Clock className="h-6 w-6 text-orange-500" />
              Jadwal Mendatang
            </h2>
            <Link href="/nurse/schedules" className="text-sm text-brand-blue hover:underline font-semibold">Lihat semua</Link>
          </div>
          {upcomingSchedules.length > 0 ? (
            <div className="space-y-4">
              {upcomingSchedules.map((s) => (
                <div key={s.id} className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-sm flex justify-between items-center transition-all hover:bg-white">
                  <div>
                    <p className="text-sm font-jakarta font-bold text-gray-800">{s.patient.name}</p>
                    <p className="text-xs text-gray-500 mt-1.5 font-medium">
                      {new Date(s.scheduledDate).toLocaleDateString("id-ID", { weekday: 'short', day: 'numeric', month: 'short' })} {s.scheduledTime ? `- ${s.scheduledTime}` : ''}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-4 py-2 rounded-full shadow-sm ${s.status === "APPROVED" ? "bg-green-50 text-green-600 border border-green-100" : "bg-orange-50 text-orange-600 border border-orange-100"}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white/40 rounded-3xl border border-white/60">
              <p className="text-gray-500 text-sm font-medium">Tidak ada jadwal kontrol dalam waktu dekat.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
