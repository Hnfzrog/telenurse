"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Bell, Check, BellRing, Pill, AlertTriangle, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

export function NotificationsClient({ initialNotifications }: { initialNotifications: any[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [markingAll, setMarkingAll] = useState(false)

  const handleMarkAsRead = async (id: number) => {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/notifications/read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      toast({ variant: "destructive", title: "Gagal memproses" })
    } finally {
      setLoadingId(null)
    }
  }

  const handleMarkAll = async () => {
    setMarkingAll(true)
    try {
      const res = await fetch(`/api/notifications/read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      })
      if (!res.ok) throw new Error()
      toast({ title: "Berhasil", description: "Semua notifikasi ditandai sudah dibaca" })
      router.refresh()
    } catch {
      toast({ variant: "destructive", title: "Gagal memproses" })
    } finally {
      setMarkingAll(false)
    }
  }

  const getIcon = (type: string) => {
    switch(type) {
      case "MEDICATION_REMINDER": return <Pill className="h-5 w-5 text-teal-500" />
      case "ABNORMAL_ALERT": return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "SCHEDULE_REMINDER": return <Calendar className="h-5 w-5 text-orange-500" />
      default: return <BellRing className="h-5 w-5 text-[#1976d2]" />
    }
  }

  const unreadCount = initialNotifications.filter(n => !n.isRead).length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="h-6 w-6 text-[#1976d2]" /> Notifikasi
          </h1>
          <p className="text-sm text-gray-500 mt-1">Anda memiliki {unreadCount} notifikasi belum dibaca</p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAll}
            disabled={markingAll}
            className="text-xs"
          >
            <Check className="h-4 w-4 mr-1.5" /> Tandai Semua Dibaca
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {initialNotifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
            <Bell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Belum ada notifikasi.</p>
          </div>
        ) : (
          initialNotifications.map(n => (
            <div 
              key={n.id} 
              className={cn(
                "p-4 rounded-xl border transition-colors flex gap-4 items-start",
                n.isRead ? "bg-white border-gray-100" : "bg-blue-50/50 border-blue-100"
              )}
            >
              <div className={cn("p-2 rounded-lg shrink-0", n.isRead ? "bg-gray-100" : "bg-white shadow-sm")}>
                {getIcon(n.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <h3 className={cn("text-sm font-semibold", n.isRead ? "text-gray-700" : "text-gray-900")}>
                    {n.title}
                  </h3>
                  <span className="text-[11px] text-gray-400 whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleDateString("id-ID", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className={cn("text-sm mt-1", n.isRead ? "text-gray-500" : "text-gray-700")}>
                  {n.message}
                </p>
              </div>
              {!n.isRead && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-[#1976d2] hover:bg-blue-100 shrink-0"
                  onClick={() => handleMarkAsRead(n.id)}
                  disabled={loadingId === n.id}
                  title="Tandai sudah dibaca"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
