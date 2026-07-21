"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pill, CheckCircle2, Clock, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { MedicationLogModal } from "./MedicationLogModal"

export function MedicationsClient({ medications }: { medications: any[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleTaken = async (medicationId: number, time: string) => {
    setLoadingId(`${medicationId}-${time}`)
    try {
      const res = await fetch("/api/medications/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          medicationId, 
          notes: time ? `Sudah diminum untuk jadwal jam ${time}` : "Sudah diminum",
          reportedIssue: false
        })
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast({ title: "Tercatat", description: "Obat berhasil ditandai sudah diminum." })
      router.refresh()
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    } finally {
      setLoadingId(null)
    }
  }

  // Helper to check if a reminder time has a corresponding log today
  const hasLogTodayForTime = (logs: any[], timeStr: string) => {
    const today = new Date().toLocaleDateString("id-ID")
    return logs.some(log => {
      const logDate = new Date(log.takenAt).toLocaleDateString("id-ID")
      return logDate === today && (timeStr ? log.notes?.includes(timeStr) : true)
    })
  }

  // Group by Time
  const timeGroups: Record<string, { medication: any, reminder: any }[]> = {}
  const noTimeGroup: any[] = []

  medications.forEach(m => {
    if (m.reminders.length === 0) {
      noTimeGroup.push(m)
    } else {
      m.reminders.forEach((r: any) => {
        if (!timeGroups[r.reminderTime]) timeGroups[r.reminderTime] = []
        timeGroups[r.reminderTime].push({ medication: m, reminder: r })
      })
    }
  })

  const sortedTimes = Object.keys(timeGroups).sort()

  if (medications.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 border-dashed mt-6">
        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Pill className="h-8 w-8 text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">Belum ada obat yang diresepkan.</p>
        <p className="text-sm text-gray-400 mt-1">Obat akan ditambahkan oleh perawat setelah sesi kontrol atau pengkajian.</p>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-8">
      {sortedTimes.map(time => (
        <div key={time} className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-teal-100 text-teal-800 p-2 rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-jakarta font-bold text-gray-800">Jadwal Jam {time}</h2>
          </div>
          
          <div className="grid gap-3">
            {timeGroups[time].map(({ medication: m, reminder: r }) => {
              const isTaken = hasLogTodayForTime(m.medicationLogs, r.reminderTime)
              const isLoading = loadingId === `${m.id}-${r.reminderTime}`

              return (
                <div key={`${m.id}-${r.id}`} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${isTaken ? 'bg-gray-50 border-gray-200' : 'bg-white border-teal-100 shadow-sm hover:shadow-md'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl shrink-0 ${isTaken ? 'bg-gray-200 text-gray-400' : 'bg-teal-50 text-teal-600'}`}>
                      <Pill className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${isTaken ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{m.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <span className="font-semibold">{m.dosage}</span>
                        <span className="text-gray-300">•</span>
                        <span>{m.frequency}</span>
                      </div>
                      {m.instructions && (
                        <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded-md border border-gray-100 flex items-start gap-1">
                          <AlertCircle className="h-3.5 w-3.5 text-orange-400 shrink-0 mt-0.5" />
                          {m.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 flex flex-col items-end gap-2 w-full sm:w-auto">
                    <Button
                      variant={isTaken ? "secondary" : "default"}
                      size="lg"
                      disabled={isTaken || isLoading}
                      onClick={() => handleTaken(m.id, r.reminderTime)}
                      className={`w-full sm:w-auto rounded-xl font-bold ${isTaken ? 'bg-gray-100 text-gray-500 hover:bg-gray-100 opacity-100' : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20'}`}
                    >
                      {isTaken ? (
                        <><CheckCircle2 className="h-5 w-5 mr-2 text-emerald-500" /> Sudah Diminum</>
                      ) : (
                        <><Check className="h-5 w-5 mr-2" /> Tandai Diminum</>
                      )}
                    </Button>
                    <MedicationLogModal medicationId={m.id} medicationName={m.name} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {noTimeGroup.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-gray-100 text-gray-600 p-2 rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-jakarta font-bold text-gray-800">Tanpa Waktu Spesifik</h2>
          </div>
          
          <div className="grid gap-3">
            {noTimeGroup.map((m) => {
              const isTaken = hasLogTodayForTime(m.medicationLogs, "")
              const isLoading = loadingId === `${m.id}-`

              return (
                <div key={m.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${isTaken ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 shadow-sm hover:shadow-md'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl shrink-0 ${isTaken ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                      <Pill className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${isTaken ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{m.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <span className="font-semibold">{m.dosage}</span>
                        <span className="text-gray-300">•</span>
                        <span>{m.frequency}</span>
                      </div>
                      {m.instructions && (
                        <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded-md border border-gray-100 flex items-start gap-1">
                          <AlertCircle className="h-3.5 w-3.5 text-orange-400 shrink-0 mt-0.5" />
                          {m.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 flex flex-col items-end gap-2 w-full sm:w-auto">
                    <Button
                      variant={isTaken ? "secondary" : "outline"}
                      size="lg"
                      disabled={isTaken || isLoading}
                      onClick={() => handleTaken(m.id, "")}
                      className={`w-full sm:w-auto rounded-xl font-bold ${isTaken ? 'bg-gray-100 text-gray-500 hover:bg-gray-100 opacity-100' : 'text-gray-700'}`}
                    >
                      {isTaken ? (
                        <><CheckCircle2 className="h-5 w-5 mr-2 text-emerald-500" /> Sudah Diminum</>
                      ) : (
                        <><Check className="h-5 w-5 mr-2" /> Tandai Diminum</>
                      )}
                    </Button>
                    <MedicationLogModal medicationId={m.id} medicationName={m.name} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
