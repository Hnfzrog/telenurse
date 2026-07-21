"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { BookOpen, Search, ArrowRight } from "lucide-react"

export function EducationClient({ articles, categories }: { articles: any[], categories: any[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (a.body || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory ? a.categoryId === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-[#1976d2] rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">Edukasi Kesehatan</h1>
          <p className="text-blue-100 mb-6">Temukan artikel informatif untuk membantu menjaga dan memantau kesehatan Anda dari rumah.</p>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari topik kesehatan (contoh: Hipertensi)..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
          
          {/* Category Bubbles */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedCategory === null ? 'bg-white text-[#1976d2]' : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              Semua
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  selectedCategory === c.id ? 'bg-white text-[#1976d2]' : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <BookOpen className="absolute -right-6 -bottom-10 h-64 w-64 text-white opacity-10 rotate-12" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((a) => (
          <Link key={a.id} href={`/education/${a.slug}`} className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-100 transition-all">
            <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
              {a.thumbnailUrl ? (
                <Image src={a.thumbnailUrl} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
                  <BookOpen className="h-12 w-12 text-blue-200" />
                </div>
              )}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold text-[#1976d2]">
                {a.category.name}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h2 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-[#1976d2] transition-colors">{a.title}</h2>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                {(a.body || "").replace(/<[^>]*>?/gm, '').substring(0, 100)}...
              </p>
              <div className="mt-auto flex items-center justify-between text-xs text-gray-400">
                <span>{new Date(a.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                <span className="flex items-center text-[#1976d2] font-medium group-hover:underline">Baca <ArrowRight className="h-3 w-3 ml-1" /></span>
              </div>
            </div>
          </Link>
        ))}
        {filteredArticles.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Tidak ada artikel yang cocok dengan pencarian Anda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
