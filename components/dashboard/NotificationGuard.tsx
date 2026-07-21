"use client"

import { useState, useEffect } from "react"
import { Bell, AlertCircle, ShieldAlert } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function NotificationGuard({ children }: { children: React.ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission | "checking">("checking")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    let unsubscribeMessage: any = null

    if ("Notification" in window && "serviceWorker" in navigator) {
      setPermission(Notification.permission)
      
      // Auto-update if user changes permission from browser settings
      navigator.permissions?.query({ name: "notifications" }).then((status) => {
        status.onchange = () => setPermission(Notification.permission)
      })

      // Jika sudah diizinkan tapi database baru di-reset, token di backend mungkin hilang.
      // Sinkronisasikan token secara diam-diam dan pasang listener foreground.
      if (Notification.permission === "granted") {
        (async () => {
          try {
            const { getMessagingInstance, getToken, onMessage } = await import("@/lib/firebase")
            const messaging = await getMessagingInstance()
            if (messaging) {
              // Listen for foreground messages
              unsubscribeMessage = onMessage(messaging, (payload) => {
                const title = payload.notification?.title || payload.data?.title || "Notifikasi Baru"
                const body = payload.notification?.body || payload.data?.body || ""
                
                // Show in-app toast
                toast({
                  title: title,
                  description: body,
                })
                
                // Also force a system notification using Service Worker
                navigator.serviceWorker.ready.then((reg) => {
                  reg.showNotification(title, {
                    body: body,
                    icon: "/logo.png",
                    data: { url: payload.data?.url || "/" }
                  })
                }).catch((e) => console.error("System notification error:", e))
                
                router.refresh()
              })

              const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js")
              const currentToken = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
                serviceWorkerRegistration: registration,
              })
              
              if (currentToken) {
                await fetch("/api/web-push", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ token: currentToken })
                })
              }
            }
          } catch(e) {
            console.error("Silent token sync error:", e)
          }
        })()
      }
    } else {
      // Browser doesn't support notifications, just let them in
      setPermission("granted") 
    }

    // Simulasi Cron Job dari sisi klien (Hanya untuk keperluan Development/MVP)
    // Mengecek jadwal obat setiap 1 menit (60000ms)
    const interval = setInterval(() => {
      fetch("/api/cron/medications").catch(console.error)
    }, 60000)

    // Panggil sekali saat dimuat
    fetch("/api/cron/medications").catch(console.error)

    return () => {
      clearInterval(interval)
      if (unsubscribeMessage) unsubscribeMessage()
    }
  }, [router, toast])

  const subscribe = async () => {
    try {
      setLoading(true)
      const newPermission = await Notification.requestPermission()
      setPermission(newPermission)
      
      if (newPermission === "granted") {
        const { getMessagingInstance, getToken } = await import("@/lib/firebase")
        
        const messaging = await getMessagingInstance()
        if (messaging) {
          // Register service worker manually to specify the file
          const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js")
          
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            serviceWorkerRegistration: registration,
          })
          
          if (currentToken) {
            // Send to backend
            await fetch("/api/web-push", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: currentToken })
            })
          }
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (permission === "checking") {
    return null // wait for client-side check
  }

  if (permission === "granted") {
    return <>{children}</>
  }

  // Blocking Modal
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl text-center">
        {permission === "denied" ? (
          <div className="mx-auto bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6">
            <ShieldAlert className="h-10 w-10 text-red-600" />
          </div>
        ) : (
          <div className="mx-auto bg-blue-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6">
            <Bell className="h-10 w-10 text-blue-600" />
          </div>
        )}
        
        <h2 className="text-2xl font-bold font-jakarta mb-2 text-slate-800">
          Notifikasi Wajib Diaktifkan
        </h2>
        
        <p className="text-slate-600 mb-8">
          Untuk menggunakan aplikasi TeleNurse, Anda diwajibkan untuk mengizinkan notifikasi browser. 
          Ini penting agar peringatan medis dan jadwal pengingat dapat langsung sampai ke perangkat Anda.
        </p>

        {permission === "denied" ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm flex gap-3 text-left">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <strong>Akses Ditolak.</strong> <br/>
              Jika Anda telah memblokir notifikasi, silakan klik ikon gembok di kiri atas URL Anda (Address Bar), ubah izin Notifikasi menjadi <strong>Izinkan (Allow)</strong>, lalu muat ulang halaman ini.
            </div>
          </div>
        ) : (
          <button 
            onClick={subscribe}
            disabled={loading}
            className="w-full bg-[#1976d2] hover:bg-[#1565c0] text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-blue-500/30"
          >
            {loading ? "Memproses..." : "Izinkan Notifikasi Sekarang"}
          </button>
        )}
      </div>
    </div>
  )
}
