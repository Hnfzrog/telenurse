import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { User, Phone, Mail, Droplets, AlertCircle, FileText, Calendar, ArrowLeft, MapPin } from "lucide-react"
import { ProfileFormClient } from "./ProfileFormClient"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    include: { patientProfile: true },
  })

  if (!user) redirect("/auth/login")

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#1976d2] transition-colors mb-2">
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Kembali
      </Link>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#1976d2] to-blue-400"></div>
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="h-24 w-24 bg-white rounded-full p-1.5 absolute -top-12 border border-gray-100 shadow-sm">
            <div className="h-full w-full rounded-full bg-blue-50 flex items-center justify-center text-[#1976d2] font-bold text-3xl">
              {user.name[0]?.toUpperCase()}
            </div>
          </div>
          
          <div className="pt-16 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
              <span className="inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user.role === "PASIEN" ? "Pasien" : user.role === "PERAWAT" ? "Perawat" : "Admin"}
              </span>
            </div>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Informasi Akun</h2>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Mail className="h-4 w-4 text-gray-400" /> {user.email}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Phone className="h-4 w-4 text-gray-400" /> {user.phone || <span className="text-gray-400 italic">Belum diisi</span>}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Calendar className="h-4 w-4 text-gray-400" /> Bergabung sejak {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>

            {user.role === "PASIEN" && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Data Medis Dasar</h2>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <MapPin className="h-4 w-4 text-green-400 shrink-0" /> Alamat: <span className="font-medium text-gray-600 line-clamp-1">{user.patientProfile?.address || "-"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Droplets className="h-4 w-4 text-red-400 shrink-0" /> Gol. Darah: <span className="font-semibold">{user.patientProfile?.bloodType || "-"}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <AlertCircle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" /> 
                  <div>
                    <span className="block text-gray-500 text-xs mb-0.5">Alergi</span>
                    {user.patientProfile?.allergies || "-"}
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <FileText className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" /> 
                  <div>
                    <span className="block text-gray-500 text-xs mb-0.5">Riwayat Penyakit</span>
                    {user.patientProfile?.medicalHistory || "-"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Edit Profil</h2>
        <ProfileFormClient user={user} />
      </div>
    </div>
  )
}
