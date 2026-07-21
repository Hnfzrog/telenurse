"use client"

import Link from "next/link"
import { Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SharedDataTable } from "@/components/ui/SharedDataTable"
import { DeleteArticleButton } from "./DeleteArticleButton"

export function ArticlesTableClient({ articles }: { articles: any[] }) {
  return (
    <SharedDataTable
      data={articles}
      searchKeys={["title", "category.name"]}
      emptyMessage="Belum ada artikel."
      columns={[
        {
          header: "Judul",
          render: (a) => <span className="font-medium text-gray-800 max-w-[250px] truncate block">{a.title}</span>,
        },
        {
          header: "Kategori",
          render: (a) => <span className="text-gray-600">{a.category.name}</span>,
        },
        {
          header: "Tanggal Upload",
          render: (a) => <span className="text-gray-600">{new Date(a.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>,
        },
        {
          header: "Status",
          render: (a) => (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${a.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
              {a.isPublished ? "Published" : "Draft"}
            </span>
          ),
        },
        {
          header: "Aksi",
          className: "text-center",
          render: (a) => (
            <div className="flex items-center justify-center gap-2">
              <Link href={`/admin/articles/${a.id}/edit`}>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"><Edit className="h-4 w-4" /></Button>
              </Link>
              <DeleteArticleButton id={a.id} />
            </div>
          ),
        },
      ]}
    />
  )
}
