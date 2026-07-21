export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArticlesTableClient } from "./ArticlesTableClient"

export default async function AdminArticlesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login")

  const articles = await prisma.educationContent.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kelola Artikel Edukasi</h1>
          <p className="text-sm text-gray-500 mt-1">Total {articles.length} artikel terpublikasi/draft</p>
        </div>
        <Link href="/admin/articles/create">
          <Button className="bg-[#1976d2] hover:bg-[#1565c0] gap-2">
            <Plus className="h-4 w-4" />
            Tulis Artikel
          </Button>
        </Link>
      </div>

      <ArticlesTableClient articles={articles} />
    </div>
  )
}
