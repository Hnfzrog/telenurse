import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ArticleFormClient } from "../ArticleFormClient"

export default async function CreateArticlePage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login")

  const categories = await prisma.educationCategory.findMany()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tulis Artikel Baru</h1>
        <p className="text-sm text-gray-500">Buat artikel edukasi kesehatan untuk dibaca oleh pasien</p>
      </div>
      <ArticleFormClient categories={categories} />
    </div>
  )
}
