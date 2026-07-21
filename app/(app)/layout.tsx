"use client"

import { useSession, signOut } from "next-auth/react"
import { usePathname, redirect, useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, HeartPulse, BookOpen, Pill, Calendar, FileText,
  Users, FileEdit, UserPlus, Menu, X, Bell, ChevronDown,
  LogOut, User, Settings, Activity
} from "lucide-react"
import { Logo } from "@/components/ui/Logo"
import { NotificationGuard } from "@/components/dashboard/NotificationGuard"
import { useToast } from "@/hooks/use-toast"

const patientNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/monitoring", icon: HeartPulse, label: "Monitoring" },
  { href: "/education", icon: BookOpen, label: "Edukasi Kesehatan" },
  { href: "/medications", icon: Pill, label: "Pengingat Obat" },
  { href: "/schedule", icon: Calendar, label: "Jadwal Kontrol" },
  { href: "/history", icon: FileText, label: "Riwayat" },
]

const nurseNav = [
  { href: "/nurse/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/nurse/patients", icon: Users, label: "Daftar Pasien" },
  { href: "/nurse/schedules", icon: Calendar, label: "Jadwal Kontrol" },
  { href: "/nurse/education", icon: BookOpen, label: "Kelola Edukasi" },
  { href: "/history", icon: FileText, label: "Riwayat Pelayanan" },
]

const adminNav = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/articles", icon: FileEdit, label: "Kelola Artikel" },
  { href: "/admin/categories", icon: Settings, label: "Kategori Artikel" },
  { href: "/admin/nurses", icon: UserPlus, label: "Kelola Perawat" },
  { href: "/admin/indicators", icon: Activity, label: "Indikator Monitor" },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const lastNotifId = useRef(0)

  // Polling Notifikasi Real-time
  useEffect(() => {
    if (status !== "authenticated") return

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications/poll?lastId=${lastNotifId.current}`)
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.unreadCount)
          
          if (data.newNotifications && data.newNotifications.length > 0) {
            data.newNotifications.forEach((n: any) => {
              if (n.id > lastNotifId.current) {
                lastNotifId.current = n.id
                // Jangan tampilkan toast untuk inisialisasi awal
                if (!n._isInit) {
                  toast({
                    title: n.title,
                    description: n.message,
                  })
                  // Segarkan router saat ini agar data tabel dsb ikut terupdate
                  router.refresh()
                }
              }
            })
          }
        }
      } catch (err) {
        console.error("Polling error:", err)
      }
    }

    // Eksekusi pertama kali
    fetchNotifications()

    // Polling setiap 10 detik (realtime workaround)
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [status, router, toast])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Activity className="h-8 w-8 text-[#1976d2] animate-pulse" />
          <p className="text-sm text-gray-500 font-medium">Memuat TeleNurse...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    redirect("/auth/login")
  }

  const role = session.user.role
  const navItems = role === "ADMIN" ? adminNav : role === "PERAWAT" ? nurseNav : patientNav
  const roleLabel = role === "ADMIN" ? "Admin" : role === "PERAWAT" ? "Perawat" : "Pasien"

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-white/20 gap-3">
        <div className="bg-white p-1 rounded-xl shadow-sm">
          <Logo className="h-10 w-10" />
        </div>
        <span className="text-xl font-jakarta font-extrabold text-white tracking-wide drop-shadow-md">TeleNurse</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-white/20 text-white shadow-lg border border-white/20 backdrop-blur-md translate-x-1"
                  : "text-blue-50/80 hover:bg-white/10 hover:text-white border border-transparent"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Role badge */}
      <div className="px-4 py-4 border-t border-white/20">
        <div className="rounded-xl bg-black/10 backdrop-blur-md border border-white/10 px-4 py-3 shadow-inner">
          <p className="font-semibold text-white break-words leading-tight">{session.user.name}</p>
          <p className="mt-1 text-xs text-blue-100 uppercase tracking-wider">{roleLabel}</p>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 relative overflow-hidden font-sans">
      {/* Animated Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-300/30 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-300/30 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col bg-gradient-to-b from-blue-600 to-indigo-700 shrink-0 fixed inset-y-0 left-0 z-30 shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 flex flex-col bg-[#1976d2] z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Area */}
      <div className="flex flex-col flex-1 min-h-screen md:pl-72 z-10 relative">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between bg-white/60 backdrop-blur-xl border-b border-white/40 px-4 md:px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:block">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {navItems.find(n => pathname === n.href || pathname.startsWith(n.href + "/"))?.label || "TeleNurse"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-[#1976d2]/10 flex items-center justify-center text-[#1976d2] font-bold text-sm">
                  {session.user.name?.[0]?.toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-800 leading-none">{session.user.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{roleLabel}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden py-1">
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                      <User className="h-4 w-4 text-gray-400" />
                      Profil Saya
                    </Link>
                    <div className="my-1 h-px bg-gray-100" />
                    <button
                      onClick={() => signOut({ callbackUrl: "/auth/login" })}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 relative">
          <NotificationGuard>
            {children}
          </NotificationGuard>
        </main>
      </div>
    </div>
  )
}
