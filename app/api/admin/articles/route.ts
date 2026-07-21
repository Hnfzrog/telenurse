import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, excerpt, content, categoryId, isPublished } = body
    
    // Create slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-5)

    const article = await prisma.educationContent.create({
      data: {
        title,
        slug,
        excerpt,
        body: content,
        categoryId: parseInt(categoryId),
        authorId: parseInt(session.user.id),
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null
      }
    })

    return NextResponse.json(article, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
