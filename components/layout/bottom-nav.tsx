"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageCircle, HeartPulse, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/monitoring", icon: HeartPulse, label: "Monitoring" },
  { href: "/profile", icon: User, label: "Akun" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 border-t bg-white pb-safe md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-2xl">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center space-y-1 transition-colors",
              isActive ? "text-[#1976d2]" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Icon className={cn("h-6 w-6", isActive && "fill-current opacity-20 relative")} />
            {/* The icon design shows outline for inactive, and maybe filled for active. Lucide doesn't have strict filled versions, so we use current color. */}
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
