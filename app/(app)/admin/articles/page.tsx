import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeleteArticleButton } from "./DeleteArticleButton"

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

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Judul</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Kategori</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Tanggal Upload</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="text-center px-5 py-3 font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800 max-w-[250px] truncate">{a.title}</td>
                  <td className="px-5 py-3 text-gray-600">{a.category.name}</td>
                  <td className="px-5 py-3 text-gray-600">{new Date(a.createdAt).toLocaleDateString("id-ID")}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${a.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {a.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/articles/${a.id}/edit`}>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"><Edit className="h-4 w-4" /></Button>
                      </Link>
                      {/* Note: Delete logic moved to client component modal if needed, keeping simple here for MVP */}
                      <DeleteArticleButton id={a.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-500">Belum ada artikel.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
