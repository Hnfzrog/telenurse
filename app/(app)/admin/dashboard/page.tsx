import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, FileEdit, UserPlus, FileText } from "lucide-react"

const menuItems = [
  { title: "Kelola Artikel Edukasi", icon: FileEdit, href: "/admin/articles", color: "bg-purple-50 text-purple-600 border-purple-100", desc: "Buat & edit konten kesehatan" },
  { title: "Kelola Akun Perawat", icon: UserPlus, href: "/admin/nurses", color: "bg-blue-50 text-brand-blue border-blue-100", desc: "Registrasi & manajemen staf" },
]

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login")

  const totalNurses = await prisma.user.count({ where: { role: "PERAWAT" } })
  const totalPatients = await prisma.user.count({ where: { role: "PASIEN" } })
  const totalArticles = await prisma.educationContent.count()

  const firstName = session.user.name || "Admin"

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-24">
      {/* Welcome Banner */}
      <div className="rounded-[2rem] bg-gradient-brand p-8 text-white relative overflow-hidden z-10 shadow-xl shadow-brand-blue/20">
        <div className="relative z-10">
          <p className="text-teal-50 text-sm font-medium">Sistem Manajemen TeleNurse 👋</p>
          <h1 className="text-3xl font-jakarta font-bold mt-1">Hallo, {firstName}!</h1>
          <p className="text-teal-100 text-sm mt-2 max-w-xl">Akses fitur administrator untuk mengelola konten edukasi dan data staff perawat.</p>
        </div>
        <div className="absolute right-[-10%] bottom-[-50%] w-64 h-64 bg-white/20 rounded-full blur-3xl mix-blend-overlay"></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-white/60 bg-white/50 backdrop-blur-xl p-6 shadow-xl shadow-blue-900/5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-medium">
            <UserPlus className="h-5 w-5 text-brand-blue" />
            Total Perawat
          </div>
          <p className="text-4xl font-jakarta font-bold text-gray-800">{totalNurses}</p>
        </div>
        <div className="rounded-3xl border border-white/60 bg-white/50 backdrop-blur-xl p-6 shadow-xl shadow-blue-900/5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-medium">
            <Users className="h-5 w-5 text-brand-teal" />
            Total Pasien
          </div>
          <p className="text-4xl font-jakarta font-bold text-gray-800">{totalPatients}</p>
        </div>
        <div className="col-span-2 md:col-span-1 rounded-3xl border border-white/60 bg-white/50 backdrop-blur-xl p-6 shadow-xl shadow-blue-900/5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-medium">
            <FileText className="h-5 w-5 text-purple-600" />
            Total Artikel Edukasi
          </div>
          <p className="text-4xl font-jakarta font-bold text-gray-800">{totalArticles}</p>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="bg-white/50 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl shadow-blue-900/5 p-6 md:p-8">
        <h2 className="text-xl font-jakarta font-bold text-gray-900 mb-6">Akses Administrator</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
    </div>
  )
}

export const dynamic = "force-dynamic";
