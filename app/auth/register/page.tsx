"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Pendaftaran Gagal",
        description: "Password dan konfirmasi password tidak cocok.",
      })
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Gagal mendaftar")
      }

      toast({
        title: "Pendaftaran Berhasil",
        description: "Silakan login menggunakan email dan password Anda.",
      })
      router.push("/auth/login")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Pendaftaran Gagal",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-background py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">TeleNurse</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Buat akun Pasien baru
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Daftar Akun</CardTitle>
            <CardDescription>
              Isi formulir di bawah ini untuk bergabung dengan TeleNurse.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" name="name" type="text" required placeholder="Budi Santoso" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="budi@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Memproses..." : "Daftar Sekarang"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Sudah punya akun?{" "}
              <a href="/auth/login" className="font-medium text-primary hover:underline">
                Masuk di sini
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
