export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { HeartPulse, BookOpen, Pill, Calendar, FileText, AlertTriangle, TrendingUp } from "lucide-react"
import { WhatsAppButton } from "@/components/dashboard/WhatsAppButton"
import { DynamicIndicatorsChart } from "@/components/dashboard/DynamicIndicatorsChart"
import { requireOnboarding } from "@/lib/checkOnboarding"

const menuItems = [
  { title: "Monitoring Kesehatan", icon: HeartPulse, href: "/monitoring", color: "bg-red-50 text-red-600 border-red-100", desc: "Catat dan pantau kondisi kesehatan" },
  { title: "Edukasi Kesehatan", icon: BookOpen, href: "/education", color: "bg-purple-50 text-purple-600 border-purple-100", desc: "Artikel dan info kesehatan" },
  { title: "Pengingat Obat", icon: Pill, href: "/medications", color: "bg-green-50 text-green-600 border-green-100", desc: "Jadwal minum obat Anda" },
  { title: "Jadwal Kontrol", icon: Calendar, href: "/schedule", color: "bg-orange-50 text-orange-600 border-orange-100", desc: "Jadwal kontrol ke faskes" },
  { title: "Riwayat Kesehatan", icon: FileText, href: "/history", color: "bg-teal-50 text-teal-600 border-teal-100", desc: "Rekam jejak pelayanan Anda" },
]

export default async function PatientDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "PASIEN") redirect("/auth/login")
  
  await requireOnboarding()

  const recentRecords = await prisma.healthRecord.findMany({
    where: { patientId: parseInt(session.user.id) },
    orderBy: { recordedAt: "desc" },
    take: 10, // Increased for better chart data
  })

  const abnormalCount = await prisma.healthRecord.count({
    where: { patientId: parseInt(session.user.id), isAbnormal: true },
  })

  const schedules = await prisma.monitoringSchedule.findMany({
    where: { patientId: parseInt(session.user.id), isActive: true },
    orderBy: { reminderTime: "asc" }
  })

  const indicators = await prisma.monitoringIndicator.findMany({
    orderBy: { id: "asc" }
  })

  const nurses = await prisma.user.findMany({
    where: { role: "PERAWAT" },
    select: { id: true, name: true, phone: true }
  })

  const firstName = session.user.name || "Pasien"

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-24">

      {/* Welcome Banner */}
      <div className="rounded-[2rem] bg-gradient-brand p-8 text-white relative overflow-hidden z-10 shadow-xl shadow-brand-blue/20">
        <div className="relative z-10">
          <p className="text-teal-50 text-sm font-medium">Selamat datang kembali 👋</p>
          <h1 className="text-3xl font-jakarta font-bold mt-1">Hallo, {firstName}!</h1>
          <p className="text-teal-100 text-sm mt-2 max-w-xl">Semoga harimu sehat selalu. Jangan lupa pantau kondisi kesehatanmu hari ini.</p>
          
          {schedules.length > 0 && (
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 inline-block">
              <p className="text-xs text-teal-50 uppercase tracking-wide font-semibold mb-2">Jadwal Cek Kesehatan Hari Ini:</p>
              <div className="flex gap-2 flex-wrap">
                {schedules.map(sch => (
                  <span key={sch.id} className="bg-white text-brand-dark px-3 py-1 rounded-md text-sm font-bold shadow-sm">
                    ⏰ {sch.reminderTime}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/monitoring/create" className="inline-flex items-center gap-2 rounded-xl bg-white text-brand-dark px-5 py-3 text-sm font-semibold hover:bg-gray-50 hover:scale-105 transition-all shadow-md">
              <HeartPulse className="h-4 w-4 text-brand-teal" />
              Catat Kondisi Hari Ini
            </Link>
            <WhatsAppButton patientName={firstName} nurses={nurses} />
          </div>
        </div>
        <div className="absolute right-[-10%] bottom-[-50%] w-64 h-64 bg-white/20 rounded-full blur-3xl mix-blend-overlay"></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-white/60 bg-white/50 backdrop-blur-xl p-6 shadow-xl shadow-blue-900/5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-medium">
            <TrendingUp className="h-5 w-5 text-brand-blue" />
            Total Record
          </div>
          <p className="text-4xl font-jakarta font-bold text-gray-800">{recentRecords.length > 0 ? recentRecords.length + "+" : "0"}</p>
          <p className="text-xs text-gray-500 mt-2">data monitoring tersimpan</p>
        </div>
        <div className={`rounded-3xl border p-6 shadow-xl backdrop-blur-xl ${abnormalCount > 0 ? "bg-red-50/70 border-red-200/60 shadow-red-900/5" : "bg-white/50 border-white/60 shadow-blue-900/5"}`}>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-medium">
            <AlertTriangle className={`h-5 w-5 ${abnormalCount > 0 ? "text-red-500" : ""}`} />
            Perlu Perhatian
          </div>
          <p className={`text-4xl font-jakarta font-bold ${abnormalCount > 0 ? "text-red-600" : "text-gray-800"}`}>{abnormalCount}</p>
          <p className="text-xs text-gray-500 mt-2">hasil abnormal terdeteksi</p>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="bg-white/50 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl shadow-blue-900/5 p-6 md:p-8">
        <h2 className="text-xl font-jakarta font-bold text-gray-900 mb-6">Menu Layanan</h2>
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

      {/* Chart Section */}
      <DynamicIndicatorsChart records={recentRecords} indicators={indicators} />

      {/* Recent Records */}
      {recentRecords.length > 0 && (
        <div className="bg-white/50 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl shadow-blue-900/5 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-jakarta font-bold text-gray-900">Monitoring Terakhir</h2>
            <Link href="/monitoring" className="text-sm text-brand-blue hover:underline font-semibold">Lihat semua</Link>
          </div>
          <div className="space-y-4">
            {recentRecords.map((r) => (
              <div key={r.id} className={`flex items-center justify-between rounded-3xl border p-5 bg-white/70 shadow-sm transition-all hover:bg-white ${r.isAbnormal ? "border-red-200/60" : "border-white/60"}`}>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Tekanan Darah: <span className="text-brand-dark">{r.systolicBp}/{r.diastolicBp}</span> mmHg &nbsp;|&nbsp; SpO₂: <span className="text-brand-dark">{r.oxygenSaturation}%</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1.5">{new Date(r.recordedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                {r.isAbnormal ? (
                  <span className="shrink-0 text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-4 py-2 rounded-full shadow-sm">Abnormal</span>
                ) : (
                  <span className="shrink-0 text-xs font-bold text-green-600 bg-green-50 border border-green-100 px-4 py-2 rounded-full shadow-sm">Normal</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
