import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Tag } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function EducationDetailPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")

  const article = await prisma.educationContent.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  })

  if (!article || !article.isPublished) notFound()

  // Simple Markdown to HTML parser for basic formatting
  // Note: For production with rich markdown, use 'marked' or 'react-markdown' package
  const renderContent = (content: string) => {
    if (!content) return []
    return content.split('\n\n').map((paragraph, idx) => {
      let html = paragraph
      // Basic bold
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Basic lists (rudimentary)
      if (html.trim().startsWith('- ')) {
        const items = html.split('\n').map(item => `<li>${item.replace(/^- /, '')}</li>`).join('')
        return <ul key={idx} className="list-disc pl-5 my-4 space-y-2 text-gray-700" dangerouslySetInnerHTML={{ __html: items }} />
      }
      return <p key={idx} className="mb-4 text-gray-700 leading-relaxed text-[15px]" dangerouslySetInnerHTML={{ __html: html }} />
    })
  }

  // Extract YouTube ID
  let youtubeId = null
  if (article.videoUrl) {
    const match = article.videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    if (match && match[1]) youtubeId = match[1]
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/education" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#1976d2] transition-colors mb-2">
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Kembali ke Edukasi
      </Link>

      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {youtubeId ? (
          <div className="relative w-full aspect-video bg-gray-900">
            <iframe 
              src={`https://www.youtube.com/embed/${youtubeId}`}
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : article.thumbnailUrl ? (
          <div className="relative w-full h-64 md:h-[400px] bg-gray-100">
            <Image src={article.thumbnailUrl} alt={article.title} fill className="object-cover" priority />
          </div>
        ) : null}

        <div className="p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#1976d2] font-semibold px-3 py-1 rounded-full text-xs">
              <Tag className="h-3 w-3" /> {article.category.name}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(article.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight mb-8">
            {article.title}
          </h1>

          <div className="prose prose-blue max-w-none">
            {renderContent(article.body)}
          </div>
        </div>
      </article>
    </div>
  )
}
