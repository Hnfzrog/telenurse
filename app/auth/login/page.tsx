"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { Logo } from "@/components/ui/Logo"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })
      if (res?.error) {
        setErrorMsg("Email atau password salah")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan sistem")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white relative overflow-hidden items-center font-sans">
      
      {/* Top Section: Logo & Text */}
      <div className="flex flex-col items-center justify-start pt-16 px-6 z-10 w-full max-w-sm">
        <div className="relative">
          <Logo className="w-28 h-28" />
        </div>
        <h1 className="text-3xl font-jakarta font-bold text-gray-900 mt-6 text-center">
          Selamat Datang<br/>di <span className="text-brand-dark">TeleNurse</span>
        </h1>
        <p className="text-gray-500 text-sm mt-3 text-center mb-8">
          Masuk untuk melanjutkan
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {errorMsg && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl border border-red-100 text-center">
              {errorMsg}
            </div>
          )}
          
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Alamat Email" 
            required 
            className="w-full h-14 rounded-xl border-gray-200 bg-gray-50 px-4 focus-visible:ring-brand-blue"
          />
          
          <div className="relative">
            <input 
              name="password" 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" 
              required 
              className="w-full h-14 rounded-xl border-gray-200 bg-gray-50 pl-4 pr-11 focus-visible:ring-brand-blue"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm py-2">
            <label className="flex items-center space-x-2 text-gray-600 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue" />
              <span>Ingat saya</span>
            </label>
            <Link href="#" className="text-gray-500 hover:text-brand-blue">
              Lupa password?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 rounded-xl bg-gradient-brand hover:opacity-90 text-white font-semibold text-lg shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Belum punya akun? <Link href="/auth/register" className="text-brand-blue font-semibold hover:underline">Daftar di sini</Link>
        </p>
      </div>

      {/* Bottom Section: Wave */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-0 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto opacity-50 block">
          <path fill="#e0f2fe" fillOpacity="1" d="M0,224L48,229.3C96,235,192,245,288,234.7C384,224,480,192,576,197.3C672,203,768,245,864,250.7C960,256,1056,224,1152,192C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path fill="#bae6fd" fillOpacity="0.5" d="M0,192L48,181.3C96,171,192,149,288,149.3C384,149,480,171,576,192C672,213,768,235,864,213.3C960,192,1056,128,1152,101.3C1248,75,1344,85,1392,90.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  )
}
