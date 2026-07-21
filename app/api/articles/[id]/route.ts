import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PERAWAT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, imageUrl, videoUrl, categoryId, isPublished } = await req.json()
    const id = parseInt(params.id)

    const article = await prisma.educationContent.update({
      where: { id },
      data: {
        title,
        body: content,
        thumbnailUrl: imageUrl,
        videoUrl,
        categoryId: parseInt(categoryId),
        isPublished,
      }
    })

    return NextResponse.json(article, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PERAWAT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = parseInt(params.id)
    await prisma.educationContent.delete({ where: { id } })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
