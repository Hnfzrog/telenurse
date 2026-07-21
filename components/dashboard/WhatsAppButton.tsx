"use client"

import { MessageCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function WhatsAppButton({ patientName, nurses = [] }: { patientName: string, nurses?: any[] }) {
  const [greeting, setGreeting] = useState("Halo")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 11) setGreeting("Selamat Pagi")
    else if (hour < 15) setGreeting("Selamat Siang")
    else if (hour < 18) setGreeting("Selamat Sore")
    else setGreeting("Selamat Malam")
  }, [])

  const message = `${greeting} Ners, saya ${patientName} mau konsultasi nih.`
  const encodedMessage = encodeURIComponent(message)

  if (nurses.length === 1 || nurses.length === 0) {
    const defaultPhone = nurses[0]?.phone || "6281234567890"
    const href = `https://wa.me/${defaultPhone}?text=${encodedMessage}`
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-xl bg-green-500 text-white px-5 py-3 text-sm font-semibold hover:bg-green-600 hover:scale-105 transition-all shadow-md"
      >
        <MessageCircle className="h-4 w-4" />
        Konsultasi WA
      </a>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-xl bg-green-500 text-white px-5 py-3 text-sm font-semibold hover:bg-green-600 hover:scale-105 transition-all shadow-md">
          <MessageCircle className="h-4 w-4" />
          Konsultasi WA
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pilih Perawat</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <p className="text-sm text-gray-500 mb-2">Silakan pilih perawat yang ingin Anda hubungi untuk konsultasi via WhatsApp.</p>
          {nurses.map((nurse) => {
            const href = `https://wa.me/${nurse.phone || "6281234567890"}?text=${encodedMessage}`
            return (
              <a
                key={nurse.id}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-green-50 hover:border-green-200 transition-colors"
              >
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{nurse.name}</p>
                  <p className="text-xs text-gray-500">Hubungi via WhatsApp</p>
                </div>
              </a>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
