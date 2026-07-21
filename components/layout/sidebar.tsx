"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, FileText, UserPlus, FileEdit, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  // Basic role check for rendering menus
  const role = session?.user?.role || "PERAWAT"

  const nurseMenu = [
    { href: "/nurse/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/nurse/patients", icon: Users, label: "Daftar Pasien" },
    { href: "/nurse/history", icon: FileText, label: "Riwayat" },
  ]

  const adminMenu = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/articles", icon: FileEdit, label: "Kelola Artikel" },
    { href: "/admin/nurses", icon: UserPlus, label: "Kelola Perawat" },
  ]

  const menuItems = role === "ADMIN" ? adminMenu : nurseMenu

  return (
    <aside className="hidden w-64 flex-col border-r bg-surface md:flex">
      <div className="flex h-16 items-center px-6 border-b">
        <h2 className="text-lg font-bold text-primary">TeleNurse</h2>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-light/50 text-primary-dark"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <button className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
          <Settings className="h-5 w-5" />
          <span>Pengaturan</span>
        </button>
      </div>
    </aside>
  )
}
