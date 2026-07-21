import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PERAWAT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, imageUrl, videoUrl, categoryId, isPublished } = await req.json()
    
    // Generate simple slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4)

    const article = await prisma.educationContent.create({
      data: {
        title,
        slug,
        body: content,
        thumbnailUrl: imageUrl,
        videoUrl,
        categoryId: parseInt(categoryId),
        isPublished,
        authorId: parseInt(session.user.id)
      }
    })

    return NextResponse.json(article, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
