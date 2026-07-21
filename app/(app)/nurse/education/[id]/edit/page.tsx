import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { ArticleFormClient } from "../../ArticleFormClient"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function NurseEditArticlePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "PERAWAT") redirect("/auth/login")

  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const [categories, article] = await Promise.all([
    prisma.educationCategory.findMany(),
    prisma.educationContent.findUnique({ where: { id } }),
  ])

  if (!article) notFound()

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/nurse/education">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Button>
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Artikel Edukasi</h1>
        <p className="text-sm text-gray-500">Perbarui konten edukasi kesehatan</p>
      </div>
      <ArticleFormClient categories={categories} initialData={article} />
    </div>
  )
}
