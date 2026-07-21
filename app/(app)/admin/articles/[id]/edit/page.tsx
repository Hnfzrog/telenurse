import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { ArticleFormClient } from "../../ArticleFormClient"

export const dynamic = "force-dynamic"

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login")

  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const [categories, article] = await Promise.all([
    prisma.educationCategory.findMany(),
    prisma.educationContent.findUnique({ where: { id } }),
  ])

  if (!article) notFound()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Artikel Edukasi</h1>
        <p className="text-sm text-gray-500">Perbarui konten edukasi kesehatan</p>
      </div>
      <ArticleFormClient categories={categories} initialData={article} />
    </div>
  )
}
